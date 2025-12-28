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
} from "lucide-react";
import {
  getAdminToken,
  clearAdminToken,
  verifyAdminToken,
} from "@/lib/admin-auth";

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

  useEffect(() => {
    // Check admin authentication
    const checkAuth = async () => {
      const isValid = await verifyAdminToken();
      if (!isValid) {
        navigate("/admin-login");
      }
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

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.includes(searchTerm) ||
      user.email.includes(searchTerm) ||
      user.phone.includes(searchTerm) ||
      user.brandName.includes(searchTerm);

    const matchesFilter =
      filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

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
    clearAdminToken();
    navigate("/admin-login");
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
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-background to-muted pt-20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-7 w-7 text-primary" />
              </div>
              پنل مدیریت کاربران
            </h1>
            <p className="text-muted-foreground mt-1">
              مدیریت حسابهای کاربری و اختصاص کلیدهای API
            </p>
          </div>
          <div className="flex gap-2">
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
        <div className="grid grid-cols-3 gap-4">
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
        </div>

        {/* Filter and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">جستجو و فیلتر</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="جستجو بر اساس نام، ایمیل، شماره تماس یا نام برند..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-3 pr-9 text-right"
                />
              </div>
            </div>

            <div className="flex gap-2">
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
            <CardTitle>کاربران ({filteredUsers.length})</CardTitle>
            <CardDescription>
              کلیک بر روی یک کاربر برای مدیریت کلیدهای API و اعتبارات
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">کاربری یافت نشد</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                    className="p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:bg-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-right hover:text-white transition-colors">
                            {user.name}
                          </h3>
                          {getStatusBadge(user.status)}
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm text-right">
                          <div>
                            <p className="text-xs text-muted-foreground hover:text-white transition-colors">
                              ایمیل
                            </p>
                            <p className="font-mono text-muted-foreground hover:text-white transition-colors">
                              {user.email}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground hover:text-white transition-colors">
                              شماره تماس
                            </p>
                            <p className="text-muted-foreground hover:text-white transition-colors">
                              {user.phone}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground hover:text-white transition-colors">
                              نام برند
                            </p>
                            <p className="text-muted-foreground hover:text-white transition-colors">
                              {user.brandName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground hover:text-white transition-colors">
                              کلیدهای API
                            </p>
                            <p className="font-semibold text-foreground hover:text-white transition-colors">
                              {user.apiKeys.length}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 ml-4">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
