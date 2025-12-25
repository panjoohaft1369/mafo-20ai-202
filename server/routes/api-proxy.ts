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
 * دریافت گزارشات (Logs) از kie.ai v1
 * Fetch user's task history
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

    console.log("[Logs] دریافت تاریخ تصاویر");

    const response = await fetch(`${KIE_AI_API_BASE}/jobs/listTasks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      console.error("[Logs] خطا - HTTP Status:", response.status);
      res.status(response.status).json({
        success: false,
        error: "خطا در دریافت گزارشات",
      });
      return;
    }

    const data = await response.json();
    console.log("[Logs] Response:", data);

    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    // Filter logs to last 2 months
    const allLogs = data?.data?.tasks || data?.tasks || [];
    const filteredLogs = allLogs.filter(
      (log: any) => {
        const logTime = log.createTime || log.timestamp;
        return logTime > twoMonthsAgo.getTime();
      }
    );

    res.json({
      success: true,
      logs: filteredLogs,
    });
  } catch (error) {
    console.error("[Logs] خطا:", error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت گزارشات",
    });
  }
}

/**
 * دریافت اطلاعات بیل (Billing) از kie.ai v1
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

    console.log("[Billing] دریافت اطلاعات اعتبار");

    const response = await fetch(`${KIE_AI_API_BASE}/users/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      console.error("[Billing] خطا - HTTP Status:", response.status);
      res.status(response.status).json({
        success: false,
        error: "خطا در دریافت اطلاعات اعتبار",
      });
      return;
    }

    const data = await response.json();
    console.log("[Billing] Response:", data);

    // Extract credit info from user profile
    const credits = data?.data?.credits || data?.credits || 0;
    const totalCredits = data?.data?.totalCredits || data?.totalCredits || 0;

    res.json({
      success: true,
      creditsRemaining: credits,
      totalCredits: totalCredits,
      usedCredits: (totalCredits - credits) || 0,
    });
  } catch (error) {
    console.error("[Billing] خطا:", error);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت اطلاعات اعتبار",
    });
  }
}

/**
 * دریافت وضعیت یک تصویر تولید شده (Task Status)
 * kie.ai v1 API - query task result
 */
export async function handleQueryTask(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const taskId = req.query.taskId as string;
    const apiKey = req.headers.authorization?.replace("Bearer ", "");

    if (!apiKey) {
      res.status(400).json({
        success: false,
        error: "کلید API یافت نشد",
      });
      return;
    }

    if (!taskId) {
      res.status(400).json({
        success: false,
        error: "Task ID یافت نشد",
      });
      return;
    }

    console.log("[Query Task] TaskID:", taskId);

    const response = await fetch(`${KIE_AI_API_BASE}/jobs/queryTask?taskId=${taskId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    console.log("[Query Task] HTTP Status:", response.status);

    const contentType = response.headers.get("content-type");
    let data: any;

    try {
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("[Query Task] غیر-JSON Response:", text.substring(0, 200));
        res.status(400).json({
          success: false,
          error: "پاسخ API نامعتبر است.",
        });
        return;
      }
    } catch (parseError) {
      console.error("[Query Task] خطا در پارس JSON:", parseError);
      res.status(400).json({
        success: false,
        error: "خطا در پاسخ API",
      });
      return;
    }

    console.log("[Query Task] Response:", data);

    if (!response.ok) {
      res.status(response.status).json({
        success: false,
        error: data?.message || "خطا در دریافت وضعیت تصویر",
      });
      return;
    }

    // Parse task result
    const taskData = data?.data || data;
    const resultJson = taskData?.resultJson ? JSON.parse(taskData.resultJson) : null;
    const imageUrl = resultJson?.resultUrls?.[0] || null;

    res.json({
      success: true,
      status: taskData?.state || "processing",
      imageUrl: imageUrl,
      message: data?.message || "موفق",
    });
  } catch (error: any) {
    console.error("[Query Task] خطا:", error.message);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت وضعیت تصویر",
    });
  }
}
