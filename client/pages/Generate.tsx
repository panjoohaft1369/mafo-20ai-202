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
  generateImage,
  pollTaskCompletion,
  uploadImage,
  translateErrorMessage,
} from "@/lib/api";
import { getAuthState, clearAuth, updateStoredCredits } from "@/lib/auth";
import { HistoryModal } from "@/components/HistoryModal";
import { Loading } from "@/components/Loading";
import {
  Upload,
  AlertCircle,
  CheckCircle,
  Download,
  Trash2,
  History,
} from "lucide-react";
import { toast } from "sonner";

// Credit costs
const CREDIT_COSTS = {
  "1K": 5,
  "2K": 7,
};

export default function Generate() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const auth = getAuthState();

  // Redirect if not logged in
  useEffect(() => {
    if (!auth.isLoggedIn || !auth.apiKey) {
      navigate("/login");
    }
  }, [auth.isLoggedIn, auth.apiKey, navigate]);

  // Initialize state from localStorage if available
  const getInitialState = () => {
    if (typeof window === "undefined") {
      return {
        selectedImages: [],
        prompt: "",
        aspectRatio: "auto",
        resolution: "1K",
        generatedImage: null,
        taskId: null,
      };
    }
    const savedState = localStorage.getItem("generate_form_state");
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch {
        return {
          selectedImages: [],
          prompt: "",
          aspectRatio: "auto",
          resolution: "1K",
          generatedImage: null,
          taskId: null,
        };
      }
    }
    return {
      selectedImages: [],
      prompt: "",
      aspectRatio: "auto",
      resolution: "1K",
      generatedImage: null,
      taskId: null,
    };
  };

  const initialState = getInitialState();
  const [selectedImages, setSelectedImages] = useState<string[]>(
    initialState.selectedImages,
  );
  const [prompt, setPrompt] = useState(initialState.prompt);
  const [aspectRatio, setAspectRatio] = useState(initialState.aspectRatio);
  const [resolution, setResolution] = useState(initialState.resolution);
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(
    initialState.generatedImage,
  );
  const [error, setError] = useState("");
  const [taskId, setTaskId] = useState<string | null>(initialState.taskId);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Track if there's an in-progress task (persisted across navigation)
  const [hasInProgressTask, setHasInProgressTask] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("generate_in_progress_task");
    return saved === "true";
  });

  // Detect if running on localhost
  const isLocalhost =
    typeof window !== "undefined" && window.location.hostname === "localhost";

  // Calculate credit cost based on resolution and task type
  const calculateCreditCost = (): number => {
    const costMap: { [key: string]: number } = {
      "1K": 5,
      "2K": 7,
    };
    return costMap[resolution] || 5;
  };

  // Persist state to localStorage
  useEffect(() => {
    const hasContent =
      selectedImages.length > 0 || prompt.trim() || generatedImage;

    if (hasContent) {
      // Save the current state
      const stateToSave = {
        selectedImages,
        prompt,
        aspectRatio,
        resolution,
        generatedImage,
        taskId,
      };
      localStorage.setItem("generate_form_state", JSON.stringify(stateToSave));
    } else {
      // Clear localStorage completely if all content is empty
      localStorage.removeItem("generate_form_state");
    }
  }, [selectedImages, prompt, aspectRatio, resolution, generatedImage, taskId]);

  const handleLogout = () => {
    // Clear saved state on logout
    localStorage.removeItem("generate_form_state");
    localStorage.removeItem("generate_in_progress_task");
    clearAuth();
    navigate("/login");
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Check if adding these files would exceed 8 images
      const totalImages = selectedImages.length + files.length;
      if (totalImages > 8) {
        toast.error(
          `حداکثر 8 تصویر مجاز است. شما ${totalImages} تصویر انتخاب کرده‌اید.`,
        );
        return;
      }

      const newImages: string[] = [];
      let loadedCount = 0;

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          newImages.push(event.target?.result as string);
          loadedCount++;

          if (loadedCount === files.length) {
            setSelectedImages((prev) => [...prev, ...newImages]);
            toast.success(`${files.length} تصویر اضافه شد`);
          }
        };
        reader.readAsDataURL(file);
      });
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

    if (selectedImages.length === 0) {
      setError("لطفا ابتدا یک یا چند تصویر انتخاب کنید");
      return;
    }

    if (!prompt.trim()) {
      setError("لطفا یک پرامپت بنویسید");
      return;
    }

    setLoading(true);
    setTaskId(null);

    try {
      // Step 1: Upload all images to get public URLs
      toast.loading(`آپلود ${selectedImages.length} تصویر...`);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < selectedImages.length; i++) {
        const uploadResult = await uploadImage(selectedImages[i]);

        if (!uploadResult.success || !uploadResult.imageUrl) {
          setError(
            translateErrorMessage(uploadResult.error) ||
              `خطا در آپلود تصویر ${i + 1} از ${selectedImages.length}`,
          );
          setLoading(false);
          return;
        }

        uploadedUrls.push(uploadResult.imageUrl);
      }

      toast.dismiss();
      toast.loading("درخواست ایجاد تصویر...");

      // Step 2: Send generation request with uploaded image URLs
      const result = await generateImage({
        apiKey: auth.apiKey!,
        userId: auth.userId!,
        imageUrls: uploadedUrls,
        prompt,
        aspectRatio,
        resolution,
      });

      if (!result.success || !result.taskId) {
        setError(translateErrorMessage(result.error) || "خطا در ایجاد تصویر");
        setLoading(false);
        return;
      }

      // Mark task as in progress
      setTaskId(result.taskId);
      setHasInProgressTask(true);
      localStorage.setItem("generate_in_progress_task", "true");

      toast.dismiss();
      toast.loading("درحال پردازش تصویر... (این ممکن است چند دقیقه طول بکشد)");

      // Step 3: Poll for completion
      const pollResult = await pollTaskCompletion(auth.apiKey!, result.taskId);

      if (pollResult.success && pollResult.imageUrl) {
        setGeneratedImage(pollResult.imageUrl);

        // Calculate and deduct credits
        const creditCost =
          CREDIT_COSTS[resolution as keyof typeof CREDIT_COSTS] || 5;
        const newCredits = Math.max(0, (auth.credits || 0) - creditCost);
        updateStoredCredits(newCredits);

        toast.dismiss();
        toast.success(
          `تصویر با موفقیت ایجاد شد! (${creditCost} اعتبار کاهش یافت)`,
        );
      } else {
        setError(pollResult.error || "خطا در ایجاد تصویر");
        toast.dismiss();
      }
    } catch (err) {
      console.error("Generate error:", err);
      setError("خطا در اتصال. لطفا بعدا دوباره سعی کنید.");
      toast.dismiss();
    } finally {
      setLoading(false);
      // Clear in-progress task flag once generation attempt completes
      setHasInProgressTask(false);
      localStorage.removeItem("generate_in_progress_task");
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      // Use backend endpoint to bypass CORS issues
      const downloadUrl = `/api/download-image?url=${encodeURIComponent(generatedImage)}`;
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
      let filename = "mafo-image.png";
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
      toast.success("تصویر دانلود شد");
    } catch (err: any) {
      console.error("[Download] Error:", err.message);
      toast.error(
        err.message === "Failed to fetch"
          ? "خطا در اتصال به سرور. لطفا بعدا دوباره سعی کنید."
          : "خطا در دانلود تصویر",
      );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-0">
      <Header isLoggedIn={true} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8 sm:py-12 pt-20 md:pt-24 -mt-[120px]">
        {/* Title Section */}
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            تولید تصویر هوش مصنوعی
          </h1>
          <p className="text-muted-foreground mb-4">
            تصویری انتخاب کنید و با پرامپت خود، نسخه جدیدی ایجاد کنید
          </p>

          {/* Credit Cost Info Box */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-300 inline-block">
            <p className="text-sm text-yellow-900 font-medium">
              💰 <strong>هزینه اعتبار:</strong> هر تصویر ساخته شده با کیفیت 1K
              میزان 5 اعتبار و با کیفیت 2K میزان 7 اعتبار از شما کسر خواهد کرد
            </p>
          </div>

          {/* Localhost Warning */}
          {isLocalhost && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-300 mt-6 inline-block max-w-2xl">
              <p className="text-sm text-blue-900 font-medium mb-2">
                ℹ️ <strong>توجه:</strong> شما روی محیط محلی (localhost) کار
                می‌کنید
              </p>
              <p className="text-xs text-blue-800 mb-3">
                برای استفاده از تولید تصویر، باید آدرس عمومی سرور خود را تنظیم
                کنید. Kie.ai نمی‌تواند تصاویری را از localhost دانلود کند.
              </p>
              <div className="text-xs text-blue-800 space-y-2 mb-3">
                <p>
                  <strong>راه حل 1:</strong> متغیر محیطی{" "}
                  <code className="bg-blue-100 px-2 py-1 rounded">
                    PUBLIC_URL
                  </code>{" "}
                  را تنظیم کنید:
                </p>
                <code className="block bg-blue-100 p-2 rounded font-mono whitespace-normal break-words">
                  PUBLIC_URL=https://your-domain.com npm run dev
                </code>
                <p>
                  <strong>راه حل 2:</strong> از ابزار تانل‌سازی مثل ngrok
                  استفاده کنید برای افشای سرور محلی:
                </p>
                <code className="block bg-blue-100 p-2 rounded font-mono">
                  ngrok http 8080
                </code>
              </div>
              <p className="text-xs text-blue-700 italic">
                پس از تنظیم، صفحه را تازه‌کنی کنید.
              </p>
            </div>
          )}
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
                {/* Selected Images Preview - Large Display */}
                {selectedImages.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">
                      {selectedImages.length} تصویر انتخاب شده (حداکثر 8 تصویر)
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="flex flex-col gap-2">
                          <img
                            src={image}
                            alt={`تصویر ${index + 1}`}
                            className="rounded object-cover w-full h-40 sm:h-48"
                          />
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImages((prev) =>
                                prev.filter((_, i) => i !== index),
                              );
                            }}
                            variant="destructive"
                            size="sm"
                            className="w-full gap-1 text-white"
                          >
                            <Trash2 className="h-3 w-3" />
                            حذف
                          </Button>
                        </div>
                      ))}
                    </div>
                    {selectedImages.length < 8 && (
                      <p className="text-xs text-muted-foreground">
                        برای اضافه کردن تصویر بیشتر (حداکثر 8) کلیک کنید
                      </p>
                    )}
                  </div>
                )}

                {/* Upload Area - Show instructions when no images selected */}
                {selectedImages.length === 0 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  >
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm font-medium">
                        تصویر را اینجا بگذارید
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG یا WebP (1 تا 8 تصویر)
                      </p>
                    </div>
                  </div>
                )}

                {/* Add More Images Button - Shows when images selected but not full */}
                {selectedImages.length > 0 && selectedImages.length < 8 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-muted-foreground/30 rounded-lg p-3 text-center cursor-pointer hover:border-primary transition-colors text-sm font-medium text-muted-foreground hover:text-primary"
                  >
                    + افزودن تصویر
                  </button>
                )}

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {/* Delete All Button */}
                {selectedImages.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedImages([]);
                      setGeneratedImage(null);
                    }}
                    className="w-full text-white gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    حذف تمام تصاویر
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Prompt Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  ۲. پرامپت خود را بنویسید
                </CardTitle>
                <CardDescription>
                  تغییراتی که می‌خواهید را توصیف کنید
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="مثلا: این تصویر اتاق من است، یک مبل قرمز رنگ بزرگ در کنار پنجره بگذار..."
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
                  نسبت ابعاد و کیفیت تصویر را انتخاب کنید
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">نسبت ابعاد</label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">خودکار (بر اساس عکس)</SelectItem>
                      <SelectItem value="1:1">۱:۱ (مربع)</SelectItem>
                      <SelectItem value="4:3">۴:۳ (افقی)</SelectItem>
                      <SelectItem value="3:4">۳:۴ (عمودی)</SelectItem>
                      <SelectItem value="16:9">۱۶:۹ (سینمایی)</SelectItem>
                      <SelectItem value="9:16">۹:۱۶ (موبایل)</SelectItem>
                      <SelectItem value="3:2">۳:۲ (کلاسیک)</SelectItem>
                      <SelectItem value="2:3">۲:۳ (کلاسیک عمودی)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">کیفیت</label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1K">۱K - بالای ۱۰۲۴px</SelectItem>
                      <SelectItem value="2K">۲K - بالای ۲۰۴۸px</SelectItem>
                    </SelectContent>
                  </Select>
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
            {!auth.credits || auth.credits <= 0 ? (
              <div className="p-4 bg-red-50 rounded-lg border-2 border-red-400 shadow-md">
                <p className="text-sm text-red-900 font-bold">
                  ❌ اعتبار به اتمام رسیده
                </p>
                <p className="text-xs text-red-800 mt-2">
                  اعتبار حساب شما به اتمام رسیده. برای ادامه استفاده از ربات،
                  لطفا با پشتیبانی تماس بگیرید.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-400 shadow-md">
                <p className="text-sm text-yellow-900 font-bold">
                  ⚠️ توجه: اعتبار شما کسر خواهد شد
                </p>
                <p className="text-xs text-yellow-800 mt-2">
                  هر تصویر ساخته شده با کیفیت 1K میزان 5 اعتبار و با کیفیت 2K
                  میزان 7 اعتبار از شما کسر خواهد کرد
                </p>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={
                loading ||
                selectedImages.length === 0 ||
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
                  درحال ایجاد تصویر...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>ایجاد تصویر</span>
                  <span className="text-sm opacity-90">
                    ({calculateCreditCost()} 💳)
                  </span>
                </div>
              )}
            </Button>
          </div>

          {/* Right Column - Output */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">۴. تصویر تولید شده</CardTitle>
                <CardDescription>نتیجه نهایی تصویر شما</CardDescription>
              </CardHeader>
              <CardContent>
                {generatedImage ? (
                  <div className="space-y-4">
                    <div className="rounded-lg overflow-hidden border border-border">
                      <img
                        src={generatedImage}
                        alt="تصویر تولید شده"
                        className="w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={handleDownload}
                        variant="default"
                        className="w-full gap-2 hover:shadow-lg hover:scale-105 active:scale-95"
                      >
                        <Download className="h-4 w-4" />
                        دانلود تصویر
                      </Button>
                      <Button
                        onClick={() => setGeneratedImage(null)}
                        variant="outline"
                        className="w-full gap-2 hover:shadow-lg hover:scale-105 active:scale-95"
                      >
                        <Trash2 className="h-4 w-4" />
                        تولید دوباره
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
                        <img
                          src="https://cdn.builder.io/api/v1/image/assets%2F4c88dfcd13ad44aba9d3f4537f9785d5%2F7b7411c026af4e239cc51b637375e6fc?format=webp&width=800"
                          alt="Robot"
                          className="w-40 h-40 object-contain mb-4"
                        />
                        <p className="text-sm text-muted-foreground px-4 py-2 border border-white rounded-lg bg-background">
                          تصویر تولید شده اینجا نشان داده می‌شود
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

      {/* History Modal */}
      <HistoryModal
        open={historyModalOpen}
        onOpenChange={setHistoryModalOpen}
        apiKey={auth.apiKey!}
      />

      {/* Bottom Navigation */}
      <BottomNav isLoggedIn={true} onLogout={handleLogout} />
    </div>
  );
}
