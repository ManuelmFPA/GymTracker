import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Dumbbell,
  LineChart,
  User,
} from "lucide-react";

const TABS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/rutinas", label: "Rutinas", icon: ClipboardList, end: false },
  { to: "/entrenar", label: "Entrenar", icon: Dumbbell, end: false },
  { to: "/progreso", label: "Progreso", icon: LineChart, end: false },
  { to: "/perfil", label: "Perfil", icon: User, end: false },
] as const;

// Navegación inferior fija, pensada para móvil (safe-area incluido para iOS).
export function BottomNavigation() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex justify-around">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                  isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
                }`
              }
            >
              <Icon size={22} strokeWidth={2} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
