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
} from "./routes/api-proxy";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // KIE.AI API Proxy Routes
  app.post("/api/validate-key", handleValidateApiKey);
  app.post("/api/generate-image", handleGenerateImage);
  app.get("/api/logs", handleFetchLogs);
  app.get("/api/billing", handleFetchBilling);

  return app;
}
