// Backend API for all requests
const BACKEND_API_BASE = "/api";

/**
 * Translate API error messages from English to Persian
 */
export function translateErrorMessage(message?: string): string {
  if (!message) return "خطای نامشخص";

  const translations: Record<string, string> = {
    "Connection error. Please try again later.":
      "خطا در اتصال. لطفا بعدا دوباره سعی کنید.",
    "Error generating image": "خطا در ایجاد تصویر",
    "Error generating video": "خطا در ایجاد ویدیو",
    "Error uploading image": "خطا در آپلود تصویر",
    "Error fetching image status": "خطا در دریافت وضعیت تصویر",
    "Invalid license code. Please contact support.":
      "کد لایسنس شما معتبر نمیباشد. لطفا با پشتیبانی تماس بگیرید.",
  };

  return translations[message] || message;
}

export interface UploadImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  message?: string;
}

export interface ApiKeyValidationResponse {
  valid: boolean;
  message?: string;
  credit?: number;
  email?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    userId: string;
    name: string;
    email: string;
    phone: string;
    brandName: string;
    status: string;
    credits: number;
    apiKey: string;
  };
  error?: string;
}

export interface ImageGenerationRequest {
  apiKey: string;
  userId: string;
  imageUrls: string[];
  prompt: string;
  aspectRatio: string;
  resolution: string;
}

export interface VideoGenerationRequest {
  apiKey: string;
  userId: string;
  imageUrl: string;
  prompt: string;
  mode: string;
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
 * Login user with email and password
 */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${BACKEND_API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const data = await response.json();
        return {
          success: false,
          error: data.error || "خطا در ورود",
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message,
        data: data.data,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "خطا در اتصال. لطفا بعدا دوباره سعی کنید.",
    };
  }
}

/**
 * Validate API Key via Backend
 */
export async function validateApiKey(
  apiKey: string,
): Promise<ApiKeyValidationResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${BACKEND_API_BASE}/validate-key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        return {
          valid: false,
          message:
            data.message || "Invalid license code. Please contact support.",
        };
      }

      return {
        valid: true,
        credit: data.credit,
        email: data.email,
        message: data.message,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("API validation error:", error);
    return {
      valid: false,
      message: "Connection error. Please try again later.",
    };
  }
}

/**
 * Generate image via Backend
 * Note: API returns taskId, results delivered via callback
 */
export async function generateImage(
  request: ImageGenerationRequest,
): Promise<ImageGenerationResponse> {
  try {
    const response = await fetch(`${BACKEND_API_BASE}/generate-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${request.apiKey}`,
      },
      body: JSON.stringify({
        userId: request.userId,
        imageUrls: request.imageUrls,
        prompt: request.prompt,
        aspectRatio: request.aspectRatio,
        resolution: request.resolution,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Error generating image",
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
      error: "Connection error. Please try again later.",
    };
  }
}

/**
 * Generate video via Backend
 * Note: API returns taskId, results delivered via callback
 */
export async function generateVideo(
  request: VideoGenerationRequest,
): Promise<ImageGenerationResponse> {
  try {
    const response = await fetch(`${BACKEND_API_BASE}/generate-video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${request.apiKey}`,
      },
      body: JSON.stringify({
        userId: request.userId,
        imageUrl: request.imageUrl,
        prompt: request.prompt,
        mode: request.mode,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Error generating video",
      };
    }

    return {
      success: true,
      taskId: data.taskId,
      imageUrl: data.imageUrl,
      message: data.message,
    };
  } catch (error) {
    console.error("Video generation error:", error);
    return {
      success: false,
      error: "Connection error. Please try again later.",
    };
  }
}

/**
 * Fetch logs via Backend (last 2 months)
 */
export async function fetchLogs(apiKey: string): Promise<any[]> {
  try {
    const response = await fetch(`${BACKEND_API_BASE}/logs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch logs");
      return [];
    }

    const data = await response.json();
    const logs: any[] = data.logs || [];

    return logs;
  } catch (error) {
    console.error("Error fetching logs:", error);
    return [];
  }
}

/**
 * Fetch billing info via Backend
 */
export async function fetchBillingInfo(
  apiKey: string,
): Promise<BillingInfo | null> {
  try {
    const response = await fetch(`${BACKEND_API_BASE}/billing`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
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
 * Fetch task status for async API v1
 */
export async function queryTaskStatus(
  apiKey: string,
  taskId: string,
): Promise<TaskStatusResponse> {
  try {
    const response = await fetch(
      `${BACKEND_API_BASE}/query-task?taskId=${taskId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to query task status:", data);
      return {
        success: false,
        error: data.error || "Error fetching image status",
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
      error: "Connection error",
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
  interval: number = 1000, // 1 second
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
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  // Timeout
  return {
    success: false,
    error: "خطا: درخواست منقضی شد",
  };
}

/**
 * Upload image to server (converts base64 to public URL)
 */
export async function uploadImage(
  imageData: string,
): Promise<UploadImageResponse> {
  try {
    const response = await fetch(`${BACKEND_API_BASE}/upload-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({
        imageData,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Error uploading image",
      };
    }

    return {
      success: true,
      imageUrl: data.imageUrl,
      message: data.message,
    };
  } catch (error) {
    console.error("Image upload error:", error);
    return {
      success: false,
      error: "Error uploading image",
    };
  }
}
