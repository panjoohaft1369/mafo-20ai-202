import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  ChevronLeft,
  Loader2,
  Trash2,
  Plus,
  Copy,
  CheckCircle,
  Key,
  Edit2,
  Eye,
  EyeOff,
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
  apiKeys: Array<{
    id: string;
    key: string;
    createdAt: string;
    isActive: boolean;
  }>;
  credits: number;
  role?: "user" | "admin";
}

export default function AdminUserDetails() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [credits, setCredits] = useState("");
  const [savingCredits, setSavingCredits] = useState(false);
  const [addingKey, setAddingKey] = useState(false);
  const [newApiKey, setNewApiKey] = useState("");
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    brandName: "",
    password: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fetchingPassword, setFetchingPassword] = useState(false);

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
    // Fetch user from API
    const loadUser = async () => {
      try {
        setLoading(true);
        const token = getAdminToken();

        const response = await fetch(`/api/admin/users/${userId}`, {
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
          setError("خطا در بارگذاری اطلاعات کاربر");
          setLoading(false);
          return;
        }

        const data = await response.json();
        setUser(data.user);
        setCredits(data.user.credits.toString());
        setEditData({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          brandName: data.user.brandName,
          password: "",
        });
      } catch (err) {
        setError("خطا در بارگذاری اطلاعات کاربر");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUser();
    }
  }, [userId, navigate]);

  const handleUpdateCredits = async () => {
    if (!credits || isNaN(Number(credits))) {
      setError("لطفا عدد معتبر وارد کنید");
      return;
    }

    setSavingCredits(true);
    try {
      const token = getAdminToken();
      const response = await fetch(`/api/admin/users/${userId}/credits`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ credits: Number(credits) }),
      });

      if (response.status === 401) {
        clearAdminToken();
        navigate("/admin-login");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "خطا در بروزرسانی اعتبار");
        return;
      }

      if (user) {
        setUser({ ...user, credits: Number(credits) });
      }
      setError("");
    } catch (err) {
      setError("خطا در بروزرسانی اعتبار");
    } finally {
      setSavingCredits(false);
    }
  };

  const handleAddApiKey = async () => {
    setAddingKey(true);
    try {
      const token = getAdminToken();
      const response = await fetch(`/api/admin/users/${userId}/api-keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ apiKey: newApiKey || undefined }),
      });

      if (response.status === 401) {
        clearAdminToken();
        navigate("/admin-login");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "خطا در افزودن کلید API");
        return;
      }

      const data = await response.json();
      if (user) {
        setUser({
          ...user,
          apiKeys: [...user.apiKeys, data.apiKey],
        });
      }
      setNewApiKey("");
      setError("");
    } catch (err) {
      setError("خطا در افزودن کلید API");
    } finally {
      setAddingKey(false);
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    if (!confirm("آیا از حذف این کلید API مطمئن هستید؟")) return;

    try {
      const token = getAdminToken();
      const response = await fetch(
        `/api/admin/users/${userId}/api-keys/${keyId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401) {
        clearAdminToken();
        navigate("/admin-login");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "خطا در حذف کلید API");
        return;
      }

      if (user) {
        setUser({
          ...user,
          apiKeys: user.apiKeys.filter((k) => k.id !== keyId),
        });
      }
      setError("");
    } catch (err) {
      setError("خطا در حذف کلید API");
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(key);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleTogglePasswordVisibility = async () => {
    // If we're showing the password, just hide it
    if (showPassword) {
      setShowPassword(false);
      return;
    }

    // If password field is empty (new password), just toggle the visibility
    if (!editData.password) {
      setShowPassword(true);
      return;
    }

    // If password looks like a bcrypt hash (starts with $2a, $2b, or $2y), show a message
    if (editData.password.startsWith("$2")) {
      setError("رمز عبور موجود رمزگذاری شده است و نمی‌تواند نمایش داده شود. لطفا یک رمز عبور جدید وارد کنید.");
      return;
    }

    // Otherwise show the password
    setShowPassword(true);
  };

  const handleApproveUser = async () => {
    try {
      const token = getAdminToken();
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: "POST",
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
        const data = await response.json();
        setError(data.error || "خطا در تایید کاربر");
        return;
      }

      if (user) {
        setUser({ ...user, status: "approved" });
      }
      setError("");
    } catch (err) {
      setError("خطا در تایید کاربر");
    }
  };

  const handleDeleteUser = async () => {
    if (
      !confirm("آیا از حذف این کاربر مطمئن هستید؟ این عملیات قابل بازگشت نیست.")
    ) {
      return;
    }

    setDeleting(true);
    try {
      const token = getAdminToken();
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
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
        const data = await response.json();
        setError(data.error || "خطا در حذف کاربر");
        setDeleting(false);
        return;
      }

      // Successfully deleted, redirect to admin dashboard
      navigate("/admin");
    } catch (err) {
      setError("خطا در حذف کاربر");
      setDeleting(false);
    }
  };

  const handleEditUser = async () => {
    // Validate edit data
    if (
      !editData.name.trim() ||
      !editData.email.trim() ||
      !editData.phone.trim() ||
      !editData.brandName.trim()
    ) {
      setError("تمام فیلدها الزامی هستند");
      return;
    }

    // Validate password if provided
    if (editData.password) {
      if (editData.password.length < 8) {
        setError("رمز عبور باید حداقل 8 کاراکتر باشد");
        return;
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(editData.password)) {
        setError("رمز عبور باید شامل حروف بزرگ، کوچک و اعداد باشد");
        return;
      }
    }

    setSavingEdit(true);
    try {
      const token = getAdminToken();
      const updateBody: any = {
        name: editData.name.trim(),
        email: editData.email.trim(),
        phone: editData.phone.trim(),
        brandName: editData.brandName.trim(),
      };

      // Add password to update if provided
      if (editData.password) {
        updateBody.password = editData.password;
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateBody),
      });

      if (response.status === 401) {
        clearAdminToken();
        navigate("/admin-login");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "خطا در ویرایش کاربر");
        setSavingEdit(false);
        return;
      }

      const data = await response.json();
      setUser(data.user);
      setEditData({
        ...editData,
        password: "",
      });
      setIsEditMode(false);
      setError("");
    } catch (err) {
      setError("خطا در ویرایش کاربر");
    } finally {
      setSavingEdit(false);
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-center text-muted-foreground">کاربر یافت نشد</p>
            <Button onClick={() => navigate("/admin")} className="w-full mt-4">
              بازگشت به پنل مدیریت
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-background to-muted pt-20 pb-[100px]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navigate("/admin")}
            className="bg-gray-600 hover:bg-gray-700 text-white gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            بازگشت
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsEditMode(!isEditMode)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Edit2 className="h-4 w-4" />
              {isEditMode ? "لغو" : "ویرایش"}
            </Button>
            <Button
              onClick={handleDeleteUser}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  حذف کاربر
                </>
              )}
            </Button>
          </div>
        </div>

        {/* User Name Section */}
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground mt-1">{user.brandName}</p>
        </div>

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

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات کاربر</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditMode ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1">نام</label>
                  <Input
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    className="text-right"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    ایمیل
                  </label>
                  <Input
                    value={editData.email}
                    onChange={(e) =>
                      setEditData({ ...editData, email: e.target.value })
                    }
                    className="text-right"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    شماره تماس
                  </label>
                  <Input
                    value={editData.phone}
                    onChange={(e) =>
                      setEditData({ ...editData, phone: e.target.value })
                    }
                    className="text-right"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    نام برند
                  </label>
                  <Input
                    value={editData.brandName}
                    onChange={(e) =>
                      setEditData({ ...editData, brandName: e.target.value })
                    }
                    className="text-right"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">
                    رمز عبور جدید (اختیاری)
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={editData.password}
                      onChange={(e) =>
                        setEditData({ ...editData, password: e.target.value })
                      }
                      placeholder="اگر می‌خواهید تغییر دهید، وارد کنید"
                      className="text-right pr-10"
                    />
                    <button
                      type="button"
                      onClick={handleTogglePasswordVisibility}
                      disabled={fetchingPassword}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {fetchingPassword ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleEditUser}
                    disabled={savingEdit}
                    className="bg-green-600 hover:bg-green-700 flex-1 text-white"
                  >
                    {savingEdit ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      "ذخیره تغییرات"
                    )}
                  </Button>
                  <Button
                    onClick={() => setIsEditMode(false)}
                    variant="outline"
                    className="flex-1 text-white hover:text-white border-white hover:bg-gray-700"
                  >
                    لغو
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">نام</p>
                  <p className="font-semibold">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ایمیل</p>
                  <p className="font-mono">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">شماره تماس</p>
                  <p>{user.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">نام برند</p>
                  <p>{user.brandName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">رمز عبور</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-sm">
                      {showPassword ? "••••••••" : "••••••••"}
                    </span>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title={showPassword ? "پنهان کن" : "نمایش بده"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">وضعیت</p>
                  <div className="mt-1">
                    {user.status === "pending" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <div className="w-2 h-2 rounded-full bg-yellow-600" />
                        منتظر تایید
                      </span>
                    )}
                    {user.status === "approved" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3" />
                        تایید شده
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">نقش</p>
                  <div className="mt-1">
                    {user.role === "admin" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <div className="w-2 h-2 rounded-full bg-purple-600" />
                        مدیر
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <div className="w-2 h-2 rounded-full bg-gray-600" />
                        کاربر معمولی
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاریخ عضویت</p>
                  <p>{new Date(user.createdAt).toLocaleDateString("fa-IR")}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approve User */}
        {user.status === "pending" && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <p className="text-sm text-green-900 mb-4">
                این کاربر هنوز تایید نشده است. آن را تایید کنید تا بتواند
                درخواست کلید API کند.
              </p>
              <Button
                onClick={handleApproveUser}
                className="bg-green-600 hover:bg-green-700"
              >
                تایید کاربر
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Credits Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1 rounded bg-blue-100">
                <Key className="h-5 w-5 text-blue-600" />
              </div>
              مدیریت اعتبار
            </CardTitle>
            <CardDescription>
              تعداد درخواست هایی را تعیین کنید که کاربر می‌تواند انجام دهد
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">اعتبار فعلی</label>
                <span className="text-2xl font-bold text-primary">
                  {user.credits}
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="تعداد اعتبارات جدید"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  className="text-right"
                />
                <Button
                  onClick={handleUpdateCredits}
                  disabled={savingCredits || !credits}
                  className="whitespace-nowrap"
                >
                  {savingCredits ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    "بروزرسانی"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Keys Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1 rounded bg-purple-100">
                <Key className="h-5 w-5 text-purple-600" />
              </div>
              کلید API
            </CardTitle>
            <CardDescription>
              کلید API ای که به این کاربر اختصاص داده شده است
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Key */}
            {user.apiKeys.length === 0 && (
              <div className="flex gap-2">
                <Input
                  placeholder="یا کلید API را اینجا بچسبانید"
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  className="text-right"
                />
                <Button
                  onClick={handleAddApiKey}
                  disabled={addingKey}
                  className="whitespace-nowrap bg-green-600 hover:bg-green-700"
                >
                  {addingKey ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      افزودن کلید
                    </>
                  )}
                </Button>
              </div>
            )}
            {user.apiKeys.length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  ℹ️ هر کاربر فقط می‌تواند یک کلید API داشته باشد.
                </p>
              </div>
            )}

            {/* API Keys List */}
            {user.apiKeys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Key className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>هنوز کلید API برای این کاربر تعیین نشده است</p>
              </div>
            ) : (
              <div className="space-y-3">
                {user.apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">
                            {apiKey.key}
                          </p>
                          {apiKey.isActive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                              فعال
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ایجاد شده:{" "}
                          {new Date(apiKey.createdAt).toLocaleDateString(
                            "fa-IR",
                          )}
                        </p>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleCopyKey(apiKey.key)}
                          className="p-2 hover:bg-gray-200 rounded transition-colors"
                          title="کپی کنید"
                        >
                          {copiedKeyId === apiKey.key ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteApiKey(apiKey.id)}
                          className="p-2 hover:bg-red-100 rounded transition-colors text-red-600"
                          title="حذف کنید"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
