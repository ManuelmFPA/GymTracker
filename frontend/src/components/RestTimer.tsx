import { useEffect, useState } from "react";

interface RestTimerProps {
  seconds: number;
  onDone: () => void;
}

export function RestTimer({ seconds, onDone }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onDone();
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onDone]);

  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-blue-600 text-white px-4 py-3 flex items-center justify-between z-40">
      <div>
        <p className="text-xs opacity-80">Descanso</p>
        <p className="text-2xl font-semibold tabular-nums">
          {mm}:{ss.toString().padStart(2, "0")}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setRemaining((r) => r + 15)}
          className="bg-blue-500 hover:bg-blue-400 text-sm font-medium px-3 py-2 rounded-lg transition"
        >
          +15s
        </button>
        <button
          onClick={onDone}
          className="bg-white text-blue-600 text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-50 transition"
        >
          Saltar
        </button>
      </div>
    </div>
  );
}
