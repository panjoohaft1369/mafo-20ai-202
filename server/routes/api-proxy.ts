import { Request, Response } from "express";

// Updated to kie.ai v1 API
const KIE_AI_API_BASE = "https://api.kie.ai/api/v1";

// Demo mode برای تست بدون API Key واقعی
const DEMO_MODE = process.env.DEMO_MODE === "true";

/**
 * تایید API Key از طریق Backend
 * این تابع CORS مشکلات را حل می‌کند با استفاده از Backend بجای درخواست مستقیم از Frontend
 * kie.ai v1 API - تایید کلید API از طریق بررسی فرمت و ساختار
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

    console.log("[API] تلاش برای تایید API Key با kie.ai v1");
    console.log("[API] API Key:", apiKey.substring(0, 10) + "...");
    console.log("[API] Base URL:", KIE_AI_API_BASE);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 ثانیه timeout

    // Try to validate by making a test request to the API
    // kie.ai v1 API will reject invalid keys
    const response = await fetch(`${KIE_AI_API_BASE}/jobs/queryTask`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "User-Agent": "MAFO-Client/1.0",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log("[API] HTTP Status:", response.status);
    console.log("[API] Response Headers:", Object.fromEntries(response.headers));

    const contentType = response.headers.get("content-type");
    let data: any;

    try {
      // Handle both JSON and non-JSON responses
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("[API] غیر-JSON Response:", text.substring(0, 200));
        res.status(400).json({
          valid: false,
          message: "پاسخ API نامعتبر است. لطفا API Key را بررسی کنید.",
        });
        return;
      }
    } catch (parseError) {
      console.error("[API] خطا در پارس JSON:", parseError);
      res.status(400).json({
        valid: false,
        message: "خطا در پاسخ API. لطفا بعدا دوباره سعی کنید.",
      });
      return;
    }

    console.log("[API] Response Body:", data);

    // API key is valid if we get any response (401 = invalid key, 200 = valid)
    if (response.status === 401) {
      console.error("[API] کلید API نامعتبر");
      res.status(401).json({
        valid: false,
        message: "کد لایسنس شما معتبر نمیباشد. لطفا با پشتیبانی تماس بگیرید.",
      });
      return;
    }

    // If we got here, the key is valid (even if the endpoint returned something else)
    console.log("[API] تایید موفق!");
    res.json({
      valid: true,
      credit: data?.data?.credit || data?.credit || 100,
      email: data?.data?.email || data?.email || "user@mafo.ai",
      message: data?.message || "موفق",
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
 * kie.ai v1 API - استفاده از /api/v1/jobs/createTask
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

    console.log("[Image Gen] Creating task with model: flux-2/pro-image-to-image");
    console.log("[Image Gen] Prompt:", prompt.substring(0, 50) + "...");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 ثانیه برای generate

    const response = await fetch(
      `${KIE_AI_API_BASE}/jobs/createTask`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "flux-2/pro-image-to-image",
          input: {
            image_urls: [imageUrl],
            prompt,
            width: parseInt(width),
            height: parseInt(height),
            quality: quality || "standard",
          },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    console.log("[Image Gen] HTTP Status:", response.status);

    const contentType = response.headers.get("content-type");
    let data: any;

    try {
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("[Image Gen] غیر-JSON Response:", text.substring(0, 200));
        res.status(400).json({
          success: false,
          error: "پاسخ API نامعتبر است.",
        });
        return;
      }
    } catch (parseError) {
      console.error("[Image Gen] خطا در پارس JSON:", parseError);
      res.status(400).json({
        success: false,
        error: "خطا در پاسخ API",
      });
      return;
    }

    console.log("[Image Gen] Response:", data);

    if (!response.ok || data?.code !== 200) {
      res.status(response.status).json({
        success: false,
        error: data?.message || "خطا در ایجاد تصویر",
      });
      return;
    }

    // Return the task ID for polling
    res.json({
      success: true,
      taskId: data?.data?.taskId,
      message: data?.message || "موفق",
    });
  } catch (error: any) {
    console.error("[Image Gen] خطا:", error.message);

    if (error.name === "AbortError") {
      return res.status(504).json({
        success: false,
        error: "خطا: درخواست منقضی شد",
      });
    }

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
