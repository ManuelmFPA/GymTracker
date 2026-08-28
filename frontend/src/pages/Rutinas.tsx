import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { routinesApi } from "../api/routines";
import { useWorkoutStore } from "../store/workoutStore";
import type { RoutineResponse } from "../types/routine";
import { ApiRequestError } from "../types/common";

export default function Rutinas() {
  const [routines, setRoutines] = useState<RoutineResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const { activeWorkout, start } = useWorkoutStore();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);
    routinesApi
      .getAll()
      .then(setRoutines)
      .catch((err) =>
        setLoadError(
          err instanceof ApiRequestError ? err.message : "No se pudieron cargar tus rutinas"
        )
      )
      .finally(() => setIsLoading(false));
  }, [reloadKey]);

  async function handleStart(routineId: number) {
    if (activeWorkout) {
      // Ya hay un entrenamiento en curso (posiblemente de otra rutina):
      // no iniciamos uno nuevo encima, lo mandamos a continuar el actual.
      navigate("/entrenar");
      return;
    }
    setStartingId(routineId);
    setActionError(null);
    try {
      await start(routineId);
      navigate("/entrenar");
    } catch (err) {
      setActionError(
        err instanceof ApiRequestError ? err.message : "No se pudo iniciar el entrenamiento"
      );
    } finally {
      setStartingId(null);
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

      {isLoading && <p className="text-sm text-slate-500">Cargando...</p>}

      {!isLoading && loadError && (
        <div className="bg-red-50 rounded-lg p-4 mb-3">
          <p className="text-sm text-red-600 mb-2">{loadError}</p>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="text-sm font-medium text-red-700 hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {actionError && <p className="text-sm text-red-600 mb-2">{actionError}</p>}

      {!isLoading && !loadError && routines.length === 0 && (
        <p className="text-sm text-slate-500">Todavía no tienes rutinas creadas.</p>
      )}

      <ul className="space-y-2">
        {routines.map((r) => (
          <li key={r.id} className="bg-white rounded-lg shadow p-4">
            <p className="font-medium text-slate-900">{r.name}</p>
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
