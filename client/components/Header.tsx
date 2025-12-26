import { Link, useNavigate } from "react-router-dom";
import { Menu, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

export function Header({ isLoggedIn, onLogout }: HeaderProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // WhatsApp contact information
  const whatsappNumber = "+989123456789"; // Replace with actual WhatsApp number
  const whatsappMessage = "سلام، من برای ثبت سفارش جدید اکانت در MAFO تماس می‌گیرم";

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-20 items-center justify-between px-4 sm:px-8">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F4c88dfcd13ad44aba9d3f4537f9785d5%2Fa2dcdb2b6e894df7989c87db38a879a2?format=webp&width=800"
              alt="MAFO"
              className="h-12 w-12 drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]"
              style={{
                filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.8))'
              }}
            />
            <div className="flex flex-col items-start">
              <h1 className="text-lg sm:text-xl font-bold">
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
