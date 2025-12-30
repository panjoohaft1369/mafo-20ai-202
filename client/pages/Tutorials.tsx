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
                      "یک مبل قرمز رنگ مدرن در اتاق نشیمن، روشنایی گرم، کیفیت
                      بالا"
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
                      "مبل آبی در اتاق خوشمنظره خانه با پنجره‌های بزرگ و نور
                      طبیعی"
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
              <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-bold text-lg mb-4 text-right text-blue-900 dark:text-blue-100">
                  💡 نکات مهم برای بهترین نتایج
                </h3>
                <ul className="space-y-3 text-right text-sm text-muted-foreground">
                  <li className="flex gap-3 items-start justify-end">
                    <span>پرامپت خود را به فارسی یا انگلیسی بنویسید</span>
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  </li>
                  <li className="flex gap-3 items-start justify-end">
                    <span>تا حد امکان جزئیات زیادی بیفزایید</span>
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  </li>
                  <li className="flex gap-3 items-start justify-end">
                    <span>رنگ‌ها، متریال‌ها و محیط را مشخص کنید</span>
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  </li>
                  <li className="flex gap-3 items-start justify-end">
                    <span>تصویری واضح و روشن برای نقطه شروع انتخاب کنید</span>
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  </li>
                  <li className="flex gap-3 items-start justify-end">
                    <span>اگر نتیجه را دوست ندارید، پرامپت را اصلاح کنید</span>
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
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
              تولید ویدیو
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
                      <p className="italic font-semibold text-sm">
                        "مردی با موهای سیاه و کت آبی دست برای دستان‌دادن دراز
                        می‌کند"
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-xs font-semibold text-green-900 dark:text-green-100 mb-2">
                        ✅ درست
                      </p>
                      <p className="italic font-semibold text-sm">
                        "دست دراز می‌کند برای دستان‌دادن"
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
                      "دوربین آهسته نزدیک می‌شه تا صورت رو ببینیم"
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
                      "موها واژنده، دوربین نزدیک می‌شه، نور طلایی ریخته میشه"
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

              {/* Core Elements */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
                <h3 className="text-lg font-semibold mb-6 text-right text-blue-900 dark:text-blue-100">
                  🎯 چند نکته مهم
                </h3>
                <div className="space-y-4 text-right text-sm">
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      ۱. حرکت اشخاص و اشیا
                    </p>
                    <p className="text-muted-foreground">
                      چطور سوژه می‌خوای حرکت کنه:
                    </p>
                    <p className="text-xs mt-1 p-2 bg-white dark:bg-black/20 rounded italic">
                      "سر رو آهسته می‌چرخونه" یا "لبخند می‌زنه"
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      ۲. دوربین
                    </p>
                    <p className="text-muted-foreground">
                      دوربین چطور حرکت کنه (۱ یا ۲ حرکت بس)
                    </p>
                    <p className="text-xs mt-1 p-2 bg-white dark:bg-black/20 rounded italic">
                      "نزدیک میشه" یا "دور میره چپ و راست"
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      ۳. نور
                    </p>
                    <p className="text-muted-foreground">
                      نور چطور باشه (گرم، سرد، مات، براق)
                    </p>
                    <p className="text-xs mt-1 p-2 bg-white dark:bg-black/20 rounded italic">
                      "نور نرم طلایی"
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      ۴. حس عمومی
                    </p>
                    <p className="text-muted-foreground">
                      ویدیو چی حس داشته باشه
                    </p>
                    <p className="text-xs mt-1 p-2 bg-white dark:bg-black/20 rounded italic">
                      "رومانتیک و آرام" یا "انرژیک و حرارتی"
                    </p>
                  </div>
                </div>
              </div>

              {/* Tips for Videos */}
              <div className="p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-bold text-lg mb-4 text-right text-green-900 dark:text-green-100">
                  💡 نکاتی که نتیجه رو بهتر می‌کنه
                </h3>
                <ul className="space-y-3 text-right text-sm text-muted-foreground">
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

              {/* Examples */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">
                  📚 نمونه‌ها
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-green-500/30 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <p className="font-semibold text-green-700 dark:text-green-400 mb-2 text-right">
                      ✅ خوب
                    </p>
                    <p className="text-sm text-muted-foreground italic text-right">
                      "آهسته سر میچرخونه، دوربین نزدیک میشه، موها واژنده"
                    </p>
                  </div>

                  <div className="p-4 border-2 border-red-500/30 rounded-lg bg-red-50 dark:bg-red-950/20">
                    <p className="font-semibold text-red-700 dark:text-red-400 mb-2 text-right">
                      ❌ بد
                    </p>
                    <p className="text-sm text-muted-foreground italic text-right">
                      "مردی با موهای سیاه و کت آبی، دوربین دور میزنه، بزرگ نمایی
                      میشه"
                    </p>
                  </div>

                  <div className="p-4 border-2 border-blue-500/30 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <p className="font-semibold text-blue-700 dark:text-blue-400 mb-2 text-right">
                      🛍️ برای محصول
                    </p>
                    <p className="text-sm text-muted-foreground italic text-right">
                      "دوربین دور و دور محصول میچرخه آهسته، نور نرم، جزئیات رو
                      خوب می‌بینی"
                    </p>
                  </div>

                  <div className="p-4 border-2 border-purple-500/30 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                    <p className="font-semibold text-purple-700 dark:text-purple-400 mb-2 text-right">
                      🎭 برای چهره
                    </p>
                    <p className="text-sm text-muted-foreground italic text-right">
                      "نگاه عوض میشه، دوربین نزدیک میشه، نور طلایی از پشت"
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Note */}
              <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 rounded flex gap-4">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-right flex-1">
                  <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                    ⚠️ نکته مهم
                  </p>
                  <p className="text-sm text-muted-foreground">
                    فراموش نکن که تصویرت قبلاً داره! کاری نیست که لباس و رنگ و
                    محیط رو دوباره توصیف کنی. فقط بگو{" "}
                    <strong>چی قرار حرکت کنه</strong> و{" "}
                    <strong>دوربین کجا برو</strong>.
                  </p>
                </div>
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
