import { useEffect } from "react";

interface PrToastProps {
  message: string;
  onDismiss: () => void;
}

export function PrToast({ message, onDismiss }: PrToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex justify-center">
      <div
        className="bg-amber-400 text-amber-950 rounded-full px-4 py-2 shadow-lg flex items-center gap-2 text-sm font-medium animate-bounce"
        onClick={onDismiss}
      >
        🏆 ¡Nuevo récord! {message}
      </div>
    </div>
  );
}
