import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getAuthState } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
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

export default function About() {
  const navigate = useNavigate();
  const auth = getAuthState();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        isLoggedIn={auth.isLoggedIn}
        onLogout={() => {
          // logout logic
        }}
      />

      <main className="flex-1 pt-20 md:pt-28">
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
              className="text-lg py-6"
            >
              {auth.isLoggedIn ? "شروع تولید" : "ورود و شروع"}
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
