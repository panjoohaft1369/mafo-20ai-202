import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";

// Updated to kie.ai v1 API
const KIE_AI_API_BASE = "https://api.kie.ai/api/v1";

// Demo mode برای تست بدون API Key واقعی
const DEMO_MODE = process.env.DEMO_MODE === "true";

// Task results storage file
const tasksDir = path.join(process.cwd(), "public", "tasks");
const tasksFile = path.join(tasksDir, "results.json");

// Ensure tasks directory exists
if (!fs.existsSync(tasksDir)) {
  fs.mkdirSync(tasksDir, { recursive: true });
}

// In-memory task storage (results received via callbacks)
// Tasks are persisted to a JSON file for durability
const taskResults: Map<
  string,
  {
    status: string;
    imageUrl?: string;
    error?: string;
    timestamp: number;
    prompt?: string;
    aspectRatio?: string;
    resolution?: string;
  }
> = new Map();

// Load tasks from file on startup
function loadTasksFromFile() {
  try {
    if (fs.existsSync(tasksFile)) {
      const data = fs.readFileSync(tasksFile, "utf-8");
      const tasks = JSON.parse(data);
      for (const [key, value] of Object.entries(tasks)) {
        taskResults.set(key, value as any);
      }
      console.log(`[Tasks] Loaded ${taskResults.size} tasks from file`);
    }
  } catch (error) {
    console.error("[Tasks] خطا در بارگذاری tasks:", error);
  }
}

// Save tasks to file
function saveTasksToFile() {
  try {
    const tasks: any = {};
    taskResults.forEach((value, key) => {
      tasks[key] = value;
    });
    fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error("[Tasks] خطا در ذخیره tasks:", error);
  }
}

// Load tasks on startup
loadTasksFromFile();

/**
 * تایید API Key از طریق Backend
 * این تابع CORS مشکلات را حل می‌کند با استفاده از Backend بجای درخواست مستقیم از Frontend
 * kie.ai v1 API - تایید کلید API از طریق بررسی فرمت و ساختار
 */
