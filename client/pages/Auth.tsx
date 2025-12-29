import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { login } from "@/lib/api";
import { saveAuthCredentials } from "@/lib/auth";
import { Loading } from "@/components/Loading";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

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

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"login" | "register">(
    location.pathname === "/register" ? "register" : "login",
  );

  // Login state
  const [email, setEmail] = useState(
    localStorage.getItem("rememberMe_email") || "",
  );
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(
    !!localStorage.getItem("rememberMe_email"),
  );
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Register state
  const [formData, setFormData] = useState<RegistrationData>({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    brandName: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);
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
        if (value.trim().length < 2)
          return "نام برند باید حداقل 2 کاراکتر باشد";
        return undefined;

      default:
        return undefined;
    }
  };

  const handleRegisterInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateRegisterForm = (): boolean => {
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

  // Login Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginSuccess(false);

    if (!email.trim()) {
      setLoginError("لطفا ایمیل خود را وارد کنید");
      return;
    }

    if (!password.trim()) {
      setLoginError("لطفا رمز عبور خود را وارد کنید");
      return;
    }

    setLoginLoading(true);

    try {
      const result = await login({ email, password });

      if (!result.success || !result.data) {
        setLoginError(result.error || "خطا در ورود");
        setLoginLoading(false);
        return;
      }

      // Save auth data
      saveAuthCredentials(
        result.data.userId,
        result.data.apiKey,
        result.data.name,
        result.data.email,
        result.data.credits,
        result.data.role || "user",
      );

      // Save email if "Remember me" is checked
      if (rememberMe) {
        localStorage.setItem("rememberMe_email", email);
      } else {
        localStorage.removeItem("rememberMe_email");
      }

      setLoginSuccess(true);

      // Redirect to admin panel if user is admin, otherwise to generate page
      setTimeout(() => {
        const redirectPath =
          result.data.role === "admin" ? "/admin" : "/generate";
        navigate(redirectPath);
      }, 1000);
    } catch (err) {
      setLoginError("خطا در اتصال. لطفا بعدا دوباره سعی کنید.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Register Handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess(false);

    if (!validateRegisterForm()) {
      return;
    }

    setRegisterLoading(true);

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
        setRegisterError(
          data.message || data.error || "خطا در ثبت نام. لطفا دوباره سعی کنید.",
        );
        setRegisterLoading(false);
        return;
      }

      // Success
      setRegisterSuccess(true);
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
      setRegisterError("خطا در اتصال. لطفا بعدا دوباره سعی کنید.");
    } finally {
      setRegisterLoading(false);
    }
  };

  const isLoginValid = email.trim() && password.trim();
  const isRegisterValid =
    formData.name &&
    formData.phone &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    formData.brandName &&
    Object.keys(errors).length === 0;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background to-muted"
      dir="rtl"
    >
      <Card className="w-full max-w-md text-right">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
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

          {/* Tab Buttons */}
          <div className="flex gap-2 bg-muted rounded-lg p-1">
            <button
              onClick={() => {
                setActiveTab("login");
                setRegisterError("");
                setLoginError("");
                navigate("/login");
              }}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === "login"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ورود
            </button>
            <button
              onClick={() => {
                setActiveTab("register");
                setRegisterError("");
                setLoginError("");
                navigate("/register");
              }}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === "register"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ثبت نام
            </button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  برای شروع، ایمیل و رمز عبور خود را وارد کنید
                </p>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="login-email" className="text-sm font-medium">
                  ایمیل
                </label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="example@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loginLoading}
                  className="text-right"
                  dir="rtl"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="login-password" className="text-sm font-medium">
                  رمز عبور
                </label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="رمز عبور خود را وارد کنید"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loginLoading}
                  className="text-right"
                  dir="rtl"
                />
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loginLoading}
                  className="w-4 h-4 rounded border-input"
                />
                <label
                  htmlFor="remember-me"
                  className="text-sm font-medium cursor-pointer"
                >
                  مرا به خاطر بسپار
                </label>
              </div>

              {/* Error Message */}
              {loginError && (
                <div className="flex gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800 text-right">
                    <p className="font-medium">خطا</p>
                    <p>{loginError}</p>
                    {loginError.includes("تایید") && (
                      <div className="mt-2 space-y-1 text-xs">
                        <p className="font-medium">
                          لطفا با پشتیبانی تماس بگیرید:
                        </p>
                        <a
                          href="tel:+989357887572"
                          className="block hover:underline"
                        >
                          ☎ 09357887572
                        </a>
                        <a
                          href="http://wa.me/+989357887572"
                          className="block hover:underline"
                        >
                          💬 واتساپ
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {loginSuccess && (
                <div className="flex gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800 font-medium">
                    ورود موفق! در حال انتقال...
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loginLoading || !isLoginValid}
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
                {loginLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loading size="sm" inline text={undefined} />
                    درحال بارگذاری...
                  </div>
                ) : (
                  "ورود"
                )}
              </Button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  حساب کاربری جدید را ایجاد کنید و شروع کنید
                </p>
              </div>

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
                  onChange={handleRegisterInputChange}
                  disabled={registerLoading}
                  className="text-right"
                />
                {errors.name && (
                  <p className="text-xs text-red-600 text-right">
                    {errors.name}
                  </p>
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
                  onChange={handleRegisterInputChange}
                  disabled={registerLoading}
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
                  onChange={handleRegisterInputChange}
                  disabled={registerLoading}
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
                <label htmlFor="reg-password" className="text-sm font-medium">
                  رمز عبور <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="حداقل 8 کاراکتر"
                    value={formData.password}
                    onChange={handleRegisterInputChange}
                    disabled={registerLoading}
                    className="text-right pe-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={registerLoading}
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
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium"
                >
                  تأیید رمز عبور <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="رمز عبور را دوباره وارد کنید"
                    value={formData.confirmPassword}
                    onChange={handleRegisterInputChange}
                    disabled={registerLoading}
                    className="text-right pe-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={registerLoading}
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
                <label htmlFor="brandName" className="text-sm font-medium">
                  نام برند <span className="text-red-500">*</span>
                </label>
                <Input
                  id="brandName"
                  name="brandName"
                  type="text"
                  placeholder="نام شرکت یا برند خود"
                  value={formData.brandName}
                  onChange={handleRegisterInputChange}
                  disabled={registerLoading}
                  className="text-right"
                />
                {errors.brandName && (
                  <p className="text-xs text-red-600 text-right">
                    {errors.brandName}
                  </p>
                )}
              </div>

              {/* Error Message */}
              {registerError && (
                <div className="flex gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 text-right">
                    {registerError}
                  </p>
                </div>
              )}

              {/* Success Message */}
              {registerSuccess && (
                <div className="flex gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800 font-medium text-right">
                    ثبت نام موفق! در حال انتقال...
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={registerLoading || !isRegisterValid}
                className="w-full"
                size="lg"
              >
                {registerLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loading size="sm" inline text={undefined} />
                    درحال ثبت نام...
                  </div>
                ) : (
                  "ثبت نام"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
