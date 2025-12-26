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
    console.log("[Image Gen] Image URLs:", imageUrls);
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
            "Authorization": `Bearer ${apiKey}`,
          },
          signal: controller.signal,
        });

        if (response.ok) {
          data = await response.json();
          console.log(`[Billing] ${endpoint} response:`, JSON.stringify(data).substring(0, 200));

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
            console.log(`[Billing] Found balance from ${endpoint}:`, balance);
            res.json({
              success: true,
              creditsRemaining: Math.floor(balance),
              totalCredits: 0,
              usedCredits: 0,
            });
            clearTimeout(timeoutId);
            return;
          }
        }
      } catch (e) {
        console.log(`[Billing] ${endpoint} failed, trying next...`);
      }
    }

    // Try 2: Fetch billing page HTML as fallback
    console.log("[Billing] Trying HTML scraping from /billing page...");
    response = await fetch("https://kie.ai/billing", {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Authorization": `Bearer ${apiKey}`,
        "Cookie": `api_key=${apiKey}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log("[Billing] HTTP Status:", response.status);
    console.log("[Billing] Content-Type:", response.headers.get("content-type"));

    // Check if API key is invalid (403 or 401)
    if (response.status === 401 || response.status === 403) {
      console.error("[Billing] Invalid API key or unauthorized (", response.status, ")");
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
        message: "برای مشاهده اعتبار دقیق خود به https://kie.ai/billing مراجعه کنید",
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
    const nextDataMatch = html.match(/__NEXT_DATA__\s*=\s*({[\s\S]*?})<\/script>/);
    if (nextDataMatch) {
      console.log("[Billing] Found __NEXT_DATA__");
      const dataStr = nextDataMatch[1].substring(0, 500);
      console.log("[Billing] __NEXT_DATA__ preview:", dataStr);
    }

    // Also search for JSON data in script tags
    const jsonDataMatches = html.match(/<script[^>]*>[\s\S]*?"credits?"\s*:\s*(\d+)/i);
    if (jsonDataMatches && jsonDataMatches[1]) {
      console.log("[Billing] Found credits in JSON data:", jsonDataMatches[1]);
    }

    // Extract credit balance from HTML
    // The page is JavaScript-rendered, so balance is loaded dynamically
    // We need to be very specific about what we're looking for
    let creditsRemaining = 0;

    console.log("[Billing] Searching for credit balance in HTML...");

    // Strategy 1: Look for numbers right before the word "credits" or after "balance"
    // This is the most reliable pattern
    const creditPatterns = [
      // Pattern: number immediately before "credits"
      /(\d+)\s*credits?(?:\s|$|<)/i,
      // Pattern: "balance: NUMBER" or "balance: NUMBER"
      /balance\s*[:\-=]\s*(\d+)/i,
      // Pattern: number right before "credit" tag
      />(\d+)\s*<[^>]*>credits?/i,
      // Pattern: Current Balance with number
      /current\s+balance[^0-9]*(\d+)/i,
    ];

    for (const pattern of creditPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        // Accept any number 0-100000 in this context
        if (!isNaN(num) && num >= 0 && num <= 100000) {
          creditsRemaining = num;
          console.log("[Billing] Found credits in pattern:", creditsRemaining);
          break;
        }
      }
    }

    // Strategy 2: Extract all 2-4 digit numbers and find the best candidate
    if (creditsRemaining === 0) {
      console.log("[Billing] Specific patterns failed, analyzing all numbers...");

      // Extract all numbers 1-9999
      const allNumbers = [...html.matchAll(/\b(\d{1,4})\b/g)]
        .map((m) => parseInt(m[1], 10))
        .filter((n) => n > 0);

      // Remove duplicates and get unique values
      const unique = [...new Set(allNumbers)];
      console.log("[Billing] Found numbers:", unique.slice(0, 30));

      // Heuristic: balance is usually displayed early on the page
      // and is typically 1-3 digits for most users (0-999)
      const likelyBalance = unique.find((n) => n < 1000);
      if (likelyBalance !== undefined) {
        creditsRemaining = likelyBalance;
        console.log("[Billing] Selected likely balance:", creditsRemaining);
      } else if (unique.length > 0) {
        creditsRemaining = unique[0];
        console.log("[Billing] Selected first unique number:", creditsRemaining);
      }
    }

    console.log("[Billing] Final extracted credits:", creditsRemaining);

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
      message: "برای مشاهده اعتبار دقیق خود به https://kie.ai/billing مراجعه کنید",
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
