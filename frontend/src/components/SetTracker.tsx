import { useState } from "react";
import type { SetType, WorkoutExerciseResponse } from "../types/workout";
import { PlateCalculator } from "./PlateCalculator";

interface SetTrackerProps {
  workoutExercise: WorkoutExerciseResponse;
  onCompleteSet: (
    setNumber: number,
    weight: number | null,
    reps: number | null,
    setType: SetType
  ) => void;
}

export function SetTracker({ workoutExercise, onCompleteSet }: SetTrackerProps) {
  const rows = Array.from({ length: workoutExercise.targetSets }, (_, i) => i + 1);
  const repsHint =
    workoutExercise.targetRepsMin && workoutExercise.targetRepsMax
      ? `${workoutExercise.targetRepsMin}-${workoutExercise.targetRepsMax}`
      : workoutExercise.targetRepsMax
        ? `${workoutExercise.targetRepsMax}`
        : "—";

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-baseline justify-between mb-1">
        <p className="font-medium text-slate-900">{workoutExercise.exerciseName}</p>
        <p className="text-xs text-slate-400">objetivo: {repsHint} reps</p>
      </div>
      {workoutExercise.bestSetSummary && (
        <p className="text-xs text-slate-400 mb-3">Mejor: {workoutExercise.bestSetSummary}</p>
      )}

      <div className="grid grid-cols-[2rem_1fr_1fr_2rem_2.5rem] gap-2 items-center text-xs text-slate-400 mb-1 px-1">
        <span>#</span>
        <span>kg</span>
        <span>reps</span>
        <span></span>
        <span></span>
      </div>

      <div className="space-y-2">
        {rows.map((setNumber) => (
          <SetRow
            key={setNumber}
            setNumber={setNumber}
            existing={workoutExercise.sets.find((s) => s.setNumber === setNumber)}
            previous={workoutExercise.previousSets.find((s) => s.setNumber === setNumber)}
            onComplete={(weight, reps, setType) =>
              onCompleteSet(setNumber, weight, reps, setType)
            }
          />
        ))}
      </div>
    </div>
  );
}

const TYPE_LABELS: Record<SetType, { label: string; className: string }> = {
  NORMAL: { label: "N", className: "bg-slate-100 text-slate-500" },
  WARMUP: { label: "C", className: "bg-amber-100 text-amber-700" },
  FAILURE: { label: "F", className: "bg-red-100 text-red-700" },
  DROP: { label: "D", className: "bg-purple-100 text-purple-700" },
};
const TYPE_ORDER: SetType[] = ["NORMAL", "WARMUP", "FAILURE", "DROP"];
const TYPE_TITLES: Record<SetType, string> = {
  NORMAL: "Normal",
  WARMUP: "Calentamiento (no cuenta para volumen/PRs)",
  FAILURE: "Al fallo",
  DROP: "Drop set",
};

interface SetRowProps {
  setNumber: number;
  existing?: WorkoutExerciseResponse["sets"][number];
  previous?: WorkoutExerciseResponse["previousSets"][number];
  onComplete: (weight: number | null, reps: number | null, setType: SetType) => void;
}

function SetRow({ setNumber, existing, previous, onComplete }: SetRowProps) {
  const isDone = existing?.status === "COMPLETED";
  const [weight, setWeight] = useState<string>(existing?.weight?.toString() ?? "");
  const [reps, setReps] = useState<string>(existing?.repetitions?.toString() ?? "");
  const [setType, setSetType] = useState<SetType>(existing?.setType ?? "NORMAL");
  const [showCalculator, setShowCalculator] = useState(false);

  const placeholderWeight = previous?.weight != null ? String(previous.weight) : "0";
  const placeholderReps = previous?.repetitions != null ? String(previous.repetitions) : "0";

  const calculatorTarget = weight ? Number(weight) : previous?.weight ?? null;

  function cycleType() {
    const idx = TYPE_ORDER.indexOf(setType);
    setSetType(TYPE_ORDER[(idx + 1) % TYPE_ORDER.length]);
  }

  const typeStyle = TYPE_LABELS[isDone && existing ? existing.setType : setType];
  const displayType = isDone && existing ? existing.setType : setType;

  return (
    <div
      className={`grid grid-cols-[2rem_1fr_1fr_2rem_2.5rem] gap-2 items-center rounded-md px-1 py-1 ${
        isDone ? "bg-green-50" : ""
      }`}
    >
      <button
        onClick={cycleType}
        disabled={isDone}
        title={TYPE_TITLES[displayType]}
        className="flex items-center gap-1 text-sm font-medium text-slate-500 disabled:cursor-default"
      >
        {setNumber}
        {displayType !== "NORMAL" && (
          <span className={`text-[10px] font-bold rounded px-1 ${typeStyle.className}`}>
            {typeStyle.label}
          </span>
        )}
      </button>
      <input
        type="number"
        inputMode="decimal"
        placeholder={placeholderWeight}
        value={weight}
        disabled={isDone}
        onChange={(e) => setWeight(e.target.value)}
        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm disabled:bg-transparent disabled:border-transparent"
      />
      <input
        type="number"
        inputMode="numeric"
        placeholder={placeholderReps}
        value={reps}
        disabled={isDone}
        onChange={(e) => setReps(e.target.value)}
        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm disabled:bg-transparent disabled:border-transparent"
      />
      <button
        onClick={() => setShowCalculator(true)}
        className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-blue-600 transition"
        aria-label="Calculadora de discos"
        title="Calculadora de discos"
      >
        🏋️
      </button>
      <button
        disabled={isDone}
        onClick={() =>
          onComplete(weight ? Number(weight) : null, reps ? Number(reps) : null, setType)
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

      {showCalculator && (
        <PlateCalculator
          initialTarget={calculatorTarget}
          onClose={() => setShowCalculator(false)}
        />
      )}
    </div>
  );
}