export async function handleValidateApiKey(
  req: Request,
  res: Response,
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
    console.log(
      "[API] Response Headers:",
      Object.fromEntries(response.headers),
    );

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
 * Note: API uses callback notifications for results
 */
export async function handleGenerateImage(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { imageUrls, prompt, aspectRatio, resolution } = req.body;
    const apiKey = req.headers.authorization?.replace("Bearer ", "");

    if (!apiKey) {
      res.status(400).json({
        success: false,
        error: "کلید API یافت نشد",
      });
      return;
    }

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0 || !prompt || !aspectRatio || !resolution) {
      res.status(400).json({
        success: false,
        error:
          "تمام فیلدها الزامی هستند: imageUrls (آرایه)، prompt، aspectRatio، resolution",
      });
      return;
    }

    console.log(
      "[Image Gen] Creating task with model: flux-2/pro-image-to-image",
    );
    console.log("[Image Gen] Number of images:", imageUrls.length);
    console.log("[Image Gen] Image URLs:", imageUrls);
    console.log("[Image Gen] Prompt:", prompt.substring(0, 50) + "...");
    console.log("[Image Gen] Aspect Ratio:", aspectRatio);
    console.log("[Image Gen] Resolution:", resolution);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 ثانیه برای generate

    // Get the public URL for callback - prefer environment variable, then x-forwarded headers
    let callbackUrl: string;

    if (process.env.PUBLIC_URL) {
      callbackUrl = `${process.env.PUBLIC_URL}/api/callback`;
    } else {
      const protocol = req.headers["x-forwarded-proto"] || "https";
      const host = req.headers["x-forwarded-host"] || req.headers.host;

      if (host && !host.includes("localhost")) {
        callbackUrl = `${protocol}://${host}/api/callback`;
      } else {
        // Fallback - won't work for external APIs from localhost
        callbackUrl = `http://localhost:8080/api/callback`;
      }
    }

    console.log("[Image Gen] Callback URL:", callbackUrl);

    const response = await fetch(`${KIE_AI_API_BASE}/jobs/createTask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "flux-2/pro-image-to-image",
        callBackUrl: callbackUrl,
        input: {
          input_urls: imageUrls,
          prompt,
          aspect_ratio: aspectRatio,
          resolution: resolution,
        },
      }),
      signal: controller.signal,
    });

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

    // Initialize task status as processing with request details
    const taskId = data?.data?.taskId;
    if (taskId) {
      taskResults.set(taskId, {
        status: "processing",
        timestamp: Date.now(),
        prompt,
        aspectRatio,
        resolution,
      });
      // Persist to file
      saveTasksToFile();
    }

    // Return the task ID for polling
    res.json({
      success: true,
      taskId: taskId,
      message: data?.message || "تصویر در حال پردازش است...",
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
 * تولید ویدیو از طریق Backend
 * kie.ai v1 API - استفاده از /api/v1/jobs/createTask با مدل grok-imagine/image-to-video
 */
export async function handleGenerateVideo(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { imageUrl, prompt, mode } = req.body;
    const apiKey = req.headers.authorization?.replace("Bearer ", "");

    if (!apiKey) {
      res.status(400).json({
        success: false,
        error: "کلید API یافت نشد",
      });
      return;
    }

    if (!imageUrl || !prompt || !mode) {
      res.status(400).json({
        success: false,
        error: "تمام فیلدها الزامی هستند: imageUrl, prompt, mode",
      });
      return;
    }

    console.log(
      "[Video Gen] Creating task with model: grok-imagine/image-to-video",
    );
    console.log("[Video Gen] Prompt:", prompt.substring(0, 50) + "...");
    console.log("[Video Gen] Mode:", mode);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 ثانیه برای generate

    // Get the public URL for callback
    let callbackUrl: string;

    if (process.env.PUBLIC_URL) {
      callbackUrl = `${process.env.PUBLIC_URL}/api/callback`;
    } else {
      const protocol = req.headers["x-forwarded-proto"] || "https";
      const host = req.headers["x-forwarded-host"] || req.headers.host;

      if (host && !host.includes("localhost")) {
        callbackUrl = `${protocol}://${host}/api/callback`;
      } else {
        // Fallback - won't work for external APIs from localhost
        callbackUrl = `http://localhost:8080/api/callback`;
      }
    }

    console.log("[Video Gen] Callback URL:", callbackUrl);

    const response = await fetch(`${KIE_AI_API_BASE}/jobs/createTask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-imagine/image-to-video",
        callBackUrl: callbackUrl,
        input: {
          image_urls: [imageUrl],
          prompt,
          mode,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log("[Video Gen] HTTP Status:", response.status);

    const contentType = response.headers.get("content-type");
    let data: any;

    try {
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("[Video Gen] غیر-JSON Response:", text.substring(0, 200));
        res.status(400).json({
          success: false,
          error: "پاسخ API نامعتبر است.",
        });
        return;
      }
    } catch (parseError) {
      console.error("[Video Gen] خطا در پارس JSON:", parseError);
      res.status(400).json({
        success: false,
        error: "خطا در پاسخ API",
      });
      return;
    }

    console.log("[Video Gen] Response:", data);

    if (!response.ok || data?.code !== 200) {
      res.status(response.status).json({
        success: false,
        error: data?.message || "خطا در ایجاد ویدیو",
      });
      return;
    }

    // Initialize task status as processing with request details
    const taskId = data?.data?.taskId;
    if (taskId) {
      taskResults.set(taskId, {
        status: "processing",
        timestamp: Date.now(),
        prompt,
        resolution: mode, // Store mode as resolution for consistency
      });
    }

    // Return the task ID for polling
    res.json({
      success: true,
      taskId: taskId,
      message: data?.message || "ویدیو در حال پردازش است...",
    });
  } catch (error: any) {
    console.error("[Video Gen] خطا:", error.message);

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
 * دریافت گزارشات (Logs)
 * Note: kie.ai doesn't provide a logs API, so we return locally stored task results
 */
export async function handleFetchLogs(
  req: Request,
  res: Response,
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

    console.log("[Logs] دریافت تاریخ تصاویر از محفوظات محلی");

    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    // Get all stored task results
    const allLogs = Array.from(taskResults.entries()).map(
      ([taskId, result]) => ({
        id: taskId,
        taskId,
        ...result,
      }),
    );

    // Filter logs to last 2 months
    const filteredLogs = allLogs.filter((log: any) => {
      return log.timestamp > twoMonthsAgo.getTime();
    });

    console.log(`[Logs] Found ${filteredLogs.length} tasks in last 2 months`);

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
 * دریافت اطلاعات بیل (Billing)
 * Try to get from kie.ai, but provide a fallback message
 */
export async function handleFetchBilling(
  req: Request,
  res: Response,
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

    // Try to get user profile from kie.ai
    const response = await fetch(`${KIE_AI_API_BASE}/users/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    // If endpoint exists, use it
    if (response.ok) {
      const data = await response.json();
      console.log("[Billing] Response:", data);

      // Extract credit info from user profile
      const credits = data?.data?.credits || data?.credits || 0;
      const totalCredits = data?.data?.totalCredits || data?.totalCredits || 0;

      res.json({
        success: true,
        creditsRemaining: credits,
        totalCredits: totalCredits,
        usedCredits: totalCredits - credits || 0,
      });
    } else {
      // Endpoint doesn't exist - return a message to check kie.ai dashboard
      console.log(
        "[Billing] Profile endpoint not available, returning fallback",
      );
      res.json({
        success: true,
        creditsRemaining: 0,
        totalCredits: 0,
        usedCredits: 0,
        message: "برای مشاهده اعتبار خود به https://kie.ai مراجعه کنید",
      });
    }
  } catch (error) {
    console.error("[Billing] خطا:", error);
    res.json({
      success: true,
      creditsRemaining: 0,
      totalCredits: 0,
      usedCredits: 0,
      message: "برای مشاهده اعتبار خود به https://kie.ai مراجعه کنید",
    });
  }
}

