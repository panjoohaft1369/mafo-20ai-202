import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Mail } from "lucide-react";
import { getAuthState, clearAuth } from "@/lib/auth";

export default function Support() {
  const navigate = useNavigate();
  const auth = getAuthState();

  // Redirect if not logged in
  if (!auth.isLoggedIn || !auth.apiKey) {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header isLoggedIn={true} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        {/* Title Section */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">پشتیبانی</h1>
          <p className="text-muted-foreground">
            درصورت نیاز به کمک، با ما تماس بگیرید
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Phone Support */}
          <Card>
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-3">
                <Phone className="h-5 w-5" />
              </div>
              <CardTitle>تماس تلفنی</CardTitle>
              <CardDescription>
                از طریق تلفن با ما در ارتباط باشید
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                شماره تلفن: <span className="font-semibold">۰۹۳۵۷۸۸۷۵۷۲</span>
              </p>
              <a
                href="tel:+989357887572"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full gap-2" variant="default">
                  <Phone className="h-4 w-4" />
                  تماس فوری
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* WhatsApp Support */}
          <Card>
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-3">
                <MessageCircle className="h-5 w-5" />
              </div>
              <CardTitle>پیام در واتساپ</CardTitle>
              <CardDescription>
                سوالات خود را از طریق واتساپ بپرسید
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                شماره واتساپ: <span className="font-semibold">۰۹۳۵۷۸۸۷۵۷۲</span>
              </p>
              <a
                href="http://wa.me/+989357887572"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full gap-2" variant="default" style={{ backgroundColor: "#25D366" }}>
                  <MessageCircle className="h-4 w-4" />
                  پیام در واتساپ
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* AI History Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">درباره MAFO</CardTitle>
            <CardDescription>
              تاریخچه فعالیت ما با فناوری های هوش مصنوعی
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">پیدایش یک نیاز</h3>
              <p>
                ما متوجه شدیم که فناوری های هوش مصنوعی برتر جهان دارای محدودیت های فراوانی برای کاربران ایرانی هستند. احراز هویت پیچیده، پرداخت های دلاری، و محدودیت های تحریمی، دسترسی به ابزارهای قدرتمند را برای مشاغل و کسب‌وکارهای ایرانی غیر ممکن کرده بود.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">تحقیق و بررسی</h3>
              <p>
                با الهام‌گیری از به‌روز‌ترین فناوری‌های هوش مصنوعی جهان، تصمیم گرفتیم که خود یک راه‌حل جامع بسازیم. طی فرآیندی دقیق، بسیاری از مدل‌های مختلف را مورد بررسی و اختبار قرار دادیم تا بهترین‌ها را برای کاربران انتخاب کنیم.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">ساخت راه‌حل اختصاصی</h3>
              <p>
                با در نظر گرفتن نیازهای صاحبان مشاغل و کسب‌وکارهای ایرانی، ما MAFO را پدید آوردیم. یک پلتفرم که بدون نیاز به احراز هویت خارجی، بدون پرداخت‌های دلاری، و بدون محدودیت‌های تحریمی، به هر ایرانی اجازه می‌دهد تا از قدرتمندترین ابزارهای تولید تصاویر و ویدیو استفاده کند.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">کمک به تجارت و صنعت</h3>
              <p>
                هدف ما این است که کاروان تجاری ایران را با فناوری‌های جدید تجهیز کنیم. MAFO کاری می‌کند تا کسب‌وکارهای ایرانی بتوانند محتوای بهتر و جذاب‌تری تولید کنند، فروش خود را افزایش دهند، و به مشتریان خود خدمات با کیفیت‌تری ارائه کنند.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">تعهد ما به شما</h3>
              <p>
                ما متعهد هستیم که:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>خدمات قابل‌اعتماد و بدون محدودیت ارائه دهیم</li>
                <li>پاسخگو و دستیار شما در هر مرحله باشیم</li>
                <li>بهترین فناوری‌های هوش مصنوعی را در دسترس‌تان قرار دهیم</li>
                <li>نرخ‌های منصفانه و شفاف را حفظ کنیم</li>
                <li>به‌طور مستمر خدمات خود را بهتر کنیم</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav isLoggedIn={true} onLogout={handleLogout} />
    </div>
  );
}
