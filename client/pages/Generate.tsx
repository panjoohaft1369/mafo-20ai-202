import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Tutorial } from "@/components/Tutorial";
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
import { generateImage, pollTaskCompletion, uploadImage } from "@/lib/api";
import { getAuthState, clearAuth } from "@/lib/auth";
import {
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  Download,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export default function Generate() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const auth = getAuthState();

  // Redirect if not logged in
  if (!auth.isLoggedIn || !auth.apiKey) {
    navigate("/login");
    return null;
  }

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [resolution, setResolution] = useState("1K");
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
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

    if (!selectedImage) {
      setError("لطفا ابتدا یک تصویر انتخاب کنید");
      return;
    }

    if (!prompt.trim()) {
      setError("لطفا یک پرامپت بنویسید");
      return;
    }

    setLoading(true);
    setTaskId(null);

    try {
      // Step 1: Upload image to get a public URL
      toast.loading("آپلود تصویر...");
      const uploadResult = await uploadImage(selectedImage);

      if (!uploadResult.success || !uploadResult.imageUrl) {
        setError(uploadResult.error || "خطا در آپلود تصویر");
        setLoading(false);
        return;
      }

      toast.dismiss();
      toast.loading("درخواست ایجاد تصویر...");

      // Step 2: Send generation request with uploaded image URL
      const result = await generateImage({
        apiKey: auth.apiKey!,
        imageUrl: uploadResult.imageUrl,
        prompt,
        aspectRatio,
        resolution,
      });

      if (!result.success || !result.taskId) {
        setError(result.error || "خطا در ایجاد تصویر");
        setLoading(false);
        return;
      }

      setTaskId(result.taskId);
      toast.dismiss();
      toast.loading(
        "درحال پردازش تصویر... (این ممکن است یند چند دقیقه طول بکشد)",
      );

      // Step 3: Poll for completion
      const pollResult = await pollTaskCompletion(auth.apiKey!, result.taskId);

      if (pollResult.success && pollResult.imageUrl) {
        setGeneratedImage(pollResult.imageUrl);
        toast.dismiss();
        toast.success("تصویر با موفقیت ایجاد شد!");
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
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mafo-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      toast.error("خطا در دانلود تصویر");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn={true} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        {/* Title Section */}
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            تولید تصویر هوش مصنوعی
          </h1>
          <p className="text-muted-foreground">
            تصویری انتخاب کنید و با پرامپت خود، نسخه جدیدی ایجاد کنید
          </p>
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
                      setGeneratedImage(null);
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

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={loading || !selectedImage || !prompt.trim()}
              className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 py-6 text-base font-semibold"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  درحال ایجاد تصویر...
                </>
              ) : (
                "ایجاد تصویر"
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
                        className="w-full gap-2"
                      >
                        <Download className="h-4 w-4" />
                        دانلود تصویر
                      </Button>
                      <Button
                        onClick={() => setGeneratedImage(null)}
                        variant="outline"
                        className="w-full gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        تولید دوباره
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-center">
                    <div className="space-y-2">
                      <CheckCircle className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        تصویر تولید شده اینجا نشان داده می‌شود
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Credits Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">اعتبار شما</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      اعتبار باقی‌مانده:
                    </span>
                    <span className="font-semibold">{auth.credits || 0}</span>
                  </div>
                  <a
                    href="/billing"
                    className="text-xs text-brand-primary hover:underline block"
                  >
                    مشاهده جزئیات اعتبار →
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tutorial */}
        <Tutorial />
      </main>
    </div>
  );
}
