import { useEffect, useState } from "react";
import { offlineQueue } from "./offlineQueue";

// Expone cuántas series están pendientes de sincronizar, para mostrar
// un indicador sutil ("2 series sin guardar") en la UI de Entrenar.
export function useOfflineQueue() {
  const [pendingCount, setPendingCount] = useState(offlineQueue.pendingCount);

  useEffect(() => offlineQueue.onChange(setPendingCount), []);

  return { pendingCount };
}
