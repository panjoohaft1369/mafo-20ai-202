import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!username.trim()) {
      setError("نام کاربری الزامی است");
      return;
    }

    if (!password) {
      setError("رمز عبور الزامی است");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      // Check if response is OK before parsing JSON
      if (!response.ok) {
        let errorMessage = "نام کاربری یا رمز عبور نادرست است";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            const data = await response.json();
            errorMessage = data.message || data.error || errorMessage;
          }
        } catch (e) {
          // If we can't parse error response, use default message
        }
        setError(errorMessage);
        setLoading(false);
        return;
      }

      const data = await response.json();

      // Save token
      if (data.token) {
        localStorage.setItem("adminToken", data.token);
        setSuccess(true);

        // Redirect to admin dashboard after a short delay
        setTimeout(() => {
          navigate("/admin");
        }, 1000);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("خطا در اتصال. لطفا بعدا دوباره سعی کنید.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = username.trim() && password && !loading;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="flex flex-col items-center">
              <Logo size="lg" className="mb-2" />
              <h1 className="text-3xl font-bold">MAFO</h1>
              <p className="text-sm text-muted-foreground">پنل مدیریت</p>
            </div>
          </div>
          <CardTitle className="text-2xl">ورود ادمین</CardTitle>
          <CardDescription>
            لطفا برای ورود به پنل مدیریت اطلاعات خود را وارد کنید
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                نام کاربری
              </label>
              <Input
                id="username"
                type="text"
                placeholder="نام کاربری خود را وارد کنید"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="text-right"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                رمز عبور
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="رمز عبور خود را وارد کنید"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="text-right pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800 text-right">
                  <p className="font-medium">خطا</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800 font-medium">
                  ورود موفق! درحال انتقال...
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isFormValid}
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

            {/* Back Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                <a
                  href="/"
                  className="text-primary hover:underline font-medium"
                >
                  بازگشت به صفحه اصلی
                </a>
              </p>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-right">
              <p className="text-sm text-blue-900 font-medium mb-2">
                اطلاعات امنیتی
              </p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• این پنل فقط برای ادمین ها در دسترس است</li>
                <li>• هرگز نام کاربری و رمز خود را با کسی به اشتراک نگذارید</li>
                <li>• پس از اتمام کار، مطمئن شوید که خارج شوید</li>
              </ul>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
