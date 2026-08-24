import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { progressApi } from "../api/progress";
import type { DashboardResponse } from "../types/progress";
import { ApiRequestError } from "../types/common";

export default function Dashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    progressApi
      .getDashboard()
      .then(setData)
      .catch((err) =>
        setError(
          err instanceof ApiRequestError ? err.message : "No se pudo cargar el dashboard"
        )
      )
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <p className="p-4 text-sm text-slate-500">Cargando...</p>;
  }

  if (error || !data) {
    return <p className="p-4 text-sm text-red-600">{error ?? "Sin datos"}</p>;
  }

  const chartData = data.weightHistory.map((p) => ({
    date: p.date.slice(5), // MM-DD, más compacto para el eje X
    peso: p.weight,
  }));

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Hola, {data.userName}</h1>
        <p className="text-sm text-slate-500">
          {data.lastWorkoutName
            ? `Último entrenamiento: ${data.lastWorkoutName}`
            : "Aún no registras entrenamientos"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Peso actual" value={data.currentWeight ? `${data.currentWeight} kg` : "—"} />
        <StatCard label="Esta semana" value={`${data.workoutsThisWeek} entren.`} />
        <StatCard label="Volumen semanal" value={`${Math.round(data.weeklyVolume)} kg`} />
        <StatCard label="Este mes" value={`${data.workoutsThisMonth} entren.`} />
      </div>

      {chartData.length > 1 && (
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-slate-700 mb-2">Peso corporal</p>
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

      {data.recentPRs.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-slate-700 mb-2">Récords recientes 🏆</p>
          <ul className="space-y-1">
            {data.recentPRs.map((pr, i) => (
              <li key={i} className="text-sm text-slate-600">
                {pr}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        to="/rutinas"
        className="block w-full text-center bg-blue-600 text-white text-sm font-medium py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Iniciar entrenamiento
      </Link>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
