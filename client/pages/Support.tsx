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
          <Card className="border-2 border-brand-primary/50">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-brand-primary/10 flex items-center justify-center mb-3">
                <Phone className="h-5 w-5 text-brand-primary" />
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
          <Card className="border-2 border-green-500/50">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
                <MessageCircle className="h-5 w-5 text-green-500" />
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
              <h3 className="font-semibold text-foreground mb-2">آغاز مسیر</h3>
              <p>
                MAFO با هدف تسهیل دسترسی به فناوری های پیشرفته هوش مصنوعی برای کاربران ایرانی تاسیس شد. ما بر این باور هستیم که هوش مصنوعی باید برای همه قابل دسترس باشد.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">تکامل تکنولوژی</h3>
              <p>
                در طی سال های گذشته، ما بسیاری از مدل های هوش مصنوعی را مورد بررسی و اختبار قرار دادیم. از مدل های قدیمی تر تا جدیدترین نسل های تولید تصاویر و ویدیوها، ما همگی را امتحان کرده ایم.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">انتخاب بهترین</h3>
              <p>
                پس از آزمایش های متعدد، ما تصمیم گرفتیم از بهترین مدل های موجود در بازار برای تولید تصاویر و ویدیوهای باکیفیت استفاده کنیم. هدف ما ارائه بهترین تجربه برای کاربران است.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">امروز و آینده</h3>
              <p>
                امروزه MAFO یک پلتفرم قابل اعتماد برای تولید تصاویر و ویدیوهای هوش مصنوعی است. ما به طور مداوم در حال بهبود خدمات خود هستیم و سعی می کنیم تجربه کاربر را بهتر کنیم.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">تعهد ما</h3>
              <p>
                ما متعهد هستیم که:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>خدمات کم زحمت و مطمئن ارائه دهیم</li>
                <li>پاسخ سریع به پرسش های کاربران بدهیم</li>
                <li>بهترین نسخه های هوش مصنوعی را در دسترس قرار دهیم</li>
                <li>نرخ های عادلانه و شفاف برای استفاده داشته باشیم</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav isLoggedIn={true} onLogout={handleLogout} />
    </div>
  );
}
