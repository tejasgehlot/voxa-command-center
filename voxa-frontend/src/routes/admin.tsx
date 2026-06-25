import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { UserPlus, ListChecks, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, CartesianGrid,
} from "recharts";
import { DashboardShell } from "@/components/voxa/DashboardShell";
import { VoxaMap } from "@/components/voxa/VoxaMap";
import { getAuth } from "@/lib/auth";
import {
  getAdminStats, getHealthScore, getTrends, getByWard,
  getByDepartment, getActivityLog, getMapPins, createUser,
} from "@/lib/apiService";
import type { AdminStats, HealthScore, MapPin } from "@/lib/types";
import type { Complaint, Severity } from "@/lib/voxa-data";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin God View — VOXA" }] }),
  component: Admin,
});

// ── Chart colour palette ──────────────────────────────────────
const DEPT_COLORS = ["#00D4FF","#00FF88","#FFB800","#FF4D6D","#A78BFA","#FB923C","#34D399"];

// ── Map pin → Complaint card adapter ─────────────────────────
const PIN_SEVERITY: Record<number, Severity> = { 1:"low",2:"low",3:"low",4:"medium",5:"medium",6:"medium",7:"high",8:"high",9:"critical",10:"critical" };

function pinToCard(p: MapPin): Complaint {
  return {
    id: p.complaintId, category: p.category, title: p.category,
    description: "", severity: PIN_SEVERITY[p.severity] ?? "medium",
    severityScore: p.severity * 10, status: p.status.toLowerCase() as any,
    ward: "", department: "", lat: p.latitude, lng: p.longitude,
    upvotes: p.upvotes, comments: 0, timeAgo: "",
    citizen: "", phone: "", photo: "",
    combinedScore: p.severity * 10 + p.upvotes,
  };
}

