import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { getAuthState, clearAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  Shield,
  Zap,
  Users,
  Target,
  Award,
  Server,
  Cpu,
  Gauge,
  Globe,
} from "lucide-react";

const slides = [
  {
    title: "تولید تصاویر حرفه‌ای",
    subtitle: "با کیفیت بالا و سرعت فوری",
    bg: "from-blue-600 to-blue-400",
  },
  {
    title: "برای کسب‌وکار شما",
    subtitle: "افزایش فروش و اعتماد مشتری",
    bg: "from-purple-600 to-purple-400",
  },
  {
    title: "ساخت ایرانی، کیفیت جهانی",
    subtitle: "سرورهای قدرتمند و گرافیک‌های پیشرفته",
    bg: "from-indigo-600 to-indigo-400",
  },
];

export default function About() {
  const navigate = useNavigate();
  const auth = getAuthState();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={auth.isLoggedIn} onLogout={handleLogout} />

      <main className="flex-1 pt-20 md:pt-28">
        {/* Hero Slider */}
        <section className="w-full h-96 md:h-[500px] overflow-hidden relative">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ${
                idx === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <div
                className={`w-full h-full bg-gradient-to-r ${slide.bg} flex flex-col items-center justify-center text-center text-white px-4`}
              >
                <h2 className="text-3xl sm:text-5xl font-bold mb-4">
                  {slide.title}
                </h2>
                <p className="text-lg sm:text-2xl font-light opacity-90">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          ))}

          {/* Slider Navigation Dots */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-3 rounded-full transition-all ${
                  idx === currentSlide
                    ? "bg-white w-8"
                    : "bg-white/50 w-3 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Hero Section */}
        <section className="px-4 py-16 sm:py-24 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">درباره MAFO</h1>
            <p className="text-xl text-muted-foreground mb-8">
              اولین هوش مصنوعی تصویرساز ایرانی
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              ساخته شده توسط جوانان متخصص ایرانی برای حل مشکلات واقعی کسب‌وکار
              شما
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="px-4 py-16 sm:py-20 border-b">
          <div className="container mx-auto max-w-4xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">ماموریت ما</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  ما سالها روی برنامه‌نویسی هوش مصنوعی و تولید محتوای بصری
                  حرفه‌ای کار کردیم و تجربه واقعی کسب‌وکارهای شما را در نظر
                  گرفتیم.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  <strong>هدف ما:</strong> فروش بیشتر شما و همکاری بلندمدت با
                  رضایت شما.
                </p>
              </div>
              <div className="bg-muted rounded-lg p-8 text-center">
                <div className="text-5xl font-bold text-primary mb-3">100%</div>
                <p className="text-muted-foreground font-semibold">
                  متعهد به موفقیت شما
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Problems We Solved */}
        <section className="px-4 py-16 sm:py-20 bg-muted/50">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-12 text-center">
              مشکلاتی که حل کردیم
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: "🌐",
                  title: "اشتراک‌های بین‌المللی",
                  desc: "خرید و تمدید اشتراک‌های خارجی سخت و پیچیده بود",
                },
                {
                  icon: "🔐",
                  title: "احراز هویت",
                  desc: "احراز هویت و پرداخت‌های بین‌المللی پیچیده و محدود",
                },
                {
                  icon: "💵",
                  title: "نوسان قیمت",
                  desc: "نوسان قیمت دلار و محدودیت‌های زمانی روی اکانت‌ها",
                },
                {
                  icon: "🔗",
                  title: "استقلال",
                  desc: "وابستگی به افراد خارج از مجموعه برای راهنمایی و پشتیبانی",
                },
              ].map((item, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <span className="text-4xl">{item.icon}</span>
                      <CardTitle className="text-right text-lg">
                        {item.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-right">
                    <p className="text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="px-4 py-16 sm:py-20">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-12 text-center">
              چرا MAFO AI؟
            </h2>
            <div className="space-y-6">
              {[
                {
                  icon: Shield,
                  title: "استقلال کامل",
                  desc: "با MAFO AI مستقل می‌شید و هیچ وابستگی به افراد خارج از مجموعه ندارید",
                },
                {
                  icon: CheckCircle2,
                  title: "بدون تاریخ انقضا",
                  desc: "اشتراک شما تاریخ انقضای زمانی ندارد. تا هر زمان که نیاز دارید استفاده کنید",
                },
                {
                  icon: Zap,
                  title: "سرعت بالا",
                  desc: "در کمتر از 1 دقیقه تصویری آماده که مشتری رو سریع متقاعد می‌کنه",
                },
                {
                  icon: Award,
                  title: "کیفیت حرفه‌ای",
                  desc: "کیفیت بالا و جزئیات دقیق برای ارائه واقعی محصولات",
                },
                {
                  icon: Target,
                  title: "نمایش در محیط مشتری",
                  desc: "محصول رو در محیط واقعی مشتری نمایش بدید تا اعتماد افزایش پیدا کنه",
                },
                {
                  icon: Users,
                  title: "پشتیبانی حرفه‌ای",
                  desc: "تیم ما همیشه همراه شما و هر زمان نیاز داشته باشید، پشتیبانی رایگان دریافت می‌کنید",
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex gap-4 p-6 rounded-lg border">
                    <Icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div className="text-right flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Our Philosophy - Difference from Others */}
        <section className="px-4 py-16 sm:py-20 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6 text-primary">تفاوت اساسی ما</h2>
              <p className="text-lg text-primary max-w-3xl mx-auto leading-relaxed">
                هوش مصنوعی های دنیا به روش سنتی کار می‌کنند: اشتراک‌های ماهیانه
                گران‌قیمت و تعداد محدود خدمات. ما فلسفه متفاوتی داریم.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left Side - Their Model */}
              <div className="space-y-4">
                <div className="p-6 rounded-lg border-2 border-red-200 bg-red-50">
                  <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">❌</span> سایر هوش مصنوعی ها
                  </h3>
                  <ul className="space-y-3 text-right">
                    <li className="flex gap-3 items-start">
                      <span className="text-red-500 font-bold mt-1">•</span>
                      <span className="text-red-800">
                        اشتراک‌های ماهیانه گران قیمت بدون بازگشت
                      </span>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="text-red-500 font-bold mt-1">•</span>
                      <span className="text-red-800">
                        تعداد محدود درخواست در هر ماه
                      </span>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="text-red-500 font-bold mt-1">•</span>
                      <span className="text-red-800">
                        استفاده نکردن = پول هدر رفته
                      </span>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="text-red-500 font-bold mt-1">•</span>
                      <span className="text-red-800">
                        فشار برای استفاده بیش‌تر از توان واقعی
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Side - Our Model */}
              <div className="space-y-4">
                <div className="p-6 rounded-lg border-2 border-green-200 bg-green-50">
                  <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">✅</span> مدل MAFO
                  </h3>
                  <ul className="space-y-3 text-right">
                    <li className="flex gap-3 items-start">
                      <span className="text-green-500 font-bold mt-1">•</span>
                      <span className="text-green-800">
                        پرداخت فقط برای آنچه استفاده می‌کنید
                      </span>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="text-green-500 font-bold mt-1">•</span>
                      <span className="text-green-800">
                        بدون محدودیت‌های مصنوعی
                      </span>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="text-green-500 font-bold mt-1">•</span>
                      <span className="text-green-800">
                        استفاده کنید وقتی که نیاز دارید
                      </span>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="text-green-500 font-bold mt-1">•</span>
                      <span className="text-green-800">
                        آرامش و راحتی در استفاده
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center p-8 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
              <p className="text-lg text-primary font-medium">
                ما می‌خواهیم شما با{" "}
                <span className="text-primary font-bold">آرامش و راحتی</span> در
                زمان‌های لازم، از هوش مصنوعی ما استفاده کنید.
              </p>
              <p className="text-primary mt-3">
                بدون فشار، بدون محدودیت، فقط وقتی که واقعا نیازتون باشه.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Infrastructure */}
        <section className="px-4 py-16 sm:py-20 bg-gradient-to-b from-primary/5 to-background border-b">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-12 text-center">
              بنیان تکنیکی ما
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {[
                {
                  icon: Cpu,
                  title: "قدرت برنامه‌نویسی",
                  desc: "تیم توسعه‌دهندگان متخصصی که سالها تجربه در زمینه هوش مصنوعی و محاسبات تصویری دارند. هر روز کد ما بهبود می‌یابه و ظرفیت جدید اضافه می‌شه.",
                },
                {
                  icon: Server,
                  title: "سرورهای خارجی قدرتمند",
                  desc: "زیرساخت جهانی برای تضمین پاسخ سریع. سرورهایی در نقاط مختلف دنیا برای کمترین تاخیر و بیشترین قابلیت اطمینان.",
                },
                {
                  icon: Cpu,
                  title: "GPU های حرفه‌ای",
                  desc: "سیستم سخت‌افزاری جدیدترین و قدرتمندترین کارت‌های گرافیکی (GPU) برای پردازش سریع و تولید تصاویر با کیفیت بالا.",
                },
                {
                  icon: Gauge,
                  title: "بروزرسانی مداوم",
                  desc: "تمام‌وقت در حال بهبود و بروزرسانی الگوریتم‌ها و مدل‌های هوش مصنوعی. اطلاعات و توانایی‌های سیستم همیشه بروز و به روزترین هستند.",
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Card key={idx} className="border-primary/20">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Icon className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                        <CardTitle className="text-right text-lg">
                          {item.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="text-right">
                      <p className="text-muted-foreground">{item.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Hardware Performance */}
            <div className="bg-muted/50 rounded-lg p-8 text-center border">
              <Cpu className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-4">بهبود عملکرد</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                برای بهبود عملکرد سیستم، از سیستم‌های سخت‌افزاری گرافیکی قدرتمند
                و جدیدترین GPU ها استفاده می‌کنیم.
              </p>
            </div>
          </div>
        </section>

        {/* Activity Timeline */}
        <section className="px-4 py-16 sm:py-20">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-12 text-center">
              تاریخچه فعالیت ما
            </h2>
            <div className="space-y-6">
              {[
                {
                  year: "۱۴۰۲",
                  title: "شروع پروژه",
                  desc: "تشکیل تیم متخصصین برای ایجاد اولین هوش مصنوعی تولید‌کننده تصاویر ایرانی",
                },
                {
                  year: "۱۴۰۲-۱۴۰۳",
                  title: "توسعه و بهبود",
                  desc: "تحقیق عمیق در الگوریتم‌های پیشرفته و آموزش مدل‌های هوش مصنوعی",
                },
                {
                  year: "۱۴۰۳",
                  title: "راه‌اندازی اولیه",
                  desc: "آغاز خدمات برای کسب‌وکارهای کوچک و متوسط و بدست‌آوردن بازخورد مشتریان",
                },
                {
                  year: "۱۴۰۳ تا‌کنون",
                  title: "رشد و بهبود مداوم",
                  desc: "افزایش ظرفیت سرورها، بهبود کیفیت تصاویر، اضافه‌کردن ویژگی‌های جدید و پشتیبانی بیشتر",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="relative pl-8 pb-8 border-l-2 border-primary"
                >
                  <div className="absolute w-4 h-4 bg-primary rounded-full -left-[9px] top-1"></div>
                  <div className="font-bold text-lg text-primary mb-2">
                    {item.year}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="px-4 py-16 sm:py-20 bg-muted/50">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-12 text-center">
              برای چه کار‌های استفاده می‌شه؟
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "فروشگاه‌های اینترنتی",
                  items: [
                    "نمایش محصول در رنگ‌های مختلف",
                    "مشتری‌های مردد رو متقاعد کنید",
                    "کاهش ریسک و افزایش فروش",
                  ],
                },
                {
                  title: "واحدهای تولیدی",
                  items: [
                    "مقایسه طرح‌ها و رنگ‌ها بدون ساخت نمونه",
                    "تولید انبوه با اطمینان",
                    "کاهش هزینه نمونه‌سازی",
                  ],
                },
                {
                  title: "بازاریابی و شبکه‌های اجتماعی",
                  items: [
                    "عکس‌های حرفه‌ای بدون دکور واقعی",
                    "محتوای جذاب برای پست و ریل",
                    "کاهش هزینه تصویربرداری",
                  ],
                },
                {
                  title: "طراحی و مشاورین",
                  items: [
                    "نمایش محصول در محیط مختلف",
                    "بازخورد سریع مشتری",
                    "رضایت و اعتماد مشتری",
                  ],
                },
              ].map((useCase, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-right">
                      {useCase.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-right">
                      {useCase.items.map((item, i) => (
                        <li key={i} className="flex gap-2 items-start">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy & Security */}
        <section className="px-4 py-16 sm:py-20 border-b">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-6">حریم خصوصی و امنیت</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              حریم خصوصی تصاویر و اطلاعات شما کاملاً حفظ می‌شه. هیچ تصویر یا
              اطلاعاتی در اختیار رقبا یا افراد دیگر قرار نمی‌گیره.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16 sm:py-20">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold mb-6">آماده‌اید شروع کنید؟</h2>
            <p className="text-lg text-muted-foreground mb-8">
              MAFO AI در ابتدای مسیر ارائه خدمات تخصصیه و کسانی که زودتر شروع
              می‌کنن، بیشترین بهره رو می‌برن.
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
      <BottomNav isLoggedIn={auth.isLoggedIn} onLogout={handleLogout} />
    </div>
  );
}
