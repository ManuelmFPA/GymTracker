import axios, { type AxiosError } from "axios";
import type { ApiError } from "../types/common";
import { ApiRequestError } from "../types/common";

// El backend expone todo bajo /api (ver @RequestMapping de los controllers)
const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

const TOKEN_KEY = "gym-tracker:token";

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Adjunta el JWT en cada request (el backend nunca debe recibir el userId por otra vía)
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normaliza los errores del backend (ApiError) a ApiRequestError,
// y limpia la sesión si el token expiró/es inválido (401).
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      if (error.response.status === 401) {
        tokenStorage.clear();
      }
      if (error.response.data) {
        return Promise.reject(new ApiRequestError(error.response.data));
      }
    }
    return Promise.reject(error);
  }
);
