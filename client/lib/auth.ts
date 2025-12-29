const API_KEY_STORAGE_KEY = "mafo_api_key";
const USER_ID_STORAGE_KEY = "mafo_user_id";
const USER_NAME_STORAGE_KEY = "mafo_user_name";
const USER_EMAIL_STORAGE_KEY = "mafo_user_email";
const USER_CREDITS_STORAGE_KEY = "mafo_user_credits";
const USER_ROLE_STORAGE_KEY = "mafo_user_role";

export interface AuthState {
  isLoggedIn: boolean;
  userId: string | null;
  apiKey: string | null;
  name: string | null;
  email: string | null;
  credits: number | null;
  role?: "user" | "admin";
}

/**
 * Get current auth state from localStorage
 */
export function getAuthState(): AuthState {
  const userId = localStorage.getItem(USER_ID_STORAGE_KEY);
  const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
  const name = localStorage.getItem(USER_NAME_STORAGE_KEY);
  const email = localStorage.getItem(USER_EMAIL_STORAGE_KEY);
  const creditsStr = localStorage.getItem(USER_CREDITS_STORAGE_KEY);
  const role =
    (localStorage.getItem(USER_ROLE_STORAGE_KEY) as "user" | "admin" | null) ||
    "user";

  return {
    isLoggedIn: !!apiKey && !!userId,
    userId,
    apiKey,
    name,
    email,
    credits: creditsStr ? parseInt(creditsStr, 10) : null,
    role: role as "user" | "admin",
  };
}

/**
 * Save auth credentials to localStorage
 */
export function saveAuthCredentials(
  userId: string,
  apiKey: string,
  name: string,
  email: string,
  credits: number,
  role: "user" | "admin" = "user",
): void {
  localStorage.setItem(USER_ID_STORAGE_KEY, userId);
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
  localStorage.setItem(USER_NAME_STORAGE_KEY, name);
  localStorage.setItem(USER_EMAIL_STORAGE_KEY, email);
  localStorage.setItem(USER_CREDITS_STORAGE_KEY, credits.toString());
  localStorage.setItem(USER_ROLE_STORAGE_KEY, role);
}

/**
 * Clear auth data (logout)
 */
export function clearAuth(): void {
  localStorage.removeItem(USER_ID_STORAGE_KEY);
  localStorage.removeItem(API_KEY_STORAGE_KEY);
  localStorage.removeItem(USER_NAME_STORAGE_KEY);
  localStorage.removeItem(USER_EMAIL_STORAGE_KEY);
  localStorage.removeItem(USER_CREDITS_STORAGE_KEY);
  localStorage.removeItem(USER_ROLE_STORAGE_KEY);
}

/**
 * Update credits in storage
 */
export function updateStoredCredits(credits: number): void {
  localStorage.setItem(USER_CREDITS_STORAGE_KEY, credits.toString());
}
