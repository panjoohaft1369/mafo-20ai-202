import { Request, Response } from "express";
import * as bcrypt from "bcrypt";
import { supabase } from "../utils/supabase-client.js";

/**
 * Basic email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
function isValidPassword(password: string): boolean {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Validate phone number (Iranian format)
 */
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+98|0)?9\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * Normalize phone number to 0-based format
 */
function normalizePhone(phone: string): string {
  // Remove +98 prefix and replace with 0
  if (phone.startsWith("+98")) {
    return "0" + phone.substring(3);
  }
  // If already starts with 09, keep as is
  if (phone.startsWith("09")) {
    return phone;
  }
  // If starts with 9, add 0
  if (phone.startsWith("9")) {
    return "0" + phone;
  }
  return phone;
}

/**
 * Handle user login with email and password
 */
export async function handleLogin(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    console.log("[Login] Login attempt for email:", email);

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: "ایمیل و رمز عبور الزامی هستند",
      });
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      res.status(400).json({
        success: false,
        error: "ایمیل معتبر نیست",
      });
      return;
    }

    const lowerEmail = email.toLowerCase();

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select(
        `
        id,
        name,
        email,
        phone,
        brand_name,
        password_hash,
        status,
        credits,
        created_at,
        api_keys:api_keys(id, key, is_active, created_at)
      `,
      )
      .eq("email", lowerEmail)
      .is("deleted_at", null)
      .single();

    if (userError || !user) {
      console.error("[Login] User not found:", lowerEmail, userError);
      res.status(401).json({
        success: false,
        error: "ایمیل یا رمز عبور نادرست است",
      });
      return;
    }

    // Check if user is approved
    if (user.status !== "approved") {
      console.error("[Login] User not approved:", user.status);
      res.status(403).json({
        success: false,
        error:
          "حساب کاربری شما هنوز تایید نشده است. لطفا منتظر تایید تیم پشتیبانی باشید.",
      });
      return;
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      console.error("[Login] Invalid password for:", lowerEmail);
      res.status(401).json({
        success: false,
        error: "ایمیل یا رمز عبور نادرست است",
      });
      return;
    }

    // Get user's API key
    let userApiKey = null;
    if (user.api_keys && user.api_keys.length > 0) {
      const activeKey = user.api_keys.find((k: any) => k.is_active);
      userApiKey = activeKey ? activeKey.key : user.api_keys[0].key;
    }

    // If user has no API key, create one
    if (!userApiKey) {
      const newKey = `mafo_${require("crypto").randomBytes(16).toString("hex")}`;
      const { data: newApiKey, error: keyError } = await supabase
        .from("api_keys")
        .insert([
          {
            user_id: user.id,
            key: newKey,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (!keyError && newApiKey) {
        userApiKey = newApiKey.key;
      }
    }

    console.log("[Login] Successful login for:", lowerEmail);

    // Get role if it exists, otherwise default to "user"
    let userRole = "user";
    if (user.role) {
      userRole = user.role;
    }

    res.json({
      success: true,
      message: "ورود موفق",
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        brandName: user.brand_name,
        status: user.status,
        credits: user.credits,
        role: userRole,
        apiKey: userApiKey,
      },
    });
  } catch (error: any) {
    console.error("[Login] Error:", error.message);
    res.status(500).json({
      success: false,
      error: "خطا در ورود. لطفا دوباره سعی کنید.",
    });
  }
}

/**
 * Handle user profile update
 */
