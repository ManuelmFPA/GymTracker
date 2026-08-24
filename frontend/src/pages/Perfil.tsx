import { useAuth } from "../hooks/useAuth";

export default function Perfil() {
  const { user, logout } = useAuth();

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold text-slate-900 mb-4">Perfil</h1>

      {user && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <p className="font-medium text-slate-900">{user.name}</p>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
      )}

      <button
        onClick={logout}
        className="w-full bg-red-50 text-red-600 text-sm font-medium py-2 rounded-lg hover:bg-red-100 transition"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
