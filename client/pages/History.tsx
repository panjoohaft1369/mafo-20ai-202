import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageViewer } from "@/components/ImageViewer";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Maximize2,
} from "lucide-react";
import { getAuthState, clearAuth } from "@/lib/auth";
import { fetchLogs } from "@/lib/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface HistoryEntry {
  id: string;
  taskId: string;
  status: string;
  imageUrl?: string;
  error?: string;
  timestamp: number;
  prompt?: string;
  aspectRatio?: string;
  resolution?: string;
  creditUsed?: number;
  creditCost?: number;
}

export default function History() {
  const navigate = useNavigate();
  const auth = getAuthState();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImage, setViewerImage] = useState<string | null>(null);

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

  // Load history on mount
  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      const logs = await fetchLogs(auth.apiKey!);

      if (!logs || logs.length === 0) {
        setHistory([]);
        setLoading(false);
        return;
      }

      // Sort by timestamp in descending order (newest first)
      const sortedLogs = logs.sort(
        (a: any, b: any) => b.timestamp - a.timestamp,
      );
      setHistory(sortedLogs);
      setLoading(false);
    };

    loadHistory();
  }, [auth.apiKey]);

  const handleDownload = async (
    imageUrl: string | undefined,
    prompt: string,
  ) => {
    if (!imageUrl) {
      toast.error("تصویر موجود نیست");
      return;
    }

    try {
      // Use backend endpoint to bypass CORS issues
      const downloadUrl = `/api/download-image?url=${encodeURIComponent(imageUrl)}`;
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        toast.error("خطا در دانلود تصویر");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mafo-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("تصویر دانلود شد");
    } catch (err) {
      toast.error("خطا در دانلود تصویر");
      console.error("Download error:", err);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getErrorMessage = (error?: string): string => {
    if (!error) return "خطایی نامعلوم رخ داد";

    const errorMap: { [key: string]: string } = {
      "Task execution timeout":
        "مهلت زمانی پردازش به پایان رسید. لطفاً دوباره تلاش کنید.",
      timeout: "مهلت زمانی به پایان رسید",
      failed: "عملیات ناموفق بود",
      error: "خطا در پردازش درخواست",
      "network error": "خطا در اتصال شبکه",
      "insufficient credits": "اعتبار کافی برای این عملیات نیست",
    };

    // Check if error contains any known keywords
    for (const [key, value] of Object.entries(errorMap)) {
      if (error.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    // If no match found, return original error with a prefix
    return `خطا: ${error}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header isLoggedIn={true} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8 sm:py-12 max-w-6xl">
        {/* Title Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            تاریخچه تصاویر و ویدیوهای تولید شده
          </h1>
          <p className="text-muted-foreground mb-4">
            تمام تصاویر و ویدیوهایی که در طی ماه‌های گذشته ساخته‌اید
          </p>

          {/* Important Notice */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-300 inline-block max-w-2xl">
            <div className="flex gap-2 items-start">
              <AlertCircle className="h-5 w-5 text-yellow-700 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-900 text-right">
                <p className="font-semibold mb-1">⚠️ توجه: ذخیره‌سازی موقت</p>
                <p>
                  این صفحه فقط تصاویر و ویدیوهایی را نگهداری می‌کند که در طی{" "}
                  <strong>ماه گذشته</strong> ساخته‌اید. اگر می‌خواهید تصاویر و
                  ویدیوهای خود را برای همیشه نگاه دارید، آن‌ها را{" "}
                  <strong>دانلود کنید</strong> تا حذف نشوند.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* History Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="mr-2 text-muted-foreground">
              درحال بارگذاری...
            </span>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-4">تاریخچه‌ای موجود نیست</p>
            <Button
              onClick={() => navigate("/generate")}
              className="hover:shadow-lg hover:scale-105 active:scale-95"
            >
              شروع ساختن تصویر
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((entry) => (
              <Card key={entry.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {entry.status === "success" ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                            <Badge
                              variant="default"
                              className="bg-yellow-500 text-black"
                            >
                              موفق
                            </Badge>
                          </>
                        ) : entry.status === "fail" ? (
                          <>
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <Badge variant="destructive">ناموفق</Badge>
                          </>
                        ) : (
                          <>
                            <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
                            <Badge variant="secondary">درحال پردازش</Badge>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.timestamp)}
                      </p>
                      {entry.creditCost && (
                        <p className="text-xs text-yellow-600 font-semibold mt-1">
                          💳 هزینه اعتبار: {entry.creditCost}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Image Preview - Larger Container */}
                  {entry.imageUrl && entry.status === "success" ? (
                    <div
                      onClick={() => {
                        setViewerImage(entry.imageUrl!);
                        setViewerOpen(true);
                      }}
                      className="relative rounded-lg overflow-hidden border border-border bg-muted h-[450px] flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors group"
                    >
                      <img
                        src={entry.imageUrl}
                        alt="تصویر تولید شده"
                        className="max-w-full max-h-full object-contain"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                        <Maximize2 className="h-8 w-8 text-white/0 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  ) : entry.status === "fail" ? (
                    <div className="rounded-lg p-4 bg-red-50 border border-red-200">
                      <p className="text-sm text-red-800">
                        {getErrorMessage(entry.error)}
                      </p>
                    </div>
                  ) : null}

                  {/* Prompt */}
                  {entry.prompt && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        پرامپت:
                      </p>
                      <p className="text-sm text-foreground line-clamp-3">
                        {entry.prompt}
                      </p>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {entry.aspectRatio && (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          نسبت ابعاد
                        </p>
                        <p className="font-medium">{entry.aspectRatio}</p>
                      </div>
                    )}
                    {entry.resolution && (
                      <div>
                        <p className="text-xs text-muted-foreground">کیفیت</p>
                        <p className="font-medium">{entry.resolution}</p>
                      </div>
                    )}
                  </div>

                  {/* Download Button */}
                  {entry.status === "success" && entry.imageUrl && (
                    <div className="flex justify-center">
                      <Button
                        onClick={() =>
                          handleDownload(
                            entry.imageUrl,
                            entry.prompt || "تصویر",
                          )
                        }
                        variant="default"
                        size="sm"
                        className="w-1/2 gap-2"
                      >
                        <Download className="h-4 w-4" />
                        ذخیره
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Image Viewer Modal */}
      {viewerImage && (
        <ImageViewer
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          imageUrl={viewerImage}
          alt="تصویر تولید شده"
        />
      )}

      <BottomNav isLoggedIn={true} onLogout={handleLogout} />
    </div>
  );
}
