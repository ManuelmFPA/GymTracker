// Refleja com.gymtracker.exception.ApiError del backend
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  fieldErrors?: Record<string, string> | null;
}

// Wrapper que usamos en el frontend para distinguir errores de red / validación
export class ApiRequestError extends Error {
  status: number;
  fieldErrors?: Record<string, string> | null;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = "ApiRequestError";
    this.status = apiError.status;
    this.fieldErrors = apiError.fieldErrors;
  }
}
