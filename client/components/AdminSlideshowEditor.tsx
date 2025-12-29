import { useState } from "react";
import { Plus, Trash2, Edit2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  bgColor: string;
  imageUrl: string;
  order: number;
}

interface AdminSlideshowEditorProps {
  slides: Slide[];
  onSave: (slides: Slide[]) => Promise<void>;
  isLoading?: boolean;
}

export function AdminSlideshowEditor({
  slides,
  onSave,
  isLoading = false,
}: AdminSlideshowEditorProps) {
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [localSlides, setLocalSlides] = useState<Slide[]>(slides);
  const [saving, setSaving] = useState(false);

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: "اسلاید جدید",
      subtitle: "",
      bgColor: "from-blue-600 to-blue-400",
      imageUrl: "",
      order: Math.max(...localSlides.map((s) => s.order), 0) + 1,
    };
    setLocalSlides([...localSlides, newSlide]);
  };

  const handleDeleteSlide = (id: string) => {
    if (!confirm("آیا از حذف این اسلاید مطمئن هستید؟")) return;
    setLocalSlides(localSlides.filter((s) => s.id !== id));
  };

  const handleUpdateSlide = (id: string, updates: Partial<Slide>) => {
    setLocalSlides(
      localSlides.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    );
    if (editingSlide?.id === id) {
      setEditingSlide({ ...editingSlide, ...updates });
    }
  };

  const handleImageUpload = (
    slideId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        handleUpdateSlide(slideId, { imageUrl: dataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(localSlides);
      toast.success("اسلاید‌شو با موفقیت ذخیره شد");
      setEditingSlide(null);
    } catch (err: any) {
      toast.error(err.message || "خطا در ذخیره اسلاید‌شو");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Slide Button */}
      <Button
        onClick={handleAddSlide}
        disabled={saving}
        className="gap-2 bg-green-600 hover:bg-green-700"
      >
        <Plus className="h-4 w-4" />
        افزودن اسلاید جدید
      </Button>

      {/* Slides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {localSlides.map((slide) => (
          <Card key={slide.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <Input
                value={slide.title}
                onChange={(e) =>
                  handleUpdateSlide(slide.id, { title: e.target.value })
                }
                placeholder="عنوان اسلاید"
                className="font-semibold"
                disabled={saving}
              />
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Image Preview */}
              {slide.imageUrl && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Image Upload */}
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(slide.id, e)}
                  className="hidden"
                  disabled={saving}
                />
                <span className="inline-flex items-center gap-2 w-full justify-center px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg cursor-pointer text-sm font-medium transition-colors">
                  <Upload className="h-4 w-4" />
                  آپلود تصویر
                </span>
              </label>

              {/* Subtitle */}
              <Textarea
                value={slide.subtitle}
                onChange={(e) =>
                  handleUpdateSlide(slide.id, { subtitle: e.target.value })
                }
                placeholder="توضیح اسلاید"
                className="text-sm resize-none min-h-16"
                disabled={saving}
              />

              {/* Background Color */}
              <div className="space-y-1">
                <label className="text-xs font-medium">رنگ پس‌زمینه</label>
                <select
                  value={slide.bgColor}
                  onChange={(e) =>
                    handleUpdateSlide(slide.id, { bgColor: e.target.value })
                  }
                  className="w-full px-2 py-1 border border-border rounded text-sm bg-background disabled:opacity-50"
                  disabled={saving}
                >
                  <option value="from-blue-600 to-blue-400">آبی</option>
                  <option value="from-purple-600 to-purple-400">بنفش</option>
                  <option value="from-indigo-600 to-indigo-400">
                    آبی تیره
                  </option>
                  <option value="from-green-600 to-green-400">سبز</option>
                  <option value="from-red-600 to-red-400">قرمز</option>
                  <option value="from-pink-600 to-pink-400">صورتی</option>
                  <option value="from-orange-600 to-orange-400">نارنجی</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => setEditingSlide(slide)}
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1"
                  disabled={saving}
                >
                  <Edit2 className="h-3 w-3" />
                  جزئیات
                </Button>
                <Button
                  onClick={() => handleDeleteSlide(slide.id)}
                  variant="destructive"
                  size="sm"
                  className="flex-1 gap-1"
                  disabled={saving}
                >
                  <Trash2 className="h-3 w-3" />
                  حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        size="lg"
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {saving ? "درحال ذخیره..." : "ذخیره تمام اسلاید‌ها"}
      </Button>
    </div>
  );
}
