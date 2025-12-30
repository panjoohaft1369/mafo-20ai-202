import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthState, clearAuth } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2, Edit2, Save, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { AdminSlideshowEditor } from "@/components/AdminSlideshowEditor";
import { AdminSlidesImageEditor } from "@/components/AdminSlidesImageEditor";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  order: number;
}

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  bgColor: string;
  imageUrl?: string;
  order: number;
}

export default function Admin() {
  const navigate = useNavigate();
  const auth = getAuthState();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [indexSlides, setIndexSlides] = useState<Slide[]>([]);
  const [aboutSlides, setAboutSlides] = useState<Slide[]>([]);
  const [activeTab, setActiveTab] = useState<
    "menu" | "slides" | "image-editor" | "index-slides" | "about-slides"
  >("menu");
  const [loading, setLoading] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (!auth.isLoggedIn || auth.role !== "admin") {
      navigate("/");
    } else {
      loadData();
    }
  }, [auth, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load menu items
      const menuRes = await fetch("/api/admin/menu");
      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setMenuItems(menuData.items || []);
      }

      // Load slides (legacy)
      const slidesRes = await fetch("/api/admin/slides");
      if (slidesRes.ok) {
        const slidesData = await slidesRes.json();
        setSlides(slidesData.slides || []);
      }

      // Load index slides
      const indexSlidesRes = await fetch("/api/admin/index-slides");
      if (indexSlidesRes.ok) {
        const indexSlidesData = await indexSlidesRes.json();
        setIndexSlides(indexSlidesData.slides || []);
      }

      // Load about slides
      const aboutSlidesRes = await fetch("/api/admin/about-slides");
      if (aboutSlidesRes.ok) {
        const aboutSlidesData = await aboutSlidesRes.json();
        setAboutSlides(aboutSlidesData.slides || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("خطا در بارگذاری داده‌ها");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  const saveMenuItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: menuItems }),
      });

      if (res.ok) {
        toast.success("منو‌ها ذخیره شدند");
      } else {
        toast.error("خطا در ذخیره");
      }
    } catch (error) {
      toast.error("خطا در ارسال");
    } finally {
      setLoading(false);
    }
  };

  const saveSlides = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides }),
      });

      if (res.ok) {
        toast.success("اسلاید‌ها ذخیره شدند");
      } else {
        toast.error("خطا در ذخیره");
      }
    } catch (error) {
      toast.error("خطا در ارسال");
    } finally {
      setLoading(false);
    }
  };

  const addMenuItem = () => {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      label: "آیتم جدید",
      href: "/new",
      order: (menuItems.length || 0) + 1,
    };
    setMenuItems([...menuItems, newItem]);
  };

  const updateMenuItem = (id: string, updated: Partial<MenuItem>) => {
    setMenuItems(
      menuItems.map((item) =>
        item.id === id ? { ...item, ...updated } : item,
      ),
    );
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(menuItems.filter((item) => item.id !== id));
  };

  const addSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: "تیتر جدید",
      subtitle: "توضیح جدید",
      bgColor: "from-blue-600 to-blue-400",
      imageUrl: "",
      order: (slides.length || 0) + 1,
    };
    setSlides([...slides, newSlide]);
  };

  const updateSlide = (id: string, updated: Partial<Slide>) => {
    setSlides(
      slides.map((slide) =>
        slide.id === id ? { ...slide, ...updated } : slide,
      ),
    );
  };

  const deleteSlide = (id: string) => {
    setSlides(slides.filter((slide) => slide.id !== id));
  };

  if (!auth.isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={auth.isLoggedIn} onLogout={handleLogout} />

      <main className="flex-1 pt-20 md:pt-28 px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          {/* Admin Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">پنل ادمین</h1>
            <p className="text-muted-foreground">
              مدیریت منو‌های سایت و اسلاید‌های نمایش
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b">
            <button
              onClick={() => setActiveTab("menu")}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === "menu"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              مدیریت منو
            </button>
            <button
              onClick={() => setActiveTab("slides")}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === "slides"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              مدیریت اسلاید‌ها
            </button>
          </div>

          {/* Menu Manager */}
          {activeTab === "menu" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">منو‌های نوار بالا</h2>
                <Button
                  onClick={addMenuItem}
                  className="gap-2"
                  disabled={loading}
                >
                  <Plus className="h-4 w-4" />
                  افزودن منو
                </Button>
              </div>

              <div className="space-y-4">
                {menuItems.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-muted-foreground">
                        منویی وجود ندارد
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  menuItems
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <Card key={item.id}>
                        <CardContent className="pt-6">
                          {editingMenu?.id === item.id ? (
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium mb-1 block">
                                  عنوان
                                </label>
                                <Input
                                  value={editingMenu.label}
                                  onChange={(e) =>
                                    setEditingMenu({
                                      ...editingMenu,
                                      label: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-1 block">
                                  آدرس
                                </label>
                                <Input
                                  value={editingMenu.href}
                                  onChange={(e) =>
                                    setEditingMenu({
                                      ...editingMenu,
                                      href: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingMenu(null)}
                                >
                                  لغو
                                </Button>
                                <Button
                                  onClick={() => {
                                    updateMenuItem(item.id, editingMenu);
                                    setEditingMenu(null);
                                  }}
                                  className="gap-2"
                                >
                                  <Save className="h-4 w-4" />
                                  ذخیره
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold">{item.label}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.href}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingMenu(item)}
                                  className="gap-2"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteMenuItem(item.id)}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>

              <Button
                onClick={saveMenuItems}
                size="lg"
                disabled={loading}
                className="w-full"
              >
                {loading ? "درحال ذخیره..." : "ذخیره تمام تغییرات"}
              </Button>
            </div>
          )}

          {/* Slides Manager */}
          {activeTab === "slides" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">اسلاید‌های نمایش</h2>
                <Button onClick={addSlide} className="gap-2" disabled={loading}>
                  <Plus className="h-4 w-4" />
                  افزودن اسلاید
                </Button>
              </div>

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
                    .map((slide) => (
                      <Card key={slide.id} className="overflow-hidden">
                        <CardContent className="pt-6">
                          {editingSlide?.id === slide.id ? (
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium mb-1 block">
                                  تیتر
                                </label>
                                <Input
                                  value={editingSlide.title}
                                  onChange={(e) =>
                                    setEditingSlide({
                                      ...editingSlide,
                                      title: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-1 block">
                                  زیرتیتر
                                </label>
                                <Input
                                  value={editingSlide.subtitle}
                                  onChange={(e) =>
                                    setEditingSlide({
                                      ...editingSlide,
                                      subtitle: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-1 block">
                                  رنگ پس‌زمینه
                                </label>
                                <Input
                                  value={editingSlide.bgColor}
                                  placeholder="from-blue-600 to-blue-400"
                                  onChange={(e) =>
                                    setEditingSlide({
                                      ...editingSlide,
                                      bgColor: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-1 block">
                                  آدرس تصویر (اختیاری)
                                </label>
                                <Input
                                  value={editingSlide.imageUrl || ""}
                                  onChange={(e) =>
                                    setEditingSlide({
                                      ...editingSlide,
                                      imageUrl: e.target.value,
                                    })
                                  }
                                  placeholder="https://example.com/image.jpg"
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingSlide(null)}
                                >
                                  لغو
                                </Button>
                                <Button
                                  onClick={() => {
                                    updateSlide(slide.id, editingSlide);
                                    setEditingSlide(null);
                                  }}
                                  className="gap-2"
                                >
                                  <Save className="h-4 w-4" />
                                  ذخیره
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <p className="font-semibold text-lg">
                                  {slide.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {slide.subtitle}
                                </p>
                                <div className="mt-2">
                                  <div
                                    className={`bg-gradient-to-r ${slide.bgColor} h-20 rounded text-white text-center flex items-center justify-center`}
                                  >
                                    پیش‌نمایش رنگ
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingSlide(slide)}
                                  className="gap-2"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteSlide(slide.id)}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>

              <Button
                onClick={saveSlides}
                size="lg"
                disabled={loading}
                className="w-full"
              >
                {loading ? "درحال ذخیره..." : "ذخیره تمام تغییرات"}
              </Button>
            </div>
          )}

          {/* Admin Warning */}
          <div className="mt-12 p-4 rounded-lg bg-amber-50 border border-amber-200 flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">نکات مهم:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>تغییرات منو بلافاصله در نوار بالای سایت اعمال می‌شود</li>
                <li>برای رنگ‌های پس‌زمینه، از فرمت Tailwind استفاده کنید</li>
                <li>اسلاید‌ها در صفحه درباره ما نمایش داده می‌شوند</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
