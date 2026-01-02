import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Zap, MessageCircle, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAuthState, updateStoredCredits } from "@/lib/auth";
import { getAdminToken } from "@/lib/admin-auth";
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

    // Sync credits from server periodically (every 10 seconds)
    const syncCredits = async () => {
      const currentAuth = getAuthState();
      if (!currentAuth.isLoggedIn || !currentAuth.apiKey) return;

      try {
        const response = await fetch("/api/user/profile", {
          method: "GET",
          headers: {
            "X-API-Key": currentAuth.apiKey,
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const { credits: newCredits } = result.data;
            // Update localStorage and state if credits differ from server
            if (newCredits !== currentAuth.credits) {
              updateStoredCredits(newCredits);
              setAuth(getAuthState());
            }
          }
        }
      } catch (err) {
        // Silently ignore sync errors to avoid console spam
        console.debug("[TopNav] Credit sync failed:", err);
      }
    };

    // Listen for storage changes (for multi-tab sync)
    window.addEventListener("storage", checkAuth);

    // Check periodically
    const interval = setInterval(checkAuth, 1000);

    // Sync credits from server every 10 seconds
    const syncInterval = setInterval(syncCredits, 10000);

    return () => {
      window.removeEventListener("storage", checkAuth);
      clearInterval(interval);
      clearInterval(syncInterval);
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
  const whatsappMessage = "سلام، من برای اطلاعات بیشتر تماس می‌گیرم";

  const handleZeroCreditClick = () => {
    setShowZeroCreditModal(true);
  };

  return (
    <>
      {/* Desktop/Tablet Navigation */}
      <nav className="hidden md:flex fixed top-0 left-1/2 transform -translate-x-1/2 z-50 justify-center px-6 py-4">
        <div
          className="backdrop-blur-md bg-background/40 border border-foreground/10 rounded-lg px-4 py-2 shadow-lg"
          style={{ width: "fit-content", maxWidth: "90vw" }}
        >
          <div className="flex flex-row justify-between items-center gap-3">
            {/* Navigation Items - Left Side */}
            <ul className="flex flex-row gap-1.5 items-center">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={`text-sm font-bold transition-colors px-2 py-1 rounded-lg block text-center whitespace-nowrap ${
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

            {/* Credits Box - Right Side */}
            {auth.isLoggedIn && auth.credits !== null && (
              <div className="flex gap-1.5 items-center flex-shrink-0">
                {auth.credits <= 0 ? (
                  <button
                    onClick={handleZeroCreditClick}
                    className="flex items-center gap-1 bg-red-100/80 dark:bg-red-900/30 border border-red-300 dark:border-red-600 rounded-lg px-2.5 py-1 min-w-max hover:bg-red-200/80 dark:hover:bg-red-900/50 transition-colors cursor-pointer"
                  >
                    <Zap className="h-3.5 w-3.5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-red-700 dark:text-red-300 leading-tight font-semibold">
                        اعتبار
                      </span>
                      <span className="text-sm font-bold text-red-700 dark:text-red-200 leading-tight">
                        {auth.credits}
                      </span>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-1 bg-yellow-100/80 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-600 rounded-lg px-2.5 py-1 min-w-max">
                    <Zap className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-yellow-700 dark:text-yellow-300 leading-tight font-semibold">
                        اعتبار
                      </span>
                      <span className="text-sm font-bold text-yellow-700 dark:text-yellow-200 leading-tight">
                        {auth.credits}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Hamburger Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-end">
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
              {auth.isLoggedIn &&
                auth.credits !== null &&
                (auth.credits <= 0 ? (
                  <button
                    onClick={handleZeroCreditClick}
                    className="flex items-center gap-2 bg-red-100/80 dark:bg-red-900/30 border border-red-300 dark:border-red-600 rounded-lg px-4 py-2 w-full hover:bg-red-200/80 dark:hover:bg-red-900/50 transition-colors cursor-pointer"
                  >
                    <Zap className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <div className="flex flex-col items-end flex-1">
                      <span className="text-xs text-red-700 dark:text-red-300">
                        اعتبار باقی
                      </span>
                      <span className="text-lg font-bold text-red-700 dark:text-red-200">
                        {auth.credits}
                      </span>
                    </div>
                  </button>
                ) : (
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
                ))}

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

      {/* Zero Credit Modal */}
      {showZeroCreditModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowZeroCreditModal(false)}
          />
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <div className="bg-background border border-red-300 rounded-lg p-6 max-w-md w-full shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-red-700">
                  ❌ اعتبار به اتمام رسیده
                </h2>
                <button
                  onClick={() => setShowZeroCreditModal(false)}
                  className="text-foreground/60 hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-foreground mb-6">
                متاسفانه اعتبار شما برای استفاده از تصویر ساز به پایان رسید.
                برای تمدید اعتبار با تیم پشتیبانی تماس بگیرید.
              </p>
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^\d]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full gap-2 bg-green-600 hover:bg-green-700">
                  <MessageCircle className="h-4 w-4" />
                  پیام در واتساپ
                </Button>
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
