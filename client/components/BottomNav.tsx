import { Link, useLocation, useNavigate } from "react-router-dom";
import { Image, Film, History, User, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomNavProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

export function BottomNav({ isLoggedIn, onLogout }: BottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-[15px] left-0 right-0 z-40 w-full border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-around px-4 sm:px-8">
        {/* Image Tab */}
        {isLoggedIn ? (
          <Link
            to="/generate"
            className="flex flex-col items-center justify-center h-full"
          >
            <Button
              variant={isActive("/generate") ? "default" : "ghost"}
              size="icon"
              className="rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
            >
              <Image className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <span className="text-xs sm:text-sm mt-1 font-medium">
              تصویر ساز
            </span>
          </Link>
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-50 cursor-not-allowed">
            <Button
              disabled
              size="icon"
              className="rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
            >
              <Image className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <span className="text-xs sm:text-sm mt-1 font-medium text-muted-foreground">
              تصویر ساز
            </span>
          </div>
        )}

        {/* Video Tab */}
        {isLoggedIn ? (
          <Link
            to="/generate-video"
            className="flex flex-col items-center justify-center h-full"
          >
            <Button
              variant={isActive("/generate-video") ? "default" : "ghost"}
              size="icon"
              className="rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
            >
              <Film className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <span className="text-xs sm:text-sm mt-1 font-medium">
              ویدیو ساز
            </span>
          </Link>
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-50 cursor-not-allowed">
            <Button
              disabled
              size="icon"
              className="rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
            >
              <Film className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <span className="text-xs sm:text-sm mt-1 font-medium text-muted-foreground">
              ویدیو ساز
            </span>
          </div>
        )}

        {/* History Tab */}
        {isLoggedIn ? (
          <Link
            to="/history"
            className="flex flex-col items-center justify-center h-full"
          >
            <Button
              variant={isActive("/history") ? "default" : "ghost"}
              size="icon"
              className="rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
            >
              <History className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <span className="text-xs sm:text-sm mt-1 font-medium">تاریخچه</span>
          </Link>
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-50 cursor-not-allowed">
            <Button
              disabled
              size="icon"
              className="rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
            >
              <History className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <span className="text-xs sm:text-sm mt-1 font-medium text-muted-foreground">
              تاریخچه
            </span>
          </div>
        )}

        {/* Profile Tab */}
        {isLoggedIn ? (
          <Link
            to="/profile"
            className="flex flex-col items-center justify-center h-full"
          >
            <Button
              variant={isActive("/profile") ? "default" : "ghost"}
              size="icon"
              className="rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
            >
              <User className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <span className="text-xs sm:text-sm mt-1 font-medium">
              مشخصات کاربری
            </span>
          </Link>
        ) : null}

        {/* Logout/Login Tab */}
        {isLoggedIn ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Button
              onClick={onLogout}
              size="icon"
              className="rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </Button>
            <span className="text-xs sm:text-sm mt-1 font-medium">خروج</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Button
              onClick={() => navigate("/login")}
              size="icon"
              className="rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg"
            >
              <LogIn className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </Button>
            <span className="text-xs sm:text-sm mt-1 font-medium">ورود</span>
          </div>
        )}
      </div>
    </div>
  );
}
