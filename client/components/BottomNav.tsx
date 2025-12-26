import { Link, useLocation } from "react-router-dom";
import { Image, Film, Phone, History, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomNavProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

export function BottomNav({ isLoggedIn, onLogout }: BottomNavProps) {
  const location = useLocation();

  if (!isLoggedIn) {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 w-full border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-around px-4 sm:px-8">
        {/* Image Tab */}
        <Link to="/generate" className="flex flex-col items-center justify-center h-full">
          <Button
            variant={isActive("/generate") ? "default" : "ghost"}
            size="icon"
            className="rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
          >
            <Image className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <span className="text-xs sm:text-sm mt-1 font-medium">تصویر</span>
        </Link>

        {/* Video Tab */}
        <Link to="/generate-video" className="flex flex-col items-center justify-center h-full">
          <Button
            variant={isActive("/generate-video") ? "default" : "ghost"}
            size="icon"
            className="rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
          >
            <Film className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <span className="text-xs sm:text-sm mt-1 font-medium">ویدیو</span>
        </Link>

        {/* Support Tab */}
        <Link to="/support" className="flex flex-col items-center justify-center h-full">
          <Button
            variant={isActive("/support") ? "default" : "ghost"}
            size="icon"
            className="rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
          >
            <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <span className="text-xs sm:text-sm mt-1 font-medium">پشتیبانی</span>
        </Link>

        {/* History Tab */}
        <Link to="/history" className="flex flex-col items-center justify-center h-full">
          <Button
            variant={isActive("/history") ? "default" : "ghost"}
            size="icon"
            className="rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
          >
            <History className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <span className="text-xs sm:text-sm mt-1 font-medium">تاریخچه</span>
        </Link>

        {/* Logout Tab */}
        <button
          onClick={onLogout}
          className="flex flex-col items-center justify-center h-full"
        >
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
          >
            <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <span className="text-xs sm:text-sm mt-1 font-medium">خروج</span>
        </button>
      </div>
    </div>
  );
}
