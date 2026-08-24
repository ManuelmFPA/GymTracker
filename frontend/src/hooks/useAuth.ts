import { useAuthStore } from "../store/authStore";

// Hook de conveniencia: expone la sesión y las acciones de auth
// sin que cada componente tenga que conocer el store de Zustand directamente.
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const clearError = useAuthStore((s) => s.clearError);

  return { user, isAuthenticated, isLoading, error, login, register, logout, clearError };
}
