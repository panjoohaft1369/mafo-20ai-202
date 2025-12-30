import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { getAuthState, clearAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function Tutorials() {
  const navigate = useNavigate();
  const auth = getAuthState();

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-0">
      <Header isLoggedIn={auth.isLoggedIn} onLogout={handleLogout} />

      <main className="flex-1 pt-20 md:pt-28">
        {/* Hero Section */}
        <section className="px-4 py-16 sm:py-24 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">آموزش ها</h1>
            <p className="text-xl text-muted-foreground">
              یاد بگیرید چطور از MAFO AI به بهترین شکل استفاده کنید
            </p>
          </div>
        </section>

        {/* Image Generation Section */}
        <section className="px-4 py-16 sm:py-20 border-b">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-12 text-center">
              تولید تصویر
            </h2>

            <div className="space-y-8">
              {/* Basic Color Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-right text-2xl">
                    🎨 نحوه شرح دادن رنگ و ظاهر
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-right space-y-4">
                  <p className="text-muted-foreground">
                    برای مثال اگر مبلی می‌فروشید و می‌خواهید آن را با رنگ قرمز
                    نشان دهید، بنویسید:
                  </p>
                  <div className="p-4 bg-muted rounded-lg border border-border">
                    <p className="italic font-semibold text-sm">
                      "رنگ پارچه به مبل موجود در تصویر اول، به رنگ قرمز تبدیل
                      بشه. جزئیات مبل و فرم مبل تغییر نکند. زاویه دوربین ثابت
                      باشد."
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    هر چه جزئیات بیشتر بنویسید، نتیجه بهتر می‌شه.
                  </p>
                </CardContent>
              </Card>

              {/* Environment Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-right text-2xl">
                    📍 تعیین موقعیت و محیط
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-right space-y-4">
                  <p className="text-muted-foreground">
                    محل قرار گرفتن محصول را مشخص کنید:
                  </p>
                  <div className="p-4 bg-muted rounded-lg border border-border">
                    <p className="italic font-semibold text-sm">
                      "مبل موجود در تصویر اول رو توی محیط موجود در تصویر دوم
                      بچین."
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    توصیف محیط اطراف محصول باعث می‌شه تصویر بیشتر واقعی‌تر نمایش
                    داده بشه.
                  </p>
                </CardContent>
              </Card>

              {/* Upload and Combine */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-right text-2xl">
                    🖼️ آپلود و ترکیب تصویر
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-right space-y-4">
                  <p className="text-muted-foreground">
                    ابتدا تصویر اتاق یا محصول را بارگذاری کنید، سپس توضیح دهید
                    چه تغییری می‌خواهید:
                  </p>
                  <div className="p-4 bg-muted rounded-lg border border-border">
                    <p className="italic font-semibold text-sm">
                      "این تصویر از اتاق من است، مبل قرمز بزرگ در کنار پنجره
                      بگذار"
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    می‌تونید تصویر در محیط مشتری نمایش بدید یا فقط تغییرات محصول
                    رو بررسی کنید.
                  </p>
                </CardContent>
              </Card>

              {/* Tips for Images */}
              <div
                className="p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"
                dir="rtl"
              >
                <h3 className="font-bold text-lg mb-4 text-right text-green-900 dark:text-green-100">
                  💡 نکات مهم برای بهترین نتایج
                </h3>
                <ul className="space-y-3 text-right text-sm text-green-700 dark:text-green-300 font-semibold">
                  <li className="flex gap-3 items-start justify-end">
                    <span>پرامپت خود را به فارسی یا انگلیسی بنویسید</span>
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  </li>
                  <li className="flex gap-3 items-start justify-end">
                    <span>تا حد امکان جزئیات زیادی بیفزایید</span>
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  </li>
                  <li className="flex gap-3 items-start justify-end">
                    <span>رنگ‌ها، متریال‌ها و محیط را مشخص کنید</span>
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  </li>
                  <li className="flex gap-3 items-start justify-end">
                    <span>تصویری واضح و روشن برای نقطه شروع انتخاب کنید</span>
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  </li>
                  <li className="flex gap-3 items-start justify-end">
                    <span>اگر نتیجه را دوست ندارید، پرامپت را اصلاح کنید</span>
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Video Generation Section */}
        <section className="px-4 py-16 sm:py-20 border-b">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-12 text-center">
              آموزش تولید ویدیو
            </h2>

            <div className="space-y-8">
              {/* Motion Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-right text-2xl">
                    🎬 فقط حرکت رو بگو
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-right space-y-4">
                  <p className="text-muted-foreground">
                    تصویرت که قبلاً داری، هیچ نیازی نیست لباس یا رنگو توضیح بدی.
                    فقط بگو چی می‌خوای حرکت کنه:
                  </p>
                  <div className="space-y-3">
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-xs font-semibold text-red-900 dark:text-red-100 mb-2">
                        ❌ نادرست
                      </p>
                      <p className="italic font-semibold text-sm text-red-700 dark:text-red-400">
                        "دوربین توی اتاق حرکت کنه"
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-xs font-semibold text-green-900 dark:text-green-100 mb-2">
                        ✅ درست
                      </p>
                      <p className="italic font-semibold text-sm text-green-700 dark:text-green-400">
                        "دوربین بصورت آهسته حول محور عمود به سوژه به آهستگی به
                        سمت چپ حرکت کند."
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Camera Movement */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-right text-2xl">
                    📹 دوربین کجا برو
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-right space-y-4">
                  <p className="text-muted-foreground">
                    بگو دوربین چطور حرکت کنه (نزدیک شدن، چرخش، سمت و سو):
                  </p>
                  <div className="p-4 bg-muted rounded-lg border border-border">
                    <p className="italic font-semibold text-sm">
                      "دوربین آهسته به سمت چپ سوژه حرکت کند."
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    یک یا دو حرکت دوربین کافیه. بیشتر از اون بد اثر می‌ندازه.
                  </p>
                </CardContent>
              </Card>

              {/* Combined Movements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-right text-2xl">
                    ✨ چند حرکت با هم
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-right space-y-4">
                  <p className="text-muted-foreground">
                    می‌تونی چند چیز رو باهم حرکت بدی تا بهتر شه:
                  </p>
                  <div className="p-4 bg-muted rounded-lg border border-border">
                    <p className="italic font-semibold text-sm">
                      "دوربین به آهستگی دور سوژه حرکت میکنه و یه مرد جوان به
                      تصویر اضافه میشه و روی مبل میشینه."
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Video Feel */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-right text-2xl">
                    🎞️ حس و فضای ویدیو
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-right space-y-4">
                  <p className="text-muted-foreground">
                    بگو ویدیو چه احساسی داشته باشه:
                  </p>
                  <div className="p-4 bg-muted rounded-lg border border-border">
                    <p className="italic font-semibold text-sm">
                      "آرام و رومانتیک"، "پرانرژی"، "سینمایی و درام‌دار"
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Tips for Videos */}
              <div
                className="p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"
                dir="rtl"
              >
                <h3 className="font-bold text-lg mb-4 text-right text-green-900 dark:text-green-100">
                  💡 نکاتی که نتیجه رو بهتر می‌کنه
                </h3>
                <ul className="space-y-3 text-right text-sm text-green-700 dark:text-green-300 font-semibold">
                  <li className="flex gap-3 items-start justify-end">
                    <span>
                      <strong>فقط حرکت:</strong> تصویرت داره، نیازی نیست دوباره
                      لباس و محیط توضیح بدی
                    </span>
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  </li>
                  <li className="flex gap-3 items-start justify-end">
                    <span>
                      <strong>کوتاه و سادی:</strong> بیش از حد طولانی نوشتن، عکس
                      العمل عکس داره
                    </span>
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  </li>
                  <li className="flex gap-3 items-start justify-end">
                    <span>
                      <strong>حرکت های واقعی:</strong> چیزایی که تو زندگی واقعی
                      ممکنه، نه خیالی
                    </span>
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  </li>
                  <li className="flex gap-3 items-start justify-end">
                    <span>
                      <strong>یک دو حرکت دوربین:</strong> بیش از اون خراب میشه
                    </span>
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  </li>
                  <li className="flex gap-3 items-start justify-end">
                    <span>
                      <strong>سرعت رو مشخص کن:</strong> "آهسته"، "سریع"، "ملایم"
                      تفاوت داره
                    </span>
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16 sm:py-20">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold mb-6">آماده‌اید شروع کنید؟</h2>
            <p className="text-lg text-muted-foreground mb-8">
              حالا که روش استفاده رو یاد گرفتید، بیایید شروع کنیم!
            </p>
            <Button
              onClick={() => navigate(auth.isLoggedIn ? "/generate" : "/login")}
              size="lg"
              className="text-lg py-6 hover:shadow-2xl hover:scale-110 active:scale-95"
            >
              {auth.isLoggedIn ? "شروع تولید" : "ورود و شروع"}
            </Button>
          </div>
        </section>
      </main>

      <Footer />

      {/* Bottom Spacing Section */}
      <div className="h-[120px] bg-gradient-to-b from-blue-50 to-blue-50/50 dark:from-blue-950/20 dark:to-blue-950/10 w-full" />

      <BottomNav isLoggedIn={auth.isLoggedIn} onLogout={handleLogout} />
    </div>
  );
}
