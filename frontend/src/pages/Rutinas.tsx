import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { routinesApi } from "../api/routines";
import { useWorkoutStore } from "../store/workoutStore";
import type { RoutineResponse } from "../types/routine";
import { ApiRequestError } from "../types/common";

export default function Rutinas() {
  const [routines, setRoutines] = useState<RoutineResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { activeWorkout, start } = useWorkoutStore();
  const navigate = useNavigate();

  useEffect(() => {
    routinesApi
      .getAll()
      .then(setRoutines)
      .catch(() => setError("No se pudieron cargar tus rutinas"))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleStart(routineId: number) {
    if (activeWorkout) {
      // Ya hay un entrenamiento en curso (posiblemente de otra rutina):
      // no iniciamos uno nuevo encima, lo mandamos a continuar el actual.
      navigate("/entrenar");
      return;
    }
    setStartingId(routineId);
    try {
      await start(routineId);
      navigate("/entrenar");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "No se pudo iniciar el entrenamiento");
    } finally {
      setStartingId(null);
    }
  }

  async function handleDelete(routineId: number) {
    if (!confirm("¿Eliminar esta rutina? Esta acción no se puede deshacer.")) return;
    setDeletingId(routineId);
    setError(null);
    try {
      await routinesApi.delete(routineId);
      setRoutines((prev) => prev.filter((r) => r.id !== routineId));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "No se pudo eliminar la rutina");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-slate-900">Rutinas</h1>
        <Link to="/ejercicios" className="text-sm text-blue-600 hover:underline">
          Ver ejercicios
        </Link>
      </div>

      <Link
        to="/rutinas/nueva"
        className="block w-full text-center bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-blue-700 transition mb-4"
      >
        + Nueva rutina
      </Link>

      {isLoading && <p className="text-sm text-slate-500">Cargando...</p>}
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      {!isLoading && routines.length === 0 && (
        <p className="text-sm text-slate-500">
          Todavía no tienes rutinas creadas. Usa el botón de arriba para crear la primera.
        </p>
      )}

      <ul className="space-y-2">
        {routines.map((r) => (
          <li key={r.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start justify-between">
              <p className="font-medium text-slate-900">{r.name}</p>
              <div className="flex items-center gap-3 shrink-0 ml-2">
                <Link
                  to={`/rutinas/${r.id}/editar`}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={deletingId === r.id}
                  className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                >
                  {deletingId === r.id ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
            {r.description && <p className="text-sm text-slate-500">{r.description}</p>}
            <p className="text-xs text-slate-400 mt-1 mb-3">
              {r.exercises.length} ejercicio{r.exercises.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => handleStart(r.id)}
              disabled={startingId === r.id}
              className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {startingId === r.id ? "Iniciando..." : "Iniciar entrenamiento"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
