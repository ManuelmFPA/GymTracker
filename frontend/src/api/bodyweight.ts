import { apiClient } from "./client";
import type { BodyWeightRequest, BodyWeightResponse } from "../types/bodyweight";

export const bodyWeightApi = {
  async getHistory(): Promise<BodyWeightResponse[]> {
    const res = await apiClient.get<BodyWeightResponse[]>("/body-weight");
    return res.data;
  },

  async add(data: BodyWeightRequest): Promise<BodyWeightResponse> {
    const res = await apiClient.post<BodyWeightResponse>("/body-weight", data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/body-weight/${id}`);
  },
};
