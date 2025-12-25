import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { validateApiKey } from "@/lib/api";
import { saveAuthCredentials } from "@/lib/auth";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!apiKey.trim()) {
      setError("لطفا کلید API خود را وارد کنید");
      return;
    }

    setLoading(true);

    try {
      const result = await validateApiKey(apiKey);

      if (!result.valid) {
        setError(
          result.message ||
          "کد لایسنس شما معتبر نمیباشد. لطفا با پشتیبانی تماس بگیرید."
        );
        setLoading(false);
        return;
      }

      // Save auth data
      saveAuthCredentials(apiKey, result.email || "", result.credit || 0);
      setSuccess(true);

      // Redirect to main page after a short delay
      setTimeout(() => {
        navigate("/");
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent bg-clip-text text-transparent">
                MAFO
              </h1>
              <p className="text-sm text-muted-foreground">
                هوش مصنوعی تصویرساز
              </p>
            </div>
          </div>
          <CardTitle className="text-2xl">خوش آمدید</CardTitle>
          <CardDescription>
            برای شروع، کلید API خود را وارد کنید
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* API Key Input */}
            <div className="space-y-2">
              <label htmlFor="api-key" className="text-sm font-medium">
                کلید API
              </label>
              <Input
                id="api-key"
                type="password"
                placeholder="API Key خود را اینجا بگذارید"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={loading}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground text-right">
                کلید خود را از{" "}
                <a
                  href="https://kie.ai/api-key"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:underline"
                >
                  اینجا
                </a>
                {" "}دریافت کنید
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800 text-right">
                  <p className="font-medium">خطا</p>
                  <p>{error}</p>
                  {error.includes("پشتیبانی") && (
                    <div className="mt-2 space-y-1 text-xs">
                      <p className="font-medium">اطلاعات تماس:</p>
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
              disabled={loading || !apiKey.trim()}
              className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  درحال تایید...
                </>
              ) : (
                "ورود"
              )}
            </Button>

            {/* Help Text */}
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-right">
              <p className="text-sm text-blue-900 font-medium mb-2">
                درباره کلید API
              </p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• کلید API شما شخصی و محرمانه است</li>
                <li>• هرگز آن را با کسی به اشتراک نگذارید</li>
                <li>• برای دریافت کلید جدید، کلید قدیمی را بازیابی کنید</li>
              </ul>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
