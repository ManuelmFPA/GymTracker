import { apiClient } from "./client";
import type { DashboardResponse, ExerciseProgressResponse } from "../types/progress";

export const progressApi = {
  async getDashboard(): Promise<DashboardResponse> {
    const res = await apiClient.get<DashboardResponse>("/progress");
    return res.data;
  },

  async getExerciseProgress(exerciseId: number): Promise<ExerciseProgressResponse> {
    const res = await apiClient.get<ExerciseProgressResponse>(
      `/progress/exercises/${exerciseId}`
    );
    return res.data;
  },
};
