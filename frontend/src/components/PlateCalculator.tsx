import { useState } from "react";
import { calculatePlates, STANDARD_PLATES } from "../utils/plateCalculator";

const BAR_OPTIONS = [20, 15, 10] as const; // barra olímpica, barra corta, EZ bar (kg)

// Colores de referencia (no oficiales) solo para diferenciar discos a simple vista.
const PLATE_COLORS: Record<number, string> = {
  20: "bg-blue-600",
  15: "bg-yellow-500",
  10: "bg-green-600",
  5: "bg-slate-400",
  2.5: "bg-red-500",
  1.25: "bg-slate-300",
};

interface PlateCalculatorProps {
  initialTarget?: number | null;
  onClose: () => void;
}

export function PlateCalculator({ initialTarget, onClose }: PlateCalculatorProps) {
  const [target, setTarget] = useState(initialTarget ? String(initialTarget) : "");
  const [barWeight, setBarWeight] = useState<number>(20);

  const targetNum = Number(target);
  const result =
    target && !Number.isNaN(targetNum) && targetNum > 0
      ? calculatePlates(targetNum, barWeight, STANDARD_PLATES)
      : null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center sm:justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-4 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="font-medium text-slate-900">Calculadora de discos</p>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg">
            ✕
          </button>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">Peso objetivo (kg)</label>
            <input
              type="number"
              inputMode="decimal"
              autoFocus
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="w-28">
            <label className="block text-xs text-slate-500 mb-1">Barra (kg)</label>
            <select
              value={barWeight}
              onChange={(e) => setBarWeight(Number(e.target.value))}
              className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {BAR_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b} kg
                </option>
              ))}
            </select>
          </div>
        </div>

        {result && (
          <div className="bg-slate-50 rounded-lg p-4">
            {result.perSide.length === 0 ? (
              <p className="text-sm text-slate-500 text-center">
                Con la barra sola ({barWeight}kg) ya alcanzas o superas el objetivo.
              </p>
            ) : (
              <>
                <p className="text-xs text-slate-500 mb-2 text-center">Por cada lado:</p>
                <div className="flex items-end justify-center gap-1 h-16 mb-2">
                  {result.perSide.map((plate, i) => (
                    <div
                      key={i}
                      className={`${PLATE_COLORS[plate] ?? "bg-slate-400"} rounded-sm flex items-center justify-center text-white text-[10px] font-bold`}
                      style={{
                        width: 18,
                        height: 24 + plate * 1.6, // discos más pesados se ven más altos
                      }}
                    >
                      {plate}
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm text-slate-700">
                  {result.perSide.join(" + ")} kg
                </p>
              </>
            )}
            <p className="text-center text-sm font-medium text-slate-900 mt-2">
              {result.exact ? (
                `= ${result.achievedWeight} kg exacto`
              ) : (
                <>
                  ≈ {result.achievedWeight} kg{" "}
                  <span className="text-xs text-amber-600 font-normal">
                    (no calza exacto con los discos disponibles)
                  </span>
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
