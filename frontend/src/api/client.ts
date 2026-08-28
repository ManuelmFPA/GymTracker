import axios, { type AxiosError } from "axios";
import type { ApiError } from "../types/common";
import { ApiRequestError } from "../types/common";

// El backend expone todo bajo /api (ver @RequestMapping de los controllers)
const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

const TOKEN_KEY = "gym-tracker:token";
const AUTH_STORE_KEY = "gym-tracker:auth"; // clave persistida por authStore (Zustand)

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

function isAuthEndpoint(url?: string): boolean {
  return !!url && (url.includes("/auth/login") || url.includes("/auth/register"));
}

// Normaliza los errores del backend (ApiError) a ApiRequestError.
// Si el token expiró o es inválido (401/403 en cualquier endpoint que NO sea
// login/register), cerramos la sesión de verdad y mandamos a /login en vez de
// dejar la app "colgada" mostrando errores en cada pantalla.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      const isSessionExpired =
        (error.response.status === 401 || error.response.status === 403) &&
        !isAuthEndpoint(error.config?.url);

      if (isSessionExpired) {
        tokenStorage.clear();
        localStorage.removeItem(AUTH_STORE_KEY);
        // Redirección dura (no client-side) para garantizar un estado limpio,
        // sin depender de que algún componente siga montado para reaccionar.
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }

      if (error.response.data) {
        return Promise.reject(new ApiRequestError(error.response.data));
      }
    }
    return Promise.reject(error);
  }
);
