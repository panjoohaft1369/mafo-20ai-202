import { X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface TaskNotificationModalProps {
  isOpen: boolean;
  message: string;
  status: "loading" | "success" | "error";
  onClose: () => void;
}

export function TaskNotificationModal({
  isOpen,
  message,
  status,
  onClose,
}: TaskNotificationModalProps) {
  const [progress, setProgress] = useState(0);

  // Simulate progress animation during loading
  useEffect(() => {
    if (status !== "loading") {
      setProgress(0);
      return;
    }

    setProgress(15);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + Math.random() * 20;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [status]);

  if (!isOpen) return null;

  const getBackgroundColor = () => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case "success":
        return "bg-gradient-to-r from-green-400 to-green-600";
      case "error":
        return "bg-gradient-to-r from-red-400 to-red-600";
      default:
        return "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      case "error":
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />;
    }
  };

  const getTextColor = () => {
    switch (status) {
      case "success":
        return "text-green-900";
      case "error":
        return "text-red-900";
      default:
        return "text-blue-900";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      {/* Backdrop - clickable to close when not loading */}
      <div
        className={`fixed inset-0 transition-opacity duration-300 ${
          status === "loading" ? "bg-black/20 pointer-events-none" : "bg-black/0 pointer-events-auto"
        }`}
        onClick={() => status !== "loading" && onClose()}
      />

      {/* Modal */}
      <div className="pointer-events-auto fixed top-[300px] left-1/2 -translate-x-1/2 w-full max-w-md mx-auto px-4">
        <div
          className={`${getBackgroundColor()} border rounded-xl shadow-2xl overflow-hidden`}
        >
          {/* Close Button - Always Visible */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-black/10 rounded-lg transition-all duration-200 hover:scale-110 z-10"
            title="بستن"
            aria-label="بستن"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Content */}
          <div className="p-6 pr-12 flex items-center gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">{getIcon()}</div>

            {/* Message */}
            <div className={`flex-1 text-sm font-medium ${getTextColor()} text-right`}>
              {message}
            </div>
          </div>

          {/* Progress Bar - Only show during loading */}
          {status === "loading" && (
            <div className="w-full h-1.5 bg-black/5 overflow-hidden">
              <div
                className={`h-full ${getProgressColor()} transition-all duration-300 ease-out shadow-lg`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Success/Error bottom accent bar */}
          {status !== "loading" && (
            <div
              className={`h-1 ${
                status === "success"
                  ? "bg-gradient-to-r from-green-400 to-green-600"
                  : "bg-gradient-to-r from-red-400 to-red-600"
              }`}
            />
          )}
        </div>

        {/* Helper text for non-loading states */}
        {status !== "loading" && (
          <p className="text-center text-xs text-muted-foreground mt-3">
            برای بستن کلیک کنید یا در خارج از این باکس کلیک کنید
          </p>
        )}
      </div>
    </div>
  );
}
