export async function isSupabaseConfigured(): Promise<boolean> {
  try {
    const response = await fetch("/api/setup/config");
    if (!response.ok) return false;
    const data = await response.json();
    return data.configured === true;
  } catch (error) {
    console.error("[Config] Error checking Supabase configuration:", error);
    return false;
  }
}
