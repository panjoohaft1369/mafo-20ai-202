import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export function TopNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "خانه", href: "/" },
    { label: "آموزش‌ها", href: "#tutorials" },
    { label: "درباره ما", href: "#about" },
    { label: "تماس با ما", href: "#contact" },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      {isScrolled && (
        <nav className="hidden md:block fixed top-0 left-4 right-4 z-40 mt-4">
          <div className="backdrop-blur-md bg-background/40 border border-foreground/10 rounded-lg px-6 py-3 shadow-lg max-w-xs">
            <ul className="flex flex-col gap-3">
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
          </div>
        </nav>
      )}

      {/* Mobile Navigation */}
      {isScrolled && (
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
              <ul className="flex flex-col gap-3">
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
            </div>
          )}
        </div>
      )}
    </>
  );
}
