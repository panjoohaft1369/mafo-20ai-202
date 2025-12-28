import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    درباره: [
      { label: "درباره ما", href: "/about" },
      { label: "تماس با ما", href: "/support" },
    ],
    منابع: [
      { label: "آموزش‌ها", href: "/tutorials" },
      { label: "تاریخچه", href: "/history" },
      { label: "پشتیبانی", href: "/support" },
    ],
  };

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8">
          <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-center text-sm">
              🇮🇷 <strong>MAFO</strong> - اولین هوش مصنوعی ایرانی برای تولید
              تصاویر و ویدیوهای پیشرفته
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                با حمایت شما، ما می‌توانیم به بهبود فناوری‌های ایرانی ادامه
                دهیم. این پروژه را با دوستان و همکاران خود به اشتراک بگذارید.
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {currentYear} MAFO AI. تمام حقوق محفوظ است.</p>
            <div className="flex gap-4">
              <a
                href="https://twitter.com"
                className="hover:text-foreground transition-colors"
              >
                توییتر
              </a>
              <a
                href="https://instagram.com"
                className="hover:text-foreground transition-colors"
              >
                اینستاگرام
              </a>
              <a
                href="https://telegram.com"
                className="hover:text-foreground transition-colors"
              >
                تلگرام
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
