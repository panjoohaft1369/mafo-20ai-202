import { X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

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
    <div className="fixed inset-0 pointer-events-none flex items-start justify-center">
      {/* Overlay - only block on loading */}
      {status === "loading" && (
        <div className="fixed inset-0 bg-black/20 pointer-events-auto" />
      )}

      {/* Modal */}
      <div className={`pointer-events-auto fixed top-[300px] left-1/2 -translate-x-1/2 w-full max-w-md mx-auto px-4 z-50`}>
        <div
          className={`${getBackgroundColor()} border rounded-lg shadow-lg p-6 flex items-center gap-4`}
        >
          {/* Icon */}
          <div className="flex-shrink-0">{getIcon()}</div>

          {/* Message */}
          <div className={`flex-1 text-sm font-medium ${getTextColor()} text-right`}>
            {message}
          </div>

          {/* Close Button */}
          {status !== "loading" && (
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 hover:bg-black/10 rounded transition-colors"
              title="بستن"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
