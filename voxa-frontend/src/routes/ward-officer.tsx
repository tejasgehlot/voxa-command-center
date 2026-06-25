import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, AlertTriangle, RefreshCw, CheckCircle2, Loader2 } from "lucide-react";
import { DashboardShell } from "@/components/voxa/DashboardShell";
import { VoxaMap } from "@/components/voxa/VoxaMap";
import { ComplaintCard } from "@/components/voxa/ComplaintCard";
import { sevBg, type Complaint, type Severity } from "@/lib/voxa-data";
import type { OfficerComplaint, WardStats } from "@/lib/types";
import {
  getOfficerComplaints,
  updateComplaintStatus,
  escalateComplaint,
} from "@/lib/apiService";
import { getAuth } from "@/lib/auth";

export const Route = createFileRoute("/ward-officer")({
  head: () => ({ meta: [{ title: "Ward Officer — VOXA" }] }),
  component: WardOfficer,
});

// ── Adapters ──────────────────────────────────────────────────

const BACKEND_TO_UI_STATUS: Record<string, Complaint["status"]> = {
  SUBMITTED:    "submitted",
  AI_ANALYSED:  "submitted",
  ASSIGNED:     "assigned",
  IN_PROGRESS:  "in_progress",
  RESOLVED:     "resolved",
};

const BACKEND_TO_UI_SEVERITY: Record<string, Severity> = {
  LOW:      "low",
  MEDIUM:   "medium",
  HIGH:     "high",
  CRITICAL: "critical",
};

const CATEGORY_LABEL: Record<string, string> = {
  POTHOLE:     "Pothole",
  GARBAGE:     "Garbage",
  STREETLIGHT: "Streetlight",
  WATER:       "Water",
  SEWAGE:      "Sewage",
  ROAD_DAMAGE: "Road Damage",
  OTHER:       "Other",
};

