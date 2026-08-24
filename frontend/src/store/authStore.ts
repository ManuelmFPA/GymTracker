import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../api/auth";
import { tokenStorage } from "../api/client";
import { ApiRequestError } from "../types/common";
import type { LoginRequest, RegisterRequest } from "../types/auth";

interface AuthUser {
  userId: number;
  name: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.login(data);
          set({
            user: { userId: res.userId, name: res.name, email: res.email },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          const message =
            err instanceof ApiRequestError ? err.message : "No se pudo iniciar sesión";
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.register(data);
          set({
            user: { userId: res.userId, name: res.name, email: res.email },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          const message =
            err instanceof ApiRequestError ? err.message : "No se pudo crear la cuenta";
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      logout: () => {
        authApi.logout();
        set({ user: null, isAuthenticated: false, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      // Solo persistimos los datos del usuario; el JWT en sí ya vive en
      // localStorage aparte, manejado por tokenStorage en api/client.ts.
      name: "gym-tracker:auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      // Si no hay un JWT real guardado (expiró, se borró, etc.) no confiamos
      // en el "isAuthenticated" persistido: forzamos logout al rehidratar.
      onRehydrateStorage: () => (state) => {
        if (state && !tokenStorage.get()) {
          state.user = null;
          state.isAuthenticated = false;
        }
      },
    }
  )
);
