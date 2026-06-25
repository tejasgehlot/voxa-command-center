import type { Complaint, Severity, Status, Category } from "./voxa-data";
import type { MapPin, ComplaintSummary, ComplaintDetail } from "./types";

// ── Backend category (UPPER_SNAKE) → UI category (Title Case) ──
const categoryMap: Record<string, Category> = {
  POTHOLE:     "Pothole",
  GARBAGE:     "Garbage",
  STREETLIGHT: "Street Light",
  WATER:       "Water",
  SEWAGE:      "Sanitation",
  ROAD_DAMAGE: "Pothole",
  OTHER:       "Garbage",
};

// ── Backend status → UI status ───────────────────────────────
const statusMap: Record<string, Status> = {
  OPEN:        "submitted",
  IN_PROGRESS: "in_progress",
  RESOLVED:    "resolved",
};

// ── Backend severity (1-10) → UI severity bucket ─────────────
function severityToUiSeverity(severity: number, status: string): Severity {
  if (status === "RESOLVED") return "resolved";
  if (severity >= 7) return "critical";
  if (severity >= 4) return "medium";
  return "low";
}

export function pinToComplaint(pin: MapPin): Complaint {
  return {
    id:            pin.complaintId,
    category:      categoryMap[pin.category] || "Garbage",
    title:         categoryMap[pin.category] || pin.category,
    description:   "",
    severity:      severityToUiSeverity(pin.severity, pin.status),
    severityScore: pin.severity * 10,
    status:        statusMap[pin.status] || "submitted",
    ward:          "",
    department:    "",
    lat:           pin.latitude,
    lng:           pin.longitude,
    upvotes:       pin.upvotes,
    comments:      0,
    timeAgo:       "",
    citizen:       "",
    phone:         "",
    photo:         "",
    combinedScore: pin.severity * 10 + pin.upvotes,
  };
}

export function summaryToComplaint(s: ComplaintSummary): Complaint {
  return {
    id:            s.complaintId,
    category:      categoryMap[s.aiCategory] || "Garbage",
    title:         categoryMap[s.aiCategory] || s.aiCategory,
    description:   "",
    severity:      severityToUiSeverity(s.aiSeverity, s.status),
    severityScore: s.aiSeverity * 10,
    status:        statusMap[s.status] || "submitted",
    ward:          s.wardName,
    department:    "",
    lat:           s.latitude,
    lng:           s.longitude,
    upvotes:       s.upvotes,
    comments:      s.commentCount,
    timeAgo:       timeAgoFromIso(s.createdAt),
    citizen:       "",
    phone:         "",
    photo:         s.photoUrl,
    combinedScore: s.aiSeverity * 10 + s.upvotes,
  };
}

export function detailToComplaint(d: ComplaintDetail, lat: number, lng: number): Complaint {
  return {
    id:            d.complaintId,
    category:      categoryMap[d.aiCategory] || "Garbage",
    title:         categoryMap[d.aiCategory] || d.aiCategory,
    description:   d.description,
    severity:      severityToUiSeverity(d.aiSeverity, d.status),
    severityScore: d.aiSeverity * 10,
    status:        statusMap[d.status] || "submitted",
    ward:          d.wardName,
    department:    d.aiDepartment,
    lat,
    lng,
    upvotes:       d.upvotes,
    comments:      d.commentCount,
    timeAgo:       timeAgoFromIso(d.createdAt),
    citizen:       "",
    phone:         "",
    photo:         d.photoUrl,
    combinedScore: d.aiSeverity * 10 + d.upvotes,
  };
}

function timeAgoFromIso(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours  = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
// Add this export to adapters.ts — converts tracked complaint with real timeline
export function trackedDetailToComplaint(d: ComplaintDetail): Complaint {
  return {
    id:            d.trackingId,
    category:      categoryMap[d.aiCategory] || "Garbage",
    title:         categoryMap[d.aiCategory] || d.aiCategory,
    description:   d.description,
    severity:      severityToUiSeverity(d.aiSeverity, d.status),
    severityScore: d.aiSeverity * 10,
    status:        statusMap[d.status] || "submitted",
    ward:          d.wardName,
    department:    d.aiDepartment,
    lat:           0,
    lng:           0,
    upvotes:       d.upvotes,
    comments:      d.commentCount,
    timeAgo:       timeAgoFromIso(d.createdAt),
    citizen:       "",
    phone:         "",
    photo:         d.photoUrl,
    combinedScore: d.aiSeverity * 10 + d.upvotes,
  };
}