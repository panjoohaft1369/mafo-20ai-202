import { Request, Response } from "express";
import * as crypto from "crypto";

// Hardcoded admin credentials
const ADMIN_USERNAME = "panjoohaft";
const ADMIN_PASSWORD = "@Msgh1369";

/**
 * Generate a JWT-like token for admin authentication
 * In production, use a proper JWT library
 */
function generateAdminToken(): string {
  const token = crypto.randomBytes(32).toString("hex");
  const timestamp = Date.now();
  // Simple token format: token_timestamp
  return `${token}_${timestamp}`;
}

/**
 * Verify admin token
 * In production, use proper JWT verification
 */
function verifyAdminToken(token: string): boolean {
  if (!token) return false;

  // Check if token is stored in a session/cache
  // For now, just check if it looks valid (contains underscore)
  return token.includes("_") && token.length > 32;
}

/**
 * Handle admin login
 */
export async function handleAdminLogin(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { username, password } = req.body;

    console.log("[Admin Login] Login attempt for username:", username);

    if (!username || !password) {
      res.status(400).json({
        success: false,
        error: "نام کاربری و رمز عبور الزامی هستند",
      });
      return;
    }

    // Verify credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      console.error("[Admin Login] Invalid credentials for:", username);
      res.status(401).json({
        success: false,
        error: "نام کاربری یا رمز عبور نادرست است",
      });
      return;
    }

    // Generate token
    const token = generateAdminToken();

    // TODO: Store token in cache/session with expiration (e.g., 24 hours)
    // For now, tokens are valid as long as they exist

    console.log("[Admin Login] Successful login for admin");

    res.json({
      success: true,
      message: "ورود موفق",
      token,
    });
  } catch (error: any) {
    console.error("[Admin Login] Error:", error.message);
    res.status(500).json({
      success: false,
      error: "خطا در ورود",
    });
  }
}

/**
 * Verify admin token
 */
export async function handleAdminVerify(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token || !verifyAdminToken(token)) {
      res.status(401).json({
        success: false,
        error: "توکن نامعتبر است",
      });
      return;
    }

    res.json({
      success: true,
      message: "توکن معتبر است",
    });
  } catch (error: any) {
    console.error("[Admin Verify] Error:", error.message);
    res.status(500).json({
      success: false,
      error: "خطا در تایید توکن",
    });
  }
}

/**
 * Get all users (requires admin authentication)
 */
export async function handleAdminGetUsers(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token || !verifyAdminToken(token)) {
      res.status(401).json({
        success: false,
        error: "توکن نامعتبر است",
      });
      return;
    }

    console.log("[Admin] Fetching all users");

    // TODO: Fetch from database
    // const users = await db.query('SELECT * FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC');

    // Mock data for now
    const users = [
      {
        id: "1",
        name: "علی محمدی",
        email: "ali@example.com",
        phone: "09123456789",
        brandName: "شرکت الفا",
        status: "pending",
        createdAt: "2025-01-20",
        apiKeys: [],
        credits: 0,
      },
      {
        id: "2",
        name: "فاطمه احمدی",
        email: "fateme@example.com",
        phone: "09987654321",
        brandName: "استودیو بتا",
        status: "approved",
        createdAt: "2025-01-15",
        apiKeys: [{ id: "k1", key: "key_abc123", createdAt: "2025-01-15", isActive: true }],
        credits: 100,
      },
    ];

    res.json({
      success: true,
      users,
    });
  } catch (error: any) {
    console.error("[Admin Users] Error:", error.message);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت کاربران",
    });
  }
}

/**
 * Get specific user
 */
