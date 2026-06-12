import api from "./api";
import type {
  AiAnalyseResponse,
  ComplaintSubmitResponse,
  MapPin,
  ComplaintSummary,
  ComplaintDetail,
  PublicStats,
  OfficerComplaint,
  WardStats,
  AdminStats,
  HealthScore,
} from "./types";

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  userId: string;
  name: string;
  role: "WARD_OFFICER" | "DEPT_HEAD" | "ADMIN";
  wardId: number | null;
  wardName: string | null;
  department: string | null;
};

function unwrapData<T>(response: any): T {
  return response?.data?.data ?? response?.data;
}

// ── AI ────────────────────────────────────────────────────────
export async function analysePhoto(
  photo: File,
  description?: string
): Promise<AiAnalyseResponse> {
  const form = new FormData();
  form.append("photo", photo);
  if (description) form.append("description", description);

  const res = await api.post("/ai/analyse", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return unwrapData<AiAnalyseResponse>(res);
}

// ── Complaints ────────────────────────────────────────────────
export async function submitComplaint(
  name: string,
  phone: string,
  description: string,
  latitude: number,
  longitude: number,
  photo: File
): Promise<ComplaintSubmitResponse> {
  const form = new FormData();
  form.append("name", name);
  form.append("phone", phone);
  form.append("description", description);
  form.append("latitude", String(latitude));
  form.append("longitude", String(longitude));
  form.append("photo", photo);

  const res = await api.post("/complaints", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return unwrapData<ComplaintSubmitResponse>(res);
}

export async function getMapPins(filters?: {
  category?: string;
  status?: string;
  wardId?: number;
}): Promise<MapPin[]> {
  const res = await api.get("/map/pins", {
    params: filters,
  });

  return unwrapData<MapPin[]>(res);
}

export async function getComplaints(params?: {
  page?: number;
  size?: number;
  status?: string;
  category?: string;
  wardId?: number;
}): Promise<{ content: ComplaintSummary[]; totalElements: number }> {
  const res = await api.get("/complaints", { params });
  return unwrapData<{ content: ComplaintSummary[]; totalElements: number }>(res);
}

export async function getComplaintById(id: string): Promise<ComplaintDetail> {
  const res = await api.get(`/complaints/${id}`);
  return unwrapData<ComplaintDetail>(res);
}

export async function trackComplaint(
  phone: string,
  trackingId?: string
): Promise<ComplaintDetail[]> {
  const res = await api.get("/complaints/track", {
    params: { phone, trackingId },
  });

  return unwrapData<ComplaintDetail[]>(res);
}

export async function upvoteComplaint(
  id: string,
  phone: string
): Promise<{ upvotes: number; priorityScore: number }> {
  const res = await api.post(`/complaints/${id}/upvote`, { phone });
  return unwrapData<{ upvotes: number; priorityScore: number }>(res);
}

export async function getComments(id: string) {
  const res = await api.get(`/complaints/${id}/comments`);
  return unwrapData(res);
}

export async function addComment(
  id: string,
  name: string,
  phone: string,
  comment: string
) {
  const res = await api.post(`/complaints/${id}/comments`, {
    name,
    phone,
    comment,
  });

  return unwrapData(res);
}

// ── Public Stats ──────────────────────────────────────────────
export async function getPublicStats(): Promise<PublicStats> {
  const res = await api.get("/stats/public");
  return unwrapData<PublicStats>(res);
}

export async function getWards() {
  const res = await api.get("/wards");
  return unwrapData(res);
}

// ── Auth ──────────────────────────────────────────────────────
export async function login(
  email: string,
  password: string,
  role: "WARD_OFFICER" | "DEPT_HEAD" | "ADMIN"
): Promise<AuthResponse> {
  const res = await api.post("/auth/login", { email, password, role });
  return unwrapData<AuthResponse>(res);
}

export async function logout(_refreshToken?: string) {
  await api.post("/auth/logout");
}

// ── Officer ───────────────────────────────────────────────────
export async function getOfficerComplaints(params?: {
  page?: number;
  size?: number;
  status?: string;
  sort?: string;
}): Promise<{
  content: OfficerComplaint[];
  wardStats: WardStats;
  totalElements: number;
  totalPages: number;
}> {
  const res = await api.get("/officer/complaints", { params });
  return unwrapData<{
    content: OfficerComplaint[];
    wardStats: WardStats;
    totalElements: number;
    totalPages: number;
  }>(res);
}

export async function updateComplaintStatus(
  id: string,
  status: string,
  note?: string
): Promise<ComplaintDetail> {
  const res = await api.patch(`/officer/complaints/${id}/status`, {
    status,
    note,
  });

  return unwrapData<ComplaintDetail>(res);
}

export async function addOfficerNote(id: string, note: string) {
  const res = await api.post(`/officer/complaints/${id}/notes`, { note });
  return unwrapData(res);
}

// ── Dept Head ─────────────────────────────────────────────────
export async function getDeptComplaints(params?: {
  page?: number;
  size?: number;
  status?: string;
  wardId?: number;
}) {
  const res = await api.get("/dept/complaints", { params });
  return unwrapData(res);
}

export async function reassignComplaint(
  id: string,
  targetWardId: number,
  reason?: string
) {
  const res = await api.patch(`/dept/complaints/${id}/reassign`, {
    targetWardId,
    reason,
  });

  return unwrapData(res);
}

export async function escalateComplaint(id: string, reason: string) {
  const res = await api.post(`/dept/complaints/${id}/escalate`, { reason });
  return unwrapData(res);
}

// ── Admin ─────────────────────────────────────────────────────
export async function getAdminStats(): Promise<AdminStats> {
  const res = await api.get("/admin/stats");
  return unwrapData<AdminStats>(res);
}

export async function getHealthScore(): Promise<HealthScore> {
  const res = await api.get("/admin/health-score");
  return unwrapData<HealthScore>(res);
}

export async function getTrends(days = 30) {
  const res = await api.get("/admin/analytics/trends", { params: { days } });
  return unwrapData(res);
}

export async function getByWard() {
  const res = await api.get("/admin/analytics/by-ward");
  return unwrapData(res);
}

export async function getByDepartment() {
  const res = await api.get("/admin/analytics/by-department");
  return unwrapData(res);
}

export async function getActivityLog(params?: {
  page?: number;
  size?: number;
}) {
  const res = await api.get("/admin/activity-log", { params });
  return unwrapData(res);
}

export async function getAdminUsers(params?: {
  role?: string;
  wardId?: number;
  active?: boolean;
}) {
  const res = await api.get("/admin/users", { params });
  return unwrapData(res);
}

export async function createUser(data: {
  name: string;
  email: string;
  role: string;
  wardId?: number;
  department?: string;
}) {
  const res = await api.post("/admin/users", data);
  return unwrapData(res);
}

// ── Notifications ─────────────────────────────────────────────
export async function getNotifications(unreadOnly = true, size = 20) {
  const res = await api.get("/notifications", {
    params: { unreadOnly, size },
  });
  return unwrapData(res);
}

export async function markNotificationRead(id: string) {
  const res = await api.patch(`/notifications/${id}/read`);
  return unwrapData(res);
}