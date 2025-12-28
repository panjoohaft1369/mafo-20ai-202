import { useState, useEffect } from "react";
import { fetchLogs } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageViewer } from "@/components/ImageViewer";
import {
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Maximize2,
} from "lucide-react";
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
}

interface HistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string;
}

export function HistoryModal({
  open,
  onOpenChange,
  apiKey,
}: HistoryModalProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImage, setViewerImage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const loadHistory = async () => {
      setLoading(true);
      setError("");

      const logs = await fetchLogs(apiKey);

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
  }, [open, apiKey]);

  const handleDownload = async (
    imageUrl: string | undefined,
    prompt: string,
  ) => {
    if (!imageUrl) {
      toast.error("تصویر موجود نیست");
      return;
    }

    try {
      const response = await fetch(imageUrl);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle>تاریخچه تصاویر تولید شده</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 w-full">
          <div className="px-6 py-4">
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
                <p className="text-muted-foreground">تاریخچه‌ای موجود نیست</p>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {history.map((entry) => (
                  <Card key={entry.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {entry.status === "success" ? (
                              <>
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <Badge
                                  variant="default"
                                  className="bg-green-600"
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
                                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                                <Badge variant="secondary">درحال پردازش</Badge>
                              </>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {formatDate(entry.timestamp)}
                          </p>
                          {entry.prompt && (
                            <p className="text-sm font-medium line-clamp-2">
                              {entry.prompt}
                            </p>
                          )}
                          {entry.creditUsed && (
                            <p className="text-xs text-muted-foreground mt-2">
                              💰 اعتبار مصرف شده: {entry.creditUsed}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          {entry.status === "success" && entry.imageUrl && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setViewerImage(entry.imageUrl!);
                                  setViewerOpen(true);
                                }}
                              >
                                <Maximize2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleDownload(entry.imageUrl, entry.prompt!)
                                }
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {entry.status === "success" && entry.imageUrl && (
                      <CardContent className="p-0">
                        <img
                          src={entry.imageUrl}
                          alt="تصویر تاریخچه"
                          className="w-full h-48 object-cover"
                        />
                      </CardContent>
                    )}

                    {entry.status === "fail" && entry.error && (
                      <CardContent className="p-3 bg-red-50">
                        <p className="text-sm text-red-700">{entry.error}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>

      {/* Image Viewer Modal */}
      <ImageViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        imageUrl={viewerImage}
      />
    </Dialog>
  );
}
