// Refleja com.gymtracker.dto.routine.*
export interface RoutineExerciseRequest {
  exerciseId: number;
  exerciseOrder: number;
  targetSets: number;
  targetRepsMin?: number | null;
  targetRepsMax?: number | null;
  restSeconds?: number | null;
}

export interface RoutineExerciseResponse {
  id: number;
  exerciseId: number;
  exerciseName: string;
  muscleGroup: string;
  exerciseOrder: number;
  targetSets: number;
  targetRepsMin: number | null;
  targetRepsMax: number | null;
  restSeconds: number | null;
}

export interface RoutineRequest {
  name: string;
  description?: string | null;
  exercises: RoutineExerciseRequest[];
}

export interface RoutineResponse {
  id: number;
  name: string;
  description: string | null;
  createdAt: string; // ISO LocalDateTime
  exercises: RoutineExerciseResponse[];
}
