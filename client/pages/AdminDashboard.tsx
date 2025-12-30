import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  AlertCircle,
  Search,
  ChevronRight,
  Users,
  Loader2,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import {
  getAdminToken,
  clearAdminToken,
  verifyAdminToken,
  isUserAdmin,
  getAdminUserRole,
} from "@/lib/admin-auth";
import { getAuthState, clearAuth } from "@/lib/auth";
import { AdminBottomNav } from "@/components/AdminBottomNav";
import { AdminGallery } from "@/pages/AdminGallery";
import { AdminSlideshowManager } from "@/components/AdminSlideshowManager";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  brandName: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  apiKeys: string[];
  credits: number;
  role?: "user" | "admin";
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [activeTab, setActiveTab] = useState<"users" | "edit" | "gallery">(
    "users",
  );
  const [editSubTab, setEditSubTab] = useState<"slideshow" | "links">(
    "slideshow",
  );
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterZeroCredit, setFilterZeroCredit] = useState(false);

  useEffect(() => {
    // Check admin authentication and role
    const checkAuth = async () => {
      // Check if user is logged in with regular auth and has admin role
      const regularAuth = getAuthState();
      console.log("[AdminDashboard] Regular auth state:", {
        isLoggedIn: regularAuth.isLoggedIn,
        role: regularAuth.role,
        email: regularAuth.email,
      });

      if (regularAuth.isLoggedIn && regularAuth.role === "admin") {
        // User is logged in via regular auth and has admin role
        console.log("[AdminDashboard] User authorized via regular auth");
        return;
      }

      // Otherwise, check for hardcoded admin token
      console.log("[AdminDashboard] Checking hardcoded admin token");
      const isValid = await verifyAdminToken();
      if (!isValid) {
        console.warn(
          "[AdminDashboard] No valid admin token, redirecting to login",
        );
        navigate("/admin-login");
        return;
      }

      // If we have a valid admin token, allow access
      console.log("[AdminDashboard] User authorized via hardcoded admin token");
      return;
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    // Fetch users from API
    const loadUsers = async () => {
      try {
        setLoading(true);
        const token = getAdminToken();

        const response = await fetch("/api/admin/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          clearAdminToken();
          navigate("/admin-login");
          return;
        }

        if (!response.ok) {
          setError("خطا در بارگذاری کاربران. لطفا دوباره سعی کنید.");
          setLoading(false);
          return;
        }

        const data = await response.json();
        setUsers(data.users || []);
      } catch (err) {
        setError("خطا در بارگذاری کاربران. لطفا دوباره سعی کنید.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [navigate]);

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.name.includes(searchTerm) ||
        user.email.includes(searchTerm) ||
        user.phone.includes(searchTerm) ||
        user.brandName.includes(searchTerm);

      const matchesFilter =
        filterStatus === "all" || user.status === filterStatus;

      const matchesCreditFilter = filterZeroCredit
        ? user.credits === 0
        : true;

      return matchesSearch && matchesFilter && matchesCreditFilter;
    })
    .sort((a, b) => {
      // Sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <div className="w-2 h-2 rounded-full bg-yellow-600" />
            منتظر تایید
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <div className="w-2 h-2 rounded-full bg-green-600" />
            تایید شده
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <div className="w-2 h-2 rounded-full bg-red-600" />
            رد شده
          </span>
        );
      default:
        return null;
    }
  };

  const getRoleBadge = (role?: string) => {
    if (!role || role === "user") return null;

    if (role === "admin") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <div className="w-2 h-2 rounded-full bg-purple-600" />
          مدیر
        </span>
      );
    }
    return null;
  };

  const handleLogout = () => {
    const regularAuth = getAuthState();
    if (regularAuth.isLoggedIn && regularAuth.role === "admin") {
      // User logged in via regular auth
      clearAuth();
      navigate("/login");
    } else {
      // User logged in via hardcoded admin login
      clearAdminToken();
      navigate("/admin-login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">درحال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-background to-muted pt-20 pb-0">
      {/* Users Tab Content */}
      {activeTab === "users" && (
        <div className="max-w-7xl mx-auto space-y-6 pb-[150px]">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>
                پنل مدیریت کاربران
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                مدیریت حسابهای کاربری و اختصاص کلیدهای API
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => navigate("/admin/users/add")}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                + افزودن کاربر
              </Button>
              <Button
                onClick={() => navigate("/")}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                بازگشت
              </Button>
              <Button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <LogOut className="h-4 w-4" />
                خروج
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {users.length}
                  </div>
                  <p className="text-sm text-muted-foreground">کل کاربران</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {users.filter((u) => u.status === "pending").length}
                  </div>
                  <p className="text-sm text-muted-foreground">منتظر تایید</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {users.filter((u) => u.status === "approved").length}
                  </div>
                  <p className="text-sm text-muted-foreground">تایید شده</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {users.filter((u) => u.credits === 0).length}
                  </div>
                  <p className="text-sm text-muted-foreground">اعتبار صفر</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter and Search */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">جستجو و فیلتر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="جستجو بر اساس نام، ایمیل، شماره تماس یا نام برند..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-3 pr-9 text-right"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === "all"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  همه
                </button>
                <button
                  onClick={() => setFilterStatus("pending")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === "pending"
                      ? "bg-yellow-600 text-white"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  منتظر تایید
                </button>
                <button
                  onClick={() => setFilterStatus("approved")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === "approved"
                      ? "bg-green-600 text-white"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  تایید شده
                </button>
                <button
                  onClick={() => setFilterStatus("rejected")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === "rejected"
                      ? "bg-red-600 text-white"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  رد شده
                </button>

                {/* Zero Credit Filter */}
                <button
                  onClick={() => {
                    setFilterZeroCredit(!filterZeroCredit);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ml-2 ${
                    filterZeroCredit
                      ? "bg-red-600 text-white"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {filterZeroCredit ? "❌ فقط اعتبار صفر" : "⭕ اعتبار صفر"}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium">خطا</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Users List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>
                    کاربران ({filteredUsers.length})
                    {filterZeroCredit && " - فقط اعتبار صفر"}
                  </CardTitle>
                  <CardDescription>
                    کلیک بر روی یک کاربر برای مدیریت کلیدهای API و اعتبارات
                  </CardDescription>
                </div>
                {/* Items Per Page Dropdown */}
                <select
                  value={usersPerPage}
                  onChange={(e) => {
                    setUsersPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 rounded-lg border border-border bg-background text-right text-sm font-medium whitespace-nowrap"
                >
                  <option value={5}>5 کاربر</option>
                  <option value={10}>10 کاربر</option>
                  <option value={20}>20 کاربر</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">کاربری یافت نشد</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                      className="p-4 border-2 border-gray-600 bg-gray-900 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:bg-gray-800"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-right hover:text-white transition-colors truncate">
                              {user.name}
                            </h3>
                            {getStatusBadge(user.status)}
                            {getRoleBadge(user.role)}
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm text-right">
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground hover:text-white transition-colors">
                                ایمیل
                              </p>
                              <p className="font-mono text-muted-foreground hover:text-white transition-colors truncate">
                                {user.email}
                              </p>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground hover:text-white transition-colors">
                                شماره تماس
                              </p>
                              <p className="text-muted-foreground hover:text-white transition-colors truncate">
                                {user.phone}
                              </p>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground hover:text-white transition-colors">
                                نام برند
                              </p>
                              <p className="text-muted-foreground hover:text-white transition-colors truncate">
                                {user.brandName}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground hover:text-white transition-colors">
                              اعتبار
                            </p>
                            <p className="text-2xl font-bold text-primary hover:text-white transition-colors">
                              {user.credits}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {filteredUsers.length > 0 && (
                <div className="mt-6 flex items-center justify-between pt-6 border-t">
                  <div className="text-sm text-muted-foreground">
                    نمایش {startIndex + 1} تا {Math.min(endIndex, filteredUsers.length)} از{" "}
                    {filteredUsers.length} کاربر
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <Button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      قبلی
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    {/* Next Button */}
                    <Button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      بعدی
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Page Tab Content */}
      {activeTab === "edit" && (
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">ویرایش صفحه</h1>
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="h-4 w-4" />
              خروج
            </Button>
          </div>

          {/* Sub-tabs */}
          <div className="flex gap-2 mb-6 border-b border-muted">
            <button
              onClick={() => setEditSubTab("slideshow")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                editSubTab === "slideshow"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              اسلاید شو
            </button>
            <button
              onClick={() => setEditSubTab("links")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                editSubTab === "links"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              لینک ها
            </button>
          </div>

          {/* Slideshow Sub-tab */}
          {editSubTab === "slideshow" && (
            <div className="pb-[150px]">
              <AdminSlideshowManager />
            </div>
          )}

          {/* Links Sub-tab */}
          {editSubTab === "links" && (
            <div className="pb-[150px]">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center">
                    این قسمت در آینده فعال خواهد شد
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Gallery Tab Content */}
      {activeTab === "gallery" && (
        <div className="max-w-7xl mx-auto pb-[150px]">
          <div className="flex items-center justify-end mb-6">
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="h-4 w-4" />
              خروج
            </Button>
          </div>
          <AdminGallery />
        </div>
      )}

      {/* Admin Bottom Navigation */}
      <AdminBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
