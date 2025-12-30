import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Download, Save } from "lucide-react";
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
  imageData?: string;
  order: number;
}

interface PageSlideshow {
  pageName: string;
  endpoint: string;
  displayName: string;
  dimensions: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  enabled: boolean;
}

const AVAILABLE_PAGES: PageSlideshow[] = [
  {
    pageName: "index",
    endpoint: "/api/admin/index-slides",
    displayName: "صفحه خانه",
    dimensions: {
      mobile: "100% × 256px",
      tablet: "100% × 320px",
      desktop: "100% × 1024px (نسبت 1980:1024)",
    },
    enabled: true,
  },
  {
    pageName: "about",
    endpoint: "/api/admin/about-slides",
    displayName: "صفحه درباره ما",
    dimensions: {
      mobile: "100% × 256px",
      tablet: "100% × 320px",
      desktop: "100% × 1024px (نسبت 1980:1024)",
    },
    enabled: true,
  },
];

export function AdminSlideshowManager() {
  const [slides, setSlides] = useState<SlideImage[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageSlideshow>(
    AVAILABLE_PAGES[0]
  );
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load slides for selected page
  useEffect(() => {
    loadSlides();
  }, [selectedPage]);

  const loadSlides = async () => {
    try {
      setLoading(true);
      const response = await fetch(selectedPage.endpoint);
      if (response.ok) {
        const data = await response.json();
        setSlides(data.slides || []);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error("Error loading slides:", error);
      toast.error("خطا در بارگذاری اسلاید‌ها");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page: PageSlideshow) => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm(
        "تغییرات ذخیره نشده دارید. آیا می‌خواهید صفحه دیگری را بروید؟"
      );
      if (!confirm) return;
    }
    setSelectedPage(page);
    setEditingSlideId(null);
  };

  const handleAddSlide = () => {
    const newSlide: SlideImage = {
      id: Date.now().toString(),
      title: "اسلاید جدید",
      order: slides.length + 1,
    };
    setSlides([...slides, newSlide]);
    setHasUnsavedChanges(true);
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

    setHasUnsavedChanges(true);
    toast.success("تصویر اسلاید به روز شد");
  };

  const handleDeleteSlide = (id: string) => {
    if (
      confirm(
        "آیا از حذف این اسلاید اطمینان دارید؟\n(این عمل برگشت‌پذیر نیست تا زمانی که تغییرات را ذخیره نکنید)"
      )
    ) {
      const updatedSlides = slides
        .filter((slide) => slide.id !== id)
        .map((slide, index) => ({
          ...slide,
          order: index + 1,
        }));
      setSlides(updatedSlides);
      setHasUnsavedChanges(true);
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

  const handleTitleChange = (id: string, newTitle: string) => {
    setSlides(
      slides.map((slide) =>
        slide.id === id ? { ...slide, title: newTitle } : slide
      )
    );
    setHasUnsavedChanges(true);
  };

  const saveToServer = async () => {
    if (!hasUnsavedChanges) {
      toast.info("تغییری برای ذخیره‌سازی وجود ندارد");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(selectedPage.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slides }),
      });

      if (response.ok) {
        toast.success(`اسلاید‌های ${selectedPage.displayName} ذخیره شدند`);
        setHasUnsavedChanges(false);
      } else {
        toast.error("خطا در ذخیره‌سازی");
      }
    } catch (error) {
      console.error("Error saving slides:", error);
      toast.error("خطا در ذخیره‌سازی");
    } finally {
      setIsSaving(false);
    }
  };

  const deletePageSlideshow = async () => {
    const confirm = window.confirm(
      `آیا از حذف تمام اسلاید‌های ${selectedPage.displayName} اطمینان دارید؟`
    );
    if (!confirm) return;

    try {
      setIsSaving(true);
      const response = await fetch(selectedPage.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slides: [] }),
      });

      if (response.ok) {
        toast.success(`اسلاید‌های ${selectedPage.displayName} حذف شدند`);
        setSlides([]);
        setHasUnsavedChanges(false);
      } else {
        toast.error("خطا در حذف");
      }
    } catch (error) {
      console.error("Error deleting slides:", error);
      toast.error("خطا در حذف");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">مدیریت اسلاید‌های صفحات</h2>
        <p className="text-muted-foreground mt-1">
          اسلاید‌های مختلف صفحات را ویرایش و مدیریت کنید
        </p>
      </div>

      {/* Page Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">انتخاب صفحه</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_PAGES.map((page) => (
              <button
                key={page.pageName}
                onClick={() => handlePageChange(page)}
                className={`p-4 rounded-lg border-2 transition-all text-right ${
                  selectedPage.pageName === page.pageName
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-semibold mb-2">{page.displayName}</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>📱 موبایل: {page.dimensions.mobile}</p>
                  <p>📊 تبلت: {page.dimensions.tablet}</p>
                  <p>🖥️ دسکتاپ: {page.dimensions.desktop}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Page Info */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">
            ویرایش: {selectedPage.displayName}
          </CardTitle>
          <CardDescription>
            ابعاد: {selectedPage.dimensions.desktop}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              onClick={handleAddSlide}
              className="gap-2"
              disabled={loading || isSaving}
            >
              <Plus className="h-4 w-4" />
              اضافه کردن اسلاید جدید
            </Button>
            <Button
              onClick={saveToServer}
              className={`gap-2 ${
                hasUnsavedChanges
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-600"
              }`}
              disabled={loading || isSaving || !hasUnsavedChanges}
            >
              <Save className="h-4 w-4" />
              {isSaving ? "درحال ذخیره..." : "ذخیره تغییرات"}
            </Button>
            {slides.length > 0 && (
              <Button
                onClick={deletePageSlideshow}
                variant="outline"
                className="gap-2 text-red-600 hover:bg-red-50"
                disabled={loading || isSaving}
              >
                <Trash2 className="h-4 w-4" />
                حذف تمام اسلاید‌ها
              </Button>
            )}
          </div>
          {hasUnsavedChanges && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
              ⚠️ تغییرات ذخیره نشده دارید. لطفا تغییرات را ذخیره کنید.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slides List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">درحال بارگذاری...</p>
            </CardContent>
          </Card>
        ) : slides.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                اسلایدی برای این صفحه وجود ندارد
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
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
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
                          value={slide.title}
                          onChange={(e) => handleTitleChange(slide.id, e.target.value)}
                          placeholder="عنوان اسلاید را وارد کنید"
                        />
                      </div>

                      <div className="text-sm text-muted-foreground">
                        ترتیب: {index + 1} از {slides.length}
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
        title={`ویرایش تصویر - ${selectedPage.displayName}`}
      />
    </div>
  );
}
