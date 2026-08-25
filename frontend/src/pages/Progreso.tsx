import { type FormEvent, useEffect, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { bodyWeightApi } from "../api/bodyweight";
import { progressApi } from "../api/progress";
import type { BodyWeightResponse } from "../types/bodyweight";
import type { DashboardResponse } from "../types/progress";
import { ApiRequestError } from "../types/common";

function today(): string {
  return new Date().toISOString().slice(0, 10); // yyyy-MM-dd
}

export default function Progreso() {
  const [history, setHistory] = useState<BodyWeightResponse[]>([]);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function loadHistory() {
    return bodyWeightApi
      .getHistory()
      .then((data) =>
        setHistory([...data].sort((a, b) => a.date.localeCompare(b.date)))
      );
  }

  useEffect(() => {
    setIsLoading(true);
    Promise.all([loadHistory(), progressApi.getDashboard().then(setDashboard)])
      .catch(() => setError("No se pudo cargar tu progreso"))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAddWeight(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = Number(weight);
    if (!weight || Number.isNaN(parsed) || parsed <= 0) {
      setFormError("Ingresa un peso válido");
      return;
    }

    setIsSaving(true);
    try {
      await bodyWeightApi.add({
        weight: parsed,
        date,
        notes: notes.trim() ? notes.trim() : null,
      });
      setWeight("");
      setNotes("");
      await loadHistory();
    } catch (err) {
      setFormError(
        err instanceof ApiRequestError ? err.message : "No se pudo registrar el peso"
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este registro de peso?")) return;
    try {
      await bodyWeightApi.delete(id);
      setHistory((h) => h.filter((entry) => entry.id !== id));
    } catch {
      setError("No se pudo eliminar el registro");
    }
  }

  const chartData = history.map((h) => ({ date: h.date.slice(5), peso: h.weight }));
  const latest = history[history.length - 1] ?? null;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Progreso</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {dashboard && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-slate-500">Esta semana</p>
            <p className="text-lg font-semibold text-slate-900">
              {dashboard.workoutsThisWeek} entren.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-slate-500">Este mes</p>
            <p className="text-lg font-semibold text-slate-900">
              {dashboard.workoutsThisMonth} entren.
            </p>
          </div>
        </div>
      )}

      {/* Registrar peso */}
      <form onSubmit={handleAddWeight} className="bg-white rounded-lg shadow p-4 space-y-3">
        <p className="text-sm font-medium text-slate-700">Registrar peso</p>

        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="weight" className="block text-xs text-slate-500 mb-1">
              Peso (kg)
            </label>
            <input
              id="weight"
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder={latest ? String(latest.weight) : "70.0"}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="date" className="block text-xs text-slate-500 mb-1">
              Fecha
            </label>
            <input
              id="date"
              type="date"
              value={date}
              max={today()}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-xs text-slate-500 mb-1">
            Notas (opcional)
          </label>
          <input
            id="notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {isSaving ? "Guardando..." : "Guardar peso"}
        </button>
      </form>

      {/* Gráfica */}
      {isLoading && <p className="text-sm text-slate-500">Cargando...</p>}

      {!isLoading && chartData.length > 1 && (
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-slate-700 mb-2">Evolución</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis
                  tick={{ fontSize: 10 }}
                  stroke="#94a3b8"
                  domain={["dataMin - 1", "dataMax + 1"]}
                />
                <Tooltip />
                <Line type="monotone" dataKey="peso" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Historial */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-slate-700 mb-2">Historial</p>
          {history.length === 0 ? (
            <p className="text-sm text-slate-500">Aún no has registrado tu peso.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {[...history].reverse().map((entry) => (
                <li key={entry.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm text-slate-900">{entry.weight} kg</p>
                    <p className="text-xs text-slate-400">
                      {entry.date}
                      {entry.notes ? ` · ${entry.notes}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
