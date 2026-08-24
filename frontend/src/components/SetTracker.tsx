import { useEffect, useState } from "react";
import type { WorkoutExerciseResponse } from "../types/workout";

interface SetTrackerProps {
  workoutExercise: WorkoutExerciseResponse;
  onCompleteSet: (setNumber: number, weight: number | null, reps: number | null) => void;
}

export function SetTracker({ workoutExercise, onCompleteSet }: SetTrackerProps) {
  const rows = Array.from({ length: workoutExercise.targetSets }, (_, i) => i + 1);
  const repsHint =
    workoutExercise.targetRepsMin && workoutExercise.targetRepsMax
      ? `${workoutExercise.targetRepsMin}-${workoutExercise.targetRepsMax}`
      : workoutExercise.targetRepsMax
        ? `${workoutExercise.targetRepsMax}`
        : "—";

  // Última serie completada de este ejercicio en el entrenamiento actual
  // (la de mayor número). Sirve para precargar la siguiente serie y para
  // el botón "repetir en las restantes", así no hay que escribir el mismo
  // peso/reps una y otra vez.
  const completedSets = workoutExercise.sets
    .filter((s) => s.status === "COMPLETED")
    .sort((a, b) => b.setNumber - a.setNumber);
  const lastCompleted = completedSets[0];

  const pendingSetNumbers = rows.filter(
    (n) => !workoutExercise.sets.find((s) => s.setNumber === n && s.status === "COMPLETED")
  );

  const canRepeatRemaining =
    lastCompleted != null &&
    (lastCompleted.weight != null || lastCompleted.repetitions != null) &&
    pendingSetNumbers.length > 0;

  function repeatRemaining() {
    if (!lastCompleted) return;
    pendingSetNumbers.forEach((n) => {
      onCompleteSet(n, lastCompleted.weight, lastCompleted.repetitions);
    });
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-baseline justify-between mb-1">
        <p className="font-medium text-slate-900">{workoutExercise.exerciseName}</p>
        <p className="text-xs text-slate-400">objetivo: {repsHint} reps</p>
      </div>
      {workoutExercise.bestSetSummary && (
        <p className="text-xs text-slate-400 mb-3">Mejor: {workoutExercise.bestSetSummary}</p>
      )}

      <div className="grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 items-center text-xs text-slate-400 mb-1 px-1">
        <span>#</span>
        <span>kg</span>
        <span>reps</span>
        <span></span>
      </div>

      <div className="space-y-2">
        {rows.map((setNumber) => {
          // Para precargar: primero la serie ya completada anterior en *este*
          // entrenamiento (misma serie que acabas de hacer); si no hay,
          // caemos a la misma serie de la sesión pasada.
          const carryFrom =
            completedSets.find((s) => s.setNumber < setNumber) ??
            workoutExercise.previousSets.find((s) => s.setNumber === setNumber);

          return (
            <SetRow
              key={setNumber}
              setNumber={setNumber}
              existing={workoutExercise.sets.find((s) => s.setNumber === setNumber)}
              carryFrom={carryFrom}
              onComplete={(weight, reps) => onCompleteSet(setNumber, weight, reps)}
            />
          );
        })}
      </div>

      {canRepeatRemaining && (
        <button
          type="button"
          onClick={repeatRemaining}
          className="mt-3 w-full text-xs font-medium text-blue-600 border border-blue-200 rounded-md py-1.5 hover:bg-blue-50 transition"
        >
          Repetir {lastCompleted.weight ?? "—"}kg x {lastCompleted.repetitions ?? "—"} en las{" "}
          {pendingSetNumbers.length} serie{pendingSetNumbers.length !== 1 ? "s" : ""} restante
          {pendingSetNumbers.length !== 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
}

interface SetRowProps {
  setNumber: number;
  existing?: WorkoutExerciseResponse["sets"][number];
  // Serie desde la que precargar peso/reps: la última completada de este
  // mismo ejercicio en el entrenamiento actual, o si no existe, la misma
  // serie de la sesión anterior.
  carryFrom?: { weight: number | null; repetitions: number | null };
  onComplete: (weight: number | null, reps: number | null) => void;
}

function SetRow({ setNumber, existing, carryFrom, onComplete }: SetRowProps) {
  const isDone = existing?.status === "COMPLETED";
  // Si ya hay un valor guardado para esta serie, lo usamos. Si no, precargamos
  // el peso/reps de "carryFrom" como punto de partida editable — antes esto
  // solo se mostraba como placeholder gris, que no se envía si el usuario no
  // vuelve a escribirlo, así que la serie se guardaba sin peso.
  const [weight, setWeight] = useState<string>(
    existing?.weight?.toString() ?? carryFrom?.weight?.toString() ?? ""
  );
  const [reps, setReps] = useState<string>(
    existing?.repetitions?.toString() ?? carryFrom?.repetitions?.toString() ?? ""
  );

  // Cuando se completa la serie anterior (o llegan datos de la sesión
  // pasada), la fila ya puede estar montada con el campo vacío. Si el
  // usuario todavía no escribió nada, la precargamos; si ya escribió algo,
  // no lo pisamos.
  useEffect(() => {
    if (isDone) return;
    if (weight === "" && carryFrom?.weight != null) setWeight(String(carryFrom.weight));
    if (reps === "" && carryFrom?.repetitions != null) setReps(String(carryFrom.repetitions));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carryFrom?.weight, carryFrom?.repetitions, isDone]);

  return (
    <div
      className={`grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 items-center rounded-md px-1 py-1 ${
        isDone ? "bg-green-50" : ""
      }`}
    >
      <span className="text-sm font-medium text-slate-500">{setNumber}</span>
      <input
        type="number"
        inputMode="decimal"
        placeholder="0"
        value={weight}
        disabled={isDone}
        onChange={(e) => setWeight(e.target.value)}
        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm disabled:bg-transparent disabled:border-transparent"
      />
      <input
        type="number"
        inputMode="numeric"
        placeholder="0"
        value={reps}
        disabled={isDone}
        onChange={(e) => setReps(e.target.value)}
        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm disabled:bg-transparent disabled:border-transparent"
      />
      <button
        disabled={isDone}
        onClick={() =>
          onComplete(weight ? Number(weight) : null, reps ? Number(reps) : null)
        }
        className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
          isDone
            ? "bg-green-500 text-white"
            : "bg-slate-100 text-slate-400 hover:bg-blue-100 hover:text-blue-600"
        }`}
        aria-label={isDone ? "Serie completada" : "Completar serie"}
      >
        ✓
      </button>
    </div>
  );
}