export async function handleAdminGetUser(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const { userId } = req.params;

    if (!token || !verifyAdminToken(token)) {
      res.status(401).json({
        success: false,
        error: "توکن نامعتبر است",
      });
      return;
    }

    console.log("[Admin] Fetching user:", userId);

    // TODO: Fetch from database
    // const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

    // Mock data for now
    const mockUser = {
      id: userId,
      name: "علی محمدی",
      email: "ali@example.com",
      phone: "09123456789",
      brandName: "شرکت الفا",
      status: "pending",
      createdAt: "2025-01-20",
      apiKeys: [],
      credits: 0,
    };

    res.json({
      success: true,
      user: mockUser,
    });
  } catch (error: any) {
    console.error("[Admin User] Error:", error.message);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت اطلاعات کاربر",
    });
  }
}

/**
 * Update user credits
 */
export async function handleAdminUpdateCredits(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const { userId } = req.params;
    const { credits } = req.body;

    if (!token || !verifyAdminToken(token)) {
      res.status(401).json({
        success: false,
        error: "توکن نامعتبر است",
      });
      return;
    }

    if (typeof credits !== "number" || credits < 0) {
      res.status(400).json({
        success: false,
        error: "مقدار اعتبار باید عدد مثبت باشد",
      });
      return;
    }

    console.log("[Admin] Updating credits for user:", userId, "to:", credits);

    // TODO: Update in database
    // await db.query('UPDATE users SET credits = ? WHERE id = ?', [credits, userId]);

    res.json({
      success: true,
      message: "اعتبار به روزرسانی شد",
      data: {
        userId,
        credits,
      },
    });
  } catch (error: any) {
    console.error("[Admin Credits] Error:", error.message);
    res.status(500).json({
      success: false,
      error: "خطا در بروزرسانی اعتبار",
    });
  }
}

/**
 * Add API key to user
 */
export async function handleAdminAddApiKey(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const { userId } = req.params;
    const { apiKey } = req.body;

    if (!token || !verifyAdminToken(token)) {
      res.status(401).json({
        success: false,
        error: "توکن نامعتبر است",
      });
      return;
    }

    console.log("[Admin] Adding API key to user:", userId);

    // Generate or use provided API key
    const newApiKey = {
      id: `key_${Date.now()}`,
      key:
        apiKey ||
        `mafo_${crypto.randomBytes(16).toString("hex")}`,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    // TODO: Save to database
    // await db.query('INSERT INTO api_keys (user_id, key, created_at) VALUES (?, ?, ?)', 
    //   [userId, newApiKey.key, newApiKey.createdAt]);

    res.json({
      success: true,
      message: "کلید API افزوده شد",
      apiKey: newApiKey,
    });
  } catch (error: any) {
    console.error("[Admin API Key] Error:", error.message);
    res.status(500).json({
      success: false,
      error: "خطا در افزودن کلید API",
    });
  }
}

/**
 * Delete API key
 */
export async function handleAdminDeleteApiKey(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const { userId, keyId } = req.params;

    if (!token || !verifyAdminToken(token)) {
      res.status(401).json({
        success: false,
        error: "توکن نامعتبر است",
      });
      return;
    }

    console.log("[Admin] Deleting API key:", keyId, "from user:", userId);

    // TODO: Delete from database
    // await db.query('DELETE FROM api_keys WHERE id = ? AND user_id = ?', [keyId, userId]);

    res.json({
      success: true,
      message: "کلید API حذف شد",
    });
  } catch (error: any) {
    console.error("[Admin Delete Key] Error:", error.message);
    res.status(500).json({
      success: false,
      error: "خطا در حذف کلید API",
    });
  }
}

/**
 * Approve user
 */
export async function handleAdminApproveUser(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const { userId } = req.params;

    if (!token || !verifyAdminToken(token)) {
      res.status(401).json({
        success: false,
        error: "توکن نامعتبر است",
      });
      return;
    }

    console.log("[Admin] Approving user:", userId);

    // TODO: Update in database
    // await db.query('UPDATE users SET status = ?, approved_at = ? WHERE id = ?',
    //   ['approved', new Date(), userId]);

    res.json({
      success: true,
      message: "کاربر تایید شد",
    });
  } catch (error: any) {
    console.error("[Admin Approve] Error:", error.message);
    res.status(500).json({
      success: false,
      error: "خطا در تایید کاربر",
    });
  }
}

