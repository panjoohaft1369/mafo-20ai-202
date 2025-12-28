import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TopNav } from "@/components/TopNav";
import { BottomNav } from "@/components/BottomNav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Mail, MapPin } from "lucide-react";
import { getAuthState, clearAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

export default function Contact() {
  const navigate = useNavigate();
  const auth = getAuthState();

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav />
      <Header isLoggedIn={auth.isLoggedIn} onLogout={handleLogout} />

      <main className="flex-1 pt-20 md:pt-28">
        {/* Title Section */}
        <section className="px-4 py-12 sm:py-16 border-b">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="text-2xl">📞</span>
              <span className="text-sm font-semibold text-primary">
                در تماس بمانید
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">تماس با ما</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              سوالات یا پیشنهادات دارید؟ تیم MAFO همیشه آماده کمک به شما است
            </p>
          </div>
        </section>

        {/* Contact Methods Grid */}
        <section className="px-4 py-16 sm:py-20">
          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {/* Phone Support */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>تماس تلفنی</CardTitle>
                  <CardDescription>مستقیماً با ما تماس بگیرید</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      شماره تلفن
                    </p>
                    <p className="text-lg font-semibold">09357887572</p>
                  </div>
                  <a
                    href="tel:+989357887572"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      className="w-full gap-2 hover:shadow-lg hover:opacity-90 active:opacity-75 transition-all duration-200"
                      variant="default"
                    >
                      <Phone className="h-4 w-4" />
                      تماس فوری
                    </Button>
                  </a>
                </CardContent>
              </Card>

              {/* WhatsApp Support */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>پیام در واتساپ</CardTitle>
                  <CardDescription>پیام صوتی یا متنی بفرستید</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      شماره واتساپ
                    </p>
                    <p className="text-lg font-semibold">09357887572</p>
                  </div>
                  <a
                    href="http://wa.me/+989357887572"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      className="w-full gap-2 hover:shadow-lg hover:opacity-90 active:opacity-75 transition-all duration-200"
                      variant="default"
                      style={{ backgroundColor: "#25D366" }}
                    >
                      <MessageCircle className="h-4 w-4" />
                      باز کردن واتساپ
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* Response Time */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">⏱️</span>
                  زمان پاسخگویی
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">تماس تلفنی</span>
                    <span className="font-semibold">معمولاً فوری</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">پیام واتساپ</span>
                    <span className="font-semibold">کمتر از 1 ساعت</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">ساعات کاری</span>
                    <span className="font-semibold">شنبه تا پنج‌شنبه، 10 صبح تا 21</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-4 py-16 sm:py-20 bg-muted/50 border-t">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-12 text-center">
              سوالات متداول
            </h2>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    چطوری کلید API بگیرم؟
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  برای دریافت کلید API، لطفا از طریق تماس تلفنی یا واتساپ با ما
                  صحبت کنید. تیم ما شما را در تمام مراحل راهنمایی می‌کند
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">هزینه خدمات چقدره؟</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  هزینه خدمات به تعداد تصاویر و ویدیوهای تولید شده بستگی دارد.
                  برای اطلاع از قیمت‌ها و پکیج‌های مختلف، لطفا با ما تماس بگیرید
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    از چه تکنولوژی استفاده می‌کنید؟
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  MAFO از جدیدترین مدل‌های هوش مصنوعی و GPU‌های قدرتمند استفاده
                  می‌کند تا کیفیت بالاترین تصاویر و ویدیوها را تولید کند
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    حریم خصوصی اطلاعات من چطوره؟
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  حریم خصوصی شما برای ما بسیار مهم است. تمام اطلاعات و تصاویری
                  که با ما به اشتراک می‌گذارید، کاملاً محفوظ و رمزگذاری شده است
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-16 sm:py-20">
          <div className="container mx-auto max-w-4xl text-center bg-primary/5 rounded-2xl p-8 sm:p-12 border border-primary/20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              آماده‌اید شروع کنید؟
            </h2>
            <p className="text-muted-foreground mb-8">
              با تماس با ما، یک کلید API دریافت کنید و شروع به ایجاد محتوای
              تصویری و ویدیویی نکنید
            </p>
            <a href="tel:+989357887572">
              <Button size="lg" className="gap-2">
                <Phone className="h-5 w-5" />
                تماس فوری
              </Button>
            </a>
          </div>
        </section>
      </main>

      <Footer />
      <BottomNav isLoggedIn={auth.isLoggedIn} onLogout={handleLogout} />
    </div>
  );
}
