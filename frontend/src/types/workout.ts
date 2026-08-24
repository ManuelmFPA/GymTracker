// Refleja com.gymtracker.dto.workout.* y los enums del backend

// com.gymtracker.entity.enums.SetStatus
export type SetStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

// com.gymtracker.entity.enums.WorkoutStatus
export type WorkoutStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED";

export interface StartWorkoutRequest {
  routineId?: number | null; // null = entrenamiento libre, sin rutina
}

export interface FinishWorkoutRequest {
  notes?: string | null;
}

export interface SetRequest {
  setNumber: number;
  weight?: number | null;
  repetitions?: number | null;
  rpe?: number | null;
  notes?: string | null;
  completed?: boolean | null;
}

export interface SetResponse {
  id: number;
  setNumber: number;
  weight: number | null;
  repetitions: number | null;
  rpe: number | null;
  status: SetStatus;
  completedAt: string | null; // ISO LocalDateTime
  notes: string | null;
}

export interface WorkoutExerciseResponse {
  id: number;
  exerciseId: number;
  exerciseName: string;
  muscleGroup: string;
  exerciseOrder: number;
  targetSets: number;
  targetRepsMin: number | null;
  targetRepsMax: number | null;
  restSeconds: number | null;
  sets: SetResponse[];
  previousSets: SetResponse[]; // series de la sesión anterior de este ejercicio, para comparar
  bestSetSummary: string | null;
}

export interface WorkoutResponse {
  id: number;
  routineId: number | null;
  routineName: string | null;
  startTime: string; // ISO LocalDateTime
  endTime: string | null;
  durationSeconds: number | null;
  status: WorkoutStatus;
  notes: string | null;
  totalVolume: number | null;
  exercises: WorkoutExerciseResponse[];
}
