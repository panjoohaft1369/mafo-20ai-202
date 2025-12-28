import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "Missing Supabase environment variables: SUPABASE_URL or SUPABASE_ANON_KEY",
  );
}

// Create Supabase client for server-side operations
export const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

// Re-export types
export type { User } from "@supabase/supabase-js";
