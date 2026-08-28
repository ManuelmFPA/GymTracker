import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkoutStore } from "../store/workoutStore";
import { useOfflineQueue } from "../hooks/useOfflineQueue";
import { SetTracker } from "../components/SetTracker";
import { RestTimer } from "../components/RestTimer";

export default function Entrenar() {
  const {
    activeWorkout,
    isLoading,
    error,
    lastCompletedRestSeconds,
    loadActive,
    completeSet,
    finish,
    cancel,
    clearRestTimer,
  } = useWorkoutStore();
  const { pendingCount } = useOfflineQueue();
  const navigate = useNavigate();

  useEffect(() => {
    if (!activeWorkout) loadActive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFinish() {
    if (!confirm("¿Finalizar el entrenamiento?")) return;
    await finish();
    navigate("/");
  }

  async function handleCancel() {
    if (!confirm("¿Cancelar este entrenamiento? Se perderá el progreso.")) return;
    await cancel();
    navigate("/");
  }

  if (isLoading && !activeWorkout) {
    return <p className="p-4 text-sm text-slate-500">Cargando...</p>;
  }

  if (!activeWorkout) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-semibold text-slate-900 mb-2">Entrenar</h1>
        <p className="text-sm text-slate-500">
          No tienes un entrenamiento en curso. Inicia uno desde Rutinas.
        </p>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 pb-24">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {activeWorkout.routineName ?? "Entrenamiento libre"}
          </h1>
          {pendingCount > 0 && (
            <p className="text-xs text-amber-600">
              Sincronizando {pendingCount} serie{pendingCount !== 1 ? "s" : ""}...
            </p>
          )}
        </div>
        <button onClick={handleCancel} className="text-xs text-red-500 hover:underline">
          Cancelar
        </button>
      </div>

      {activeWorkout.exercises
        .sort((a, b) => a.exerciseOrder - b.exerciseOrder)
        .map((ex) => (
          <SetTracker
            key={ex.id}
            workoutExercise={ex}
            onCompleteSet={(setNumber, weight, reps, setType) =>
              completeSet(
                ex.id,
                { setNumber, weight, repetitions: reps, setType },
                ex.restSeconds
              )
            }
          />
        ))}

      <button
        onClick={handleFinish}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white text-sm font-medium py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
      >
        Finalizar entrenamiento
      </button>

      {lastCompletedRestSeconds != null && lastCompletedRestSeconds > 0 && (
        <RestTimer seconds={lastCompletedRestSeconds} onDone={clearRestTimer} />
      )}
    </div>
  );
}
