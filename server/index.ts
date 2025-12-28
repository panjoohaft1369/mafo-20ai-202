import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleValidateApiKey,
  handleGenerateImage,
  handleGenerateVideo,
  handleFetchLogs,
  handleFetchBilling,
  handleQueryTask,
  handleCallback,
} from "./routes/api-proxy";
import { handleImageUpload } from "./routes/upload";
import { handleRegister } from "./routes/auth";
import {
  handleAdminLogin,
  handleAdminVerify,
  handleAdminGetUsers,
  handleAdminGetUser,
  handleAdminUpdateCredits,
  handleAdminAddApiKey,
  handleAdminDeleteApiKey,
  handleAdminApproveUser,
} from "./routes/admin";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  // Increase body size limit to handle base64-encoded images (up to 50MB)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Serve static files from public directory
  app.use(express.static("public"));

  // Logging middleware for debugging
  app.use((req, res, next) => {
    if (req.path === "/api/callback") {
      console.log("[REQUEST] Incoming callback request");
      console.log("[REQUEST] Method:", req.method);
      console.log(
        "[REQUEST] Headers:",
        Object.fromEntries(
          Object.entries(req.headers).filter(
            ([key]) =>
              !key.toLowerCase().includes("cookie") &&
              !key.toLowerCase().includes("authorization"),
          ),
        ),
      );
    }
    next();
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Health check endpoint - shows all tasks and callback status
  app.get("/api/health", (_req, res) => {
    const fs = require("fs");
    const path = require("path");

    const tasksFile = path.join(
      process.cwd(),
      "public",
      "tasks",
      "results.json",
    );
    let taskData: any = {};

    try {
      if (fs.existsSync(tasksFile)) {
        const content = fs.readFileSync(tasksFile, "utf-8");
        taskData = JSON.parse(content);
      }
    } catch (e) {
      console.error("[Health] Error reading tasks:", e);
    }

    res.json({
      status: "ok",
      public_url: process.env.PUBLIC_URL || "not set",
      callback_url: `${process.env.PUBLIC_URL || "not set"}/api/callback`,
      tasks_file: tasksFile,
      tasks_count: Object.keys(taskData).length,
      tasks: taskData,
      timestamp: new Date().toISOString(),
    });
  });

  // Image upload route
  app.post("/api/upload-image", handleImageUpload);

  // Authentication routes
  app.post("/api/register", handleRegister);

  // KIE.AI API Proxy Routes
  app.post("/api/validate-key", handleValidateApiKey);
  app.post("/api/generate-image", handleGenerateImage);
  app.post("/api/generate-video", handleGenerateVideo);
  app.get("/api/query-task", handleQueryTask);
  app.post("/api/callback", handleCallback); // Callback endpoint for kie.ai
  app.get("/api/logs", handleFetchLogs);
  app.get("/api/billing", handleFetchBilling);

  // Test endpoint - manually trigger callback for debugging
  app.post("/api/test-callback", (req, res) => {
    console.log("[TEST] Test callback received");
    console.log("[TEST] Body:", JSON.stringify(req.body, null, 2));
    handleCallback(req, res);
  });

  // Debug endpoint - shows recent logs
  app.get("/api/debug-logs", (_req, res) => {
    res.json({
      message: "Check browser console and server logs for debug output",
      endpoints: {
        health: "/api/health",
        test_callback: "/api/test-callback",
        tasks_file: "/tasks/results.json",
      },
    });
  });

  return app;
}
