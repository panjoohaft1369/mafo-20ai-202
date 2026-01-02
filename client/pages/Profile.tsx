import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TopNav } from "@/components/TopNav";
import { BottomNav } from "@/components/BottomNav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Store, Lock } from "lucide-react";
import { getAuthState, clearAuth, saveAuthCredentials } from "@/lib/auth";
import { toast } from "sonner";

export default function Profile() {
  const navigate = useNavigate();
  const auth = getAuthState();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    brandName: "",
    credits: 0,
  });

  const [originalData, setOriginalData] = useState({ ...formData });

  // Redirect if not logged in and load user profile from backend
  useEffect(() => {
    if (!auth.isLoggedIn || !auth.apiKey) {
      navigate("/login");
      return;
    }

    const loadProfileData = async () => {
      try {
        const response = await fetch("/api/user/profile", {
          method: "GET",
          headers: {
            "X-API-Key": auth.apiKey!,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setFormData({
              name: data.data.name || auth.name || "",
              email: data.data.email || auth.email || "",
              phone: data.data.phone || "",
              brandName: data.data.brandName || "",
              credits: data.data.credits || auth.credits || 0,
            });
            setOriginalData({
              name: data.data.name || auth.name || "",
              email: data.data.email || auth.email || "",
              phone: data.data.phone || "",
              brandName: data.data.brandName || "",
              credits: data.data.credits || auth.credits || 0,
            });
          } else {
            // Fallback to auth state
            setFormData({
              name: auth.name || "",
              email: auth.email || "",
              phone: "",
              brandName: "",
              credits: auth.credits || 0,
            });
            setOriginalData({
              name: auth.name || "",
              email: auth.email || "",
              phone: "",
              brandName: "",
              credits: auth.credits || 0,
            });
          }
        } else {
          // Fallback to auth state
          setFormData({
            name: auth.name || "",
            email: auth.email || "",
            phone: "",
            brandName: "",
            credits: auth.credits || 0,
          });
          setOriginalData({
            name: auth.name || "",
            email: auth.email || "",
            phone: "",
            brandName: "",
            credits: auth.credits || 0,
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        // Fallback to auth state
        setFormData({
          name: auth.name || "",
          email: auth.email || "",
          phone: "",
          brandName: "",
          credits: auth.credits || 0,
        });
        setOriginalData({
          name: auth.name || "",
          email: auth.email || "",
          phone: "",
          brandName: "",
          credits: auth.credits || 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [auth.isLoggedIn, auth.apiKey, navigate, auth.name, auth.email, auth.credits]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setFormData({ ...originalData });
    setIsEditing(false);
    setMessage(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: auth.userId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          brandName: formData.brandName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error || "خطا در ذخیره اطلاعات",
        });
        setIsSaving(false);
        return;
      }

      // Update auth state with new data
      saveAuthCredentials(
        auth.userId!,
        auth.apiKey!,
        data.data.name,
        data.data.email,
        data.data.credits,
        auth.role || "user",
      );

      // Update form data with new data
      setFormData({
        name: data.data.name,
        email: data.data.email,
        phone: formData.phone,
        brandName: data.data.brandName,
        credits: data.data.credits,
      });
      setOriginalData({
        name: data.data.name,
        email: data.data.email,
        phone: formData.phone,
        brandName: data.data.brandName,
        credits: data.data.credits,
      });

      setMessage({
        type: "success",
        text: "پروفایل با موفقیت ذخیره شد",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage({
        type: "error",
        text: "خطا در ارتباط با سرور",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setMessage(null);

    // Validate fields
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setMessage({
        type: "error",
        text: "تمام فیلدها الزامی هستند",
      });
      return;
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      setMessage({
        type: "error",
        text: "رمز عبور باید حداقل 8 کاراکتر و شامل حروف بزرگ، کوچک و اعداد باشد",
      });
      return;
    }

    // Check if passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({
        type: "error",
        text: "رمز عبور جدید و تکرار آن مطابقت ندارند",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: auth.userId,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error || "خطا در تغییر رمز عبور",
        });
        setIsChangingPassword(false);
        return;
      }

      // Show success message
      toast.success("رمز عبور با موفقیت تغییر کرد. درحال ورود دوباره...");

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Logout and redirect to login
      setTimeout(() => {
        clearAuth();
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage({
        type: "error",
        text: "خطا در ارتباط با سرور",
      });
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <TopNav />
      <Header isLoggedIn={auth.isLoggedIn} onLogout={handleLogout} />

      <main className="flex-1 pt-20 md:pt-28 pb-0 -mt-[120px]">
        <section className="px-4 py-12 sm:py-16">
          <div className="container mx-auto max-w-2xl">
            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <span className="text-2xl">👤</span>
                <span className="text-sm font-semibold text-primary">
                  حساب کاربری
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                مشخصات کاربری
              </h1>
              <p className="text-lg text-muted-foreground">
                اطلاعات حساب کاربری خود را مشاهده و ویرایش کنید
              </p>
            </div>

            {/* Message Display */}
            {message && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Profile Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  اطلاعات شخصی
                </CardTitle>
                <CardDescription>
                  {isEditing
                    ? "اطلاعات خود را ویرایش کنید"
                    : "مشاهده اطلاعات حساب کاربری"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-right">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    نام کامل
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isEditing
                        ? "border-border bg-background cursor-text"
                        : "border-border bg-muted cursor-default"
                    } text-right focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-70`}
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    ایمیل
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isEditing
                        ? "border-border bg-background cursor-text"
                        : "border-border bg-muted cursor-default"
                    } text-right focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-70`}
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    شماره تماس
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="09xxxxxxxxx"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isEditing
                        ? "border-border bg-background cursor-text"
                        : "border-border bg-muted cursor-default"
                    } text-right focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-70`}
                  />
                </div>

                {/* Brand Name Field */}
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    نام برند
                  </label>
                  <input
                    type="text"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="نام برند یا فروشگاه"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isEditing
                        ? "border-border bg-background cursor-text"
                        : "border-border bg-muted cursor-default"
                    } text-right focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-70`}
                  />
                </div>

                {/* Credits Display */}
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <label className="block text-sm font-semibold mb-2">
                    اعتبار موجود
                  </label>
                  <div className="text-2xl font-bold text-primary">
                    {formData.credits.toLocaleString("fa-IR")} واحد
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="w-full"
                      variant="default"
                    >
                      ویرایش اطلاعات
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1"
                        variant="default"
                      >
                        {isSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="flex-1"
                        variant="outline"
                      >
                        انصراف
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              خروج از حساب
            </Button>
          </div>
        </section>
      </main>

      <Footer />

      <section className="h-[150px] bg-background w-full"></section>

      <BottomNav isLoggedIn={auth.isLoggedIn} onLogout={handleLogout} />
    </div>
  );
}
