import { apiClient } from "./client";
import type {
  FinishWorkoutRequest,
  SetRequest,
  StartWorkoutRequest,
  WorkoutResponse,
} from "../types/workout";

export const workoutsApi = {
  async start(data: StartWorkoutRequest): Promise<WorkoutResponse> {
    const res = await apiClient.post<WorkoutResponse>("/workouts", data);
    return res.data;
  },

  async getActive(): Promise<WorkoutResponse> {
    const res = await apiClient.get<WorkoutResponse>("/workouts/active");
    return res.data;
  },

  async getById(id: number): Promise<WorkoutResponse> {
    const res = await apiClient.get<WorkoutResponse>(`/workouts/${id}`);
    return res.data;
  },

  async getHistory(): Promise<WorkoutResponse[]> {
    const res = await apiClient.get<WorkoutResponse[]>("/workouts");
    return res.data;
  },

  // Crea o actualiza (upsert) una serie dentro de un ejercicio del entrenamiento activo.
  // Usado por useOfflineQueue en cada "Completar serie".
  async upsertSet(
    workoutId: number,
    workoutExerciseId: number,
    data: SetRequest
  ): Promise<WorkoutResponse> {
    const res = await apiClient.post<WorkoutResponse>(
      `/workouts/${workoutId}/exercises/${workoutExerciseId}/sets`,
      data
    );
    return res.data;
  },

  async undoSet(
    workoutId: number,
    workoutExerciseId: number,
    setId: number
  ): Promise<WorkoutResponse> {
    const res = await apiClient.delete<WorkoutResponse>(
      `/workouts/${workoutId}/exercises/${workoutExerciseId}/sets/${setId}/complete`
    );
    return res.data;
  },

  async finish(id: number, data?: FinishWorkoutRequest): Promise<WorkoutResponse> {
    const res = await apiClient.put<WorkoutResponse>(`/workouts/${id}/finish`, data);
    return res.data;
  },

  async cancel(id: number): Promise<WorkoutResponse> {
    const res = await apiClient.put<WorkoutResponse>(`/workouts/${id}/cancel`);
    return res.data;
  },

  async setPaused(id: number, paused: boolean): Promise<WorkoutResponse> {
    const res = await apiClient.put<WorkoutResponse>(`/workouts/${id}/pause`, null, {
      params: { paused },
    });
    return res.data;
  },
};
