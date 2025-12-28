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
  ChevronLeft,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  getAdminToken,
  clearAdminToken,
  verifyAdminToken,
} from "@/lib/admin-auth";

export default function AdminAddUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    brandName: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Check admin authentication
    const checkAuth = async () => {
      const isValid = await verifyAdminToken();
      if (!isValid) {
        navigate("/admin-login");
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      setError("نام باید حداقل 3 کاراکتر باشد");
      return false;
    }

    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      setError("ایمیل معتبر نیست");
      return false;
    }

    if (!formData.phone.trim() || !/^(\+98|0)?9\d{9}$/.test(formData.phone)) {
      setError("شماره تماس معتبر نیست");
      return false;
    }

    if (!formData.password || formData.password.length < 8) {
      setError("رمز عبور باید حداقل 8 کاراکتر باشد");
      return false;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError("رمز عبور باید حداقل یک حرف بزرگ داشته باشد");
      return false;
    }

    if (!/[a-z]/.test(formData.password)) {
      setError("رمز عبور باید حداقل یک حرف کوچک داشته باشد");
      return false;
    }

    if (!/[0-9]/.test(formData.password)) {
      setError("رمز عبور باید حداقل یک عدد داشته باشد");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("رمز های عبور مطابقت ندارند");
      return false;
    }

    if (!formData.brandName.trim() || formData.brandName.trim().length < 2) {
      setError("نام برند باید حداقل 2 کاراکتر باشد");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const token = getAdminToken();
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
          brandName: formData.brandName.trim(),
        }),
      });

      if (response.status === 401) {
        clearAdminToken();
        navigate("/admin-login");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "خطا در افزودن کاربر");
        setSaving(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/admin");
      }, 2000);
    } catch (err) {
      setError("خطا در افزودن کاربر");
    } finally {
      setSaving(false);
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

  const isFormValid =
    formData.name &&
    formData.email &&
    formData.phone &&
    formData.password &&
    formData.confirmPassword &&
    formData.brandName &&
    !error;

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-background to-muted pt-20">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin")}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">افزودن کاربر جدید</h1>
            <p className="text-muted-foreground">
              ایجاد حساب کاربری جدید برای مشتری
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات کاربر</CardTitle>
            <CardDescription>تمام فیلدها الزامی هستند</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-medium block mb-1"
                >
                  نام
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="نام کامل"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={saving}
                  className="text-right"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium block mb-1"
                >
                  ایمیل
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@domain.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={saving}
                  className="text-right"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="text-sm font-medium block mb-1"
                >
                  شماره تماس
                </label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="09xxxxxxxxx"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={saving}
                  className="text-right"
                />
              </div>

              {/* Brand Name */}
              <div>
                <label
                  htmlFor="brandName"
                  className="text-sm font-medium block mb-1"
                >
                  نام برند
                </label>
                <Input
                  id="brandName"
                  name="brandName"
                  placeholder="نام شرکت یا برند"
                  value={formData.brandName}
                  onChange={handleInputChange}
                  disabled={saving}
                  className="text-right"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-medium block mb-1"
                >
                  رمز عبور
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="حداقل 8 کاراکتر"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={saving}
                    className="text-right pe-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={saving}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium block mb-1"
                >
                  تأیید رمز عبور
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="رمز عبور را دوباره وارد کنید"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={saving}
                    className="text-right pe-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={saving}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="flex gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800 font-medium">
                    کاربر با موفقیت افزوده شد! درحال انتقال...
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={!isFormValid || saving}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      درحال افزودن...
                    </>
                  ) : (
                    "افزودن کاربر"
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate("/admin")}
                  variant="outline"
                  className="flex-1"
                >
                  انصراف
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
