import { Outlet } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";

// Layout de las páginas privadas: contenido arriba, tabs fijos abajo.
// pb-16 deja espacio para que la nav inferior no tape el contenido.
export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="pb-16">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}
