import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Upload image from base64 data URL to server
 * Returns a public URL that kie.ai can access
 */
export async function handleImageUpload(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { imageData } = req.body;

    if (!imageData) {
      res.status(400).json({
        success: false,
        error: "No image data provided",
      });
      return;
    }

    // Parse base64 data URL
    const dataUrlPattern = /^data:image\/([a-zA-Z]+);base64,(.+)$/;
    const matches = imageData.match(dataUrlPattern);

    if (!matches) {
      res.status(400).json({
        success: false,
        error: "Invalid image format. Expected base64 data URL.",
      });
      return;
    }

    const [, imageType, base64Data] = matches;

    // Validate image type
    const allowedTypes = ["jpeg", "jpg", "png", "webp"];
    const normalizedType = imageType.toLowerCase();

    if (!allowedTypes.includes(normalizedType)) {
      res.status(400).json({
        success: false,
        error: `Unsupported image type: ${imageType}. Allowed: jpeg, png, webp`,
      });
      return;
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, "base64");

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(4).toString("hex");
    const ext = normalizedType === "jpg" ? "jpeg" : normalizedType;
    const filename = `${timestamp}-${randomStr}.${ext}`;
    const filepath = path.join(uploadsDir, filename);

    // Save file to disk
    fs.writeFileSync(filepath, buffer);
    console.log(`[Upload] Image saved: ${filename}`);

    // Get public URL - prefer environment variable, then x-forwarded headers, then request host
    let publicUrl: string;
    let urlSource: string;

    if (process.env.PUBLIC_URL) {
      // Use PUBLIC_URL if explicitly set
      publicUrl = `${process.env.PUBLIC_URL}/uploads/${filename}`;
      urlSource = "PUBLIC_URL env variable";
    } else {
      // Try to detect from request headers (for deployed apps with reverse proxy)
      const protocol = req.headers["x-forwarded-proto"] || "https";
      const host = req.headers["x-forwarded-host"] || req.headers.host;

      if (host && !host.includes("localhost")) {
        // Use detected host for deployed environments
        publicUrl = `${protocol}://${host}/uploads/${filename}`;
        urlSource = "detected via x-forwarded headers";
      } else {
        // Fallback - this might not work for external APIs
        publicUrl = `http://localhost:8080/uploads/${filename}`;
        urlSource = "FALLBACK TO LOCALHOST (⚠️ Kie.ai cannot access this)";
      }
    }

    console.log(
      `[Upload] Public URL generated: ${publicUrl} (source: ${urlSource})`,
    );
    if (urlSource.includes("LOCALHOST")) {
      console.warn(
        "[Upload] ⚠️  WARNING: Using localhost URL which external APIs cannot access.",
      );
      console.warn(
        "[Upload] ℹ️  Set PUBLIC_URL environment variable for production URLs:",
      );
      console.warn(
        "[Upload]    PUBLIC_URL=https://your-domain.com npm run dev",
      );
    }

    res.json({
      success: true,
      imageUrl: publicUrl,
      message: "Image uploaded successfully",
    });
  } catch (error: any) {
    console.error("[Upload] Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to upload image",
    });
  }
}

/**
 * Download image/video from external URL and serve it back
 * This bypasses CORS issues by downloading on the server side
 */
export async function handleDownloadImage(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { url } = req.query;

    if (!url || typeof url !== "string") {
      console.error("[Download] Missing URL parameter");
      res.status(400).json({
        success: false,
        error: "URL is required",
      });
      return;
    }

    console.log("[Download] Fetching from:", url);

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for larger files

    try {
      // Fetch the file from the external URL with timeout
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(
          "[Download] Failed to fetch, status:",
          response.status,
          response.statusText,
        );
        res.status(response.status).json({
          success: false,
          error: `Failed to download (HTTP ${response.status})`,
        });
        return;
      }

      // Get content type from response headers
      let contentType = response.headers.get("content-type") || "";

      console.log("[Download] Content-Type from server:", contentType);

      // If content-type is not set properly, try to detect from URL
      if (!contentType || contentType.includes("octet-stream")) {
        const urlLower = url.toLowerCase();
        if (
          urlLower.includes(".mp4") ||
          urlLower.includes("video") ||
          urlLower.includes("generated_video")
        ) {
          contentType = "video/mp4";
          console.log("[Download] Detected video from URL");
        } else if (
          urlLower.includes(".png") ||
          urlLower.includes(".jpg") ||
          urlLower.includes(".webp")
        ) {
          contentType = "image/png";
          console.log("[Download] Detected image from URL");
        } else {
          contentType = "application/octet-stream";
        }
      }

      // Determine filename and extension based on content type
      let filename = "mafo-file";
      let extension = "";

      if (contentType.includes("video")) {
        extension = ".mp4";
        filename = `mafo-video-${Date.now()}${extension}`;
      } else if (
        contentType.includes("image/png") ||
        contentType.includes("png")
      ) {
        extension = ".png";
        filename = `mafo-image-${Date.now()}${extension}`;
      } else if (
        contentType.includes("image/jpeg") ||
        contentType.includes("image/jpg") ||
        contentType.includes("jpg")
      ) {
        extension = ".jpg";
        filename = `mafo-image-${Date.now()}${extension}`;
      } else if (
        contentType.includes("image/webp") ||
        contentType.includes("webp")
      ) {
        extension = ".webp";
        filename = `mafo-image-${Date.now()}${extension}`;
      } else if (contentType.includes("image")) {
        extension = ".png";
        filename = `mafo-image-${Date.now()}${extension}`;
      } else {
        extension = ".bin";
        filename = `mafo-file-${Date.now()}${extension}`;
      }

      console.log(
        "[Download] Final filename:",
        filename,
        "content-type:",
        contentType,
      );

      // Set response headers to allow download
      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      // Get the buffer and send it
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (buffer.length === 0) {
        console.error("[Download] Downloaded buffer is empty!");
        res.status(500).json({
          success: false,
          error: "Downloaded file is empty",
        });
        return;
      }

      res.send(buffer);

      console.log(
        "[Download] File downloaded successfully, size:",
        buffer.length,
        "bytes",
      );
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error("[Download] Fetch error:", fetchError.message);

      if (fetchError.name === "AbortError") {
        res.status(504).json({
          success: false,
          error: "Download timeout - file took too long to fetch",
        });
      } else {
        res.status(502).json({
          success: false,
          error: `Failed to fetch file: ${fetchError.message}`,
        });
      }
    }
  } catch (error: any) {
    console.error("[Download] Unexpected error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to download file",
    });
  }
}