export async function handleUpdateProfile(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { userId, name, email, phone, brandName } = req.body;

    console.log("[UpdateProfile] Update attempt for user:", userId);

    // Validate required fields
    if (!userId) {
      res.status(400).json({
        success: false,
        error: "شناسه کاربری الزامی است",
      });
      return;
    }

    // Validate name if provided
    if (name && (typeof name !== "string" || name.trim().length < 3)) {
      res.status(400).json({
        success: false,
        error: "نام باید حداقل 3 کاراکتر باشد",
      });
      return;
    }

    // Validate email if provided
    if (email && !isValidEmail(email)) {
      res.status(400).json({
        success: false,
        error: "ایمیل معتبر نیست",
      });
      return;
    }

    // Validate phone if provided
    if (phone && !isValidPhone(phone)) {
      res.status(400).json({
        success: false,
        error: "شماره تماس معتبر نیست. لطفا با 09 شروع کنید.",
      });
      return;
    }

    // Validate brand name if provided
    if (
      brandName &&
      (typeof brandName !== "string" || brandName.trim().length < 2)
    ) {
      res.status(400).json({
        success: false,
        error: "نام برند باید حداقل 2 کاراکتر باشد",
      });
      return;
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase();
    if (phone) updateData.phone = normalizePhone(phone);
    if (brandName) updateData.brand_name = brandName.trim();

    // Check if email is already taken by another user
    if (email) {
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email.toLowerCase())
        .neq("id", userId)
        .is("deleted_at", null)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("[UpdateProfile] Database error:", checkError.message);
        res.status(500).json({
          success: false,
          error: "خطا در بررسی ایمیل",
        });
        return;
      }

      if (existingUser) {
        res.status(409).json({
          success: false,
          error: "ایمیل قبلا ثبت شده است",
        });
        return;
      }
    }

    // Update user in database
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select("id, name, email, phone, brand_name, credits, status")
      .single();

    if (error) {
      console.error("[UpdateProfile] Database error:", error.message);
      res.status(500).json({
        success: false,
        error: "خطا در به‌روزرسانی پروفایل. لطفا دوباره سعی کنید.",
      });
      return;
    }

    console.log("[UpdateProfile] Successfully updated user:", userId);

    res.json({
      success: true,
      message: "پروفایل با موفقیت به‌روزرسانی شد",
      data: {
        userId: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        brandName: updatedUser.brand_name,
        credits: updatedUser.credits,
        status: updatedUser.status,
      },
    });
  } catch (error: any) {
    console.error("[UpdateProfile] Error:", error.message);
    res.status(500).json({
      success: false,
      error: "خطا در به‌روزرسانی پروفایل. لطفا دوباره سعی کنید.",
    });
  }
}

/**
 * Handle user password change
 */
export async function handleChangePassword(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { userId, currentPassword, newPassword, confirmPassword } = req.body;

    console.log("[ChangePassword] Password change attempt for user:", userId);

    // Validate required fields
    if (!userId || !currentPassword || !newPassword || !confirmPassword) {
      res.status(400).json({
        success: false,
        error: "تمام فیلدها الزامی هستند",
      });
      return;
    }

    // Validate password strength
    if (!isValidPassword(newPassword)) {
      res.status(400).json({
        success: false,
        error:
          "رمز عبور باید حداقل 8 کاراکتر و شامل حروف بزرگ، کوچک و اعداد باشد",
      });
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      res.status(400).json({
        success: false,
        error: "رمز عبور جدید و تکرار آن مطابقت ندارند",
      });
      return;
    }

    // Check if new password is same as current password
    if (currentPassword === newPassword) {
      res.status(400).json({
        success: false,
        error: "رمز عبور جدید نمی‌تواند همان رمز عبور فعلی باشد",
      });
      return;
    }

    // Fetch user from database
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, password_hash")
      .eq("id", userId)
      .is("deleted_at", null)
      .single();

    if (userError || !user) {
      console.error("[ChangePassword] User not found:", userId, userError);
      res.status(404).json({
        success: false,
        error: "کاربر یافت نشد",
      });
      return;
    }

    // Verify current password
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password_hash,
    );

    if (!isPasswordCorrect) {
      console.log(
        "[ChangePassword] Invalid current password for user:",
        userId,
      );
      res.status(401).json({
        success: false,
        error: "رمز عبور فعلی نادرست است",
      });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: hashedPassword })
      .eq("id", userId)
      .is("deleted_at", null);

    if (updateError) {
      console.error("[ChangePassword] Database error:", updateError.message);
      res.status(500).json({
        success: false,
        error: "خطا در تغییر رمز عبور. لطفا دوباره سعی کنید.",
      });
      return;
    }

    console.log(
      "[ChangePassword] Successfully changed password for user:",
      userId,
    );

    res.json({
      success: true,
      message: "رمز عبور با موفقیت تغییر کرد. لطفا دوباره وارد شوید.",
    });
  } catch (error: any) {
    console.error("[ChangePassword] Error:", error.message);
    res.status(500).json({
      success: false,
      error: "خطا در تغییر رمز عبور. لطفا دوباره سعی کنید.",
    });
  }
}

/**
 * Handle user registration
 */
