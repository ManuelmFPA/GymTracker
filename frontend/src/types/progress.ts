// Refleja com.gymtracker.dto.progress.*
export interface WeightPointResponse {
  date: string; // ISO LocalDate
  weight: number;
}

export interface ProgressPointResponse {
  date: string; // ISO LocalDate
  maxWeight: number;
  volume: number;
}

export interface DashboardResponse {
  userName: string;
  currentWeight: number | null;
  targetWeight: number | null;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  weeklyVolume: number;
  monthlyVolume: number;
  lastWorkoutName: string | null;
  lastWorkoutDate: string | null;
  recentPRs: string[];
  weightHistory: WeightPointResponse[];
}

export interface ExerciseProgressResponse {
  exerciseId: number;
  exerciseName: string;
  bestWeight: number | null;
  bestReps: number | null;
  bestVolume: number | null;
  lastWorkoutDate: string | null;
  history: ProgressPointResponse[];
}
