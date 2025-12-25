import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchLogs } from "@/lib/api";
import { getAuthState, clearAuth } from "@/lib/auth";
import { Loader2, AlertCircle, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

export interface LogEntry {
  id: string;
  taskId?: string;
  timestamp: number;
  prompt?: string;
  imageUrl?: string;
  aspectRatio?: string;
  resolution?: string;
  status?: string;
  error?: string;
}

export default function Logs() {
  const navigate = useNavigate();
  const auth = getAuthState();

  // Redirect if not logged in
  if (!auth.isLoggedIn || !auth.apiKey) {
    navigate("/login");
    return null;
  }

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await fetchLogs(auth.apiKey!);
        setLogs(data || []);
      } catch (err) {
        setError("خطا در بارگذاری گزارشات");
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [auth.apiKey]);

  const handleDownloadImage = async (imageUrl: string, id: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mafo-${id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      toast.error("خطا در دانلود تصویر");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn={true} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        {/* Title Section */}
        <div className="max-w-6xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            گزارش تصاویر
          </h1>
          <p className="text-muted-foreground">
            تصاویری که در 2 ماه اخیر ایجاد کرده‌اید
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
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
          ) : logs.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">هنوز تصویری ایجاد نشده است</p>
                  <Button onClick={() => navigate("/generate")} variant="default">
                    شروع کنید
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {logs.map((log) => (
                <Card key={log.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={log.imageUrl}
                      alt={log.prompt}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>

                  <CardContent className="p-4 space-y-3">
                    {/* Date */}
                    <p className="text-xs text-muted-foreground">
                      {formatDate(log.timestamp)}
                    </p>

                    {/* Prompt */}
                    <div>
                      <p className="text-sm font-medium mb-1">پرامپت:</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {log.prompt}
                      </p>
                    </div>

                    {/* Settings */}
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>ابعاد: {log.width}×{log.height}</p>
                      <p>کیفیت: {log.quality}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                          handleDownloadImage(log.imageUrl, log.id)
                        }
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setLogs(logs.filter((l) => l.id !== log.id));
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
