import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAuthState, clearAuth } from "@/lib/auth";

export function TopNav() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [auth, setAuth] = useState(getAuthState());

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

  const handleLogout = () => {
    clearAuth();
    setAuth(getAuthState());
    navigate("/");
  };

  const navItems = [
    { label: "خانه", href: "/" },
    { label: "آموزش‌ها", href: "/tutorials" },
    { label: "درباره ما", href: "/about" },
    { label: "تماس با ما", href: "/contact" },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4">
        <div className="backdrop-blur-md bg-background/40 border border-foreground/10 rounded-lg px-10 py-3 shadow-lg">
          <div className="flex gap-12 justify-center items-center whitespace-nowrap">
            <ul className="flex gap-12 justify-center items-center">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 items-center border-l border-foreground/10 pl-8">
              {auth.isLoggedIn && auth.credits !== null ? (
                // Logged In - Show Credits Box
                <>
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
                  <Link to="/admin-login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent hover:bg-foreground/5"
                    >
                      پنل ادمین
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:border-red-400"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    خروج
                  </Button>
                </>
              ) : (
                // Not Logged In - Show Login/Register
                <>
                  <Link to="/admin-login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent hover:bg-foreground/5"
                    >
                      پنل ادمین
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent hover:bg-foreground/5"
                    >
                      ورود
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      ثبت نام
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 p-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="backdrop-blur-md bg-background/40 border border-foreground/10 rounded-lg p-3 flex items-center justify-center w-12 h-12 hover:bg-foreground/10 transition-colors"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="backdrop-blur-md bg-background/80 border border-foreground/10 rounded-lg mt-3 p-4 absolute top-16 left-4 right-4 shadow-lg">
            <ul className="flex flex-col gap-3 mb-4">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="text-sm font-medium hover:text-primary transition-colors block"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-foreground/10 pt-3 space-y-2">
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
              <Link
                to="/admin-login"
                onClick={() => setIsOpen(false)}
                className="block"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent hover:bg-foreground/5"
                >
                  پنل ادمین
                </Button>
              </Link>
              {!auth.isLoggedIn ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent hover:bg-foreground/5"
                    >
                      ورود
                    </Button>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block"
                  >
                    <Button
                      size="sm"
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      ثبت نام
                    </Button>
                  </Link>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:border-red-400"
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  خروج
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
