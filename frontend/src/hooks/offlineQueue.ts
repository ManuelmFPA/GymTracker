import { workoutsApi } from "../api/workouts";
import type { SetRequest, WorkoutResponse } from "../types/workout";

interface QueuedSet {
  id: string; // clave local, no confundir con el id del set en el backend
  workoutId: number;
  workoutExerciseId: number;
  data: SetRequest;
  attempts: number;
}

const STORAGE_KEY = "gym-tracker:offline-queue";
const MAX_BACKOFF_MS = 30_000;

type Listener = (pendingCount: number) => void;
type SyncListener = (workout: WorkoutResponse) => void;

function readQueue(): QueuedSet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QueuedSet[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedSet[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

// Cola simple en memoria + localStorage. No es un hook porque necesita
// sobrevivir aunque el componente que la usó se desmonte (p. ej. si el
// usuario navega fuera de "Entrenar" con series aún pendientes de sincronizar).
class OfflineQueue {
  private queue: QueuedSet[] = readQueue();
  private listeners = new Set<Listener>();
  private syncListeners = new Set<SyncListener>();
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private flushing = false;

  constructor() {
    window.addEventListener("online", () => this.flush());
    if (this.queue.length > 0) this.scheduleFlush(0);
  }

  get pendingCount(): number {
    return this.queue.length;
  }

  onChange(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Se dispara cuando una serie encolada se confirma con el backend,
  // con el WorkoutResponse actualizado (para reconciliar el store).
  onSync(listener: SyncListener): () => void {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  enqueue(workoutId: number, workoutExerciseId: number, data: SetRequest): void {
    const id = `${workoutExerciseId}-${data.setNumber}`;
    // Si ya había una entrada pendiente para esta misma serie, la reemplaza
    // en vez de duplicar (el usuario pudo editar peso/reps antes de sincronizar).
    this.queue = [
      ...this.queue.filter((item) => item.id !== id),
      { id, workoutId, workoutExerciseId, data, attempts: 0 },
    ];
    this.persist();
    this.scheduleFlush(0);
  }

  private persist(): void {
    writeQueue(this.queue);
    this.listeners.forEach((l) => l(this.queue.length));
  }

  private scheduleFlush(delayMs: number): void {
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => this.flush(), delayMs);
  }

  async flush(): Promise<void> {
    if (this.flushing || this.queue.length === 0 || !navigator.onLine) return;
    this.flushing = true;

    const [item] = this.queue;
    try {
      const workout = await workoutsApi.upsertSet(
        item.workoutId,
        item.workoutExerciseId,
        item.data
      );
      this.queue = this.queue.filter((q) => q.id !== item.id);
      this.persist();
      this.syncListeners.forEach((l) => l(workout));
      this.flushing = false;
      if (this.queue.length > 0) this.scheduleFlush(0);
    } catch {
      item.attempts += 1;
      this.persist();
      this.flushing = false;
      const backoff = Math.min(1000 * 2 ** item.attempts, MAX_BACKOFF_MS);
      this.scheduleFlush(backoff);
    }
  }
}

export const offlineQueue = new OfflineQueue();
