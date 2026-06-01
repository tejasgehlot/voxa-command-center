// ── Auth helpers ─────────────────────────────────────────────

export interface AuthUser {
  accessToken:  string;
  refreshToken: string;
  userId:       string;
  name:         string;
  role:         "WARD_OFFICER" | "DEPT_HEAD" | "ADMIN";
  wardId:       number | null;
  wardName:     string | null;
  department:   string | null;
}

export function saveAuth(user: AuthUser) {
  sessionStorage.setItem("accessToken",  user.accessToken);
  sessionStorage.setItem("refreshToken", user.refreshToken);
  sessionStorage.setItem("authUser",     JSON.stringify(user));
}

export function getAuth(): AuthUser | null {
  const raw = sessionStorage.getItem("authUser");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function clearAuth() {
  sessionStorage.clear();
}

export function isLoggedIn(): boolean {
  return !!sessionStorage.getItem("accessToken");
}

export function getRole(): AuthUser["role"] | null {
  return getAuth()?.role ?? null;
}