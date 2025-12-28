import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { fetchBillingInfo } from "@/lib/api";
import { getAuthState, clearAuth } from "@/lib/auth";
import { Loader2, AlertCircle, TrendingUp } from "lucide-react";

interface BillingInfo {
  creditsRemaining: number;
  totalCredits: number;
  usedCredits: number;
}

export default function Billing() {
  const navigate = useNavigate();
  const auth = getAuthState();

  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!auth.isLoggedIn || !auth.apiKey) {
      navigate("/login");
      return;
    }
  }, [auth.isLoggedIn, auth.apiKey, navigate]);

  useEffect(() => {
    const loadBilling = async () => {
      try {
        const data = await fetchBillingInfo(auth.apiKey!);
        if (data) {
          setBilling(data);
        } else {
          setError("خطا در بارگذاری اطلاعات اعتبار");
        }
      } catch (err) {
        setError("خطا در اتصال به سرویس");
      } finally {
        setLoading(false);
      }
    };

    loadBilling();
  }, [auth.apiKey]);

  const usagePercentage = billing
    ? (billing.usedCredits / billing.totalCredits) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn={true} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        {/* Title Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">اعتبار و بیل</h1>
          <p className="text-muted-foreground">
            مشاهده و مدیریت اعتبار حساب خود
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">درحال بارگذاری...</p>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="flex items-center gap-3 py-8">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800">{error}</p>
              </CardContent>
            </Card>
          ) : billing ? (
            <>
              {/* Credit Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    اعتبار باقی‌مانده
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Remaining Credits */}
                    <div className="p-6 rounded-lg bg-white/50 backdrop-blur border border-border">
                      <p className="text-sm text-muted-foreground mb-1">
                        اعتبار باقی‌مانده
                      </p>
                      <p className="text-3xl font-bold">
                        {billing.creditsRemaining.toLocaleString()}
                      </p>
                    </div>

                    {/* Total Credits */}
                    <div className="p-6 rounded-lg bg-white/50 backdrop-blur border border-border">
                      <p className="text-sm text-muted-foreground mb-1">
                        کل اعتبار
                      </p>
                      <p className="text-3xl font-bold">
                        {billing.totalCredits.toLocaleString()}
                      </p>
                    </div>

                    {/* Used Credits */}
                    <div className="p-6 rounded-lg bg-white/50 backdrop-blur border border-border">
                      <p className="text-sm text-muted-foreground mb-1">
                        اعتبار مصرف‌شده
                      </p>
                      <p className="text-3xl font-bold text-red-600">
                        {billing.usedCredits.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Usage Progress */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">درصد استفاده</p>
                      <p className="text-sm font-semibold text-muted-foreground">
                        {Math.round(usagePercentage)}%
                      </p>
                    </div>
                    <Progress value={usagePercentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Billing Details */}
              <Card>
                <CardHeader>
                  <CardTitle>جزئیات اعتبار</CardTitle>
                  <CardDescription>
                    نحوه محاسبه و استفاده از اعتبار
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm">هر تصویر ایجاد شده</span>
                      <span className="font-semibold">1 اعتبار</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm">کیفیت بالا</span>
                      <span className="font-semibold">+50% اعتبار</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="text-sm">کیفیت بسیار بالا</span>
                      <span className="font-semibold">+100% اعتبار</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Credit Status */}
              {billing.creditsRemaining === 0 ? (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <p className="text-red-900 font-medium text-center">
                      اعتبار شما تمام شده است. لطفا با پشتیبانی تماس بگیرید.
                    </p>
                  </CardContent>
                </Card>
              ) : billing.creditsRemaining < 10 ? (
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="pt-6">
                    <p className="text-orange-900 text-center">
                      اعتبار شما کم است. برای خریدن اعتبار، با پشتیبانی تماس
                      بگیرید.
                    </p>
                  </CardContent>
                </Card>
              ) : null}

              {/* Contact Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    برای درخواست اعتبار اضافی
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="tel:+989357887572"
                    className="flex-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full gap-2">
                      ☎ تماس: 09357887572
                    </Button>
                  </a>
                  <a
                    href="http://wa.me/+989357887572"
                    className="flex-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full gap-2">
                      💬 واتساپ
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
