import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AdminImageEditorModal } from "@/components/AdminImageEditorModal";
import { toast } from "sonner";

interface SlideImage {
  id: string;
  title: string;
  imageUrl?: string;
  imageData?: string; // Base64 encoded image data
  order: number;
}

interface AdminSlidesImageEditorProps {
  onSave?: (slides: SlideImage[]) => void;
}

export function AdminSlidesImageEditor({ onSave }: AdminSlidesImageEditorProps) {
  const [slides, setSlides] = useState<SlideImage[]>([]);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // Load slides from storage
  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/index-slides");
      if (response.ok) {
        const data = await response.json();
        setSlides(data.slides || []);
      }
    } catch (error) {
      console.error("Error loading slides:", error);
      toast.error("خطا در بارگذاری اسلاید‌ها");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlide = () => {
    const newSlide: SlideImage = {
      id: Date.now().toString(),
      title: "اسلاید جدید",
      order: slides.length + 1,
    };
    setSlides([...slides, newSlide]);
    setEditingSlideId(newSlide.id);
    setEditingTitle(newSlide.title);
  };

  const handleEditImage = (slide: SlideImage) => {
    setEditingSlideId(slide.id);
    setEditingTitle(slide.title);
    setEditorOpen(true);
  };

  const handleSaveImage = (imageData: string) => {
    if (!editingSlideId) return;

    setSlides(
      slides.map((slide) =>
        slide.id === editingSlideId
          ? {
              ...slide,
              imageData: imageData,
              title: editingTitle,
            }
          : slide
      )
    );

    toast.success("تصویر اسلاید ذخیره شد");
    saveToServer();
  };

  const handleDeleteSlide = (id: string) => {
    if (confirm("آیا از حذف این اسلاید اطمینان دارید؟")) {
      const updatedSlides = slides
        .filter((slide) => slide.id !== id)
        .map((slide, index) => ({
          ...slide,
          order: index + 1,
        }));
      setSlides(updatedSlides);
      saveToServer(updatedSlides);
      toast.success("اسلاید حذف شد");
    }
  };

  const handleDownloadImage = (slide: SlideImage) => {
    if (!slide.imageData && !slide.imageUrl) {
      toast.error("تصویری برای دانلود وجود ندارد");
      return;
    }

    const imageUrl = slide.imageData || slide.imageUrl;
    if (!imageUrl) return;

    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${slide.title}-${Date.now()}.png`;
    link.click();

    toast.success("تصویر دانلود شد");
  };

  const saveToServer = async (slidesToSave: SlideImage = slides) => {
    try {
      const response = await fetch("/api/admin/index-slides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slides: slidesToSave }),
      });

      if (response.ok) {
        toast.success("تغییرات ذخیره شدند");
        onSave?.(slidesToSave);
      } else {
        toast.error("خطا در ذخیره‌سازی");
      }
    } catch (error) {
      console.error("Error saving slides:", error);
      toast.error("خطا در ذخیره‌سازی");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">ویرایش تصاویر اسلاید‌ها</h2>
          <p className="text-muted-foreground mt-1">
            تصاویر اسلاید‌های صفحه خانه را ویرایش کنید
          </p>
        </div>
        <Button onClick={handleAddSlide} className="gap-2" disabled={loading}>
          <Plus className="h-4 w-4" />
          اضافه کردن اسلاید
        </Button>
      </div>

      {/* Slides List */}
      <div className="space-y-4">
        {slides.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                اسلایدی وجود ندارد
              </p>
            </CardContent>
          </Card>
        ) : (
          slides
            .sort((a, b) => a.order - b.order)
            .map((slide, index) => (
              <Card key={slide.id} className="overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {/* Image Preview */}
                    <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      {slide.imageData || slide.imageUrl ? (
                        <img
                          src={slide.imageData || slide.imageUrl}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          بدون تصویر
                        </div>
                      )}
                    </div>

                    {/* Slide Info */}
                    <div className="flex-1">
                      <div className="mb-4">
                        <label className="text-sm font-medium mb-1 block">
                          عنوان اسلاید
                        </label>
                        <Input
                          value={editingSlideId === slide.id ? editingTitle : slide.title}
                          onChange={(e) => {
                            if (editingSlideId === slide.id) {
                              setEditingTitle(e.target.value);
                            }
                          }}
                          onBlur={() => {
                            if (editingSlideId === slide.id) {
                              setSlides(
                                slides.map((s) =>
                                  s.id === slide.id ? { ...s, title: editingTitle } : s
                                )
                              );
                              setEditingSlideId(null);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.currentTarget.blur();
                            }
                          }}
                        />
                      </div>

                      <div className="text-sm text-muted-foreground">
                        شماره ترتیب: {index + 1}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-col">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleEditImage(slide)}
                        className="gap-2"
                      >
                        <Edit2 className="h-4 w-4" />
                        ویرایش تصویر
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadImage(slide)}
                        disabled={!slide.imageData && !slide.imageUrl}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        دانلود
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {/* Image Editor Modal */}
      <AdminImageEditorModal
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSave={handleSaveImage}
        initialImage={
          editingSlideId
            ? slides.find((s) => s.id === editingSlideId)?.imageData ||
              slides.find((s) => s.id === editingSlideId)?.imageUrl
            : undefined
        }
        title="ویرایش تصویر اسلاید"
      />
    </div>
  );
}
