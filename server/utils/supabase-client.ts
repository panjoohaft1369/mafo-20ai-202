import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("[Supabase Init] SUPABASE_URL:", SUPABASE_URL ? "✅ Set" : "❌ NOT SET");
console.log("[Supabase Init] SUPABASE_ANON_KEY:", SUPABASE_ANON_KEY ? "✅ Set" : "❌ NOT SET");
console.log("[Supabase Init] SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ NOT SET");

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
