import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { routinesApi } from "../api/routines";
import { exercisesApi } from "../api/exercises";
import type { ExerciseRequest, ExerciseResponse } from "../types/exercise";
import type { RoutineExerciseRequest } from "../types/routine";
import { ApiRequestError } from "../types/common";

const MUSCLE_GROUPS = [
  "Pecho",
  "Espalda",
  "Hombros",
  "Bíceps",
  "Tríceps",
  "Piernas",
  "Core",
] as const;

interface DraftExercise extends RoutineExerciseRequest {
  // Solo para mostrar el nombre en la lista mientras se arma la rutina;
  // no se envía al backend (el backend solo necesita exerciseId).
  exerciseName: string;
}

// Ignora mayúsculas/minúsculas y tildes al comparar (ej. "pajaros" debe encontrar "Pájaros")
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function NuevaRutina() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = id !== undefined;
  const routineId = isEditMode ? Number(id) : null;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [draftExercises, setDraftExercises] = useState<DraftExercise[]>([]);

  const [allExercises, setAllExercises] = useState<ExerciseResponse[]>([]);
  const [query, setQuery] = useState("");
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [loadingRoutine, setLoadingRoutine] = useState(isEditMode);

  const [showNewExerciseForm, setShowNewExerciseForm] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    if (routineId === null) return;
    setLoadingRoutine(true);
    routinesApi
      .getById(routineId)
      .then((routine) => {
        setName(routine.name);
        setDescription(routine.description ?? "");
        setDraftExercises(
          routine.exercises.map((ex) => ({
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            exerciseOrder: ex.exerciseOrder,
            targetSets: ex.targetSets,
            targetRepsMin: ex.targetRepsMin,
            targetRepsMax: ex.targetRepsMax,
            restSeconds: ex.restSeconds,
          }))
        );
      })
      .catch(() => setError("No se pudo cargar la rutina"))
      .finally(() => setLoadingRoutine(false));
  }, [routineId]);

  function loadExercises() {
    setLoadingExercises(true);
    exercisesApi
      .search()
      .then(setAllExercises)
      .catch(() => setError("No se pudieron cargar los ejercicios disponibles"))
      .finally(() => setLoadingExercises(false));
  }

  const filteredExercises = useMemo(() => {
    const alreadyAdded = new Set(draftExercises.map((d) => d.exerciseId));
    const q = normalize(query.trim());
    return allExercises.filter(
      (ex) => !alreadyAdded.has(ex.id) && (q === "" || normalize(ex.name).includes(q))
    );
  }, [allExercises, draftExercises, query]);

  function addExercise(ex: ExerciseResponse) {
    setDraftExercises((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        exerciseName: ex.name,
        exerciseOrder: prev.length,
        targetSets: 3,
        targetRepsMin: 8,
        targetRepsMax: 12,
        restSeconds: 90,
      },
    ]);
  }

  function removeExercise(exerciseId: number) {
    setDraftExercises((prev) =>
      prev
        .filter((d) => d.exerciseId !== exerciseId)
        .map((d, i) => ({ ...d, exerciseOrder: i }))
    );
  }

  function moveExercise(index: number, direction: -1 | 1) {
    setDraftExercises((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((d, i) => ({ ...d, exerciseOrder: i }));
    });
  }

  function updateExercise(exerciseId: number, patch: Partial<DraftExercise>) {
    setDraftExercises((prev) =>
      prev.map((d) => (d.exerciseId === exerciseId ? { ...d, ...patch } : d))
    );
  }

  function handleExerciseCreated(created: ExerciseResponse, addToRoutine: boolean) {
    setAllExercises((prev) => [...prev, created]);
    setShowNewExerciseForm(false);
    if (addToRoutine) addExercise(created);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Ponle un nombre a la rutina");
      return;
    }
    if (draftExercises.length === 0) {
      setError("Agrega al menos un ejercicio");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        exercises: draftExercises.map(({ exerciseName, ...rest }) => rest),
      };
      if (isEditMode && routineId !== null) {
        await routinesApi.update(routineId, payload);
      } else {
        await routinesApi.create(payload);
      }
      navigate("/rutinas");
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : isEditMode
          ? "No se pudieron guardar los cambios"
          : "No se pudo guardar la rutina"
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (loadingRoutine) {
    return (
      <div className="p-4">
        <p className="text-sm text-slate-500">Cargando rutina...</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-40">
      <h1 className="text-xl font-semibold text-slate-900 mb-4">
        {isEditMode ? "Editar rutina" : "Nueva rutina"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              placeholder="Ej. Pecho + Tríceps"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
              Descripción (opcional)
            </label>
            <textarea
              id="description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {draftExercises.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-2">
              Ejercicios en la rutina ({draftExercises.length})
            </h2>
            <ul className="space-y-2">
              {draftExercises.map((d, index) => (
                <li key={d.exerciseId} className="bg-white rounded-lg shadow p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-slate-900 text-sm">
                      {index + 1}. {d.exerciseName}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveExercise(index, -1)}
                        disabled={index === 0}
                        className="text-slate-400 hover:text-slate-700 disabled:opacity-30 px-1"
                        aria-label="Subir"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveExercise(index, 1)}
                        disabled={index === draftExercises.length - 1}
                        className="text-slate-400 hover:text-slate-700 disabled:opacity-30 px-1"
                        aria-label="Bajar"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeExercise(d.exerciseId)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium ml-1"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <NumberField
                      label="Series"
                      value={d.targetSets}
                      min={1}
                      onChange={(v) => updateExercise(d.exerciseId, { targetSets: v })}
                    />
                    <NumberField
                      label="Reps min"
                      value={d.targetRepsMin ?? 0}
                      min={0}
                      onChange={(v) => updateExercise(d.exerciseId, { targetRepsMin: v })}
                    />
                    <NumberField
                      label="Reps max"
                      value={d.targetRepsMax ?? 0}
                      min={0}
                      onChange={(v) => updateExercise(d.exerciseId, { targetRepsMax: v })}
                    />
                    <NumberField
                      label="Descanso (s)"
                      value={d.restSeconds ?? 90}
                      min={0}
                      step={15}
                      onChange={(v) => updateExercise(d.exerciseId, { restSeconds: v })}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-700">Agregar ejercicios</h2>
            <button
              type="button"
              onClick={() => setShowNewExerciseForm((s) => !s)}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              {showNewExerciseForm ? "Cancelar" : "+ Crear ejercicio nuevo"}
            </button>
          </div>

          {showNewExerciseForm && (
            <NewExerciseForm
              onCreated={handleExerciseCreated}
              onCancel={() => setShowNewExerciseForm(false)}
            />
          )}

          <input
            type="text"
            placeholder="Buscar ejercicio..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {loadingExercises && <p className="text-sm text-slate-500">Cargando ejercicios...</p>}

          <ul className="space-y-1.5 max-h-72 overflow-y-auto">
            {filteredExercises.map((ex) => (
              <li key={ex.id}>
                <button
                  type="button"
                  onClick={() => addExercise(ex)}
                  className="w-full flex items-center justify-between bg-white rounded-lg shadow-sm border border-slate-100 px-3 py-2 text-left hover:border-blue-300 transition"
                >
                  <span>
                    <span className="block text-sm font-medium text-slate-900">{ex.name}</span>
                    <span className="block text-xs text-slate-400">
                      {ex.muscleGroup}
                      {ex.custom ? " · Personalizado" : ""}
                    </span>
                  </span>
                  <span className="text-blue-600 text-lg leading-none">+</span>
                </button>
              </li>
            ))}
            {!loadingExercises && filteredExercises.length === 0 && (
              <p className="text-sm text-slate-500">No hay ejercicios que coincidan.</p>
            )}
          </ul>
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-slate-200 p-4 flex gap-2 shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
          <button
            type="button"
            onClick={() => navigate("/rutinas")}
            className="flex-1 border border-slate-300 text-slate-700 text-sm font-medium py-2.5 rounded-lg hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {isSaving ? "Guardando..." : isEditMode ? "Guardar cambios" : "Guardar rutina"}
          </button>
        </div>
      </form>
    </div>
  );
}

function NewExerciseForm({
  onCreated,
  onCancel,
}: {
  onCreated: (exercise: ExerciseResponse, addToRoutine: boolean) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<string>(MUSCLE_GROUPS[0]);
  const [equipment, setEquipment] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(addToRoutine: boolean) {
    if (!name.trim()) {
      setError("Ponle un nombre al ejercicio");
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      const payload: ExerciseRequest = {
        name: name.trim(),
        muscleGroup,
        equipment: equipment.trim() || null,
        description: description.trim() || null,
      };
      const created = await exercisesApi.create(payload);
      onCreated(created, addToRoutine);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "No se pudo crear el ejercicio");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-3 mb-3 space-y-2 border border-blue-100">
      <div>
        <label className="block text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">
          Nombre
        </label>
        <input
          type="text"
          placeholder="Ej. Press Arnold"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">
            Grupo muscular
          </label>
          <select
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MUSCLE_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">
            Equipo (opcional)
          </label>
          <input
            type="text"
            placeholder="Ej. Mancuernas"
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">
          Descripción (opcional)
        </label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-slate-300 text-slate-700 text-xs font-medium py-1.5 rounded-md hover:bg-slate-50 transition"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={() => handleCreate(false)}
          className="flex-1 border border-blue-300 text-blue-700 text-xs font-medium py-1.5 rounded-md hover:bg-blue-50 disabled:opacity-50 transition"
        >
          Crear
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={() => handleCreate(true)}
          className="flex-1 bg-blue-600 text-white text-xs font-medium py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
        >
          Crear y agregar
        </button>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  // Mantenemos el texto "en borrador" mientras el usuario escribe, separado
  // del valor ya confirmado. Si normalizáramos en cada tecla, borrar el "3"
  // para escribir "12" pasaba por un estado vacío -> Number("") = 0 -> el
  // campo se quedaba en "0" antes de que alcanzaras a escribir el resto.
  // Ahora solo se valida/normaliza al salir del campo (onBlur).
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  function commit(raw: string) {
    const parsed = Number(raw);
    const finalValue = raw.trim() === "" || Number.isNaN(parsed) ? min : Math.max(min, parsed);
    setText(String(finalValue));
    if (finalValue !== value) onChange(finalValue);
  }

  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">
        {label}
      </label>
      <input
        type="number"
        value={text}
        min={min}
        step={step}
        onChange={(e) => setText(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