export async function handleRegister(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { name, phone, email, password, brandName } = req.body;

    console.log("[Register] New registration attempt");
    console.log("[Register] Email:", email);
    console.log("[Register] Phone:", phone);
    console.log("[Register] Name:", name);
    console.log("[Register] Brand Name:", brandName);

    // Validate required fields
    if (!name || !phone || !email || !password || !brandName) {
      res.status(400).json({
        success: false,
        error: "تمام فیلدها الزامی هستند",
      });
      return;
    }

    // Validate name
    if (typeof name !== "string" || name.trim().length < 3) {
      res.status(400).json({
        success: false,
        error: "نام باید حداقل 3 کاراکتر باشد",
      });
      return;
    }

    // Validate phone
    if (!isValidPhone(phone)) {
      res.status(400).json({
        success: false,
        error: "شماره تماس معتبر نیست. لطفا با 09 شروع کنید.",
      });
      return;
    }

    // Validate email
    if (!isValidEmail(email)) {
      res.status(400).json({
        success: false,
        error: "ایمیل معتبر نیست",
      });
      return;
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      res.status(400).json({
        success: false,
        error:
          "رمز عبور باید حداقل 8 کاراکتر و شامل حروف بزرگ، کوچک و اعداد باشد",
      });
      return;
    }

    // Validate brand name
    if (typeof brandName !== "string" || brandName.trim().length < 2) {
      res.status(400).json({
        success: false,
        error: "نام برند باید حداقل 2 کاراکتر باشد",
      });
      return;
    }

    // Normalize phone number
    const normalizedPhone = normalizePhone(phone);
    const lowerEmail = email.toLowerCase();

    // Check if email already exists in database
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", lowerEmail)
      .is("deleted_at", null)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "not found" error, which is what we want
      console.error("[Register] Database error:", checkError.message);
      res.status(500).json({
        success: false,
        error: "خطا در بررسی ایمیل",
      });
      return;
    }

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: "ایمیل قبلا ثبت شده است",
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database with "pending" status
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name: name.trim(),
          email: lowerEmail,
          password_hash: hashedPassword,
          phone: normalizedPhone,
          brand_name: brandName.trim(),
          status: "pending",
          credits: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[Register] Database error:", error.message);
      res.status(500).json({
        success: false,
        error: "خطا در ثبت نام. لطفا دوباره سعی کنید.",
      });
      return;
    }

    console.log("[Register] User registered successfully:", data.id);

    res.status(201).json({
      success: true,
      message:
        "ثبت نام موفق! لطفا براي تاييد اشتراك خود قوانين و مقررات استفاده از سايت را بپذيريد و منتظر تائيد تيم پشتيباني باشيد.",
      data: {
        id: data.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        brandName: data.brand_name,
        status: data.status,
      },
    });
  } catch (error: any) {
    console.error("[Register] خطا:", error.message);
    console.error("[Register] Stack:", error.stack);

    res.status(500).json({
      success: false,
      error: error.message || "خطا در ثبت نام. لطفا دوباره سعی کنید.",
    });
  }
}

/**
 * Handle fetching current user profile (for syncing credits and user info)
 * Uses API key authentication
 */
export async function handleGetUserProfile(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const apiKey = req.headers.authorization?.replace("Bearer ", "");

    if (!apiKey) {
      res.status(401).json({
        success: false,
        error: "API key is required",
      });
      return;
    }

    // Find user by API key
    const { data: apiKeyData, error: keyError } = await supabase
      .from("api_keys")
      .select("user_id")
      .eq("key", apiKey)
      .eq("is_active", true)
      .single();

    if (keyError || !apiKeyData) {
      console.error("[GetUserProfile] Invalid API key:", keyError);
      res.status(401).json({
        success: false,
        error: "Invalid API key",
      });
      return;
    }

    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select(
        `
        id,
        name,
        email,
        phone,
        brand_name,
        credits,
        status,
        role
      `,
      )
      .eq("id", apiKeyData.user_id)
      .is("deleted_at", null)
      .single();

    if (userError || !user) {
      console.error("[GetUserProfile] User not found:", userError);
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        brandName: user.brand_name,
        credits: user.credits,
        status: user.status,
        role: user.role || "user",
      },
    });
  } catch (error: any) {
    console.error("[GetUserProfile] Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Error fetching user profile",
    });
  }
}
