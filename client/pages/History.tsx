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
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "images" | "videos">("all");

  // Function to detect if URL is a video
  const isVideoUrl = (url?: string): boolean => {
    if (!url) return false;
    const videoExtensions = [".mp4", ".webm", ".mov", ".avi", ".mkv"];
    const urlLower = url.toLowerCase();
    return (
      videoExtensions.some((ext) => urlLower.includes(ext)) ||
      urlLower.includes("video") ||
      urlLower.includes("generated_video")
    );
  };

  // Filter history based on selected filter
  const filteredHistory = history.filter((entry) => {
    if (filter === "videos") {
      return entry.imageUrl && isVideoUrl(entry.imageUrl);
    } else if (filter === "images") {
      return entry.imageUrl && !isVideoUrl(entry.imageUrl);
    }
    return true; // "all"
  });

  // Function to calculate credit cost based on resolution and media type
  const calculateCreditCost = (entry: HistoryEntry): number => {
    // If creditCost is already provided, use it
    if (entry.creditCost !== undefined) {
      return entry.creditCost;
    }

    // Calculate based on resolution and media type
    if (entry.imageUrl && isVideoUrl(entry.imageUrl)) {
      return 20; // Video always costs 20 credits
    }

    // For images, check resolution
    const resolution = entry.resolution?.toUpperCase() || "1K";
    if (resolution === "2K") {
      return 7;
    }
    return 5; // Default to 1K = 5 credits
  };

  // Check if a processing task has timed out (more than 15 minutes)
  const hasTimedOut = (entry: HistoryEntry): boolean => {
    if (entry.status !== "processing") return false;
    const timeoutThreshold = 15 * 60 * 1000; // 15 minutes in milliseconds
    const elapsedTime = Date.now() - entry.timestamp;
    return elapsedTime > timeoutThreshold;
  };

  // Get the effective status (handles timeout scenarios)
  const getEffectiveStatus = (
    entry: HistoryEntry,
  ): "success" | "fail" | "processing" => {
    if (hasTimedOut(entry)) {
      return "fail";
    }
    return entry.status as any;
  };

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
      console.log("[Download] Requesting from backend:", downloadUrl);

      const response = await fetch(downloadUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || `خطا در دانلود تصویر (HTTP ${response.status})`;
        console.error("[Download] Server error:", errorMessage);
        toast.error(errorMessage);
        return;
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        toast.error("فایل دانلود شده خالی است");
        return;
      }

      // Try to get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "mafo-file";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("فایل دانلود شد");
    } catch (err: any) {
      console.error("[Download] Error:", err.message);
      toast.error(
        err.message === "Failed to fetch"
          ? "خطا در اتصال به سرور. لطفا بعدا دوباره سعی کنید."
          : "خطا در دانلود تصویر",
      );
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
    <div className="min-h-screen bg-background pb-10">
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

          {/* Filter Tabs */}
          <div className="flex gap-2 justify-center mt-6 flex-wrap">
            <Button
              onClick={() => setFilter("all")}
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              className="gap-1"
            >
              همه ({history.length})
            </Button>
            <Button
              onClick={() => setFilter("images")}
              variant={filter === "images" ? "default" : "outline"}
              size="sm"
              className="gap-1"
            >
              تصاویر (
              {
                history.filter((h) => h.imageUrl && !isVideoUrl(h.imageUrl))
                  .length
              }
              )
            </Button>
            <Button
              onClick={() => setFilter("videos")}
              variant={filter === "videos" ? "default" : "outline"}
              size="sm"
              className="gap-1"
            >
              ویدیوها (
              {
                history.filter((h) => h.imageUrl && isVideoUrl(h.imageUrl))
                  .length
              }
              )
            </Button>
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
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-4">
              {filter === "videos"
                ? "ویدیویی موجود نیست"
                : filter === "images"
                  ? "تصویری موجود نیست"
                  : "تاریخچه‌ای موجود نیست"}
            </p>
            {history.length > 0 && (
              <p className="text-sm text-muted-foreground mb-4">
                (اما {history.length} مورد دیگر در دسته‌های دیگر وجود دارد)
              </p>
            )}
            <Button
              onClick={() => navigate("/generate")}
              className="hover:shadow-lg hover:scale-105 active:scale-95"
            >
              شروع ساختن تصویر
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredHistory.map((entry) => (
              <Card key={entry.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getEffectiveStatus(entry) === "success" ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                            <Badge
                              variant="default"
                              className="bg-yellow-500 text-black"
                            >
                              موفق
                            </Badge>
                          </>
                        ) : getEffectiveStatus(entry) === "fail" ? (
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
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Media Preview - Image or Video */}
                  {entry.imageUrl && getEffectiveStatus(entry) === "success" ? (
                    isVideoUrl(entry.imageUrl) ? (
                      // Video Player
                      <div className="relative rounded-lg overflow-hidden border border-border bg-black h-[450px] flex items-center justify-center group">
                        <video
                          src={entry.imageUrl}
                          controls
                          className="w-full h-full object-contain"
                          poster={`${entry.imageUrl}?thumbnail=true`}
                        />
                      </div>
                    ) : (
                      // Image Preview
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
                    )
                  ) : getEffectiveStatus(entry) === "fail" ? (
                    <div className="rounded-lg p-4 bg-red-50 border border-red-200">
                      <p className="text-sm text-red-800">
                        {hasTimedOut(entry)
                          ? "پردازش منقضی شد. درخواست برای تولید این تصویر/ویدیو لغو شد. اعتباری کسر نشده است."
                          : getErrorMessage(entry.error)}
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
                    {getEffectiveStatus(entry) === "success" && (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          مصرف اعتبار
                        </p>
                        <p className="font-medium text-yellow-600">
                          {calculateCreditCost(entry)} اعتبار
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 justify-center w-full">
                    {getEffectiveStatus(entry) === "success" &&
                      entry.imageUrl && (
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
                      )}
                  </div>
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
