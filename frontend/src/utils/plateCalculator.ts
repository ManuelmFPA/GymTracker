// Discos estándar disponibles en la mayoría de gimnasios (en kg).
export const STANDARD_PLATES = [20, 15, 10, 5, 2.5, 1.25] as const;

export interface PlateResult {
  perSide: number[]; // discos a poner en UN lado de la barra, de mayor a menor
  achievedWeight: number; // peso real que se logra (puede diferir del objetivo si no calza exacto)
  exact: boolean;
}

// Calcula qué discos poner en cada lado de la barra para acercarse lo más
// posible al peso objetivo, usando un algoritmo goloso (greedy) con los
// discos más grandes primero. Asume discos ilimitados de cada tamaño.
export function calculatePlates(
  targetWeight: number,
  barWeight: number,
  availablePlates: readonly number[] = STANDARD_PLATES
): PlateResult {
  const weightPerSide = (targetWeight - barWeight) / 2;

  if (weightPerSide <= 0) {
    return { perSide: [], achievedWeight: barWeight, exact: targetWeight === barWeight };
  }

  const sorted = [...availablePlates].sort((a, b) => b - a);
  const perSide: number[] = [];
  let remaining = weightPerSide;

  for (const plate of sorted) {
    // Margen pequeño para evitar problemas de precisión con decimales (1.25kg).
    while (remaining >= plate - 0.001) {
      perSide.push(plate);
      remaining -= plate;
    }
  }

  const achievedPerSide = perSide.reduce((sum, p) => sum + p, 0);
  const achievedWeight = barWeight + achievedPerSide * 2;

  return {
    perSide,
    achievedWeight: Math.round(achievedWeight * 100) / 100,
    exact: Math.abs(achievedWeight - targetWeight) < 0.01,
  };
}
