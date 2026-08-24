import { useEffect, useState } from "react";
import { exercisesApi } from "../api/exercises";
import type { ExerciseResponse } from "../types/exercise";

const MUSCLE_GROUPS = [
  "Pecho",
  "Espalda",
  "Hombros",
  "Bíceps",
  "Tríceps",
  "Piernas",
  "Core",
] as const;

export default function Exercises() {
  const [exercises, setExercises] = useState<ExerciseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const params = {
      ...(query ? { q: query } : {}),
      ...(muscleGroup ? { muscleGroup } : {}),
    };
    const timeout = setTimeout(() => {
      exercisesApi
        .search(params)
        .then(setExercises)
        .catch(() => setError("No se pudieron cargar los ejercicios"))
        .finally(() => setIsLoading(false));
    }, 250); // pequeño debounce para no disparar una request por cada tecla

    return () => clearTimeout(timeout);
  }, [query, muscleGroup]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold text-slate-900 mb-4">Ejercicios</h1>

      <input
        type="text"
        placeholder="Buscar ejercicio..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-4 px-4">
        <FilterChip
          label="Todos"
          active={muscleGroup === null}
          onClick={() => setMuscleGroup(null)}
        />
        {MUSCLE_GROUPS.map((g) => (
          <FilterChip
            key={g}
            label={g}
            active={muscleGroup === g}
            onClick={() => setMuscleGroup(g)}
          />
        ))}
      </div>

      {isLoading && <p className="text-sm text-slate-500">Cargando...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!isLoading && !error && exercises.length === 0 && (
        <p className="text-sm text-slate-500">No se encontraron ejercicios.</p>
      )}

      <ul className="space-y-2">
        {exercises.map((ex) => (
          <li key={ex.id} className="bg-white rounded-lg shadow p-4">
            <p className="font-medium text-slate-900">{ex.name}</p>
            <p className="text-xs text-slate-400">
              {ex.muscleGroup}
              {ex.equipment ? ` · ${ex.equipment}` : ""}
            </p>
            {ex.description && (
              <p className="text-sm text-slate-500 mt-1">{ex.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"
      }`}
    >
      {label}
    </button>
  );
}
