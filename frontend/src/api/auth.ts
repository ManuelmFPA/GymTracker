import { apiClient, tokenStorage } from "./client";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types/auth";

export const authApi = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/register", data);
    tokenStorage.set(res.data.token);
    return res.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/login", data);
    tokenStorage.set(res.data.token);
    return res.data;
  },

  logout(): void {
    tokenStorage.clear();
  },

  isAuthenticated(): boolean {
    return tokenStorage.get() !== null;
  },
};
