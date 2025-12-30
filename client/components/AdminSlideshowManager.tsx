import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Download, Save, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  },
];

export function AdminSlideshowManager() {
  const [activePages, setActivePages] = useState<PageSlideshow[]>([]);
  const [slides, setSlides] = useState<SlideImage[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageSlideshow | null>(null);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load active pages on mount
  useEffect(() => {
    loadActivePages();
  }, []);

  // Load slides when page is selected
  useEffect(() => {
    if (selectedPage) {
      loadSlides();
    }
  }, [selectedPage]);

  const loadActivePages = async () => {
    try {
      setLoading(true);
      const pagesWithSlides: PageSlideshow[] = [];

      for (const page of AVAILABLE_PAGES) {
        try {
          const response = await fetch(page.endpoint);
          if (response.ok) {
            const data = await response.json();
            if (data.slides && data.slides.length > 0) {
              pagesWithSlides.push(page);
            }
          }
        } catch (error) {
          console.error(`Error checking page ${page.pageName}:`, error);
        }
      }

      setActivePages(pagesWithSlides);
      if (pagesWithSlides.length > 0) {
        setSelectedPage(pagesWithSlides[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSlides = async () => {
    if (!selectedPage) return;

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

  const handleAddPageSlideshow = async (page: PageSlideshow) => {
    try {
      setIsSaving(true);
      const newSlides: SlideImage[] = [
        {
          id: Date.now().toString(),
          title: "اسلاید اول",
          order: 1,
        },
      ];

      const response = await fetch(page.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slides: newSlides }),
      });

      if (response.ok) {
        toast.success(`اسلاید‌شو برای ${page.displayName} اضافه شد`);
        await loadActivePages();
        setSelectedPage(page);
      } else {
        toast.error("خطا در اضافه کردن اسلاید‌شو");
      }
    } catch (error) {
      console.error("Error adding page slideshow:", error);
      toast.error("خطا در اضافه کردن اسلاید‌شو");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePageSlideshow = async (page: PageSlideshow) => {
    const confirmed = window.confirm(
      `آیا از حذف تمام اسلاید‌های ${page.displayName} اطمینان دارید؟`
    );
    if (!confirmed) return;

    try {
      setIsSaving(true);
      const response = await fetch(page.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slides: [] }),
      });

      if (response.ok) {
        toast.success(`اسلاید‌های ${page.displayName} حذف شدند`);
        if (selectedPage?.pageName === page.pageName) {
          setSelectedPage(null);
          setSlides([]);
        }
        await loadActivePages();
      } else {
        toast.error("خطا در حذف");
      }
    } catch (error) {
      console.error("Error removing page slideshow:", error);
      toast.error("خطا در حذف");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSlide = () => {
    const newSlide: SlideImage = {
      id: Date.now().toString(),
      title: "اسلاید جدید",
      order: slides.length + 1,
    };
    setSlides([...slides, newSlide]);
    setHasUnsavedChanges(true);
  };

  const handleEditImage = (slide: SlideImage) => {
    setEditingSlideId(slide.id);
    setEditingTitle(slide.title);
    setEditorOpen(true);
  };

  const handleSaveImage = async (imageData: string) => {
    if (!editingSlideId) return;

    try {
      setUploading(true);
      // Upload image to server
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageData }),
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }

      // Update slide with uploaded image URL
      setSlides(
        slides.map((slide) =>
          slide.id === editingSlideId
            ? {
                ...slide,
                imageUrl: data.imageUrl,
                imageData: undefined, // Remove base64 data
                title: editingTitle,
              }
            : slide
        )
      );

      setHasUnsavedChanges(true);
      toast.success("تصویر با موفقیت آپلود شد");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("خطا در آپلود تصویر");
    } finally {
      setUploading(false);
    }
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

    const imageUrl = slide.imageUrl || slide.imageData;
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
    if (!selectedPage || !hasUnsavedChanges) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">مدیریت اسلاید‌های صفحات</h2>
        <p className="text-muted-foreground mt-1">
          اسلاید‌های مختلف صفحات را ویرایش و مدیریت کنید
        </p>
      </div>

      {/* Active Pages and Add New Page */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">صفحات موجود</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Active Pages List */}
          {activePages.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">صفحات با اسلاید‌شو:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activePages.map((page) => (
                  <button
                    key={page.pageName}
                    onClick={() => setSelectedPage(page)}
                    className={`p-3 rounded-lg border-2 transition-all text-right ${
                      selectedPage?.pageName === page.pageName
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-semibold">{page.displayName}</div>
                    <div className="text-xs text-muted-foreground">
                      در حال استفاده ✓
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add New Page Section */}
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3">صفحات دیگر:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AVAILABLE_PAGES.map((page) => {
                const isActive = activePages.some((p) => p.pageName === page.pageName);
                if (isActive) return null;

                return (
                  <button
                    key={page.pageName}
                    onClick={() => handleAddPageSlideshow(page)}
                    disabled={isSaving}
                    className="p-3 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-all text-right hover:bg-primary/5"
                  >
                    <div className="font-semibold flex items-center gap-2 justify-end">
                      <Plus className="h-4 w-4" />
                      {page.displayName}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      برای اضافه کردن کلیک کنید
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Page Editor */}
      {selectedPage && (
        <>
          {/* Page Info */}
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    ویرایش: {selectedPage.displayName}
                  </CardTitle>
                  <CardDescription>
                    ابعاد: {selectedPage.dimensions.desktop}
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 ml-2" />
                      حذف اسلاید‌شو
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>حذف اسلاید‌شو</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        آیا از حذف تمام اسلاید‌های {selectedPage.displayName} اطمینان دارید؟
                      </p>
                      <div className="flex gap-2 justify-end">
                        <DialogTrigger asChild>
                          <Button variant="outline">انصراف</Button>
                        </DialogTrigger>
                        <Button
                          onClick={() => handleRemovePageSlideshow(selectedPage)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                          disabled={isSaving}
                        >
                          حذف
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
          </Card>

          {/* Slides Editor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>اسلاید‌ها ({slides.length})</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddSlide}
                    className="gap-2"
                    disabled={loading || isSaving || uploading}
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
                    disabled={
                      loading || isSaving || uploading || !hasUnsavedChanges
                    }
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? "درحال ذخیره..." : "ذخیره تغییرات"}
                  </Button>
                </div>
              </div>
              {hasUnsavedChanges && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                  ⚠️ تغییرات ذخیره نشده دارید. لطفا تغییرات را ذخیره کنید.
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center text-muted-foreground">درحال بارگذاری...</p>
                ) : slides.length === 0 ? (
                  <p className="text-center text-muted-foreground">اسلایدی وجود ندارد</p>
                ) : (
                  slides
                    .sort((a, b) => a.order - b.order)
                    .map((slide, index) => (
                      <Card key={slide.id} className="overflow-hidden">
                        <CardContent className="pt-6">
                          <div className="flex gap-4">
                            {/* Image Preview */}
                            <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                              {slide.imageUrl || slide.imageData ? (
                                <img
                                  src={slide.imageUrl || slide.imageData}
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
                                  onChange={(e) =>
                                    handleTitleChange(slide.id, e.target.value)
                                  }
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
                                disabled={uploading}
                              >
                                <Edit2 className="h-4 w-4" />
                                ویرایش
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadImage(slide)}
                                disabled={
                                  !slide.imageData && !slide.imageUrl
                                }
                                className="gap-2"
                              >
                                <Download className="h-4 w-4" />
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
            </CardContent>
          </Card>
        </>
      )}

      {/* Image Editor Modal */}
      <AdminImageEditorModal
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSave={handleSaveImage}
        initialImage={
          editingSlideId
            ? slides.find((s) => s.id === editingSlideId)?.imageUrl ||
              slides.find((s) => s.id === editingSlideId)?.imageData
            : undefined
        }
        title={`ویرایش تصویر - ${selectedPage?.displayName || ""}`}
      />
    </div>
  );
}
