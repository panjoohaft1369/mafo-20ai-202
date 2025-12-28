import { Request, Response } from "express";

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
 * Handle user registration
 * TODO: This endpoint should:
 * 1. Validate input data
 * 2. Check if email already exists in database
 * 3. Hash password using bcrypt
 * 4. Store user record in database with "pending" status
 * 5. Send confirmation email (optional)
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

    // TODO: Database Integration Required
    // ======================================
    // At this point, you need to:
    //
    // 1. Connect to a database (Supabase, Neon, or similar)
    // 2. Check if email already exists:
    //    const existingUser = await db.query('SELECT * FROM users WHERE email = ?', [email])
    //    if (existingUser) {
    //      return res.status(409).json({ error: "ایمیل قبلا ثبت شده است" })
    //    }
    //
    // 3. Hash the password using bcrypt:
    //    const hashedPassword = await bcrypt.hash(password, 10)
    //
    // 4. Normalize phone number:
    const normalizedPhone = normalizePhone(phone);
    //
    // 5. Insert user into database with "pending" status:
    //    await db.query(
    //      'INSERT INTO users (name, email, password_hash, phone, brand_name, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    //      [name, email.toLowerCase(), hashedPassword, normalizedPhone, brandName, 'pending', new Date()]
    //    )
    //
    // 6. (Optional) Send confirmation email
    // ======================================

    // For now, return a mock success response
    console.log("[Register] User registered successfully (mock)");
    console.log("[Register] Normalized Phone:", normalizedPhone);

    res.status(201).json({
      success: true,
      message:
        "ثبت نام موفق! لطفا براي تاييد اشتراك خود قوانين و مقررات استفاده از سايت را بپذيريد و منتظر تائيد تيم پشتيباني باشيد.",
      data: {
        email: email.toLowerCase(),
        name: name.trim(),
        phone: normalizedPhone,
        brandName: brandName.trim(),
        status: "pending",
      },
    });
  } catch (error: any) {
    console.error("[Register] خطا:", error.message);
    console.error("[Register] Stack:", error.stack);

    res.status(500).json({
      success: false,
      error:
        error.message ||
        "خطا در ثبت نام. لطفا دوباره سعی کنید.",
    });
  }
}

/**
 * TODO: Add additional auth endpoints as needed:
 * - handleLogin: Authenticate user with email and password
 * - handleForgotPassword: Send password reset email
 * - handleResetPassword: Reset password with token
 * - handleVerifyEmail: Verify email with token
 */
