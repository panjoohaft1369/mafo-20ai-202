import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  generateVideo,
  pollTaskCompletion,
  uploadImage,
  translateErrorMessage,
} from "@/lib/api";
import { getAuthState, clearAuth, updateStoredCredits } from "@/lib/auth";
import { Loading } from "@/components/Loading";
import {
  Upload,
  AlertCircle,
  CheckCircle,
  Download,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

// Credit costs
const VIDEO_CREDIT_COST = 20;

export default function GenerateVideo() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const auth = getAuthState();

  // Redirect if not logged in
  useEffect(() => {
    if (!auth.isLoggedIn || !auth.apiKey) {
      navigate("/login");
    }
  }, [auth.isLoggedIn, auth.apiKey, navigate]);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("normal");
  const [loading, setLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [taskId, setTaskId] = useState<string | null>(null);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setError("");

    // Check if user has credits
    if (!auth.credits || auth.credits <= 0) {
      toast.error(
        "اعتبار حساب شما به اتمام رسیده، لطفا برای ادامه استفاده از ربات، با پشتیبانی تماس بگیرید",
      );
      return;
    }

    if (!selectedImage) {
      setError("لطفا ابتدا یک تصویر انتخاب کنید");
      return;
    }

    if (!prompt.trim()) {
      setError("لطفا یک پرامپت برای حرکت ویدیو بنویسید");
      return;
    }

    setLoading(true);
    setTaskId(null);

    try {
      // Step 1: Upload image to get a public URL
      toast.loading("آپلود تصویر...");
      const uploadResult = await uploadImage(selectedImage);

      if (!uploadResult.success || !uploadResult.imageUrl) {
        setError(
          translateErrorMessage(uploadResult.error) || "خطا در آپلود تصویر",
        );
        setLoading(false);
        return;
      }

      toast.dismiss();
      toast.loading("درخواست ایجاد ویدیو...");

      // Step 2: Send generation request with uploaded image URL
      const result = await generateVideo({
        apiKey: auth.apiKey!,
        userId: auth.userId!,
        imageUrl: uploadResult.imageUrl,
        prompt,
        mode,
      });

      if (!result.success || !result.taskId) {
        setError(translateErrorMessage(result.error) || "خطا در ایجاد ویدیو");
        setLoading(false);
        return;
      }

      setTaskId(result.taskId);
      toast.dismiss();
      toast.loading("درحال پردازش ویدیو... (این ممکن است چند دقیقه طول بکشد)");

      // Step 3: Poll for completion
      const pollResult = await pollTaskCompletion(auth.apiKey!, result.taskId);

      if (pollResult.success && pollResult.imageUrl) {
        setGeneratedVideo(pollResult.imageUrl);

        // Calculate and deduct credits for video
        const newCredits = Math.max(0, (auth.credits || 0) - VIDEO_CREDIT_COST);
        updateStoredCredits(newCredits);

        toast.dismiss();
        toast.success(
          `ویدیو با موفقیت ایجاد شد! (${VIDEO_CREDIT_COST} اعتبار کاهش یافت)`,
        );
      } else {
        setError(
          translateErrorMessage(pollResult.error) || "خطا در ایجاد ویدیو",
        );
        toast.dismiss();
      }
    } catch (err) {
      console.error("Generate video error:", err);
      setError("خطا در اتصال. لطفا بعدا دوباره سعی کنید.");
      toast.dismiss();
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedVideo) return;

    try {
      // Use backend endpoint to bypass CORS issues
      const downloadUrl = `/api/download-image?url=${encodeURIComponent(generatedVideo)}`;
      console.log("[Download] Requesting from backend:", downloadUrl);

      const response = await fetch(downloadUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || `خطا در دانلود ویدیو (HTTP ${response.status})`;
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
      let filename = "mafo-video.mp4";
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
      toast.success("ویدیو دانلود شد");
    } catch (err: any) {
      console.error("[Download] Error:", err.message);
      toast.error(
        err.message === "Failed to fetch"
          ? "خطا در اتصال به سرور. لطفا بعدا دوباره سعی کنید."
          : "خطا در دانلود ویدیو",
      );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header isLoggedIn={true} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8 sm:py-12 pt-20 md:pt-24">
        {/* Title Section */}
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            تولید ویدیو هوش مصنوعی (حالت آزمایشی)
          </h1>
          <p className="text-muted-foreground mb-2">
            تصویری انتخاب کنید و حرکت دلخواه را توصیف کنید تا ویدیویی خیره‌کننده
            ایجاد شود
          </p>
          <p className="text-sm text-yellow-900 font-medium mb-4">
            استفاده از این هوش مصنوعی رایگان نمی‌باشد
          </p>

          {/* Credit Cost Info Box */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-300 inline-block">
            <p className="text-sm text-yellow-900 font-medium">
              💰 <strong>هزینه اعتبار:</strong> ساخت هر ویدیو 6 ثانیه‌ای با این
              هوش مصنوعی 20 اعتبار از شما کسر خواهد کرد
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  ۱. تصویر را بارگذاری کنید
                </CardTitle>
                <CardDescription>
                  تصویری از گوشی یا کامپیوتر انتخاب کنید
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  {selectedImage ? (
                    <div className="space-y-2">
                      <img
                        src={selectedImage}
                        alt="انتخاب شده"
                        className="max-h-48 mx-auto rounded"
                      />
                      <p className="text-sm text-muted-foreground">
                        برای تغییر، دوباره کلیک کنید
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm font-medium">
                        تصویر را اینجا بگذارید
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG یا WebP
                      </p>
                    </div>
                  )}
                </div>

                {selectedImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedImage(null);
                      setGeneratedVideo(null);
                    }}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    حذف تصویر
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Prompt Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  ۲. حرکت ویدیو را توصیف کنید
                </CardTitle>
                <CardDescription>
                  دقیقاً توصیف کنید چگونه تصویر باید حرکت کند
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="مثلا: دوربین دست‌دار به دخترک نزدیک می‌شود و او سر تکان می‌دهد..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-32 resize-none"
                />
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">۳. تنظیمات</CardTitle>
                <CardDescription>
                  سبک و جزئیات ویدیو را انتخاب کنید
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">سبک</label>
                  <Select value={mode} onValueChange={setMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fun">سرگرم‌کننده</SelectItem>
                      <SelectItem value="normal">عادی</SelectItem>
                      <SelectItem value="spicy">خلاقانه</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    نکته: هنگام استفاده از تصاویر خارجی، تنها «عادی» و
                    «سرگرم‌کننده» پشتیبانی می‌شود
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
              <div className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Credit Cost Alert */}
            {(!auth.credits || auth.credits <= 0) ? (
              <div className="p-4 bg-red-50 rounded-lg border-2 border-red-400 shadow-md">
                <p className="text-sm text-red-900 font-bold">
                  ❌ اعتبار به اتمام رسیده
                </p>
                <p className="text-xs text-red-800 mt-2">
                  اعتبار حساب شما به اتمام رسیده. برای ادامه استفاده از ربات، لطفا با پشتیبانی تماس بگیرید.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-400 shadow-md">
                <p className="text-sm text-yellow-900 font-bold">
                  ⚠️ توجه: اعتبار شما کسر خواهد شد
                </p>
                <p className="text-xs text-yellow-800 mt-2">
                  ساخت هر ویدیو 6 ثانیه‌ای با این هوش مصنوعی 20 اعتبار از شما کسر
                  خواهد کرد
                </p>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={
                loading ||
                !selectedImage ||
                !prompt.trim() ||
                !auth.credits ||
                auth.credits <= 0
              }
              className="w-full py-6 text-base font-semibold hover:shadow-lg hover:opacity-90 active:opacity-75 transition-all duration-200"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loading size="sm" inline text={undefined} />
                  درحال ایجاد ویدیو...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>ایجاد ویدیو</span>
                  <span className="text-sm opacity-90">
                    ({VIDEO_CREDIT_COST} 💳)
                  </span>
                </div>
              )}
            </Button>
          </div>

          {/* Middle Column - Robot Image */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="text-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F4c88dfcd13ad44aba9d3f4537f9785d5%2F7b7411c026af4e239cc51b637375e6fc?format=webp&width=800"
                alt="Robot"
                className="w-full max-w-xs mx-auto object-contain"
              />
            </div>
          </div>

          {/* Right Column - Output */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">۴. ویدیو تولید شده</CardTitle>
                <CardDescription>نتیجه نهایی ویدیو شما</CardDescription>
              </CardHeader>
              <CardContent>
                {generatedVideo ? (
                  <div className="space-y-4">
                    <div className="rounded-lg overflow-hidden border border-border bg-muted">
                      <video src={generatedVideo} controls className="w-full" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={handleDownload}
                        variant="default"
                        className="w-full gap-2 hover:shadow-lg hover:scale-105 active:scale-95"
                      >
                        <Download className="h-4 w-4" />
                        دانلود ویدیو
                      </Button>
                      <Button
                        onClick={() => setGeneratedVideo(null)}
                        variant="outline"
                        className="w-full gap-2 hover:shadow-lg hover:scale-105 active:scale-95"
                      >
                        <Trash2 className="h-4 w-4" />
                        ایجاد دوباره
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center text-center">
                    {loading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <img
                          src="/loading-gif.gif"
                          alt="درحال بارگذاری"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="w-32 h-32">
                          <Loading size="lg" inline text={undefined} />
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">
                          ویدیو تولید شده اینجا نشان داده می‌شود
                        </p>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav isLoggedIn={true} onLogout={handleLogout} />
    </div>
  );
}
