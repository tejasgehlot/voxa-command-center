// Mock data for VOXA civic platform

export type Severity = "critical" | "medium" | "low" | "resolved";
export type Status = "submitted" | "ai_analysed" | "assigned" | "in_progress" | "resolved";
export type Category = "Pothole" | "Garbage" | "Street Light" | "Water" | "Electricity" | "Sanitation";

export interface Complaint {
  id: string;
  category: Category;
  title: string;
  description: string;
  severity: Severity;
  severityScore: number;
  status: Status;
  ward: string;
  department: string;
  lat: number;
  lng: number;
  upvotes: number;
  comments: number;
  timeAgo: string;
  citizen: string;
  phone: string;
  photo: string;
  combinedScore: number;
}

// Vadodara center
export const VADODARA_CENTER: [number, number] = [22.3072, 73.1812];

const photos = [
  "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1597149959856-ae9b9aa5c8b3?w=600&h=400&fit=crop",
];

function rand(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const categories: Category[] = ["Pothole", "Garbage", "Street Light", "Water", "Electricity", "Sanitation"];
const departments: Record<Category, string> = {
  Pothole: "Roads",
  Garbage: "Sanitation",
  "Street Light": "Electricity",
  Water: "Water",
  Electricity: "Electricity",
  Sanitation: "Sanitation",
};

export const complaints: Complaint[] = Array.from({ length: 48 }).map((_, i) => {
  const cat = categories[i % categories.length];
  const sev = i % 5 === 0 ? "critical" : i % 3 === 0 ? "resolved" : i % 2 === 0 ? "medium" : "low";
  const score = sev === "critical" ? 85 + Math.floor(rand(i) * 15) : sev === "medium" ? 50 + Math.floor(rand(i) * 25) : sev === "resolved" ? 30 + Math.floor(rand(i) * 30) : 20 + Math.floor(rand(i) * 20);
  const up = Math.floor(rand(i + 7) * 100);
  return {
    id: `VX-${20000 + i}`,
    category: cat,
    title: cat === "Pothole" ? "Major road crater" : cat === "Garbage" ? "Garbage pile uncollected" : cat === "Street Light" ? "Streetlight out" : `${cat} issue`,
    description: "Major civic issue reported by resident. Requires immediate attention from authority.",
    severity: sev as Severity,
    severityScore: score,
    status: sev === "resolved" ? "resolved" : i % 4 === 0 ? "in_progress" : i % 4 === 1 ? "assigned" : "submitted",
    ward: `Ward ${(i % 19) + 1}`,
    department: departments[cat],
    lat: VADODARA_CENTER[0] + (rand(i) - 0.5) * 0.08,
    lng: VADODARA_CENTER[1] + (rand(i + 1) - 0.5) * 0.08,
    upvotes: up,
    comments: Math.floor(rand(i + 3) * 12),
    timeAgo: `${Math.floor(rand(i + 9) * 24)}h ago`,
    citizen: ["Ramesh Gupta", "Priya Shah", "Anil Kumar", "Meera Patel", "Vikram Joshi"][i % 5],
    phone: `987${String(6543210 + i).slice(-7)}`,
    photo: photos[i % photos.length],
    combinedScore: score + up,
  };
});

export const sevColor = (s: Severity) =>
  s === "critical" ? "text-critical" : s === "medium" ? "text-warning" : s === "resolved" ? "text-success" : "text-muted-foreground";

export const sevBg = (s: Severity) =>
  s === "critical" ? "bg-critical/15 text-critical border-critical/40" :
  s === "medium" ? "bg-warning/15 text-warning border-warning/40" :
  s === "resolved" ? "bg-success/15 text-success border-success/40" :
  "bg-muted text-muted-foreground border-border";

export const sevHex = (s: Severity) =>
  s === "critical" ? "#FF2D2D" : s === "medium" ? "#FFB800" : s === "resolved" ? "#00FF88" : "#6B7FA3";

// Chart mock data
export const complaintsOverTime = Array.from({ length: 12 }).map((_, i) => ({
  day: `D${i + 1}`,
  count: 30 + Math.floor(rand(i + 11) * 70),
}));

export const complaintsByWard = Array.from({ length: 19 }).map((_, i) => ({
  ward: `W${i + 1}`,
  count: 50 + Math.floor(rand(i + 21) * 200),
}));

export const complaintsByDept = [
  { name: "Roads", value: 36, fill: "#00D4FF" },
  { name: "Sanitation", value: 32, fill: "#00FF88" },
  { name: "Water", value: 16, fill: "#FFB800" },
  { name: "Electricity", value: 12, fill: "#a78bfa" },
  { name: "Others", value: 4, fill: "#FF2D2D" },
];

export const activityLog = [
  { who: "Rajesh Patel", what: "reassigned VX-20934", when: "2m ago", color: "critical" as const },
  { who: "A. Sharma", what: "added internal note", when: "5m ago", color: "warning" as const },
  { who: "Vikram Shah", what: "resolved VX-20912", when: "11m ago", color: "success" as const },
  { who: "Meera Patel", what: "escalated VX-20901", when: "17m ago", color: "critical" as const },
  { who: "P. Joshi", what: "assigned officer to VX-20890", when: "24m ago", color: "primary" as const },
  { who: "Rajesh Patel", what: "updated status VX-20875", when: "31m ago", color: "warning" as const },
  { who: "System", what: "auto-routed 14 complaints", when: "42m ago", color: "primary" as const },
];
