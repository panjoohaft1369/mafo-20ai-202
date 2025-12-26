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
import { Download, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
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

  const handleDownload = async (imageUrl: string | undefined, prompt: string) => {
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
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <div className="px-6 py-4 border-b">
          <DialogTitle>تاریخچه تصاویر تولید شده</DialogTitle>
        </div>

        <ScrollArea className="flex-1 overflow-hidden">
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
                <p className="text-muted-foreground">
                  تاریخچه‌ای موجود نیست
                </p>
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
                                <Badge variant="default" className="bg-green-600">
                                  موفق
                                </Badge>
                              </>
                            ) : entry.status === "fail" ? (
                              <>
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <Badge variant="destructive">
                                  ناموفق
                                </Badge>
                              </>
                            ) : (
                              <>
                                <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
                                <Badge variant="secondary">
                                  درحال پردازش
                                </Badge>
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
                      {/* Image Preview */}
                      {entry.imageUrl && entry.status === "success" ? (
                        <div className="rounded-lg overflow-hidden border border-border bg-muted">
                          <img
                            src={entry.imageUrl}
                            alt="تصویر تولید شده"
                            className="w-full max-h-64 object-cover"
                          />
                        </div>
                      ) : entry.status === "fail" ? (
                        <div className="rounded-lg p-4 bg-red-50 border border-red-200">
                          <p className="text-sm text-red-800">
                            {entry.error ||
                              "خطایی در ایجاد تصویر رخ داد"}
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
                            <p className="text-xs text-muted-foreground">
                              کیفیت
                            </p>
                            <p className="font-medium">{entry.resolution}</p>
                          </div>
                        )}
                      </div>

                      {/* Download Button */}
                      {entry.status === "success" && entry.imageUrl && (
                        <Button
                          onClick={() =>
                            handleDownload(
                              entry.imageUrl,
                              entry.prompt || "تصویر"
                            )
                          }
                          variant="outline"
                          size="sm"
                          className="w-full gap-2"
                        >
                          <Download className="h-4 w-4" />
                          دانلود تصویر
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
