import { apiClient } from "./client";
import type { RoutineRequest, RoutineResponse } from "../types/routine";

export const routinesApi = {
  async getAll(): Promise<RoutineResponse[]> {
    const res = await apiClient.get<RoutineResponse[]>("/routines");
    return res.data;
  },

  async getById(id: number): Promise<RoutineResponse> {
    const res = await apiClient.get<RoutineResponse>(`/routines/${id}`);
    return res.data;
  },

  async create(data: RoutineRequest): Promise<RoutineResponse> {
    const res = await apiClient.post<RoutineResponse>("/routines", data);
    return res.data;
  },

  async update(id: number, data: RoutineRequest): Promise<RoutineResponse> {
    const res = await apiClient.put<RoutineResponse>(`/routines/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/routines/${id}`);
  },

  async duplicate(id: number): Promise<RoutineResponse> {
    const res = await apiClient.post<RoutineResponse>(`/routines/${id}/duplicate`);
    return res.data;
  },
};
