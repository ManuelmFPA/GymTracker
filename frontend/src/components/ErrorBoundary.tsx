import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Red de seguridad: si cualquier componente de la app lanza un error al
// renderizar, React por defecto desmonta TODO el árbol y deja la pantalla
// en blanco. Esto evita eso, mostrando una pantalla de recuperación simple.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error no controlado:", error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <div className="text-center max-w-xs">
            <p className="text-lg font-semibold text-slate-900 mb-2">
              Algo salió mal
            </p>
            <p className="text-sm text-slate-500 mb-4">
              Ocurrió un error inesperado. Puedes intentar de nuevo.
            </p>
            <button
              onClick={this.handleReload}
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
