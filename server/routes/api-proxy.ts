import { Request, Response } from "express";

// Updated to kie.ai v1 API
const KIE_AI_API_BASE = "https://api.kie.ai/api/v1";

// Demo mode برای تست بدون API Key واقعی
const DEMO_MODE = process.env.DEMO_MODE === "true";

/**
 * تایید API Key از طریق Backend
 * این تابع CORS مشکلات را حل می‌کند با استفاده از Backend بجای درخواست مستقیم از Frontend
 */
export async function handleValidateApiKey(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const apiKey = req.headers.authorization?.replace("Bearer ", "");

    if (!apiKey) {
      res.status(400).json({
        valid: false,
        message: "کلید API یافت نشد",
      });
      return;
    }

    // Demo mode - برای تست بدون API Key واقعی
    if (DEMO_MODE && apiKey === "demo-key-123") {
      console.log("[DEMO MODE] تایید API Key موفق");
      res.json({
        valid: true,
        credit: 100,
        email: "demo@example.com",
        message: "موفق - حالت Demo",
      });
      return;
    }

    console.log("[API] تلاش برای اتصال به kie.ai");
    console.log("[API] API Key:", apiKey.substring(0, 10) + "...");
    console.log("[API] Endpoint:", `${KIE_AI_API_BASE}/validate-key`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 ثانیه timeout

    const response = await fetch(`${KIE_AI_API_BASE}/validate-key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "User-Agent": "MAFO-Client/1.0",
      },
      body: JSON.stringify({}),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log("[API] HTTP Status:", response.status);
    console.log("[API] Response Headers:", Object.fromEntries(response.headers));

    const data = await response.json();
    console.log("[API] Response Body:", data);

    if (!response.ok) {
      console.error("[API] خطا در تایید API Key");
      res.status(response.status).json({
        valid: false,
        message: data.message || "کد لایسنس شما معتبر نمیباشد. لطفا با پشتیبانی تماس بگیرید.",
      });
      return;
    }

    console.log("[API] تایید موفق!");
    res.json({
      valid: true,
      credit: data.credit || data.credits || 0,
      email: data.email || data.user_email || "",
      message: data.message || "موفق",
    });
  } catch (error: any) {
    console.error("[API] خطا:", {
      name: error.name,
      message: error.message,
      cause: error.cause,
    });

    // اگر abort شد (timeout)
    if (error.name === "AbortError") {
      return res.status(504).json({
        valid: false,
        message: "خطا: سرویس پاسخ نداد. لطفا بعدا دوباره سعی کنید.",
      });
    }

    res.status(500).json({
      valid: false,
      message: `خطا در اتصال: ${error.message}`,
    });
  }
}

/**
 * تولید تصویر از طریق Backend
 */
export async function handleGenerateImage(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { imageUrl, prompt, width, height, quality } = req.body;
    const apiKey = req.headers.authorization?.replace("Bearer ", "");

    if (!apiKey) {
      res.status(400).json({
        success: false,
        error: "کلید API یافت نشد",
      });
      return;
    }

    const response = await fetch(
      `${KIE_AI_API_BASE}/flux-2/pro-image-to-image`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          image: imageUrl,
          prompt,
          width,
          height,
          quality,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      res.status(response.status).json({
        success: false,
        error: errorData.message || "خطا در ایجاد تصویر",
      });
      return;
    }

    const data = await response.json();
    res.json({
      success: true,
      imageUrl: data.imageUrl,
      message: data.message || "موفق",
    });
  } catch (error) {
    console.error("Image generation error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در اتصال به سرویس",
    });
  }
}

/**
 * دریافت گزارشات (Logs) از kie.ai
 */
export async function handleFetchLogs(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const apiKey = req.headers.authorization?.replace("Bearer ", "");

    if (!apiKey) {
      res.status(400).json({
        success: false,
        error: "کلید API یافت نشد",
      });
      return;
    }

    const response = await fetch(`${KIE_AI_API_BASE}/logs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      res.status(response.status).json({
        success: false,
        error: "خطا در دریافت گزارشات",
      });
      return;
    }

    const data = await response.json();
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const filteredLogs = (data.logs || []).filter(
      (log: any) => log.timestamp > twoMonthsAgo.getTime()
    );

    res.json({
      success: true,
      logs: filteredLogs,
    });
  } catch (error) {
    console.error("Logs fetch error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت گزارشات",
    });
  }
}

/**
 * دریافت اطلاعات بیل (Billing) از kie.ai
 */
export async function handleFetchBilling(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const apiKey = req.headers.authorization?.replace("Bearer ", "");

    if (!apiKey) {
      res.status(400).json({
        success: false,
        error: "کلید API یافت نشد",
      });
      return;
    }

    const response = await fetch(`${KIE_AI_API_BASE}/billing`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      res.status(response.status).json({
        success: false,
        error: "خطا در دریافت اطلاعات اعتبار",
      });
      return;
    }

    const data = await response.json();
    res.json({
      success: true,
      creditsRemaining: data.creditsRemaining || 0,
      totalCredits: data.totalCredits || 0,
      usedCredits: data.usedCredits || 0,
    });
  } catch (error) {
    console.error("Billing fetch error:", error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت اطلاعات اعتبار",
    });
  }
}
