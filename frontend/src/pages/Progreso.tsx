import { useEffect, useState } from "react";
import { progressApi } from "../api/progress";
import type { DashboardResponse } from "../types/progress";

export default function Progreso() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    progressApi
      .getDashboard()
      .then(setDashboard)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold text-slate-900 mb-4">Progreso</h1>

      {isLoading && <p className="text-sm text-slate-500">Cargando...</p>}

      {dashboard && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-slate-500">Peso actual</p>
            <p className="text-lg font-semibold text-slate-900">
              {dashboard.currentWeight ?? "—"} kg
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs text-slate-500">Entrenamientos este mes</p>
            <p className="text-lg font-semibold text-slate-900">
              {dashboard.workoutsThisMonth}
            </p>
          </div>
        </div>
      )}
      {/* TODO: gráfica de peso corporal y volumen con Recharts usando weightHistory */}
    </div>
  );
}
