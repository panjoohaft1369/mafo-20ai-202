import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function Setup() {
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [serviceRoleKey, setServiceRoleKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!supabaseUrl.trim()) {
      setError("Supabase URL الزامی است");
      return;
    }

    if (!anonKey.trim()) {
      setError("Supabase Anon Key الزامی است");
      return;
    }

    if (!serviceRoleKey.trim()) {
      setError("Supabase Service Role Key الزامی است");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/setup/configure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supabaseUrl,
          anonKey,
          serviceRoleKey,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "خطا در اتصال به Supabase");
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err: any) {
      setError(err.message || "خطا در اتصال به Supabase");
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
              <Logo size="lg" className="mb-2" />
              <h1 className="text-3xl font-bold">MAFO</h1>
              <p className="text-sm text-muted-foreground">راه‌اندازی</p>
            </div>
          </div>
          <CardTitle className="text-2xl">اتصال Supabase</CardTitle>
          <CardDescription>
            برای شروع کار، Supabase credentials خود را وارد کنید
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Supabase URL */}
            <div className="space-y-2">
              <label htmlFor="url" className="text-sm font-medium">
                Supabase URL
              </label>
              <Input
                id="url"
                type="text"
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                disabled={loading}
                className="text-right"
              />
            </div>

            {/* Anon Key */}
            <div className="space-y-2">
              <label htmlFor="anonKey" className="text-sm font-medium">
                Anon Key
              </label>
              <Input
                id="anonKey"
                type="password"
                placeholder="eyJhbGc..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                disabled={loading}
                className="text-right"
              />
            </div>

            {/* Service Role Key */}
            <div className="space-y-2">
              <label htmlFor="roleKey" className="text-sm font-medium">
                Service Role Key
              </label>
              <Input
                id="roleKey"
                type="password"
                placeholder="eyJhbGc..."
                value={serviceRoleKey}
                onChange={(e) => setServiceRoleKey(e.target.value)}
                disabled={loading}
                className="text-right"
              />
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
                  اتصال موفق! درحال انتقال...
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !supabaseUrl || !anonKey || !serviceRoleKey}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  درحال اتصال...
                </>
              ) : (
                "متصل کردن"
              )}
            </Button>

            {/* Info Box */}
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-right">
              <p className="text-sm text-blue-900 font-medium mb-2">
                کدام مقادیر را وارد کنم؟
              </p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• این مقادیر را از Supabase project settings بگیرید</li>
                <li>• Settings → API → Project URL و Keys</li>
                <li>• هرگز این مقادیر را با کسی به اشتراک نگذارید</li>
              </ul>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
