import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthState } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Tutorial } from "@/components/Tutorial";
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

      <main className="pt-32 md:pt-24">
        {/* Iranian Pride Banner */}
        <section className="px-4 py-4 bg-primary/10 border-b border-primary/20">
          <div className="container mx-auto max-w-6xl text-center">
            <p className="text-xs sm:text-sm font-medium text-primary">
              🇮🇷 اولین هوش مصنوعی ایرانی برای تولید تصاویر و ویدیوهای هوش مصنوعی
            </p>
          </div>
        </section>

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
                className="py-5 text-sm font-semibold"
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
                  className="py-5 text-sm font-semibold"
                >
                  ورود با کلید API
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        {!auth.isLoggedIn && (
          <section className="px-4 py-20 bg-muted/50">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  ویژگی‌های منحصربه‌فرد
                </h2>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                  ما به عنوان اولین پلتفرم هوش مصنوعی ایرانی، خدمات جهان‌سطح و قابل‌اعتماد ارائه می‌دهیم
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Feature 1 */}
                <Card>
                  <CardHeader>
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-3">
                      <Image className="h-5 w-5" />
                    </div>
                    <CardTitle>تولید تصویر</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      تصویری انتخاب کنید و با ابعاد و کیفیت دلخواه تصاویر جدید
                      ایجاد کنید
                    </CardDescription>
                  </CardContent>
                </Card>

                {/* Feature 2 */}
                <Card>
                  <CardHeader>
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-3">
                      <Film className="h-5 w-5" />
                    </div>
                    <CardTitle>تولید ویدیو</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      تصویری را به ویدیوی متحرک تبدیل کنید و حرکات خود را کنترل
                      کنید
                    </CardDescription>
                  </CardContent>
                </Card>

                {/* Feature 3 */}
                <Card>
                  <CardHeader>
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-3">
                      <Zap className="h-5 w-5" />
                    </div>
                    <CardTitle>نتایج سریع</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      نتایج فوری و کیفیت بالا. تصاویر و ویدیوهای خود را فوراً
                      دریافت کنید
                    </CardDescription>
                  </CardContent>
                </Card>

                {/* Feature 4 */}
                <Card>
                  <CardHeader>
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-3">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <CardTitle>کنترل کامل</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      تمام پارامترها را کنترل کنید و نتایج دقیق دریافت کنید
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Tutorial Section */}
        {!auth.isLoggedIn && <Tutorial />}

        {/* Support Iranian Tech Section */}
        {!auth.isLoggedIn && (
          <section className="px-4 py-16 bg-primary/5 border-y border-primary/10">
            <div className="container mx-auto max-w-4xl text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">
                <Heart className="h-6 w-6 inline-block mr-2 text-primary" />
                حمایت از فناوری ایرانی
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
                با استفاده از MAFO، شما از تیمی ایرانی را حمایت می‌کنید که
                خدمات جهان‌سطح ارائه می‌دهند.
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
          <section className="px-4 py-20">
            <div className="container mx-auto max-w-4xl text-center bg-muted/50 rounded-2xl p-12 border border-border">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                آماده‌اید شروع کنید؟
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                با وارد کردن کلید API خود، به تمام قابلیت‌های ما دسترسی داشته
                باشید
              </p>
              <Button
                onClick={() => navigate("/login")}
                className="py-6 text-base font-semibold"
                size="lg"
              >
                <Sparkles className="h-5 w-5 mr-2" />
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
