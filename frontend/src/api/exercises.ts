import { apiClient } from "./client";
import type {
  ExerciseRequest,
  ExerciseResponse,
  ExerciseSearchParams,
} from "../types/exercise";

export const exercisesApi = {
  async search(params?: ExerciseSearchParams): Promise<ExerciseResponse[]> {
    const res = await apiClient.get<ExerciseResponse[]>("/exercises", { params });
    return res.data;
  },

  async getById(id: number): Promise<ExerciseResponse> {
    const res = await apiClient.get<ExerciseResponse>(`/exercises/${id}`);
    return res.data;
  },

  async create(data: ExerciseRequest): Promise<ExerciseResponse> {
    const res = await apiClient.post<ExerciseResponse>("/exercises", data);
    return res.data;
  },

  async update(id: number, data: ExerciseRequest): Promise<ExerciseResponse> {
    const res = await apiClient.put<ExerciseResponse>(`/exercises/${id}`, data);
    return res.data;
  },

  async deactivate(id: number): Promise<void> {
    await apiClient.delete(`/exercises/${id}`);
  },
};
