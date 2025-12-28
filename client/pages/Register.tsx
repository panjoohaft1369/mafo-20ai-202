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
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

// Validation patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PHONE_REGEX = /^(\+98|0)?9\d{9}$/;

interface RegistrationData {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  brandName: string;
}

interface ValidationErrors {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  brandName?: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegistrationData>({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    brandName: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validate field on change
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "name":
        if (!value.trim()) return "نام الزامی است";
        if (value.trim().length < 3) return "نام باید حداقل 3 کاراکتر باشد";
        return undefined;

      case "phone":
        if (!value.trim()) return "شماره تماس الزامی است";
        if (!PHONE_REGEX.test(value)) {
          return "شماره تماس معتبر نیست (مثال: 09xxxxxxxxx)";
        }
        return undefined;

      case "email":
        if (!value.trim()) return "ایمیل الزامی است";
        if (!EMAIL_REGEX.test(value)) return "ایمیل معتبر نیست";
        return undefined;

      case "password":
        if (!value) return "رمز عبور الزامی است";
        if (value.length < PASSWORD_MIN_LENGTH) {
          return `رمز عبور باید حداقل ${PASSWORD_MIN_LENGTH} کاراکتر باشد`;
        }
        if (!/[A-Z]/.test(value)) {
          return "رمز عبور باید حداقل یک حرف بزرگ داشته باشد";
        }
        if (!/[a-z]/.test(value)) {
          return "رمز عبور باید حداقل یک حرف کوچک داشته باشد";
        }
        if (!/[0-9]/.test(value)) {
          return "رمز عبور باید حداقل یک عدد داشته باشد";
        }
        return undefined;

      case "confirmPassword":
        if (!value) return "تأیید رمز عبور الزامی است";
        if (value !== formData.password) {
          return "رمز های عبور مطابقت ندارند";
        }
        return undefined;

      case "brandName":
        if (!value.trim()) return "نام برند الزامی است";
        if (value.trim().length < 2) return "نام برند باید حداقل 2 کاراکتر باشد";
        return undefined;

      default:
        return undefined;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    newErrors.name = validateField("name", formData.name);
    newErrors.phone = validateField("phone", formData.phone);
    newErrors.email = validateField("email", formData.email);
    newErrors.password = validateField("password", formData.password);
    newErrors.confirmPassword = validateField(
      "confirmPassword",
      formData.confirmPassword,
    );
    newErrors.brandName = validateField("brandName", formData.brandName);

    // Remove undefined errors
    Object.keys(newErrors).forEach((key) => {
      if (newErrors[key as keyof ValidationErrors] === undefined) {
        delete newErrors[key as keyof ValidationErrors];
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          brandName: formData.brandName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(
          data.message || data.error || "خطا در ثبت نام. لطفا دوباره سعی کنید.",
        );
        setLoading(false);
        return;
      }

      // Success
      setSuccess(true);
      setFormData({
        name: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        brandName: "",
      });

      // Redirect to pending approval page after 3 seconds
      setTimeout(() => {
        navigate("/register-pending");
      }, 3000);
    } catch (err) {
      console.error("Registration error:", err);
      setServerError("خطا در اتصال. لطفا بعدا دوباره سعی کنید.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.name &&
    formData.phone &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    formData.brandName &&
    Object.keys(errors).length === 0;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="flex flex-col items-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F4c88dfcd13ad44aba9d3f4537f9785d5%2Fa2dcdb2b6e894df7989c87db38a879a2?format=webp&width=800"
                alt="MAFO"
                className="h-16 w-16 mb-2 drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]"
              />
              <h1 className="text-3xl font-bold">MAFO</h1>
              <p className="text-sm text-muted-foreground">
                هوش مصنوعی تصویرساز
              </p>
            </div>
          </div>
          <CardTitle className="text-2xl">ثبت نام</CardTitle>
          <CardDescription>
            حساب کاربری جدید را ایجاد کنید و شروع کنید
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                نام <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="نام کامل خود را وارد کنید"
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
                className="text-right"
              />
              {errors.name && (
                <p className="text-xs text-red-600 text-right">{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                شماره تماس <span className="text-red-500">*</span>
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="09xxxxxxxxx"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={loading}
                className="text-right"
              />
              {errors.phone && (
                <p className="text-xs text-red-600 text-right">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                ایمیل <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@domain.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                className="text-right"
              />
              {errors.email && (
                <p className="text-xs text-red-600 text-right">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                رمز عبور <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="حداقل 8 کاراکتر"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="text-right pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 text-right">
                  {errors.password}
                </p>
              )}
              {!errors.password && formData.password && (
                <p className="text-xs text-green-600 text-right">
                  ✓ رمز عبور قوی است
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                تأیید رمز عبور <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="رمز عبور را دوباره وارد کنید"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="text-right pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 text-right">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Brand Name */}
            <div className="space-y-2">
              <label htmlFor="brand-name" className="text-sm font-medium">
                نام برند <span className="text-red-500">*</span>
              </label>
              <Input
                id="brand-name"
                name="brandName"
                type="text"
                placeholder="نام برند یا شرکت خود"
                value={formData.brandName}
                onChange={handleInputChange}
                disabled={loading}
                className="text-right"
              />
              {errors.brandName && (
                <p className="text-xs text-red-600 text-right">
                  {errors.brandName}
                </p>
              )}
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="flex gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800 text-right">
                  <p className="font-medium">خطا</p>
                  <p>{serverError}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800 font-medium">
                  ثبت نام موفق! درحال انتقال...
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full"
              size="lg"
              style={{
                backgroundColor: "#ffffff",
                color: "#000000",
                border: "1px solid #d1d5db",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffff";
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  درحال ثبت نام...
                </>
              ) : (
                "ثبت نام"
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                حساب کاربری دارید؟{" "}
                <a
                  href="/login"
                  className="text-primary hover:underline font-medium"
                >
                  ورود
                </a>
              </p>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-right">
              <p className="text-sm text-blue-900 font-medium mb-2">
                اطلاعات ثبت نام
              </p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• رمز عبور شما باید شامل حروف بزرگ، کوچک و اعداد باشد</li>
                <li>• شماره تماس با 09 شروع می‌شود</li>
                <li>• ایمیل برای تایید حساب استفاده خواهد شد</li>
                <li className="mt-2 pt-2 border-t border-blue-200">
                  پس از ثبت نام، درخواست شما توسط تیم پشتیبانی بررسی خواهد شد
                </li>
              </ul>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