/**
 * دریافت وضعیت یک تصویر تولید شده (Task Status)
 * Checks local task results (received via callback from kie.ai)
 */
export async function handleQueryTask(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const taskId = req.query.taskId as string;

    if (!taskId) {
      res.status(400).json({
        success: false,
        error: "Task ID یافت نشد",
      });
      return;
    }

    console.log("[Query Task] Checking TaskID:", taskId);

    // Check if task result is available
    const result = taskResults.get(taskId);

    if (!result) {
      // Task not found
      console.log("[Query Task] Task not found or not yet created");
      res.status(404).json({
        success: false,
        error: "تصویر یافت نشد",
      });
      return;
    }

    console.log("[Query Task] Result:", result);

    res.json({
      success: true,
      status: result.status,
      imageUrl: result.imageUrl,
      error: result.error,
      message:
        result.status === "success"
          ? "تصویر آماده است"
          : "تصویر در حال پردازش است...",
    });
  } catch (error: any) {
    console.error("[Query Task] خطا:", error.message);
    res.status(500).json({
      success: false,
      error: "خطا در دریافت وضعیت تصویر",
    });
  }
}

/**
 * Callback handler - receives task completion notifications from kie.ai
 */
export async function handleCallback(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const data = req.body;

    console.log("[Callback] ========== RECEIVED CALLBACK FROM KIE.AI ==========");
    console.log("[Callback] Full Body:", JSON.stringify(data, null, 2));
    console.log("[Callback] Headers:", Object.fromEntries(req.headers));

    // Try different possible paths for taskId
    const taskId =
      data?.data?.taskId ||
      data?.taskId ||
      data?.task_id ||
      data?.id;

    // Try different possible paths for state
    const state =
      data?.data?.state ||
      data?.state ||
      data?.status;

    console.log("[Callback] Extracted TaskID:", taskId);
    console.log("[Callback] Extracted State:", state);
    console.log("[Callback] resultJson exists:", !!data?.data?.resultJson);
    console.log("[Callback] resultUrls exists:", !!data?.data?.resultUrls);

    if (!taskId) {
      console.error("[Callback] No taskId found in callback - data structure unknown");
      res.status(400).json({ error: "No taskId provided" });
      return;
    }

    // Parse the result - try multiple possible structures
    let imageUrl: string | undefined;

    // Try parsing resultJson as JSON string
    if (data?.data?.resultJson) {
      try {
        const resultJson = JSON.parse(data.data.resultJson);
        console.log("[Callback] Parsed resultJson:", JSON.stringify(resultJson, null, 2));
        imageUrl =
          resultJson?.resultUrls?.[0] ||
          resultJson?.result_urls?.[0] ||
          resultJson?.image ||
          resultJson?.imageUrl ||
          resultJson?.url;
      } catch (e) {
        console.error("[Callback] Failed to parse resultJson as JSON:", e);
      }
    }

    // Try resultUrls as array directly
    if (!imageUrl && data?.data?.resultUrls && Array.isArray(data.data.resultUrls)) {
      imageUrl = data.data.resultUrls[0];
      console.log("[Callback] Found imageUrl in resultUrls:", imageUrl);
    }

    // Try result as object
    if (!imageUrl && data?.data?.result) {
      imageUrl =
        data.data.result?.imageUrl ||
        data.data.result?.url ||
        data.data.result?.[0];
      console.log("[Callback] Found imageUrl in result:", imageUrl);
    }

    console.log("[Callback] Final extracted imageUrl:", imageUrl);
    console.log("[Callback] State is success:", state === "success");

    // Store the result, preserving any existing request details
    const existingResult = taskResults.get(taskId);
    taskResults.set(taskId, {
      ...existingResult,
      status: state || "unknown",
      imageUrl: imageUrl,
      error: state === "fail" ? (data?.data?.failMsg || data?.failMsg || "Unknown error") : undefined,
      timestamp: existingResult?.timestamp || Date.now(),
    });

    // Persist to file
    saveTasksToFile();

    console.log("[Callback] Task result stored:", {
      taskId,
      status: state,
      hasImage: !!imageUrl,
      filePath: tasksFile,
    });
    console.log("[Callback] ========== CALLBACK PROCESSING COMPLETE ==========");

    // Respond to kie.ai
    res.json({ success: true, message: "Callback received" });
  } catch (error: any) {
    console.error("[Callback] خطا:", error.message);
    console.error("[Callback] Stack:", error.stack);
    res.status(500).json({
      error: "خطا در پردازش callback",
    });
  }
}
