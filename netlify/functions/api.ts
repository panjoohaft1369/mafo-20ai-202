import serverless from "serverless-http";
import { createServer } from "../../server";

// Initialize the Express app once
let app: any = null;

const getApp = () => {
  if (!app) {
    console.log("[Netlify Function] Initializing Express server");
    try {
      app = createServer();
      console.log("[Netlify Function] Express server initialized successfully");
    } catch (error) {
      console.error("[Netlify Function] Error initializing server:", error);
      throw error;
    }
  }
  return app;
};

export const handler = serverless(getApp());