function officerComplaintToCard(o: OfficerComplaint): Complaint {
  return {
    id:            o.trackingId,
    category:      CATEGORY_LABEL[o.aiCategory] ?? o.aiCategory,
    title:         CATEGORY_LABEL[o.aiCategory] ?? o.aiCategory,
    description:   o.description,
    severity:      BACKEND_TO_UI_SEVERITY[o.severityLabel] ?? "medium",
    severityScore: o.aiSeverity * 10,
    status:        BACKEND_TO_UI_STATUS[o.status] ?? "submitted",
    ward:          "Ward 5",
    department:    "",
    lat:           o.latitude,
    lng:           o.longitude,
    upvotes:       o.upvotes,
    comments:      0,
    timeAgo:       timeAgo(o.createdAt),
    citizen:       o.citizenName,
    phone:         o.citizenPhone,
    photo:         o.photoUrl,
    combinedScore: o.priorityScore,
  };
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `${Math.floor(diff / 60_000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const UI_TO_BACKEND_STATUS: Record<string, string> = {
  Submitted:   "SUBMITTED",
  Assigned:    "ASSIGNED",
  "In Progress": "IN_PROGRESS",
  Resolved:    "RESOLVED",
};

// ── Main Component ────────────────────────────────────────────

function WardOfficer() {
  const navigate = useNavigate();

  // auth guard — redirect if not logged in as officer
useEffect(() => {
  const user = getAuth();
  if (!user || user.role !== "WARD_OFFICER") navigate({ to: "/login" });
}, [navigate]);

const officerName = getAuth()?.name ?? "Officer";
const wardName    = getAuth()?.wardName ?? "Ward 5";

  const [complaints,    setComplaints]    = useState<OfficerComplaint[]>([]);
  const [wardStats,     setWardStats]     = useState<WardStats | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [selected,      setSelected]      = useState<OfficerComplaint | null>(null);
  const [filterStatus,  setFilterStatus]  = useState<string>("all");
  const [sortBy,        setSortBy]        = useState<string>("COMBINED_SCORE");
  const [countdown,     setCountdown]     = useState(58);

  // ── Fetch ─────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await getOfficerComplaints({
        size:   50,
        status: filterStatus === "all" ? undefined : filterStatus,
        sort:   sortBy,
      });
      setComplaints(res.content);
      setWardStats(res.wardStats);
      if (selected) {
        const refreshed = res.content.find(c => c.complaintId === selected.complaintId);
        if (refreshed) setSelected(refreshed);
      }
    } catch {
      setError("Failed to load complaints. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Auto-refresh countdown ────────────────────────────────

  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { fetchData(); return 58; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [fetchData]);

  // ── Derived UI list ───────────────────────────────────────

  const cards = complaints.map(officerComplaintToCard);
  const selectedCard = selected ? officerComplaintToCard(selected) : null;

  // ── Render ────────────────────────────────────────────────

  if (loading) return (
    <DashboardShell title="WARD OFFICER" subtitle="loading…" context="" head="">
      <div className="flex-1 flex items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm tracking-widest">LOADING WARD DATA…</span>
      </div>
    </DashboardShell>
  );

  return (
    <DashboardShell
      title={`WARD OFFICER — ${wardName} Dashboard`}
      subtitle="daily work tool for VMC ward-level staff"
      context={`CITY: VADODARA · WARD: ${wardName} (VMC)`}
      head={`${officerName.toUpperCase()} · AUTO-REFRESH ${countdown}s`}
    >
      <div className="h-full flex">

        {/* ── Sidebar ─────────────────────────────────────── */}
        <aside className="w-[320px] border-r border-border bg-surface/30 overflow-y-auto p-4 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-xs tracking-widest text-muted-foreground">
              COMPLAINTS IN {wardName.toUpperCase()} ({complaints.length} TOTAL)
            </div>
            <button onClick={() => { setLoading(true); fetchData(); }} className="text-muted-foreground hover:text-primary transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Category pills — filter */}
          <div className="grid grid-cols-3 gap-1 text-[10px]">
            {["all", "SUBMITTED", "IN_PROGRESS", "RESOLVED"].slice(0, 3).map((t) => (
              <button
                key={t}
                onClick={() => setFilterStatus(t)}
                className={`panel text-center py-1 capitalize transition-colors ${filterStatus === t ? "border-primary text-primary" : ""}`}
              >
                {t === "all" ? "All" : t === "SUBMITTED" ? "New" : t === "IN_PROGRESS" ? "Active" : t}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="w-full panel px-2 py-1.5 text-xs bg-surface"
          >
            <option value="COMBINED_SCORE">Combined Score</option>
            <option value="SEVERITY">Severity</option>
            <option value="CREATED_AT">Time</option>
          </select>

          {error && (
            <div className="text-xs text-critical border border-critical/30 rounded p-2">{error}</div>
          )}

          {cards.map((c, i) => (
            <ComplaintCard
              key={c.id}
              c={c}
              active={selected?.complaintId === complaints[i]?.complaintId}
              onClick={() => setSelected(complaints[i])}
            />
          ))}
        </aside>

        {/* ── Main ────────────────────────────────────────── */}
        <section className="flex-1 min-w-0 flex flex-col">
          {!selected ? (
            <>
              <div className="flex-1">
                <VoxaMap complaints={cards} />
              </div>
              <div className="border-t border-border p-4 grid grid-cols-4 gap-3 shrink-0">
                {[
                  { l: "OPEN",          v: wardStats?.total ?? complaints.filter(c => c.status !== "RESOLVED").length,       col: "text-warning"  },
                  { l: "CRITICAL",      v: wardStats?.critical ?? complaints.filter(c => c.severityLabel === "CRITICAL").length, col: "text-critical" },
                  { l: "IN PROGRESS",   v: wardStats?.inProgress ?? complaints.filter(c => c.status === "IN_PROGRESS").length,  col: "text-primary"  },
                  { l: "RESOLVED TODAY",v: wardStats?.resolvedToday ?? 0,                                                        col: "text-success"  },
                ].map((k) => (
                  <div key={k.l} className="panel p-3">
                    <div className="text-[10px] tracking-widest text-muted-foreground">{k.l}</div>
                    <div className={`font-mono text-2xl font-bold ${k.col}`}>{k.v}</div>
                  </div>
                ))}
              </div>
            </>
          ) : selectedCard ? (
            <DetailPanel
              c={selectedCard}
              raw={selected}
              onClose={() => setSelected(null)}
              onUpdate={fetchData}
            />
          ) : null}
        </section>

      </div>
    </DashboardShell>
  );
}

// ── Detail Panel ──────────────────────────────────────────────

export function DetailPanel({
  c, raw, onClose, onUpdate, extra,
}: {
  c: Complaint;
  raw: OfficerComplaint;
  onClose: () => void;
  onUpdate: () => void;
  extra?: React.ReactNode;
}) {
  
  const [status,   setStatus]   = useState(() => {
    // derive current UI label from backend status
    const map: Record<string, string> = {
      SUBMITTED: "Submitted", AI_ANALYSED: "Submitted",
      ASSIGNED: "Assigned", IN_PROGRESS: "In Progress", RESOLVED: "Resolved",
    };
    return map[raw.status] ?? "Submitted";
  });
  const [note,     setNote]     = useState("");
  const [saving,   setSaving]   = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [saveMsg,  setSaveMsg]  = useState<string | null>(null);
  const [saveErr,  setSaveErr]  = useState<string | null>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  const handleUpdate = async () => {
    setSaving(true); setSaveErr(null); setSaveMsg(null);
    try {
      await updateComplaintStatus(
        raw.complaintId,
        UI_TO_BACKEND_STATUS[status] ?? "IN_PROGRESS",
        note.trim() || undefined,
      );
      setSaveMsg("Status updated successfully.");
      setNote("");
      onUpdate();
    } catch {
      setSaveErr("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEscalate = async () => {
    const reason = note.trim();
    if (!reason) { setSaveErr("Add a reason in the note field before escalating."); return; }
    setEscalating(true); setSaveErr(null);
    try {
      await escalateComplaint(raw.complaintId, reason);
      setSaveMsg("Complaint escalated to department head.");
      setNote("");
      onUpdate();
    } catch {
      setSaveErr("Escalation failed. Please try again.");
    } finally {
      setEscalating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <button onClick={onClose} className="flex items-center gap-1 text-sm text-primary mb-4">
        <ChevronLeft className="w-4 h-4" /> Back to Ward Map
      </button>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h2 className="text-2xl font-display font-bold">COMPLAINT {c.id} DETAILS</h2>
        <span className="text-sm text-muted-foreground">— {c.ward}</span>
        {raw.escalated && (
          <span className="text-[10px] tracking-widest px-2 py-0.5 rounded border border-critical/60 text-critical bg-critical/10">
            ESCALATED
          </span>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <img src={c.photo} alt="" className="w-full h-48 object-cover rounded-lg col-span-1" />

        <div className="panel p-4">
          <div className="text-xs tracking-widest text-muted-foreground">CATEGORY</div>
          <div className="font-display font-bold text-lg mt-1">{c.category}</div>
          <div className="text-xs tracking-widest text-muted-foreground mt-3">SEVERITY SCORE</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded border uppercase ${sevBg(c.severity)}`}>
              {c.severity}
            </span>
            <span className="font-mono text-2xl font-bold text-critical">{c.severityScore}</span>
          </div>
          <div className="text-xs tracking-widest text-muted-foreground mt-3">CITIZEN</div>
          <div className="font-mono text-sm">{c.citizen} · {c.phone}</div>
        </div>

        <div className="panel p-4">
          <div className="text-xs tracking-widest text-muted-foreground">COMBINED SCORE</div>
          <div className="font-mono text-3xl font-bold text-primary text-glow-cyan">{c.combinedScore}</div>
          <div className="text-xs text-muted-foreground">Priority · Upvotes: {c.upvotes}</div>
          <div className="text-xs tracking-widest text-muted-foreground mt-3">AI RESULT</div>
          <div className="text-xs">Category: {c.category} · Severity: {c.severity}</div>
          <div className="text-xs tracking-widest text-muted-foreground mt-3">TRACKING ID</div>
          <div className="font-mono text-sm">{c.id}</div>
          <div className="text-xs tracking-widest text-muted-foreground mt-3">SUBMITTED</div>
          <div className="font-mono text-xs">{c.timeAgo}</div>
        </div>
      </div>

      {/* Citizen description */}
      <div className="panel p-4 mt-4">
        <div className="text-sm font-semibold mb-1">Citizen Description</div>
        <div className="text-sm text-muted-foreground">
          "{raw.citizenName} says: '{c.description || "No description provided."}'"
        </div>
      </div>

      {/* Status updater */}
      <div className="panel p-4 mt-4 space-y-3">
        <div className="text-xs tracking-widest text-muted-foreground">STATUS UPDATER — OFFICER</div>

        <div className="flex flex-wrap gap-2">
          {["Submitted", "Assigned", "In Progress", "Resolved"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded text-xs border transition-colors ${
                status === s
                  ? "border-primary text-primary glow-cyan bg-primary/10"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="text-xs tracking-widest text-muted-foreground mt-3">NOTE TO CITIZEN</div>
        <textarea
          ref={noteRef}
          rows={3}
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add a note for the citizen or escalation reason…"
          className="w-full bg-input border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary resize-none"
        />

        {saveMsg && (
          <div className="flex items-center gap-2 text-xs text-success">
            <CheckCircle2 className="w-3.5 h-3.5" /> {saveMsg}
          </div>
        )}
        {saveErr && (
          <div className="text-xs text-critical">{saveErr}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="btn-glow px-5 py-2 rounded-md text-sm flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Update Status & Note
          </button>
          <button
            onClick={handleEscalate}
            disabled={escalating || raw.escalated}
            className="px-5 py-2 rounded-md text-sm border border-critical/60 text-critical hover:bg-critical/10 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {escalating
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <AlertTriangle className="w-4 h-4" />
            }
            {raw.escalated ? "Escalated" : "Escalate Critical"}
          </button>
        </div>
      </div>
    </div>
  );
}