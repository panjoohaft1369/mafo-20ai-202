import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleValidateApiKey,
  handleGenerateImage,
  handleFetchLogs,
  handleFetchBilling,
  handleQueryTask,
  handleCallback,
} from "./routes/api-proxy";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  // Increase body size limit to handle base64-encoded images (up to 50MB)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // KIE.AI API Proxy Routes
  app.post("/api/validate-key", handleValidateApiKey);
  app.post("/api/generate-image", handleGenerateImage);
  app.get("/api/query-task", handleQueryTask);
  app.get("/api/logs", handleFetchLogs);
  app.get("/api/billing", handleFetchBilling);

  return app;
}
