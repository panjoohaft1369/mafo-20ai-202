import { Link, useLocation } from "react-router-dom";
import { Menu, LogOut, Wand2, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sidebar } from "./Sidebar";

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

export function Header({ isLoggedIn, onLogout }: HeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-20 items-center justify-between px-4 sm:px-8">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex flex-col items-start">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent bg-clip-text text-transparent">
                MAFO
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                هوش مصنوعی
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          {isLoggedIn && (
            <div className="hidden sm:flex items-center gap-2 mx-auto">
              <Link to="/generate">
                <Button
                  variant={
                    location.pathname === "/generate" ? "default" : "ghost"
                  }
                  size="sm"
                  className="gap-2"
                >
                  <Wand2 className="h-4 w-4" />
                  تصویر
                </Button>
              </Link>
              <Link to="/generate-video">
                <Button
                  variant={
                    location.pathname === "/generate-video"
                      ? "default"
                      : "ghost"
                  }
                  size="sm"
                  className="gap-2"
                >
                  <Film className="h-4 w-4" />
                  ویدیو
                </Button>
              </Link>
            </div>
          )}

          {/* Center spacer */}
          <div className="flex-1" />

          {/* Right side actions */}
          {isLoggedIn && (
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Support buttons - desktop */}
              <div className="hidden sm:flex items-center gap-2">
                <a
                  href="tel:+989357887572"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="text-xs">
                    ☎ <span className="hidden sm:inline">تماس</span>
                  </Button>
                </a>
                <a
                  href="http://wa.me/+989357887572"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="text-xs">
                    💬 واتساپ
                  </Button>
                </a>
              </div>

              {/* Logout button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">خروج</span>
              </Button>

              {/* Mobile menu */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="sm:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </header>

      <Sidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        onLogout={onLogout}
      />
    </>
  );
}
