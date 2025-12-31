import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Clock, FileCheck, Smartphone } from "lucide-react";

export default function RegisterPending() {
  const navigate = useNavigate();

  useEffect(() => {
    // Prevent going back to register page
    window.history.pushState(null, "", "/register-pending");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl">ثبت نام موفق!</CardTitle>
          <CardDescription className="text-base">
            درخواست عضویت شما با موفقیت ثبت شد
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Message */}
          <div className="p-5 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
            <p className="text-sm text-green-900 font-medium leading-relaxed">
              تشکر از ثبت نام در MAFO. درخواست عضویت شما دریافت شد و در حال
              بررسی تیم پشتیبانی ما می‌باشد.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <h3 className="font-semibold text-right">مراحل بعدی:</h3>

            {/* Step 1 */}
            <div className="flex gap-4 p-4 rounded-lg border border-blue-200 bg-blue-50">
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                1
              </div>
              <div className="text-right flex-1">
                <h4 className="font-medium text-sm mb-1">
                  📞 تماس با تیم پشتیبانی
                </h4>
                <p className="text-xs text-blue-700 font-medium">
                  اولین و مهم‌ترین گام: لطفاً درحال حاضر با تیم پشتیبانی ما تماس بگیرید
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 p-4 rounded-lg border border-purple-200 bg-purple-50">
              <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                2
              </div>
              <div className="text-right flex-1">
                <h4 className="font-medium text-sm mb-1">💰 بررسی پلان‌های مختلف</h4>
                <p className="text-xs text-purple-700">
                  تیم پشتیبانی درمورد پلان‌های اعتبار و خدمات مختلف MAFO با شما صحبت خواهد کرد
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 p-4 rounded-lg border border-green-200 bg-green-50">
              <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                3
              </div>
              <div className="text-right flex-1">
                <h4 className="font-medium text-sm mb-1">✅ انتخاب پلان و فعال‌سازی</h4>
                <p className="text-xs text-green-700">
                  پس از انتخاب پلان مورد نیاز، تیم پشتیبانی حساب کاربری شما را فعال خواهد کرد
                </p>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 gap-3">
            <div className="p-4 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
              <div className="flex gap-3 items-start">
                <span className="text-2xl">📋</span>
                <div className="text-right flex-1">
                  <p className="text-sm font-semibold text-orange-900 mb-1">
                    پلان‌های مختلف
                  </p>
                  <p className="text-xs text-orange-800">
                    MAFO پلان‌های متنوعی برای تمام نیازها ارائه می‌دهد. تیم پشتیبانی ما به شما کمک خواهد کرد تا بهترین پلان برای فعالیت خود انتخاب کنید.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex gap-2 items-start">
                  <Smartphone className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-right">
                    <p className="text-xs font-medium text-blue-900">
                      تماس فوری
                    </p>
                    <p className="text-xs text-blue-800">09357887572</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="flex gap-2 items-start">
                  <Clock className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-right">
                    <p className="text-xs font-medium text-green-900">
                      زمان پاسخ
                    </p>
                    <p className="text-xs text-green-800">معمولاً فوری</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-3">
            <div className="flex gap-2 items-start">
              <Smartphone className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-right flex-1">
                <h4 className="font-medium text-sm text-blue-900 mb-2">
                  در صورت سؤال
                </h4>
                <p className="text-xs text-blue-800 mb-2">
                  با تیم پشتیبانی ما تماس بگیرید:
                </p>
                <div className="space-y-1">
                  <a
                    href="tel:+989357887572"
                    className="flex items-center gap-2 text-xs text-blue-700 hover:text-blue-900 font-medium"
                  >
                    ☎ 09357887572
                  </a>
                  <a
                    href="http://wa.me/+989357887572"
                    className="flex items-center gap-2 text-xs text-blue-700 hover:text-blue-900 font-medium"
                  >
                    💬 واتساپ
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Terms Agreement Message */}
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-right">
            <p className="text-xs text-amber-900 leading-relaxed">
              <span className="font-medium">توجه:</span> با ثبت نام در MAFO، شما
              قوانین و شرایط استفاده از سرویس را پذیرفته‌اید. لطفاً قبل از شروع
              کار حتماً{" "}
              <a href="/terms" className="underline hover:no-underline">
                قوانین و شرایط
              </a>{" "}
              را مطالعه کنید.
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3 pt-4 border-t">
            <Button
              onClick={() => navigate("/")}
              className="w-full"
              size="lg"
              style={{
                backgroundColor: "#ffffff",
                color: "#000000",
                border: "1px solid #d1d5db",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffff";
              }}
            >
              بازگشت به صفحه اصلی
            </Button>

            <Button
              onClick={() => navigate("/contact")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              تماس با پشتیبانی
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