// ── Main ──────────────────────────────────────────────────────
function Admin() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getAuth();
    if (!user || user.role !== "ADMIN") navigate({ to: "/login" });
  }, [navigate]);

  const adminName = getAuth()?.name ?? "Commissioner";

  // State
  const [stats,      setStats]      = useState<AdminStats | null>(null);
  const [health,     setHealth]     = useState<HealthScore | null>(null);
  const [trends,     setTrends]     = useState<{ day: string; count: number }[]>([]);
  const [byWard,     setByWard]     = useState<{ ward: string; count: number }[]>([]);
  const [byDept,     setByDept]     = useState<{ name: string; value: number; fill: string }[]>([]);
  const [activity,   setActivity]   = useState<any[]>([]);
  const [mapPins,    setMapPins]    = useState<Complaint[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Fetch all
  const fetchAll = useCallback(async () => {
    try {
      const [s, h, t, w, d, a, pins] = await Promise.all([
        getAdminStats(),
        getHealthScore(),
        getTrends(30),
        getByWard(),
        getByDepartment(),
        getActivityLog({ size: 20 }),
        getMapPins(),
      ]);

      setStats(s);
      setHealth(h);

      // Trends — expect [{ date/day, count }]
      const trendArr = Array.isArray(t) ? t : (t as any).content ?? [];
      setTrends(trendArr.map((r: any) => ({
        day:   r.date ?? r.day ?? r.label ?? "",
        count: r.count ?? r.total ?? 0,
      })));

      // By ward — expect [{ wardName, count }]
      const wardArr = Array.isArray(w) ? w : (w as any).content ?? [];
      setByWard(wardArr.map((r: any) => ({
        ward:  r.wardName ?? r.ward ?? r.name ?? "",
        count: r.count ?? r.total ?? 0,
      })));

      // By dept — expect [{ department, count }]
      const deptArr = Array.isArray(d) ? d : (d as any).content ?? [];
      setByDept(deptArr.map((r: any, i: number) => ({
        name:  r.department ?? r.dept ?? r.name ?? "",
        value: r.count ?? r.total ?? 0,
        fill:  DEPT_COLORS[i % DEPT_COLORS.length],
      })));

      // Activity log
      const actArr = Array.isArray(a) ? a : (a as any).content ?? [];
      setActivity(actArr);

      // Map pins
      const pinArr = Array.isArray(pins) ? pins : [];
      setMapPins(pinArr.map(pinToCard));

    } catch (e) {
      console.error("Admin fetch failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Health score ring
  const score         = health?.score ?? 0;
  const circumference = 2 * Math.PI * 90;
  const dash          = (score / 100) * circumference;
  const scoreColor    = score >= 75 ? "#00FF88" : score >= 50 ? "#FFB800" : "#FF4D6D";
  const scoreGlow     = score >= 75 ? "text-success" : score >= 50 ? "text-warning" : "text-critical";

  if (loading) return (
    <DashboardShell title="ADMIN" subtitle="loading…" context="" head="">
      <div className="flex-1 flex items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm tracking-widest">LOADING CITY DATA…</span>
      </div>
    </DashboardShell>
  );

  return (
    <DashboardShell
      title="MUNICIPAL COMMISSIONER — God View"
      subtitle="Admin Dashboard · Municipal Commissioner Level"
      context="GOD VIEW: Entire city, all departments, all wards, all roles"
      head={adminName.toUpperCase()}
    >
      <div className="h-full overflow-y-auto p-4 grid grid-cols-12 gap-4 auto-rows-min">

        {/* City health score */}
        <div className="col-span-12 lg:col-span-3 panel p-5 flex flex-col items-center">
          <div className="text-[10px] tracking-widest text-muted-foreground">CITY HEALTH SCORE (0–100)</div>
          <div className="relative w-52 h-52 my-2">
            <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
              <circle cx="100" cy="100" r="90" fill="none" stroke="oklch(0.3 0.04 235 / 0.4)" strokeWidth="12" />
              <circle cx="100" cy="100" r="90" fill="none" stroke={scoreColor} strokeWidth="12"
                strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 8px ${scoreColor})` }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`font-mono text-6xl font-bold ${scoreGlow}`}>{score}</div>
              <div className="text-xs text-muted-foreground mt-1">{health?.label ?? ""}</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Trend: <span className={scoreGlow}>{health?.trend ?? "—"}</span>
          </div>
          {health && (
            <div className="mt-3 w-full space-y-1">
              {[
                { l: "Resolution Rate",   v: health.components.resolutionRate   },
                { l: "Avg Response (hrs)",v: health.components.avgResponseHours },
                { l: "Critical Backlog",  v: health.components.criticalBacklog  },
                { l: "Ward Coverage",     v: health.components.wardCoverage     },
              ].map(c => (
                <div key={c.l} className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">{c.l}</span>
                  <span className="font-mono text-foreground">{c.v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* KPI banners + map */}
        <div className="col-span-12 lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { l: "TOTAL COMPLAINTS",    v: stats?.totalComplaints?.toLocaleString()  ?? "—", c: "",              glow: false },
            { l: "RESOLVED TODAY",      v: stats?.resolvedToday?.toLocaleString()    ?? "—", c: "text-success",  glow: false },
            { l: "CRITICAL ACTIVE",     v: stats?.criticalActive?.toLocaleString()   ?? "—", c: "text-critical", glow: true  },
            { l: "AVG RESOLUTION (days)",v: stats?.avgResolutionDays?.toFixed(1)     ?? "—", c: "",              glow: false },
          ].map((k) => (
            <div key={k.l} className={k.glow ? "panel-glow p-4" : "panel p-4"}>
              <div className="text-[10px] tracking-widest text-muted-foreground">{k.l}</div>
              <div className={`font-mono text-3xl font-bold ${k.c || "text-foreground"}`}>{k.v}</div>
            </div>
          ))}
          {/* secondary KPIs */}
          {[
            { l: "ESCALATED ACTIVE",       v: stats?.escalatedActive?.toLocaleString()       ?? "—", c: "text-warning" },
            { l: "TOTAL CITIZENS",         v: stats?.totalCitizens?.toLocaleString()          ?? "—", c: "" },
            { l: "MOST COMPLAINTS — WARD", v: stats?.wardWithMostComplaints                  ?? "—", c: "text-primary" },
            { l: "DEPT BACKLOG LEADER",    v: stats?.deptWithMostBacklog                     ?? "—", c: "text-warning" },
          ].map((k) => (
            <div key={k.l} className="panel p-3">
              <div className="text-[10px] tracking-widest text-muted-foreground">{k.l}</div>
              <div className={`font-mono text-lg font-bold truncate ${k.c || "text-foreground"}`}>{k.v}</div>
            </div>
          ))}
          <div className="col-span-2 md:col-span-4 panel overflow-hidden h-72">
            <VoxaMap complaints={mapPins} />
          </div>
        </div>

        {/* Charts */}
        <div className="col-span-12 lg:col-span-4 panel p-4">
          <div className="font-display font-bold mb-2">Complaints Over Time (30 days)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trends}>
              <CartesianGrid stroke="oklch(0.3 0.04 235 / 0.3)" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="#6B7FA3" fontSize={10} tickFormatter={v => v.slice(5)} />
              <YAxis stroke="#6B7FA3" fontSize={11} />
              <Tooltip contentStyle={{ background: "#0F1623", border: "1px solid #00D4FF40" }} />
              <Line type="monotone" dataKey="count" stroke="#00D4FF" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="col-span-12 lg:col-span-4 panel p-4">
          <div className="font-display font-bold mb-2">Complaints by Ward</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byWard}>
              <CartesianGrid stroke="oklch(0.3 0.04 235 / 0.3)" strokeDasharray="3 3" />
              <XAxis dataKey="ward" stroke="#6B7FA3" fontSize={9} />
              <YAxis stroke="#6B7FA3" fontSize={11} />
              <Tooltip contentStyle={{ background: "#0F1623", border: "1px solid #00D4FF40" }} />
              <Bar dataKey="count" fill="#00D4FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="col-span-12 lg:col-span-4 panel p-4">
          <div className="font-display font-bold mb-2">Complaints by Department</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byDept} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {byDept.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0F1623", border: "1px solid #00D4FF40" }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#6B7FA3" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Admin powers */}
        <div className="col-span-12 panel-glow p-4 grid md:grid-cols-2 gap-4">
          {/* Create account */}
          <div className="panel p-4 flex flex-col items-center text-center">
            <UserPlus className="w-8 h-8 text-primary mb-2" />
            <div className="font-display font-bold tracking-wider">CREATE AUTHORITY ACCOUNT</div>
            <div className="text-xs text-muted-foreground mt-1 mb-3">Ward Officers, Dept Heads, All roles</div>
            <button onClick={() => setShowCreate(true)} className="btn-glow px-5 py-2 rounded text-sm">
              + NEW ACCOUNT
            </button>
          </div>

          {/* Activity log */}
          <div className="panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <ListChecks className="w-5 h-5 text-primary" />
              <div className="font-display font-bold tracking-wider">FULL ACTIVITY LOG</div>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {activity.length === 0 && (
                <div className="text-xs text-muted-foreground">No activity recorded yet.</div>
              )}
              {activity.map((a: any, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                    a.severity === "CRITICAL" || a.type === "ESCALATE" ? "bg-critical" :
                    a.severity === "HIGH"     || a.type === "ASSIGN"   ? "bg-warning"  :
                    a.type === "RESOLVE"                               ? "bg-success"  : "bg-primary"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-foreground font-semibold">{a.actorName ?? a.who ?? "System"}</span>
                    <span className="text-muted-foreground"> {a.action ?? a.what ?? a.description ?? ""}</span>
                  </div>
                  <span className="font-mono text-muted-foreground shrink-0">
                    {a.createdAt ? new Date(a.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : a.when ?? ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Create account modal */}
      {showCreate && <CreateAccountModal onClose={() => setShowCreate(false)} onDone={() => { setShowCreate(false); fetchAll(); }} />}
    </DashboardShell>
  );
}

// ── Create Account Modal ──────────────────────────────────────
function CreateAccountModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [role,       setRole]       = useState<"WARD_OFFICER" | "DEPT_HEAD" | "ADMIN">("WARD_OFFICER");
  const [wardId,     setWardId]     = useState("");
  const [department, setDepartment] = useState("");
  const [saving,     setSaving]     = useState(false);
  const [err,        setErr]        = useState<string | null>(null);
  const [done,       setDone]       = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) { setErr("Name and email are required."); return; }
    setSaving(true); setErr(null);
    try {
      await createUser({
        name:       name.trim(),
        email:      email.trim(),
        role,
        wardId:     role === "WARD_OFFICER" && wardId ? Number(wardId) : undefined,
        department: role === "DEPT_HEAD"    && department ? department : undefined,
      });
      setDone(true);
      setTimeout(onDone, 1200);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Failed to create account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="panel-glow w-full max-w-md p-6 rounded-lg space-y-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
        <div className="font-display font-bold tracking-widest text-lg">CREATE AUTHORITY ACCOUNT</div>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle2 className="w-10 h-10 text-success" />
            <div className="text-success font-semibold">Account created successfully!</div>
          </div>
        ) : (
          <>
            {err && (
              <div className="flex items-center gap-2 bg-critical/10 border border-critical/40 rounded px-3 py-2 text-xs text-critical">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {err}
              </div>
            )}

            <div>
              <label className="text-xs tracking-widest text-muted-foreground">FULL NAME</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full mt-1 bg-input border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs tracking-widest text-muted-foreground">EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full mt-1 bg-input border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs tracking-widest text-muted-foreground">ROLE</label>
              <select value={role} onChange={e => setRole(e.target.value as any)}
                className="w-full mt-1 bg-input border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary">
                <option value="WARD_OFFICER">Ward Officer</option>
                <option value="DEPT_HEAD">Department Head</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            {role === "WARD_OFFICER" && (
              <div>
                <label className="text-xs tracking-widest text-muted-foreground">WARD ID</label>
                <select value={wardId} onChange={e => setWardId(e.target.value)}
                  className="w-full mt-1 bg-input border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary">
                  <option value="">Select ward…</option>
                  {Array.from({ length: 19 }, (_, i) => i + 1).map(n => (
                    <option key={n} value={String(n)}>Ward {n}</option>
                  ))}
                </select>
              </div>
            )}
            {role === "DEPT_HEAD" && (
              <div>
                <label className="text-xs tracking-widest text-muted-foreground">DEPARTMENT</label>
                <select value={department} onChange={e => setDepartment(e.target.value)}
                  className="w-full mt-1 bg-input border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary">
                  <option value="">Select department…</option>
                  {["Roads and Infrastructure","Sanitation and Waste Management","Water Supply","Street Lighting","Drainage and Sewage","Parks and Gardens","Building and Construction"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}

            <button onClick={handleSubmit} disabled={saving}
              className="btn-glow w-full py-2.5 rounded-md text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              CREATE ACCOUNT
            </button>
          </>
        )}
      </div>
    </div>
  );
}