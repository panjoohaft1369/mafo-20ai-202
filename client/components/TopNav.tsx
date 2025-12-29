import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Zap, MessageCircle, Menu, X, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAuthState } from "@/lib/auth";
import { getAdminToken } from "@/lib/admin-auth";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function TopNav() {
  const location = useLocation();
  const [auth, setAuth] = useState(getAuthState());
  const [isOpen, setIsOpen] = useState(false);
  const [showZeroCreditModal, setShowZeroCreditModal] = useState(false);

  // Update auth state when component mounts or when location changes
  useEffect(() => {
    const checkAuth = () => {
      setAuth(getAuthState());
    };

    // Check on component mount
    checkAuth();

    // Listen for storage changes (for multi-tab sync)
    window.addEventListener("storage", checkAuth);

    // Also check periodically
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener("storage", checkAuth);
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { label: "خانه", href: "/" },
    { label: "آموزش‌ها", href: "/tutorials" },
    { label: "درباره ما", href: "/about" },
    { label: "تماس با ما", href: "/contact" },
  ];

  // Check if user is admin (either via hardcoded admin token or role-based admin)
  const isAdmin =
    (auth.isLoggedIn && auth.role === "admin") || !!getAdminToken();

  // Add admin panel link if user is admin
  if (isAdmin) {
    navItems.push({ label: "پنل ادمین", href: "/admin" });
  }

  // Check if a menu item is active
  const isActive = (href: string) => {
    // For root path, only match exactly
    if (href === "/") {
      return location.pathname === "/";
    }
    // For other paths, match if pathname starts with href
    return location.pathname.startsWith(href);
  };

  // WhatsApp contact information
  const whatsappNumber = "+989357887572";
  const whatsappMessage =
    "سلام، من برای اطلاعات بیشتر تماس می‌گیرم";

  const handleZeroCreditClick = () => {
    setShowZeroCreditModal(true);
  };

  return (
    <>
      {/* Desktop/Tablet Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 px-4 py-4">
        <div className="backdrop-blur-md bg-background/40 border border-foreground/10 rounded-lg px-4 md:px-10 py-3 shadow-lg">
          <div className="flex flex-row gap-6 md:gap-12 justify-center items-center">
            {/* Navigation Items */}
            <ul className="flex flex-row gap-3 md:gap-12 justify-center items-center">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg block text-center ${
                        active
                          ? "text-primary bg-primary/10 border border-primary/30"
                          : "hover:text-primary"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Credits Box */}
            {auth.isLoggedIn && auth.credits !== null && (
              <div className="flex gap-2 items-center border-l border-foreground/10 pl-8">
                <div className="flex items-center gap-2 bg-yellow-100/80 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-600 rounded-lg px-4 py-2 min-w-max">
                  <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-yellow-700 dark:text-yellow-300">
                      اعتبار باقی
                    </span>
                    <span className="text-lg font-bold text-yellow-700 dark:text-yellow-200">
                      {auth.credits}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Hamburger Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 p-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="backdrop-blur-md bg-background/40 border border-foreground/10 rounded-lg p-3 flex items-center justify-center w-12 h-12 hover:bg-foreground/10 transition-colors"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Off-Canvas Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          {/* Off-Canvas Panel */}
          <div className="fixed top-0 right-0 h-full w-80 max-w-[80vw] bg-background border-l border-foreground/10 shadow-lg z-40 md:hidden overflow-y-auto">
            <div className="pt-20 pb-6 px-4 space-y-4">
              {/* Navigation Items */}
              <ul className="space-y-2 mb-6">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg block text-right ${
                          active
                            ? "text-primary bg-primary/10 border border-primary/30"
                            : "hover:text-primary"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Divider */}
              <div className="border-t border-foreground/10" />

              {/* Credits Box (Mobile) */}
              {auth.isLoggedIn && auth.credits !== null && (
                <div className="flex items-center gap-2 bg-yellow-100/80 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-600 rounded-lg px-4 py-2 w-full">
                  <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                  <div className="flex flex-col items-end flex-1">
                    <span className="text-xs text-yellow-700 dark:text-yellow-300">
                      اعتبار باقی
                    </span>
                    <span className="text-lg font-bold text-yellow-700 dark:text-yellow-200">
                      {auth.credits}
                    </span>
                  </div>
                </div>
              )}

              {/* Contact Info Buttons */}
              <div className="space-y-2 pt-2">
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full gap-2 bg-green-600 hover:bg-green-700">
                    <MessageCircle className="h-4 w-4" />
                    واتساپ
                  </Button>
                </a>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    window.location.href = `tel:${whatsappNumber}`;
                    setIsOpen(false);
                  }}
                >
                  {whatsappNumber.replace("+98", "0")}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
