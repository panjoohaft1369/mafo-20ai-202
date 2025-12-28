import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopNav() {
  const [isOpen, setIsOpen] = useState(false);

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
              <Link to="/admin">
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
              <Link
                to="/admin"
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
            </div>
          </div>
        )}
      </div>
    </>
  );
}
