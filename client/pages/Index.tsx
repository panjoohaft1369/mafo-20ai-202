import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthState } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TopNav } from "@/components/TopNav";
import { ImageCarousel } from "@/components/ImageCarousel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, Image, TrendingUp, Zap, Film, Heart } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const auth = getAuthState();

  const handleStartClick = () => {
    if (auth.isLoggedIn) {
      navigate("/generate");
    } else {
      navigate("/login");
    }
  };

  const handleLogout = () => {
    // This is called from Header when logged in
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <Header isLoggedIn={auth.isLoggedIn} onLogout={handleLogout} />

      <main className="pt-20 md:pt-28">
        {/* Image Carousel - Top */}
        <section className="px-4 py-12 sm:py-16">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
              نمونه‌های تولید شده
            </h2>
            <ImageCarousel />
          </div>
        </section>

        {/* Hero Section */}
        <section className="relative px-4 py-16 sm:py-24">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs sm:text-sm font-medium">
                قدرت هوش مصنوعی در دستان شما
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              تولید تصاویر و ویدیوهای هوش مصنوعی
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
              تصویری انتخاب کنید، پرامپت بنویسید، و تصویر یا ویدیوی جدید خود را
              ایجاد کنید. فناوری پیشرفته هوش مصنوعی ما کار را برای شما انجام
              می‌دهد.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleStartClick}
                className="py-5 text-sm font-semibold hover:shadow-2xl hover:scale-110 active:scale-95"
                size="lg"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                شروع کنید
              </Button>
              {!auth.isLoggedIn && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/login")}
                  className="py-5 text-sm font-semibold hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  ورود با کلید API
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        {!auth.isLoggedIn && (
          <section className="px-4 py-20 bg-muted/50">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  چطوری کار می‌کنه؟
                </h2>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                  سه مرحله ساده برای ایجاد محتوای تصویری و ویدیویی
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Step 1 */}
                <Card>
                  <CardHeader>
                    <div className="h-10 w-10 rounded-lg bg-primary text-white flex items-center justify-center mb-3 font-bold text-lg">
                      1
                    </div>
                    <CardTitle>انتخاب تصویر و توضیح</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      یک تصویر پایه انتخاب کنید و توضیح بدهید چه تغییری می‌خواهید
                    </CardDescription>
                  </CardContent>
                </Card>

                {/* Step 2 */}
                <Card>
                  <CardHeader>
                    <div className="h-10 w-10 rounded-lg bg-primary text-white flex items-center justify-center mb-3 font-bold text-lg">
                      2
                    </div>
                    <CardTitle>تنظیم پارامترها</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      سایز، کیفیت و سبک تصویر یا ویدیو را انتخاب کنید
                    </CardDescription>
                  </CardContent>
                </Card>

                {/* Step 3 */}
                <Card>
                  <CardHeader>
                    <div className="h-10 w-10 rounded-lg bg-primary text-white flex items-center justify-center mb-3 font-bold text-lg">
                      3
                    </div>
                    <CardTitle>دریافت نتیجه</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      تصویر یا ویدیو تولید شده را دانلود و استفاده کنید
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Support Iranian Tech Section */}
        {!auth.isLoggedIn && (
          <section className="px-4 py-16 bg-primary/5 border-y border-primary/10">
            <div className="container mx-auto max-w-4xl text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">
                <Heart className="h-6 w-6 inline-block mr-2 text-primary" />
                حمایت از فناوری ایرانی
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
                با استفاده از MAFO، شما از تیمی ایرانی را حمایت می‌کنید که خدمات
                جهان‌سطح ارائه می‌دهند.
                <br />
                <br />
                <strong>
                  ما را با دوستان و همکاران خود به اشتراک بگذارید
                </strong>{" "}
                تا بیشتر مردم از خدمات قابل‌اعتماد ایرانی بهره‌برداری کنند.
              </p>
            </div>
          </section>
        )}

        {/* CTA Section */}
        {!auth.isLoggedIn && (
          <section className="px-4 py-16">
            <div className="container mx-auto max-w-4xl text-center bg-muted/50 rounded-2xl p-8 sm:p-12 border border-border">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                آماده‌اید شروع کنید؟
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
                با وارد کردن کلید API خود، به تمام قابلیت‌های ما دسترسی داشته
                باشید
              </p>
              <Button
                onClick={() => navigate("/login")}
                className="py-5 text-sm font-semibold"
                size="lg"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                ورود و شروع
              </Button>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
