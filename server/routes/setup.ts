import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";

const CONFIG_FILE = path.join(process.cwd(), "public", "config.json");

/**
 * Get current Supabase configuration
 */
export async function handleGetConfig(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    let config = {
      configured: false,
      supabaseUrl: "",
    };

    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, "utf-8");
      config = JSON.parse(content);
    }

    res.json(config);
  } catch (error: any) {
    console.error("[Setup] Error reading config:", error.message);
    res.status(500).json({
      success: false,
      error: "خطا در خواندن پیکربندی",
    });
  }
}

/**
 * Save Supabase configuration
 */
export async function handleSetupConfigure(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { supabaseUrl, anonKey, serviceRoleKey } = req.body;

    console.log("[Setup] Configuring Supabase...");

    // Validate inputs
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return res.status(400).json({
        success: false,
        error: "تمام فیلدها الزامی هستند",
      });
    }

    // Validate URL format
    if (!supabaseUrl.startsWith("https://")) {
      return res.status(400).json({
        success: false,
        error: "URL باید با https:// شروع شود",
      });
    }

    // Create config object
    const config = {
      configured: true,
      supabaseUrl,
      anonKey,
      serviceRoleKey,
      configuredAt: new Date().toISOString(),
    };

    // Ensure directory exists
    const configDir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Write config file
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));

    console.log("[Setup] ✅ Configuration saved successfully");

    res.json({
      success: true,
      message: "پیکربندی با موفقیت ذخیره شد",
    });
  } catch (error: any) {
    console.error("[Setup] Error saving config:", error.message);
    res.status(500).json({
      success: false,
      error: "خطا در ذخیره پیکربندی",
    });
  }
}
