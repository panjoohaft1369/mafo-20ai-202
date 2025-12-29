import { Edit2 } from "lucide-react";
import { getAdminToken } from "@/lib/admin-auth";

interface AdminEditButtonProps {
  onClick: () => void;
  className?: string;
}

export function AdminEditButton({
  onClick,
  className = "",
}: AdminEditButtonProps) {
  const isAdmin = !!getAdminToken();

  if (!isAdmin) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors ${className}`}
      title="ویرایش این بخش"
    >
      <Edit2 className="h-4 w-4" />
      ویرایش
    </button>
  );
}
