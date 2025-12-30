import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Upload, RotateCw, Undo2, X } from "lucide-react";
import { toast } from "sonner";
import { useResponsive } from "@/hooks/useResponsive";

interface AdminImageEditorProps {
  onClose?: () => void;
  onSave?: (imageData: string) => void;
  initialImage?: string;
}

export function AdminImageEditor({
  onClose,
  onSave,
  initialImage,
}: AdminImageEditorProps) {
  const [imageSource, setImageSource] = useState<string | null>(initialImage || null);
  const [isLoading, setIsLoading] = useState(false);
  const { device, isMobile, isTablet, isDesktop } = useResponsive();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);

  // Calculate responsive dimensions
  const getCanvasDimensions = () => {
    if (isMobile) {
      return { width: 300, height: 400 };
    } else if (isTablet) {
      return { width: 500, height: 600 };
    } else {
      return { width: 800, height: 600 };
    }
  };

  const dimensions = getCanvasDimensions();

  // Draw image on canvas
  useEffect(() => {
    if (!imageSource || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas dimensions
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      // Clear canvas
      ctx.fillStyle = "#f5f5f5";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save context state
      ctx.save();

      // Apply rotation
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Calculate scaling to fit image
      const scale = Math.min(
        canvas.width / img.width,
        canvas.height / img.height
      );
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;

      // Draw image
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // Restore context state
      ctx.restore();
    };

    img.onerror = () => {
      toast.error("خطا در بارگذاری تصویر");
    };

    img.src = imageSource;
  }, [imageSource, rotation, dimensions]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("لطفاً یک فایل تصویری انتخاب کنید");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSource(event.target?.result as string);
      setRotation(0);
      toast.success("تصویر با موفقیت بارگذاری شد");
    };

    reader.onerror = () => {
      toast.error("خطا در خواندن فایل");
    };

    reader.readAsDataURL(file);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setImageSource(initialImage || null);
    setRotation(0);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `edited-image-${Date.now()}.png`;
    link.click();

    toast.success("تصویر با موفقیت دانلود شد");
  };

  const handleSave = () => {
    if (!canvasRef.current) return;

    const imageData = canvasRef.current.toDataURL("image/png");
    onSave?.(imageData);
    toast.success("تصویر با موفقیت ذخیره شد");
    onClose?.();
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">ویرایشگر تصویر</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden border border-gray-200">
        {imageSource ? (
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-center">
            <p className="text-gray-500 mb-4">هنوز تصویری انتخاب نشده</p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              بارگذاری تصویر
            </Button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          {isMobile ? "بارگذاری" : "بارگذاری تصویر"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRotate}
          disabled={!imageSource}
          className="gap-2"
        >
          <RotateCw className="h-4 w-4" />
          {isMobile ? "چرخش" : "چرخش 90°"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={!imageSource}
          className="gap-2"
        >
          <Undo2 className="h-4 w-4" />
          {isMobile ? "بازگشت" : "بازگشت به اصل"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={!imageSource}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {isMobile ? "دانلود" : "دانلود تصویر"}
        </Button>
      </div>

      {/* Action Buttons */}
      {onSave && (
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={!imageSource}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            ذخیره تصویر
          </Button>

          {onClose && (
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              انصراف
            </Button>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}