/**
 * Create new user
 */
export async function handleAdminCreateUser(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const { name, email, phone, password, brandName } = req.body;

    if (!token || !verifyAdminToken(token)) {
      res.status(401).json({
        success: false,
        error: "توکن نامعتبر است",
      });
      return;
    }

    // Validate required fields
    if (!name || !email || !phone || !password || !brandName) {
      res.status(400).json({
        success: false,
        error: "تمام فیلدها الزامی هستند",
      });
      return;
    }

    console.log("[Admin] Creating new user:", email);

    // TODO: Check if email already exists
    // const existing = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    // if (existing) {
    //   return res.status(409).json({ error: "ایمیل قبلا ثبت شده است" });
    // }

    // TODO: Hash password and insert user
    // const hashedPassword = await bcrypt.hash(password, 10);
    // await db.query(
    //   'INSERT INTO users (name, email, password_hash, phone, brand_name, status, credits, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    //   [name, email, hashedPassword, phone, brandName, 'approved', 0, new Date()]
    // );

    // Mock response
    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      phone,
      brandName,
      status: "approved",
      createdAt: new Date().toISOString(),
      apiKeys: [],
      credits: 0,
    };

    console.log("[Admin] User created successfully");

    res.status(201).json({
      success: true,
      message: "کاربر با موفقیت افزوده شد",
      user: newUser,
    });
  } catch (error: any) {
    console.error("[Admin Create User] Error:", error.message);
    res.status(500).json({
      success: false,
      error: "خطا در افزودن کاربر",
    });
  }
}

/**
 * Update user
 */
export async function handleAdminUpdateUser(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const { userId } = req.params;
    const { name, email, phone, brandName } = req.body;

    if (!token || !verifyAdminToken(token)) {
      res.status(401).json({
        success: false,
        error: "توکن نامعتبر است",
      });
      return;
    }

    // Validate required fields
    if (!name || !email || !phone || !brandName) {
      res.status(400).json({
        success: false,
        error: "تمام فیلدها الزامی هستند",
      });
      return;
    }

    console.log("[Admin] Updating user:", userId);

    // TODO: Update in database
    // await db.query(
    //   'UPDATE users SET name = ?, email = ?, phone = ?, brand_name = ? WHERE id = ?',
    //   [name, email, phone, brandName, userId]
    // );

    // Mock response - return updated user
    const updatedUser = {
      id: userId,
      name,
      email,
      phone,
      brandName,
      status: "approved",
      createdAt: new Date().toISOString(),
      apiKeys: [],
      credits: 0,
    };

    console.log("[Admin] User updated successfully");

    res.json({
      success: true,
      message: "کاربر با موفقیت بروزرسانی شد",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("[Admin Update User] Error:", error.message);
    res.status(500).json({
      success: false,
      error: "خطا در ویرایش کاربر",
    });
  }
}

/**
 * Delete user
 */
export async function handleAdminDeleteUser(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const { userId } = req.params;

    if (!token || !verifyAdminToken(token)) {
      res.status(401).json({
        success: false,
        error: "توکن نامعتبر است",
      });
      return;
    }

    console.log("[Admin] Deleting user:", userId);

    // TODO: Delete from database (soft delete recommended)
    // await db.query('UPDATE users SET deleted_at = ? WHERE id = ?', [new Date(), userId]);
    // Or hard delete:
    // await db.query('DELETE FROM users WHERE id = ?', [userId]);

    console.log("[Admin] User deleted successfully");

    res.json({
      success: true,
      message: "کاربر با موفقیت حذف شد",
    });
  } catch (error: any) {
    console.error("[Admin Delete User] Error:", error.message);
    res.status(500).json({
      success: false,
      error: "خطا در حذف کاربر",
    });
  }
}
