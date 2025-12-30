import { Request, Response } from "express";
import * as crypto from "crypto";
import * as bcrypt from "bcrypt";
import { supabase } from "../utils/supabase-client.js";

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

    // Fetch users from database (without nested api_keys)
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select(
        `
        id,
        name,
        email,
        phone,
        brand_name,
        status,
        credits,
        created_at
      `,
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (usersError) {
      console.error("[Admin Users] Database error:", usersError.message);
      res.status(500).json({
        success: false,
        error: "خطا در دریافت کاربران",
      });
      return;
    }

    // Fetch all API keys at once
    const { data: apiKeysData } = await supabase
      .from("api_keys")
      .select("id, user_id, key, is_active, created_at");

    // Create a map of user IDs to their API keys
    const apiKeysByUser: { [userId: string]: any[] } = {};
    if (apiKeysData) {
      apiKeysData.forEach((key: any) => {
        if (!apiKeysByUser[key.user_id]) {
          apiKeysByUser[key.user_id] = [];
        }
        apiKeysByUser[key.user_id].push({
          id: key.id,
          key: key.key,
          createdAt: key.created_at,
          isActive: key.is_active,
        });
      });
    }

    // Format response
    const users =
      usersData?.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        brandName: user.brand_name,
        status: user.status,
        createdAt: user.created_at,
        apiKeys: apiKeysByUser[user.id] || [],
        credits: user.credits,
        role: user.role || "user",
      })) || [];

    console.log("[Admin] Successfully fetched", users.length, "users");
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

    // Fetch user from database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(
        `
        id,
        name,
        email,
        phone,
        brand_name,
        status,
        credits,
        created_at
      `,
      )
      .eq("id", userId)
      .is("deleted_at", null)
      .single();

    if (userError) {
      console.error("[Admin User] Database error:", userError.message);
      res.status(404).json({
        success: false,
        error: "کاربر یافت نشد",
      });
      return;
    }

    // Fetch API keys separately
    const { data: apiKeysData, error: apiKeysError } = await supabase
      .from("api_keys")
      .select("id, key, is_active, created_at")
      .eq("user_id", userId);

    if (apiKeysError) {
      console.error("[Admin API Keys] Database error:", apiKeysError.message);
      // Continue without API keys rather than failing completely
    }

    // Format response
    const user = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      brandName: userData.brand_name,
      status: userData.status,
      createdAt: userData.created_at,
      apiKeys: (apiKeysData || []).map((key: any) => ({
        id: key.id,
        key: key.key,
        createdAt: key.created_at,
        isActive: key.is_active,
      })),
      credits: userData.credits,
      role: "user",
    };

    console.log("[Admin] Successfully fetched user:", userId);
    res.json({
      success: true,
      user,
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
 * Get user password for editing
 */
export async function handleAdminGetUserPassword(
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

    console.log("[Admin] Fetching password for user:", userId);

    // Fetch user password from database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("password")
      .eq("id", userId)
      .is("deleted_at", null)
      .single();

    if (userError) {
      console.error("[Admin Password] Database error:", userError.message);
      res.status(404).json({
        success: false,
        error: "کاربر یافت نشد",
      });
      return;
    }

    // Return the password (it's stored as bcrypt hash, but we return it for display)
    res.json({
      success: true,
      password: userData.password || "",
    });
  } catch (error: any) {
    console.error("[Admin Password] Error:", error.message);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت رمز عبور",
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

    // Update in database
    const { error } = await supabase
      .from("users")
      .update({ credits })
      .eq("id", userId);

    if (error) {
      console.error("[Admin Credits] Database error:", error.message);
      res.status(500).json({
        success: false,
        error: "خطا در بروزرسانی اعتبار",
      });
      return;
    }

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
    const newApiKeyValue =
      apiKey || `mafo_${crypto.randomBytes(16).toString("hex")}`;

    // Insert into database
    const { data, error } = await supabase
      .from("api_keys")
      .insert([
        {
          user_id: userId,
          key: newApiKeyValue,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[Admin API Key] Database error:", error.message);
      res.status(500).json({
        success: false,
        error: "خطا در افزودن کلید API",
      });
      return;
    }

    const newApiKey = {
      id: data.id,
      key: data.key,
      createdAt: data.created_at,
      isActive: data.is_active,
    };

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

    // Delete from database
    const { error } = await supabase
      .from("api_keys")
      .delete()
      .eq("id", keyId)
      .eq("user_id", userId);

    if (error) {
      console.error("[Admin Delete Key] Database error:", error.message);
      res.status(500).json({
        success: false,
        error: "خطا در حذف کلید API",
      });
      return;
    }

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

    // Update in database
    const { error } = await supabase
      .from("users")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("[Admin Approve] Database error:", error.message);
      res.status(500).json({
        success: false,
        error: "خطا در تایید کاربر",
      });
      return;
    }

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
    const { name, email, phone, password, brandName, role = "user" } = req.body;

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

    console.log("[Admin] Creating new user:", email, "role:", role);

    // Check if email already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .is("deleted_at", null)
      .single();

    if (existing) {
      return res.status(409).json({
        success: false,
        error: "ایمیل قبلا ثبت شده است",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          password_hash: hashedPassword,
          phone,
          brand_name: brandName,
          status: "approved",
          credits: 0,
          role: role === "admin" ? "admin" : "user",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[Admin Create User] Database error:", error.message);
      res.status(500).json({
        success: false,
        error: "خطا در افزودن کاربر",
      });
      return;
    }

    const newUser = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      brandName: data.brand_name,
      status: data.status,
      createdAt: data.created_at,
      apiKeys: [],
      credits: data.credits,
      role: data.role || "user",
    };

    console.log("[Admin] User created successfully with role:", newUser.role);

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
    const { name, email, phone, brandName, password } = req.body;

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

    // Validate password if provided
    if (password) {
      if (password.length < 8) {
        res.status(400).json({
          success: false,
          error: "رمز عبور باید حداقل 8 کاراکتر باشد",
        });
        return;
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(password)) {
        res.status(400).json({
          success: false,
          error: "رمز عبور باید شامل حروف بزرگ، کوچک و اعداد باشد",
        });
        return;
      }
    }

    console.log("[Admin] Updating user:", userId);

    // Check if email is already in use by another user
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .neq("id", userId)
      .is("deleted_at", null)
      .single();

    if (existing) {
      return res.status(409).json({
        success: false,
        error: "این ایمیل توسط کاربر دیگری استفاده می‌شود",
      });
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      phone,
      brand_name: brandName,
      updated_at: new Date().toISOString(),
    };

    // Add hashed password if provided
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
      console.log("[Admin] Password will be updated for user:", userId);
    }

    // Update in database
    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select(
        `
        id,
        name,
        email,
        phone,
        brand_name,
        status,
        credits,
        created_at,
        api_keys:api_keys(id, key, is_active, created_at)
      `,
      )
      .single();

    if (error) {
      console.error("[Admin Update User] Database error:", error.message);
      res.status(500).json({
        success: false,
        error: "خطا در ویرایش کاربر",
      });
      return;
    }

    const updatedUser = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      brandName: data.brand_name,
      status: data.status,
      createdAt: data.created_at,
      apiKeys: data.api_keys || [],
      credits: data.credits,
      role: data.role || "user",
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

    // Soft delete - mark as deleted
    const { error } = await supabase
      .from("users")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("[Admin Delete User] Database error:", error.message);
      res.status(500).json({
        success: false,
        error: "خطا در حذف کاربر",
      });
      return;
    }

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

/**
 * Get all generated images with pagination and search
 */
export async function handleAdminGetGeneratedImages(
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

    const {
      page = "1",
      pageSize = "20",
      searchUser = "",
    } = req.query as Record<string, string>;

    const pageNum = parseInt(page) || 1;
    const size = parseInt(pageSize) || 20;
    const offset = (pageNum - 1) * size;

    console.log("[Admin Gallery] Fetching generated images", {
      page: pageNum,
      pageSize: size,
      searchUser,
    });

    // Build query
    let query = supabase
      .from("generated_images")
      .select(
        `
        id,
        user_id,
        task_id,
        image_url,
        prompt,
        status,
        aspect_ratio,
        resolution,
        credit_cost,
        created_at,
        users:user_id(id, name, email, phone, brand_name)
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false });

    // Apply search filter if provided
    if (searchUser.trim()) {
      const trimmedSearch = searchUser.toLowerCase();
      // We'll filter by user name or email in the response
      const { data: matchingUsers } = await supabase
        .from("users")
        .select("id")
        .or(`name.ilike.%${trimmedSearch}%,email.ilike.%${trimmedSearch}%`);

      if (matchingUsers && matchingUsers.length > 0) {
        const userIds = matchingUsers.map((u: any) => u.id);
        query = query.in("user_id", userIds);
      } else {
        // No matching users found
        return res.json({
          success: true,
          images: [],
          total: 0,
          page: pageNum,
          pageSize: size,
          totalPages: 0,
        });
      }
    }

    // Get total count and paginated data
    const { data, count, error } = await query.range(offset, offset + size - 1);

    if (error) {
      console.error("[Admin Gallery] Database error:", error.message);
      res.status(500).json({
        success: false,
        error: "خطا در دریافت تصاویر",
      });
      return;
    }

    const totalPages = Math.ceil((count || 0) / size);

    // Format response
    const images =
      data?.map((img: any) => ({
        id: img.id,
        userId: img.user_id,
        taskId: img.task_id,
        imageUrl: img.image_url,
        prompt: img.prompt,
        status: img.status,
        aspectRatio: img.aspect_ratio,
        resolution: img.resolution,
        creditCost: img.credit_cost,
        createdAt: img.created_at,
        user: {
          id: img.users?.id,
          name: img.users?.name,
          email: img.users?.email,
          phone: img.users?.phone,
          brandName: img.users?.brand_name,
        },
      })) || [];

    res.json({
      success: true,
      images,
      total: count || 0,
      page: pageNum,
      pageSize: size,
      totalPages,
    });
  } catch (error: any) {
    console.error("[Admin Gallery] Error:", error.message);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت تصاویر",
    });
  }
}
