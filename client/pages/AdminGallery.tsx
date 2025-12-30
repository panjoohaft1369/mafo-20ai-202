import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Download,
  X,
} from "lucide-react";
import { getAdminToken } from "@/lib/admin-auth";

interface GeneratedImage {
  id: string;
  userId: string;
  taskId?: string;
  imageUrl?: string;
  prompt?: string;
  status: string;
  aspectRatio?: string;
  resolution?: string;
  creditCost?: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    brandName?: string;
  };
}

interface GalleryResponse {
  success: boolean;
  images: GeneratedImage[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function AdminGallery() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(
    null,
  );
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "images" | "videos">("all");

  // Function to detect if URL is a video
  const isVideoUrl = (url?: string): boolean => {
    if (!url) return false;
    const videoExtensions = [".mp4", ".webm", ".mov", ".avi", ".mkv"];
    const urlLower = url.toLowerCase();
    return (
      videoExtensions.some((ext) => urlLower.includes(ext)) ||
      urlLower.includes("video") ||
      urlLower.includes("generated_video")
    );
  };

  // Filter images based on selected filter
  const filteredImages = images.filter((entry) => {
    if (filter === "videos") {
      return entry.imageUrl && isVideoUrl(entry.imageUrl);
    } else if (filter === "images") {
      return entry.imageUrl && !isVideoUrl(entry.imageUrl);
    }
    return true; // "all"
  });

  // Set default page size based on screen size
  const getDefaultPageSize = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768 ? 20 : 10; // md breakpoint = 768px
    }
    return 20;
  };

  const [pageSize, setPageSize] = useState(getDefaultPageSize());
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  // Update page size on window resize
  useEffect(() => {
    const handleResize = () => {
      const newPageSize = getDefaultPageSize();
      setPageSize(newPageSize);
      setPage(1);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch images on mount or when search/page/pageSize changes
  useEffect(() => {
    fetchImages();
  }, [page, pageSize, searchUser]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getAdminToken();
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        searchUser,
      });

      const response = await fetch(`/api/admin/gallery?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("خطا در دریافت تصاویر");
      }

      const data: GalleryResponse = await response.json();
      setImages(data.images);
      setTotalPages(data.totalPages);
      setTotal(data.total);

      // Reset to first page if search changes
      if (searchUser && page > 1 && page > data.totalPages) {
        setPage(1);
      }
    } catch (err: any) {
      setError(err.message || "خطا در دریافت تصاویر");
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchUser(value);
    setPage(1); // Reset to first page
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value));
    setPage(1); // Reset to first page
  };

  const handleDownloadImage = async (image: GeneratedImage) => {
    if (!image.imageUrl) return;

    try {
      setDownloadingId(image.id);

      // Use backend endpoint to bypass CORS issues
      const downloadUrl = `/api/download-image?url=${encodeURIComponent(image.imageUrl)}`;

      const response = await fetch(downloadUrl);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || `خطا در دانلود فایل (HTTP ${response.status})`;
        console.error("[Download] Server error:", errorMessage);
        return;
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        console.error("Downloaded file is empty");
        return;
      }

      // Try to get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "mafo-file";
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
    } catch (err: any) {
      console.error("[Download] Error:", err.message);
    } finally {
      setDownloadingId(null);
    }
  };

  const goToFirstPage = () => setPage(1);
  const goToLastPage = () => setPage(totalPages);
  const goToPreviousPage = () => setPage(Math.max(1, page - 1));
  const goToNextPage = () => setPage(Math.min(totalPages, page + 1));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">گالری تصاویر</h1>
        <p className="text-sm text-muted-foreground">مجموع {total} تصویر</p>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            {/* Search by User */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو بر اساس نام یا ایمیل کاربر..."
                value={searchUser}
                onChange={(e) => handleSearch(e.target.value)}
                className="pr-9 text-right"
              />
            </div>

            {/* Page Size Selector */}
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="md:w-32 text-right">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 آیتم</SelectItem>
                <SelectItem value="20">20 آیتم</SelectItem>
                <SelectItem value="50">50 آیتم</SelectItem>
                <SelectItem value="100">100 آیتم</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 justify-center flex-wrap pt-2 border-t">
            <Button
              onClick={() => {
                setFilter("all");
                setPage(1);
              }}
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              className="gap-1"
            >
              همه ({images.length})
            </Button>
            <Button
              onClick={() => {
                setFilter("images");
                setPage(1);
              }}
              variant={filter === "images" ? "default" : "outline"}
              size="sm"
              className="gap-1"
            >
              تصاویر (
              {images.filter((h) => h.imageUrl && !isVideoUrl(h.imageUrl)).length}
              )
            </Button>
            <Button
              onClick={() => {
                setFilter("videos");
                setPage(1);
              }}
              variant={filter === "videos" ? "default" : "outline"}
              size="sm"
              className="gap-1"
            >
              ویدیوها (
              {images.filter((h) => h.imageUrl && isVideoUrl(h.imageUrl)).length}
              )
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <CardContent className="pt-6 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Gallery Grid */}
      {!loading && filteredImages.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredImages.map((image) => (
              <Card
                key={image.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                {/* Image Preview */}
                <div className="aspect-square bg-muted overflow-hidden group">
                  {image.imageUrl ? (
                    <img
                      src={image.imageUrl}
                      alt={image.prompt || "Generated image"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/50">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Image Details */}
                <CardContent className="p-3 space-y-2 text-right">
                  {/* User Info */}
                  <div className="text-xs border-b pb-2">
                    <p className="font-semibold text-foreground truncate">
                      {image.user.name}
                    </p>
                    <p className="text-muted-foreground text-xs truncate">
                      {image.user.email}
                    </p>
                  </div>

                  {/* Prompt */}
                  {image.prompt && (
                    <div className="text-xs">
                      <p className="text-muted-foreground line-clamp-2">
                        {image.prompt}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    {image.resolution && <p>کیفیت: {image.resolution}</p>}
                    {image.aspectRatio && (
                      <p>نسبت ابعاد: {image.aspectRatio}</p>
                    )}
                    {image.creditCost && (
                      <p>هزینه اعتبار: {image.creditCost}</p>
                    )}
                    <p className="text-xs">
                      {new Date(image.createdAt).toLocaleDateString("fa-IR")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card>
              <CardContent className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  صفحه {page} از {totalPages} | مجموع {total}{" "}
                  {filter === "images"
                    ? "تصویر"
                    : filter === "videos"
                      ? "ویدیو"
                      : "آیتم"}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToFirstPage}
                    disabled={page === 1 || loading}
                    className="hidden md:inline-flex"
                  >
                    اول
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={page === 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    قبلی
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }).map(
                      (_, i) => {
                        let pageNum = i + 1;
                        if (totalPages > 5 && page > 3) {
                          pageNum = page - 2 + i;
                        }
                        if (pageNum > totalPages) return null;

                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            disabled={loading}
                            className="w-10"
                          >
                            {pageNum}
                          </Button>
                        );
                      },
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={page === totalPages || loading}
                  >
                    بعدی
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToLastPage}
                    disabled={page === totalPages || loading}
                    className="hidden md:inline-flex"
                  >
                    آخر
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && filteredImages.length === 0 && !error && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center py-12">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              {filter === "videos"
                ? "ویدیویی موجود نیست"
                : filter === "images"
                  ? "تصویری موجود نیست"
                  : searchUser
                    ? "تصویری با این جستجو یافت نشد"
                    : "هنوز تصویری ایجاد نشده است"}
            </p>
            {images.length > 0 && filteredImages.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                (اما {images.length} مورد دیگر در دسته‌های دیگر وجود دارد)
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 pb-[80px]"
          onClick={() => setSelectedImage(null)}
        >
          <Card
            className="w-full max-w-2xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b bg-card sticky top-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedImage(null)}
                className="hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold flex-1 text-center">
                جزئیات تصویر
              </h2>
              <div className="w-10" /> {/* Placeholder for balance */}
            </div>

            {/* Modal Content */}
            <CardContent className="pt-6 space-y-6 pb-6">
              {/* Image Display */}
              {selectedImage.imageUrl ? (
                <div className="flex flex-col gap-4">
                  <img
                    src={selectedImage.imageUrl}
                    alt={selectedImage.prompt || "Generated image"}
                    className="w-full max-h-96 object-contain rounded-lg bg-muted"
                  />
                  <Button
                    onClick={() => handleDownloadImage(selectedImage)}
                    disabled={downloadingId === selectedImage.id}
                    className="w-full gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {downloadingId === selectedImage.id
                      ? "در حال دانلود..."
                      : "دانلود تصویر"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 bg-muted rounded-lg">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              {/* Image Details */}
              <div className="space-y-4 text-right">
                {/* User Info */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">اطلاعات کاربر</h3>
                  <p className="text-sm">نام: {selectedImage.user.name}</p>
                  <p className="text-sm">ایمیل: {selectedImage.user.email}</p>
                  {selectedImage.user.phone && (
                    <p className="text-sm">موبایل: {selectedImage.user.phone}</p>
                  )}
                </div>

                {/* Prompt */}
                {selectedImage.prompt && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">متن درخواست</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedImage.prompt}
                    </p>
                  </div>
                )}

                {/* Technical Details */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">مشخصات فنی</h3>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    {selectedImage.resolution && (
                      <p>کیفیت: {selectedImage.resolution}</p>
                    )}
                    {selectedImage.aspectRatio && (
                      <p>نسبت ابعاد: {selectedImage.aspectRatio}</p>
                    )}
                    {selectedImage.creditCost && (
                      <p>هزینه اعتبار: {selectedImage.creditCost}</p>
                    )}
                    <p>
                      تاریخ ایجاد:{" "}
                      {new Date(selectedImage.createdAt).toLocaleDateString(
                        "fa-IR",
                      )}{" "}
                      {new Date(selectedImage.createdAt).toLocaleTimeString(
                        "fa-IR",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
