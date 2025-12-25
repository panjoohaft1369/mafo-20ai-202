import { Request, Response } from "express";

const KIE_AI_API_BASE = "https://kie.ai/api";

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

    const response = await fetch(`${KIE_AI_API_BASE}/validate-key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      res.status(401).json({
        valid: false,
        message: "کد لایسنس شما معتبر نمیباشد. لطفا با پشتیبانی تماس بگیرید.",
      });
      return;
    }

    const data = await response.json();
    res.json({
      valid: true,
      credit: data.credit || 0,
      email: data.email || "",
      message: data.message || "موفق",
    });
  } catch (error) {
    console.error("API validation error:", error);
    res.status(500).json({
      valid: false,
      message: "خطا در اتصال به سرویس. لطفا بعدا دوباره سعی کنید.",
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
