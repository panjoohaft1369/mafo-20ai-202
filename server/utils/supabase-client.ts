import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

let SUPABASE_URL = process.env.SUPABASE_URL;
let SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
let SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Try to read from config file if env vars not set
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  const configFile = path.join(process.cwd(), "public", "config.json");
  if (fs.existsSync(configFile)) {
    try {
      const config = JSON.parse(fs.readFileSync(configFile, "utf-8"));
      if (config.supabaseUrl && config.anonKey) {
        SUPABASE_URL = config.supabaseUrl;
        SUPABASE_ANON_KEY = config.anonKey;
        SUPABASE_SERVICE_ROLE_KEY = config.serviceRoleKey;
        console.log("[Supabase Init] Configuration loaded from config.json");
      }
    } catch (e) {
      console.warn("[Supabase Init] Failed to read config.json:", e);
    }
  }
}

console.log(
  "[Supabase Init] SUPABASE_URL:",
  SUPABASE_URL ? "✅ Set" : "❌ NOT SET",
);
console.log(
  "[Supabase Init] SUPABASE_ANON_KEY:",
  SUPABASE_ANON_KEY ? "✅ Set" : "❌ NOT SET",
);
console.log(
  "[Supabase Init] SUPABASE_SERVICE_ROLE_KEY:",
  SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ NOT SET",
);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "❌ CRITICAL: Missing Supabase environment variables: SUPABASE_URL or SUPABASE_ANON_KEY",
  );
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "⚠️  Warning: SUPABASE_SERVICE_ROLE_KEY not set. Admin operations may fail.",
  );
}

// Create Supabase client for public/client operations (respects RLS policies)
export const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

// Create Supabase client for server-side trusted operations (bypasses RLS)
export const supabaseAdmin = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!,
);

console.log("[Supabase Init] ✅ Supabase clients initialized");

// Re-export types
export type { User } from "@supabase/supabase-js";
