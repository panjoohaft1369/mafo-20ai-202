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
  width: string;
  height: string;
  quality: string;
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
          width: request.width,
          height: request.height,
          quality: request.quality,
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
