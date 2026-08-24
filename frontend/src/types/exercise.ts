// Refleja com.gymtracker.dto.exercise.*
export interface ExerciseRequest {
  name: string;
  muscleGroup: string;
  primaryMuscle?: string | null;
  equipment?: string | null;
  description?: string | null;
  instructions?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
}

export interface ExerciseResponse {
  id: number;
  name: string;
  muscleGroup: string;
  primaryMuscle: string | null;
  equipment: string | null;
  description: string | null;
  instructions: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  active: boolean;
  custom: boolean;
}

export interface ExerciseSearchParams {
  muscleGroup?: string;
  equipment?: string;
  q?: string;
}
