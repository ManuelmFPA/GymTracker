import { create } from "zustand";
import { persist } from "zustand/middleware";
import { workoutsApi } from "../api/workouts";
import { offlineQueue } from "../hooks/offlineQueue";
import { ApiRequestError } from "../types/common";
import type {
  FinishWorkoutRequest,
  SetRequest,
  WorkoutResponse,
} from "../types/workout";

interface WorkoutState {
  activeWorkout: WorkoutResponse | null;
  isLoading: boolean;
  error: string | null;
  lastCompletedRestSeconds: number | null; // dispara el RestTimer en la UI
  newPr: string | null; // mensaje del último récord confirmado por el servidor

  loadActive: () => Promise<void>;
  start: (routineId?: number) => Promise<void>;
  completeSet: (
    workoutExerciseId: number,
    data: SetRequest,
    restSeconds: number | null
  ) => void;
  finish: (data?: FinishWorkoutRequest) => Promise<void>;
  cancel: () => Promise<void>;
  clearRestTimer: () => void;
  clearNewPr: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      activeWorkout: null,
      isLoading: false,
      error: null,
      lastCompletedRestSeconds: null,
      newPr: null,

      loadActive: async () => {
        set({ isLoading: true, error: null });
        try {
          const workout = await workoutsApi.getActive();
          set({ activeWorkout: workout, isLoading: false });
        } catch (err) {
          // 404 = no hay entrenamiento en curso, es un estado válido
          if (err instanceof ApiRequestError && err.status === 404) {
            set({ activeWorkout: null, isLoading: false });
          } else {
            set({ isLoading: false, error: "No se pudo cargar el entrenamiento activo" });
          }
        }
      },

      start: async (routineId) => {
        set({ isLoading: true, error: null });
        try {
          const workout = await workoutsApi.start({ routineId: routineId ?? null });
          set({ activeWorkout: workout, isLoading: false });
        } catch (err) {
          const message =
            err instanceof ApiRequestError ? err.message : "No se pudo iniciar el entrenamiento";
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      // Actualiza la UI al instante (estado local) y encola el envío real.
      // La reconciliación con la respuesta del servidor llega vía offlineQueue.onSync.
      completeSet: (workoutExerciseId, data, restSeconds) => {
        const current = get().activeWorkout;
        if (!current) return;

        const updatedExercises = current.exercises.map((ex) => {
          if (ex.id !== workoutExerciseId) return ex;

          const existingIndex = ex.sets.findIndex((s) => s.setNumber === data.setNumber);
          const optimisticSet = {
            id: existingIndex >= 0 ? ex.sets[existingIndex].id : -Date.now(),
            setNumber: data.setNumber,
            weight: data.weight ?? null,
            repetitions: data.repetitions ?? null,
            rpe: data.rpe ?? null,
            status: "COMPLETED" as const,
            completedAt: new Date().toISOString(),
            notes: data.notes ?? null,
            setType: data.setType ?? "NORMAL",
            isPersonalRecord: false,
            prType: null,
          };

          const sets =
            existingIndex >= 0
              ? ex.sets.map((s, i) => (i === existingIndex ? optimisticSet : s))
              : [...ex.sets, optimisticSet];

          return { ...ex, sets };
        });

        set({
          activeWorkout: { ...current, exercises: updatedExercises },
          lastCompletedRestSeconds: restSeconds,
        });

        offlineQueue.enqueue(current.id, workoutExerciseId, { ...data, completed: true });
      },

      finish: async (data) => {
        const current = get().activeWorkout;
        if (!current) return;
        set({ isLoading: true, error: null });
        try {
          await workoutsApi.finish(current.id, data);
          set({ activeWorkout: null, isLoading: false, lastCompletedRestSeconds: null });
        } catch (err) {
          const message =
            err instanceof ApiRequestError ? err.message : "No se pudo finalizar el entrenamiento";
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      cancel: async () => {
        const current = get().activeWorkout;
        if (!current) return;
        set({ isLoading: true, error: null });
        try {
          await workoutsApi.cancel(current.id);
          set({ activeWorkout: null, isLoading: false, lastCompletedRestSeconds: null });
        } catch {
          set({ isLoading: false, error: "No se pudo cancelar el entrenamiento" });
        }
      },

      clearRestTimer: () => set({ lastCompletedRestSeconds: null }),
      clearNewPr: () => set({ newPr: null }),
    }),
    {
      // Persistimos el entrenamiento activo para que sobreviva un refresh
      // de página a mitad de sesión (punto "offline-first" del plan original).
      name: "gym-tracker:active-workout",
      partialize: (state) => ({ activeWorkout: state.activeWorkout }),
    }
  )
);

// Cuando la cola offline logra sincronizar una serie, reconciliamos el
// workout local con la versión real del servidor (ids reales, PRs, etc.)
// — pero solo si sigue siendo el mismo entrenamiento activo.
offlineQueue.onSync((serverWorkout) => {
  const current = useWorkoutStore.getState().activeWorkout;
  if (!current || current.id !== serverWorkout.id) return;

  // Antes de reemplazar el estado, comparamos contra lo que había para
  // detectar si el servidor confirmó un récord que la UI aún no mostró
  // (la actualización optimista no puede saber esto de antemano).
  for (const serverEx of serverWorkout.exercises) {
    const localEx = current.exercises.find((e) => e.id === serverEx.id);
    for (const serverSet of serverEx.sets) {
      if (!serverSet.isPersonalRecord) continue;
      const localSet = localEx?.sets.find((s) => s.setNumber === serverSet.setNumber);
      if (localSet && !localSet.isPersonalRecord) {
        useWorkoutStore.setState({
          newPr: `${serverEx.exerciseName}: ${serverSet.weight}kg x ${serverSet.repetitions} (${serverSet.prType})`,
        });
      }
    }
  }

  useWorkoutStore.setState({ activeWorkout: serverWorkout });
});
