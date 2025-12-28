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
  localStorage.removeItem("adminUserRole");
  localStorage.removeItem("adminUserInfo");
}

export function getAdminUserRole(): string | null {
  return localStorage.getItem("adminUserRole");
}

export function saveAdminUserRole(role: string): void {
  localStorage.setItem("adminUserRole", role);
}

export function saveAdminUserInfo(userInfo: any): void {
  localStorage.setItem("adminUserInfo", JSON.stringify(userInfo));
}

export function getAdminUserInfo(): any {
  const info = localStorage.getItem("adminUserInfo");
  return info ? JSON.parse(info) : null;
}

export function isAdminLoggedIn(): boolean {
  return !!getAdminToken();
}

export function isUserAdmin(): boolean {
  const role = getAdminUserRole();
  return role === "admin";
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

    console.log(
      "[Admin Auth] Token verification response status:",
      response.status,
    );

    // 401 means token is invalid
    if (response.status === 401) {
      console.error("[Admin Auth] Token verification failed - clearing token");
      clearAdminToken();
      return false;
    }

    // 404 might mean endpoint doesn't exist yet, allow access (development mode)
    if (response.status === 404) {
      console.warn(
        "[Admin Auth] Verify endpoint not found, allowing access (development mode)",
      );
      return true;
    }

    // Other errors
    if (!response.ok) {
      console.error(
        "[Admin Auth] Token verification failed with status:",
        response.status,
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Admin Auth] Token verification error:", error);
    return false;
  }
}
