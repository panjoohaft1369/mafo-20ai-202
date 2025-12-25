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
    const matches = imageData.match(/^data:image\/(\w+);base64,(.+)$/);