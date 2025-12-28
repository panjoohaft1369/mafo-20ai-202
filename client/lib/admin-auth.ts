/**
 * Admin authentication utilities
 */

export function getAdminToken(): string | null {
  return localStorage.getItem("adminToken");
}

export function saveAdminToken(token: string): void {
  localStorage.setItem("adminToken", token);
}

export function clearAdminToken(): void {
  localStorage.removeItem("adminToken");
}

export function isAdminLoggedIn(): boolean {
  return !!getAdminToken();
}

export async function verifyAdminToken(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;

  try {
    const response = await fetch("/api/admin/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      clearAdminToken();
      return false;
    }

    return response.ok;
  } catch (error) {
    console.error("Token verification error:", error);
    return false;
  }
}
