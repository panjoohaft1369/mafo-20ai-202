import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import { fetchBalanceFromBilling } from "../utils/puppeteer-balance.js";
import { fetchCompleteLogsFromKie } from "../utils/kie-logs-scraper.js";
import {
  deductUserCredits,
  recordUsageTransaction,
  getImageCreditType,
  CreditType,
  CREDIT_COSTS,
} from "../utils/credit-manager.js";
import { supabase } from "../utils/supabase-client.js";

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
    apiKey?: string;
    userId?: string;
    taskType?: "image" | "video";
    creditsDeducted?: boolean;
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
      console.log(`[Tasks] Task IDs:`, Array.from(taskResults.keys()));
      console.log(`[Tasks] File path:`, tasksFile);
    } else {
      console.log(`[Tasks] Tasks file does not exist yet: ${tasksFile}`);
    }
  } catch (error) {
    console.error("[Tasks] خطا در بارگذاری tasks:", error);
  }
}

// Save tasks to file
function saveTasksToFile() {
  try {
    const tasks: any = {};

    // Safely convert Map to object
    if (taskResults instanceof Map) {
      for (const [key, value] of taskResults.entries()) {
        tasks[key] = value;
      }
    } else {
      // Fallback if taskResults is already an object
      Object.assign(tasks, taskResults);
    }

    // Ensure directory exists
    if (!fs.existsSync(tasksDir)) {
      fs.mkdirSync(tasksDir, { recursive: true });
    }

    fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));
    console.log("[Tasks] Tasks saved to file successfully");
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

    // Demo/Test mode - برای تست بدون API Key واقعی
    const testKeys = ["demo-key-123", "test-key", "mafo-test"];
    if (testKeys.includes(apiKey)) {
      console.log("[DEMO MODE] تایید API Key موفق");
      res.json({
        valid: true,
        credit: 100,
        email: "test@mafo.ai",
        message: "موفق - حالت Test",
      });
      return;
    }

    console.log("[API] تلاش برای تایید API Key با kie.ai v1");
    console.log("[API] API Key:", apiKey.substring(0, 10) + "...");
    console.log("[API] Base URL:", KIE_AI_API_BASE);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 ثانیه timeout

    // Try multiple validation approaches
    let validationSuccess = false;
    let responseData: any = null;

    // Approach 1: Try queryTask endpoint
    try {
      console.log("[API] سعی اول: /jobs/queryTask");
      const response = await fetch(
        `${KIE_AI_API_BASE}/jobs/queryTask?taskId=test`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "User-Agent": "MAFO-Client/1.0",
          },
          signal: controller.signal,
        },
      );

      console.log("[API] queryTask Response Status:", response.status);

      // 401 means invalid key
      if (response.status === 401) {
        console.error("[API] کلید API نامعتبر (401)");
        clearTimeout(timeoutId);
        res.status(401).json({
          valid: false,
          message: "کد لایسنس شما معتبر نمیباشد. لطفا با پشتیبانی تماس بگیرید.",
        });
        return;
      }

      // 404 or any other response means the key might be valid
      if (response.status !== 401) {
        validationSuccess = true;
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          responseData = await response.json();
        }
      }
    } catch (err: any) {
      console.log("[API] خطا در queryTask:", err.message);
      // Continue to next approach
    }

    // Approach 2: If first approach failed, try a generic API call
    if (!validationSuccess) {
      try {
        console.log("[API] سعی دوم: /jobs/listJobs");
        const response = await fetch(`${KIE_AI_API_BASE}/jobs/listJobs`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "User-Agent": "MAFO-Client/1.0",
          },
          signal: controller.signal,
        });

        console.log("[API] listJobs Response Status:", response.status);

        if (response.status === 401) {
          console.error("[API] کلید API نامعتبر (401)");
          clearTimeout(timeoutId);
          res.status(401).json({
            valid: false,
            message:
              "کد لایسنس شما معتبر نمیباشد. لطفا با پشتیبانی تماس بگیرید.",
          });
          return;
        }

        if (response.status !== 401) {
          validationSuccess = true;
          const contentType = response.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            responseData = await response.json();
          }
        }
      } catch (err: any) {
        console.log("[API] خطا در listJobs:", err.message);
      }
    }

    clearTimeout(timeoutId);

    // If we didn't get a clear validation result, try to check balance
    if (!validationSuccess) {
      console.log("[API] تایید از طریق balance check...");
      try {
        const balanceResult = await fetchBalanceFromBilling(apiKey);
        if (balanceResult >= 0) {
          validationSuccess = true;
          console.log("[API] Balance check successful:", balanceResult);
        }
      } catch (err) {
        console.log("[API] Balance check failed:", err);
      }
    }

    // If validation succeeded, try to get balance
    if (validationSuccess) {
      console.log("[API] تایید موفق!");

      // Now fetch the actual credit balance from kie.ai/billing using Puppeteer
      console.log(
        "[API] Fetching actual balance from kie.ai/billing using Puppeteer...",
      );
      let actualBalance = 0;

      try {
        actualBalance = await fetchBalanceFromBilling(apiKey);
        console.log("[API] Puppeteer extracted balance:", actualBalance);
      } catch (billingError) {
        console.error(
          "[API] Error fetching balance with Puppeteer:",
          billingError,
        );
        // Continue even if balance fetch fails
      }

      // Use actual balance if found, otherwise fallback to 100
      // If balance is 0 or not found, assume user has credits
      const finalBalance = actualBalance > 0 ? actualBalance : 100;

      console.log("[API] Final balance to return:", finalBalance);

      res.json({
        valid: true,
        credit: finalBalance,
        email:
          responseData?.data?.email || responseData?.email || "user@mafo.ai",
        message: responseData?.message || "موفق",
      });
      return;
    }

    // If we couldn't validate through API calls, use fallback mode
    console.log("[API] Couldn't validate through API, using fallback mode");
    res.json({
      valid: true,
      credit: 50,
      email: "user@mafo.ai",
      message: "حالت محدود - لطفا API Key خود را بررسی کنید",
    });
  } catch (error: any) {
    console.error("[API] خطا:", {
      name: error.name,
      message: error.message,
      cause: error.cause,
    });

    // اگر abort شد (timeout) یا connection error - fallback mode
    if (error.name === "AbortError" || error.code === "ECONNREFUSED") {
      console.log("[API] kie.ai not available, using fallback mode");
      // Fallback: allow the API key to be used with a default balance
      // This allows testing when kie.ai is down
      res.json({
        valid: true,
        credit: 50,
        email: "user@mafo.ai",
        message: "حالت آفلاین - لطفا بعدا دوباره سعی کنید",
      });
      return;
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
    const { userId, imageUrls, prompt, aspectRatio, resolution } = req.body;
    const apiKey = req.headers.authorization?.replace("Bearer ", "");

    if (!apiKey) {
      res.status(400).json({
        success: false,
        error: "کلید API یافت نشد",
      });
      return;
    }

    if (!userId) {
      res.status(400).json({
        success: false,
        error: "شناسه کاربر یافت نشد",
      });
      return;
    }

    if (
      !imageUrls ||
      !Array.isArray(imageUrls) ||
      imageUrls.length === 0 ||
      !prompt ||
      !aspectRatio ||
      !resolution
    ) {
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

    // Check if any URLs are localhost
    const localhostUrls = imageUrls.filter((url: string) =>
      url.includes("localhost"),
    );
    console.log("[Image Gen] Image URLs:", imageUrls);
    if (localhostUrls.length > 0) {
      console.warn(
        `[Image Gen] ⚠️  WARNING: ${localhostUrls.length} image URL(s) are localhost URLs which Kie.ai cannot access:`,
        localhostUrls,
      );
    }

    console.log("[Image Gen] Prompt:", prompt);
    console.log("[Image Gen] Prompt length:", prompt.length);
    console.log("[Image Gen] Aspect Ratio:", aspectRatio);
    console.log("[Image Gen] Resolution:", resolution);

    // Validate aspect ratio
    const validAspectRatios = [
      "1:1",
      "4:3",
      "3:4",
      "16:9",
      "9:16",
      "3:2",
      "2:3",
      "auto",
    ];
    if (!validAspectRatios.includes(aspectRatio)) {
      console.error("[Image Gen] Invalid aspect ratio:", aspectRatio);
    }

    // Validate resolution
    const validResolutions = ["1K", "2K"];
    if (!validResolutions.includes(resolution)) {
      console.error("[Image Gen] Invalid resolution:", resolution);
    }

    // Validate prompt length (3-5000 chars per docs)
    if (prompt.length < 3 || prompt.length > 5000) {
      res.status(400).json({
        success: false,
        error: `پرامپت باید بین 3 تا 5000 کاراکتر باشد (فعلی: ${prompt.length})`,
      });
      return;
    }

    // Validate image count (1-8 per docs)
    if (imageUrls.length < 1 || imageUrls.length > 8) {
      res.status(400).json({
        success: false,
        error: `تعداد تصاویر باید بین 1 تا 8 عکس باشد (فعلی: ${imageUrls.length})`,
      });
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 ثانیه برای generate

    // Get the public URL for callback - prefer environment variable, then x-forwarded headers
    let callbackUrl: string;
    let callbackSource: string;

    if (process.env.PUBLIC_URL) {
      callbackUrl = `${process.env.PUBLIC_URL}/api/callback`;
      callbackSource = "PUBLIC_URL";
    } else {
      const protocol = req.headers["x-forwarded-proto"] || "https";
      const host = req.headers["x-forwarded-host"] || req.headers.host;

      if (host && !host.includes("localhost")) {
        callbackUrl = `${protocol}://${host}/api/callback`;
        callbackSource = "x-forwarded headers";
      } else {
        // Fallback - won't work for external APIs from localhost
        callbackUrl = `http://localhost:8080/api/callback`;
        callbackSource = "LOCALHOST FALLBACK ⚠️";
      }
    }

    console.log(
      `[Image Gen] Callback URL: ${callbackUrl} (source: ${callbackSource})`,
    );

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

    console.log("[Image Gen] Full Response:", JSON.stringify(data, null, 2));
    console.log("[Image Gen] Response code:", data?.code);
    console.log("[Image Gen] Response message:", data?.message);
    console.log("[Image Gen] Task ID:", data?.data?.taskId);

    if (!response.ok || data?.code !== 200) {
      console.error("[Image Gen] API Error:", {
        httpStatus: response.status,
        code: data?.code,
        message: data?.message,
      });
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
        apiKey,
        userId,
        taskType: "image",
        creditsDeducted: false,
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
    const { userId, imageUrl, prompt, mode } = req.body;
    const apiKey = req.headers.authorization?.replace("Bearer ", "");

    if (!apiKey) {
      res.status(400).json({
        success: false,
        error: "کلید API یافت نشد",
      });
      return;
    }

    if (!userId) {
      res.status(400).json({
        success: false,
        error: "شناسه کاربر یافت نشد",
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
    console.log("[Video Gen] Image URL:", imageUrl);

    // Check if URL is localhost
    if (imageUrl.includes("localhost")) {
      console.warn(
        "[Video Gen] ⚠️  WARNING: Image URL is localhost which Kie.ai cannot access:",
        imageUrl,
      );
    }

    console.log("[Video Gen] Prompt:", prompt.substring(0, 50) + "...");
    console.log("[Video Gen] Mode:", mode);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 ثانیه برای generate

    // Get the public URL for callback
    let callbackUrl: string;
    let callbackSource: string;

    if (process.env.PUBLIC_URL) {
      callbackUrl = `${process.env.PUBLIC_URL}/api/callback`;
      callbackSource = "PUBLIC_URL";
    } else {
      const protocol = req.headers["x-forwarded-proto"] || "https";
      const host = req.headers["x-forwarded-host"] || req.headers.host;

      if (host && !host.includes("localhost")) {
        callbackUrl = `${protocol}://${host}/api/callback`;
        callbackSource = "x-forwarded headers";
      } else {
        // Fallback - won't work for external APIs from localhost
        callbackUrl = `http://localhost:8080/api/callback`;
        callbackSource = "LOCALHOST FALLBACK ⚠️";
      }
    }

    console.log(
      `[Video Gen] Callback URL: ${callbackUrl} (source: ${callbackSource})`,
    );

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
        apiKey,
        userId,
        taskType: "video",
        creditsDeducted: false,
      });
      // Persist to file
      saveTasksToFile();
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
 * Fetches complete history from kie.ai/logs page, with fallback to local storage
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

    console.log("[Logs] دریافت تاریخ کامل تصاویر از kie.ai/logs");

    // First, try to fetch from kie.ai/logs
    const remoteLogs = await fetchCompleteLogsFromKie(apiKey);

    if (remoteLogs && remoteLogs.length > 0) {
      console.log(
        `[Logs] Fetched ${remoteLogs.length} entries from kie.ai/logs`,
      );
      // Sort by timestamp in descending order (newest first)
      const sortedLogs = remoteLogs.sort((a, b) => b.timestamp - a.timestamp);
      res.json({
        success: true,
        logs: sortedLogs,
        source: "kie.ai",
      });
      return;
    }

    console.log(
      "[Logs] No logs from kie.ai/logs, falling back to local storage",
    );

    // Fallback: Get locally stored task results
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

    // Sort by timestamp in descending order (newest first)
    const sortedLogs = filteredLogs.sort(
      (a: any, b: any) => b.timestamp - a.timestamp,
    );

    console.log(`[Logs] Found ${sortedLogs.length} tasks in local storage`);

    res.json({
      success: true,
      logs: sortedLogs,
      source: "local",
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
 * Scrape the kie.ai/billing page to extract real credit balance
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

    console.log("[Billing] دریافت اطلاعات اعتبار از kie.ai");
    console.log("[Billing] API Key:", apiKey.substring(0, 10) + "...");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 ثانیه timeout

    // Try to fetch from multiple possible endpoints
    let response = null;
    let data = null;

    // Try multiple API endpoints where balance might be available
    // kie.ai likely has an endpoint to get account/balance information
    const endpoints = [
      // Try various endpoint patterns
      `/users/me`,
      `/users/profile`,
      `/user/me`,
      `/user/info`,
      `/user/profile`,
      `/user/balance`,
      `/user/credits`,
      `/account`,
      `/account/info`,
      `/account/balance`,
      `/account/profile`,
      `/account/credits`,
      `/auth/me`,
      `/auth/user`,
      `/me`,
      `/profile`,
      `/balance`,
      `/credits`,
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`[Billing] Trying ${endpoint} endpoint...`);
        response = await fetch(`${KIE_AI_API_BASE}${endpoint}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          signal: controller.signal,
        });

        const responseText = await response.text();
        console.log(
          `[Billing] ${endpoint} (${response.status}):`,
          responseText.substring(0, 150),
        );

        if (response.ok) {
          try {
            data = JSON.parse(responseText);

            // Try to extract balance from various possible paths
            const balance =
              data?.data?.balance ||
              data?.data?.credits ||
              data?.data?.creditsRemaining ||
              data?.data?.credit ||
              data?.balance ||
              data?.credits ||
              data?.creditsRemaining ||
              data?.credit ||
              data?.account?.balance ||
              data?.account?.credits ||
              data?.user?.balance ||
              data?.user?.credits;

            if (typeof balance === "number" && balance >= 0) {
              console.log(
                `[Billing] ✓ Found balance from ${endpoint}:`,
                balance,
              );
              res.json({
                success: true,
                creditsRemaining: Math.floor(balance),
                totalCredits: 0,
                usedCredits: 0,
              });
              clearTimeout(timeoutId);
              return;
            }
          } catch (parseError) {
            console.log(`[Billing] Could not parse JSON from ${endpoint}`);
          }
        }
      } catch (e: any) {
        console.log(`[Billing] ${endpoint} error:`, e.message);
      }
    }

    // Try 2: Fetch billing page HTML as fallback
    console.log("[Billing] Trying HTML scraping from /billing page...");
    response = await fetch("https://kie.ai/billing", {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Authorization: `Bearer ${apiKey}`,
        Cookie: `api_key=${apiKey}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log("[Billing] HTTP Status:", response.status);
    console.log(
      "[Billing] Content-Type:",
      response.headers.get("content-type"),
    );

    // Check if API key is invalid (403 or 401)
    if (response.status === 401 || response.status === 403) {
      console.error(
        "[Billing] Invalid API key or unauthorized (",
        response.status,
        ")",
      );
      res.status(401).json({
        success: false,
        error: "کد لایسنس شما معتبر نمیباشد",
      });
      return;
    }

    if (!response.ok) {
      console.error("[Billing] HTTP Error:", response.status);
      res.json({
        success: true,
        creditsRemaining: 0,
        totalCredits: 0,
        usedCredits: 0,
        message:
          "برای مشاهده اعتبار دقیق خود به https://kie.ai/billing مراجعه کنید",
      });
      return;
    }

    const html = await response.text();
    console.log("[Billing] HTML length:", html.length);
    console.log("[Billing] HTML preview:", html.substring(0, 500));

    // Log HTML around "Balance" keyword to debug
    const balanceIndex = html.toLowerCase().indexOf("balance");
    if (balanceIndex > -1) {
      console.log(
        "[Billing] HTML around 'Balance':",
        html.substring(
          Math.max(0, balanceIndex - 200),
          Math.min(html.length, balanceIndex + 500),
        ),
      );
    }

    // Also try to find where number data might be (could be in __NEXT_DATA__ or window.__data__)
    const nextDataMatch = html.match(
      /__NEXT_DATA__\s*=\s*({[\s\S]*?})<\/script>/,
    );
    if (nextDataMatch) {
      console.log("[Billing] Found __NEXT_DATA__");
      const dataStr = nextDataMatch[1].substring(0, 500);
      console.log("[Billing] __NEXT_DATA__ preview:", dataStr);
    }

    // Also search for JSON data in script tags
    const jsonDataMatches = html.match(
      /<script[^>]*>[\s\S]*?"credits?"\s*:\s*(\d+)/i,
    );
    if (jsonDataMatches && jsonDataMatches[1]) {
      console.log("[Billing] Found credits in JSON data:", jsonDataMatches[1]);
    }

    // Extract credit balance using Puppeteer
    // The balance loads via JavaScript, so we use headless browser to render it
    console.log("[Billing] Fetching balance using Puppeteer...");

    let creditsRemaining = 0;
    try {
      creditsRemaining = await fetchBalanceFromBilling(apiKey);
      console.log("[Billing] Puppeteer extracted balance:", creditsRemaining);
    } catch (puppeteerError) {
      console.error("[Billing] Error with Puppeteer:", puppeteerError);
      creditsRemaining = 0;
    }

    console.log("[Billing] Final balance:", creditsRemaining);

    // Return the result
    res.json({
      success: true,
      creditsRemaining: creditsRemaining,
      totalCredits: 0,
      usedCredits: 0,
    });
  } catch (error: any) {
    console.error("[Billing] خطا:", {
      name: error.name,
      message: error.message,
    });

    // If abort (timeout)
    if (error.name === "AbortError") {
      return res.status(504).json({
        success: false,
        error: "خطا: سرویس پاسخ نداد",
      });
    }

    // For any other error, return fallback
    res.json({
      success: true,
      creditsRemaining: 0,
      totalCredits: 0,
      usedCredits: 0,
      message:
        "برای مشاهده اعتبار دقیق خود به https://kie.ai/billing مراجعه کنید",
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
      // Task not found - provide debugging info
      console.log("[Query Task] Task not found in memory");
      console.log(
        "[Query Task] All stored tasks:",
        Array.from(taskResults.keys()),
      );

      // Check if file exists
      if (fs.existsSync(tasksFile)) {
        const fileContent = fs.readFileSync(tasksFile, "utf-8");
        console.log("[Query Task] Tasks in file:", fileContent);
      }

      res.status(404).json({
        success: false,
        error: "تصویر یافت نشد",
      });
      return;
    }

    console.log("[Query Task] Result found:", {
      status: result.status,
      hasImageUrl: !!result.imageUrl,
      error: result.error,
    });

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

    console.log(
      "[Callback] ========== RECEIVED CALLBACK FROM KIE.AI ==========",
    );
    console.log("[Callback] Full Body:", JSON.stringify(data, null, 2));
    console.log(
      "[Callback] Headers:",
      Object.fromEntries(
        Object.entries(req.headers).filter(
          ([key]) =>
            !key.toLowerCase().includes("cookie") &&
            !key.toLowerCase().includes("authorization"),
        ),
      ),
    );

    // Try different possible paths for taskId
    const taskId =
      data?.data?.taskId || data?.taskId || data?.task_id || data?.id;

    // Try different possible paths for state
    const state = data?.data?.state || data?.state || data?.status;

    console.log("[Callback] Extracted TaskID:", taskId);
    console.log("[Callback] Extracted State:", state);
    console.log("[Callback] resultJson exists:", !!data?.data?.resultJson);
    console.log("[Callback] resultUrls exists:", !!data?.data?.resultUrls);

    if (!taskId) {
      console.error(
        "[Callback] No taskId found in callback - data structure unknown",
      );
      console.error(
        "[Callback] Data structure:",
        JSON.stringify(data, null, 2),
      );
      // Still return 200 to prevent retries, but log the issue for debugging
      res.status(200).json({ error: "No taskId provided" });
      return;
    }

    // Parse the result - try multiple possible structures
    let imageUrl: string | undefined;

    // Try parsing resultJson as JSON string
    if (data?.data?.resultJson) {
      try {
        const resultJson = JSON.parse(data.data.resultJson);
        console.log(
          "[Callback] Parsed resultJson:",
          JSON.stringify(resultJson, null, 2),
        );
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
    if (
      !imageUrl &&
      data?.data?.resultUrls &&
      Array.isArray(data.data.resultUrls)
    ) {
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
    const isSuccess = state === "success" && imageUrl;

    // Deduct credits if task completed successfully
    if (
      isSuccess &&
      existingResult &&
      !existingResult.creditsDeducted &&
      existingResult.userId
    ) {
      try {
        let creditType: CreditType;
        let creditCost: number;

        if (existingResult.taskType === "image") {
          creditType = getImageCreditType(existingResult.resolution || "1K");
          creditCost = CREDIT_COSTS[creditType];
        } else if (existingResult.taskType === "video") {
          creditType = CreditType.VIDEO;
          creditCost = CREDIT_COSTS[creditType];
        } else {
          creditType = CreditType.IMAGE_1K;
          creditCost = CREDIT_COSTS[creditType];
        }

        console.log(
          `[Callback] Deducting ${creditCost} credits for ${creditType} from user ${existingResult.userId}`,
        );

        // Deduct credits from user's account
        const deductionSuccess = await deductUserCredits(
          existingResult.userId,
          creditCost,
          creditType,
          taskId,
        );

        if (deductionSuccess) {
          existingResult.creditsDeducted = true;
          console.log("[Callback] Credits deducted successfully");
        } else {
          console.warn(
            "[Callback] Credit deduction returned false - user may not have enough credits",
          );
        }
      } catch (creditError) {
        console.error("[Callback] Error deducting credits:", creditError);
      }

      // Save generated image to database for admin gallery
      if (isSuccess && existingResult.userId && imageUrl) {
        try {
          const insertData: any = {
            user_id: existingResult.userId,
            task_id: taskId,
            image_url: imageUrl,
            prompt: existingResult.prompt,
            status: "completed",
            aspect_ratio: existingResult.aspectRatio,
            resolution: existingResult.resolution,
          };

          // Add credit cost if available
          if (existingResult.taskType === "image") {
            insertData.credit_cost = CREDIT_COSTS[getImageCreditType(existingResult.resolution || "1K")];
          } else if (existingResult.taskType === "video") {
            insertData.credit_cost = CREDIT_COSTS[CreditType.VIDEO];
          }

          const { error: insertError } = await supabase
            .from("generated_images")
            .insert([insertData]);

          if (insertError) {
            console.error(
              "[Callback] Error saving generated image to database:",
              insertError,
            );
          } else {
            console.log(
              "[Callback] Generated image saved to database successfully",
            );
          }
        } catch (dbError) {
          console.error("[Callback] Error inserting image to database:", dbError);
        }
      }
    }

    taskResults.set(taskId, {
      ...existingResult,
      status: state || "unknown",
      imageUrl: imageUrl,
      error:
        state === "fail"
          ? data?.data?.failMsg || data?.failMsg || "Unknown error"
          : undefined,
      timestamp: existingResult?.timestamp || Date.now(),
    });

    // Persist to file
    saveTasksToFile();

    console.log("[Callback] Task result stored:", {
      taskId,
      status: state,
      hasImage: !!imageUrl,
      creditsDeducted: existingResult?.creditsDeducted,
      filePath: tasksFile,
    });
    console.log(
      "[Callback] ========== CALLBACK PROCESSING COMPLETE ==========",
    );

    // Respond to kie.ai with 200 OK (important to prevent retries)
    res.status(200).json({ success: true, message: "Callback received" });
  } catch (error: any) {
    console.error("[Callback] خطا:", error.message);
    console.error("[Callback] Stack:", error.stack);
    console.error("[Callback] Request Body:", req.body);

    // Still respond with 200 to prevent kie.ai from retrying
    res.status(200).json({
      success: false,
      error: "Error processing callback, but request was received",
    });
  }
}
