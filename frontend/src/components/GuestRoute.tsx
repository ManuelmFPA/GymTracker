import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Inverso de ProtectedRoute: para /login y /register, si ya hay sesión
// activa no tiene sentido mostrar el formulario, mandamos al dashboard.
export function GuestRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
