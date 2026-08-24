// Refleja com.gymtracker.dto.bodyweight.*
export interface BodyWeightRequest {
  weight: number;
  date: string; // ISO date (yyyy-MM-dd), coincide con LocalDate del backend
  notes?: string | null;
}

export interface BodyWeightResponse {
  id: number;
  weight: number;
  date: string;
  notes: string | null;
}
