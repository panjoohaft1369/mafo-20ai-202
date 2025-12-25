// استفاده از Backend برای تمام درخواست‌های API
const BACKEND_API_BASE = "/api";

export interface ApiKeyValidationResponse {
  valid: boolean;
  message?: string;
  credit?: number;
  email?: string;
}

export interface ImageGenerationRequest {
  apiKey: string;
  imageUrl: string;
  prompt: string;
  aspectRatio: string;
  resolution: string;
}

export interface ImageGenerationResponse {
  success: boolean;
  taskId?: string;
  imageUrl?: string;
  error?: string;
  message?: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  prompt: string;
  imageUrl: string;
  width: string;
  height: string;
  quality: string;
}

export interface BillingInfo {
  creditsRemaining: number;
  totalCredits: number;
  usedCredits: number;
}

export interface TaskStatusResponse {
  success: boolean;
  status?: string;
  imageUrl?: string;
  error?: string;
  message?: string;
}

/**
 * تایید API Key از طریق Backend
 */
export async function validateApiKey(
  apiKey: string
): Promise<ApiKeyValidationResponse> {
  try {
    const response = await fetch(`${BACKEND_API_BASE}/validate-key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        valid: false,
        message: data.message || "کد لایسنس شما معتبر نمیباشد. لطفا با پشتیبانی تماس بگیرید.",
      };
    }

    return {
      valid: true,
      credit: data.credit,
      email: data.email,
      message: data.message,
    };
  } catch (error) {
    console.error("API validation error:", error);
    return {
      valid: false,
      message: "خطا در اتصال به سرویس. لطفا بعدا دوباره سعی کنید.",
    };
  }
}

/**
 * تولید تصویر از طریق Backend
 * Note: kie.ai v1 API returns taskId, results delivered via callback
 */
export async function generateImage(
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse> {
  try {
    const response = await fetch(
      `${BACKEND_API_BASE}/generate-image`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${request.apiKey}`,
        },
        body: JSON.stringify({
          imageUrl: request.imageUrl,
          prompt: request.prompt,
          aspectRatio: request.aspectRatio,
          resolution: request.resolution,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "خطا در ایجاد تصویر",
      };
    }

    return {
      success: true,
      taskId: data.taskId,
      imageUrl: data.imageUrl,
      message: data.message,
    };
  } catch (error) {
    console.error("Image generation error:", error);
    return {
      success: false,
      error: "خطا در اتصال به سرویس. لطفا بعدا دوباره سعی کنید.",
    };
  }
}

/**
 * دریافت گزارشات از طریق Backend (2 ماه اخیر)
 */
export async function fetchLogs(apiKey: string): Promise<LogEntry[]> {
  try {
    const response = await fetch(`${BACKEND_API_BASE}/logs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch logs");
      return [];
    }

    const data = await response.json();
    const logs: LogEntry[] = data.logs || [];

    return logs;
  } catch (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
}

/**
 * دریافت اطلاعات اعتبار از طریق Backend
 */
export async function fetchBillingInfo(
  apiKey: string
): Promise<BillingInfo | null> {
  try {
    const response = await fetch(`${BACKEND_API_BASE}/billing`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch billing info");
      return null;
    }

    const data = await response.json();
    return {
      creditsRemaining: data.creditsRemaining || 0,
      totalCredits: data.totalCredits || 0,
      usedCredits: data.usedCredits || 0,
    };
  } catch (error) {
    console.error("Error fetching billing info:", error);
    return null;
  }
}

/**
 * دریافت وضعیت تصویری تولید شده (برای API v1 غیرهمزمان)
 */
export async function queryTaskStatus(
  apiKey: string,
  taskId: string
): Promise<TaskStatusResponse> {
  try {
    const response = await fetch(`${BACKEND_API_BASE}/query-task?taskId=${taskId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to query task status:", data);
      return {
        success: false,
        error: data.error || "خطا در دریافت وضعیت تصویر",
      };
    }

    return {
      success: true,
      status: data.status,
      imageUrl: data.imageUrl,
      message: data.message,
    };
  } catch (error) {
    console.error("Error querying task status:", error);
    return {
      success: false,
      error: "خطا در اتصال به سرویس",
    };
  }
}

/**
 * Poll for task completion (helper function)
 */
export async function pollTaskCompletion(
  apiKey: string,
  taskId: string,
  maxAttempts: number = 120, // 2 minutes with 1 second intervals
  interval: number = 1000 // 1 second
): Promise<TaskStatusResponse> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await queryTaskStatus(apiKey, taskId);

    if (result.success && result.status === "success") {
      return result;
    }

    if (result.success && result.status === "fail") {
      return {
        success: false,
        error: result.error || "خطا در ایجاد تصویر",
      };
    }

    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  // Timeout
  return {
    success: false,
    error: "خطا: درخواست منقضی شد",
  };
}
