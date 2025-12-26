import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
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


          {/* Center spacer */}
          <div className="flex-1" />

          {/* Right side actions */}
          {isLoggedIn && (
            <div className="flex items-center gap-2 sm:gap-4">
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
