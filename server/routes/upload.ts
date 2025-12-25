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
  res: Response
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

    // Get protocol and host from request
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:8080";
    
    // Generate public URL
    const publicUrl = `${protocol}://${host}/uploads/${filename}`;

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
