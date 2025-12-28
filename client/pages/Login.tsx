import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { login } from "@/lib/api";
import { saveAuthCredentials } from "@/lib/auth";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(
    localStorage.getItem("rememberMe_email") || ""
  );
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(
    !!localStorage.getItem("rememberMe_email")
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("لطفا ایمیل خود را وارد کنید");
      return;
    }

    if (!password.trim()) {
      setError("لطفا رمز عبور خود را وارد کنید");
      return;
    }

    setLoading(true);

    try {
      const result = await login({ email, password });

      if (!result.success || !result.data) {
        setError(result.error || "خطا در ورود");
        setLoading(false);
        return;
      }

      // Save auth data
      saveAuthCredentials(
        result.data.userId,
        result.data.apiKey,
        result.data.name,
        result.data.email,
        result.data.credits,
      );

      // Save email if "Remember me" is checked
      if (rememberMe) {
        localStorage.setItem("rememberMe_email", email);
      } else {
        localStorage.removeItem("rememberMe_email");
      }

      setSuccess(true);

      // Redirect to image generator page after a short delay
      setTimeout(() => {
        navigate("/generate");
      }, 1000);
    } catch (err) {
      setError("خطا در اتصال. لطفا بعدا دوباره سعی کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="flex flex-col items-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F4c88dfcd13ad44aba9d3f4537f9785d5%2Fa2dcdb2b6e894df7989c87db38a879a2?format=webp&width=800"
                alt="MAFO"
                className="h-16 w-16 mb-2 drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]"
              />
              <h1 className="text-3xl font-bold">MAFO</h1>
              <p className="text-sm text-muted-foreground">
                هوش مصنوعی تصویرساز
              </p>
            </div>
          </div>
          <CardTitle className="text-2xl">خوش آمدید</CardTitle>
          <CardDescription>
            برای شروع، ایمیل و رمز عبور خود را وارد کنید
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                ایمیل
              </label>
              <Input
                id="email"
                type="email"
                placeholder="example@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                رمز عبور
              </label>
              <Input
                id="password"
                type="password"
                placeholder="رمز عبور خود را وارد کنید"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800 text-right">
                  <p className="font-medium">خطا</p>
                  <p>{error}</p>
                  {error.includes("تایید") && (
                    <div className="mt-2 space-y-1 text-xs">
                      <p className="font-medium">
                        لطفا با پشتیبانی تماس بگیرید:
                      </p>
                      <a
                        href="tel:+989357887572"
                        className="block hover:underline"
                      >
                        ☎ 09357887572
                      </a>
                      <a
                        href="http://wa.me/+989357887572"
                        className="block hover:underline"
                      >
                        💬 واتساپ
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800 font-medium">
                  ورود موفق! در حال انتقال...
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
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
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  درحال ورود...
                </>
              ) : (
                "ورود"
              )}
            </Button>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                className="h-4 w-4 rounded border-border cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium cursor-pointer"
              >
                من را به خاطر داشته باش
              </label>
            </div>

            {/* Register Link */}
            <div className="text-center text-sm text-muted-foreground">
              <p>
                حساب کاربری ندارید؟{" "}
                <a
                  href="/register"
                  className="text-primary hover:underline font-medium"
                >
                  ثبت نام کنید
                </a>
              </p>
            </div>

            {/* Help Text */}
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-right">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  درباره کلید API
                </p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• کلید API شما شخصی و محرمانه است</li>
                  <li>• هرگز آن را با کسی به اشتراک نگذارید</li>
                  <li>• برای دریافت کلید جدید، کلید قدیمی را بازیابی کنید</li>
                  <li className="mt-2 pt-2 border-t border-blue-200">
                    برای استفاده از این هوش مصنوعی، لطفا ابتدا با پشتیبانی در تماس باشید.
                  </li>
                </ul>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
