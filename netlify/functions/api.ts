import serverless from "serverless-http";
import { createServer } from "../../server";

console.log("[Netlify Function] Starting API function initialization...");
console.log("[Netlify Function] Node environment:", process.env.NODE_ENV);
console.log("[Netlify Function] Environment variables available:", {
  SUPABASE_URL: process.env.SUPABASE_URL ? "✅" : "❌",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? "✅" : "❌",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅" : "❌",
  PUBLIC_URL: process.env.PUBLIC_URL ? "✅" : "❌",
});

let handler: any = null;

try {
  console.log("[Netlify Function] Creating Express server...");
  const app = createServer();
  console.log("[Netlify Function] ✅ Express server created successfully");
  
  handler = serverless(app);
  console.log("[Netlify Function] ✅ Serverless handler ready");
} catch (error: any) {
  console.error("[Netlify Function] ❌ Failed to initialize:", error);
  handler = async (event: any, context: any) => {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server initialization failed",
        message: error.message,
      }),
    };
  };
}

export { handler };
