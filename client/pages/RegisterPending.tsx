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
import { CheckCircle2 } from "lucide-react";

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
          <div className="p-5 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
            <p className="text-sm text-blue-900 font-medium leading-relaxed">
              ✨ تشکر از ثبت نام در MAFO!
            </p>
            <p className="text-sm text-blue-800 mt-2 leading-relaxed">
              حساب کاربری شما ایجاد شده است، اما برای فعال‌سازی و شروع کار، باید با تیم پشتیبانی ما صحبت کنید و پلانی را برای نیازهای خود انتخاب کنید.
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
                <h4 className="font-bold text-sm mb-1 text-gray-800">
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
                <h4 className="font-bold text-sm mb-1 text-gray-800">💰 بررسی پلان‌های مختلف</h4>
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
                <h4 className="font-bold text-sm mb-1 text-gray-800">✅ انتخاب پلان و فعال‌سازی</h4>
                <p className="text-xs text-green-700">
                  پس از انتخاب پلان مورد نیاز، تیم پشتیبانی حساب کاربری شما را فعال خواهد کرد
                </p>
              </div>
            </div>
          </div>


          {/* Terms Agreement Message */}
          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-300 text-right">
            <p className="text-xs text-yellow-900 leading-relaxed mb-2">
              <span className="font-bold text-base">⚠️ توجه مهم:</span>
            </p>
            <p className="text-xs text-yellow-900 leading-relaxed">
              با ثبت نام در MAFO، شما قوانین و شرایط استفاده از سرویس را پذیرفته‌اید.
              <br />
              برای شروع کار، <strong>حتماً</strong> با تیم پشتیبانی تماس بگیرید، پلان مورد نیاز را انتخاب کنید، و منتظر فعال‌سازی حساب بمانید.
            </p>
          </div>

          {/* Important Message */}
          <div className="p-4 rounded-lg bg-red-50 border-2 border-red-300 text-center">
            <p className="text-sm font-bold text-gray-800">
              ⚠️ بدون تماس با پشتیبانی و انتخاب پلان، نمی‌توانید از خدمات MAFO استفاده کنید.
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3 pt-4 border-t">
            <a
              href="tel:+989357887572"
              className="block w-full"
            >
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-base"
                size="lg"
              >
                📞 تماس با پشتیبانی (09357887572)
              </Button>
            </a>

            <a
              href="https://wa.me/+989357887572"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                size="lg"
              >
                💬 ارسال پیام از طریق واتساپ
              </Button>
            </a>

            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full text-gray-700"
              size="lg"
            >
              بازگشت به صفحه اصلی
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
