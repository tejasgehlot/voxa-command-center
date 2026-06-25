import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { DashboardShell } from "@/components/voxa/DashboardShell";
import { VoxaMap } from "@/components/voxa/VoxaMap";
import { ComplaintCard } from "@/components/voxa/ComplaintCard";
import { DetailPanel } from "./ward-officer";
import { getAuth } from "@/lib/auth";
import { getDeptComplaints, reassignComplaint, escalateComplaint } from "@/lib/apiService";
import { sevBg, type Complaint, type Severity } from "@/lib/voxa-data";
import type { OfficerComplaint } from "@/lib/types";

export const Route = createFileRoute("/department-head")({
  head: () => ({ meta: [{ title: "Department Head — VOXA" }] }),
  component: DeptHead,
});

// ── Adapters (same pattern as ward-officer) ───────────────────

const BACKEND_TO_UI_STATUS: Record<string, Complaint["status"]> = {
  SUBMITTED:   "submitted",
  AI_ANALYSED: "submitted",
  ASSIGNED:    "assigned",
  IN_PROGRESS: "in_progress",
  RESOLVED:    "resolved",
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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `${Math.floor(diff / 60_000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function toCard(o: OfficerComplaint, wardName: string): Complaint {
  return {
    id:            o.trackingId,
    category:      CATEGORY_LABEL[o.aiCategory] ?? o.aiCategory,
    title:         CATEGORY_LABEL[o.aiCategory] ?? o.aiCategory,
    description:   o.description,
    severity:      BACKEND_TO_UI_SEVERITY[o.severityLabel] ?? "medium",
    severityScore: o.aiSeverity * 10,
    status:        BACKEND_TO_UI_STATUS[o.status] ?? "submitted",
    ward:          wardName,
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

// ── Main Component ────────────────────────────────────────────

function DeptHead() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getAuth();
    if (!user || user.role !== "DEPT_HEAD") navigate({ to: "/login" });
  }, [navigate]);

  const user       = getAuth();
  const deptName   = user?.department ?? "Roads";
  const officerName = user?.name ?? "Department Head";

  const [complaints, setComplaints] = useState<OfficerComplaint[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [selected,   setSelected]   = useState<OfficerComplaint | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // ── Fetch ───────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await getDeptComplaints({
        size:   100,
        status: filterStatus === "all" ? undefined : filterStatus,
      });
      // getDeptComplaints returns unwrapped — handle both paged and array shapes
      const list: OfficerComplaint[] = Array.isArray(res) ? res : (res as any).content ?? [];
      setComplaints(list);
      if (selected) {
        const refreshed = list.find(c => c.complaintId === selected.complaintId);
        if (refreshed) setSelected(refreshed);
      }
    } catch {
      setError("Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData(); }, [fetchData]);

  const cards = complaints.map(o => toCard(o, o.citizenName ? "City-wide" : "VMC"));
  const selectedCard = selected ? toCard(selected, "City-wide") : null;

  // ── Render ──────────────────────────────────────────────────

  if (loading) return (
    <DashboardShell title="DEPARTMENT HEAD" subtitle="loading…" context="" head="">
      <div className="flex-1 flex items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm tracking-widest">LOADING DEPARTMENT DATA…</span>
      </div>
    </DashboardShell>
  );

  return (
    <DashboardShell
      title={`${deptName.toUpperCase()} DEPARTMENT — Vadodara Head`}
      subtitle="daily city-wide oversight filtered by department"
      context="VADODARA · ALL WARDS (VMC)"
      head={officerName.toUpperCase()}
    >
      <div className="h-full flex">

        {/* Sidebar */}
        <aside className="w-[320px] border-r border-border bg-surface/30 overflow-y-auto p-4 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-xs tracking-widest text-muted-foreground">
              CITY-WIDE ({deptName}) — {complaints.length} TOTAL
            </div>
            <button onClick={() => { setLoading(true); fetchData(); }} className="text-muted-foreground hover:text-primary transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full panel px-2 py-1.5 text-xs bg-surface"
          >
            <option value="all">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
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

        {/* Main */}
        <section className="flex-1 min-w-0 flex flex-col">
          {!selected ? (
            <div className="flex-1"><VoxaMap complaints={cards} /></div>
          ) : selectedCard ? (
            <DetailPanel
              c={selectedCard}
              raw={selected}
              onClose={() => setSelected(null)}
              onUpdate={fetchData}
              extra={
                <DeptExtraPanel
                  complaintId={selected.complaintId}
                  escalated={selected.escalated}
                  onDone={fetchData}
                />
              }
            />
          ) : null}
        </section>

      </div>
    </DashboardShell>
  );
}

// ── Dept-specific extra panel ─────────────────────────────────

function DeptExtraPanel({
  complaintId, escalated, onDone,
}: {
  complaintId: string;
  escalated:   boolean;
  onDone:      () => void;
}) {
  const [note,        setNote]        = useState("");
  const [wardId,      setWardId]      = useState("11");
  const [reassigning, setReassigning] = useState(false);
  const [escalating,  setEscalating]  = useState(false);
  const [msg,         setMsg]         = useState<string | null>(null);
  const [err,         setErr]         = useState<string | null>(null);

  const handleReassign = async () => {
    setReassigning(true); setErr(null); setMsg(null);
    try {
      await reassignComplaint(complaintId, Number(wardId), note.trim() || undefined);
      setMsg(`Reassigned to Ward ${wardId}.`);
      onDone();
    } catch {
      setErr("Reassignment failed. Try again.");
    } finally {
      setReassigning(false);
    }
  };

  const handleEscalate = async () => {
    if (!note.trim()) { setErr("Add an escalation reason in the notes field."); return; }
    setEscalating(true); setErr(null); setMsg(null);
    try {
      await escalateComplaint(complaintId, note.trim());
      setMsg("Escalated — Admin alert created.");
      onDone();
    } catch {
      setErr("Escalation failed. Try again.");
    } finally {
      setEscalating(false);
    }
  };

  return (
    <div className="panel-glow p-4 mt-4 space-y-3">
      <div className="text-sm font-semibold">
        Internal Management Actions{" "}
        <span className="text-xs text-muted-foreground">(Not Visible to Citizen)</span>
      </div>

      <div className="text-xs tracking-widest text-muted-foreground">INTERNAL NOTES / REASON</div>
      <textarea
        rows={3}
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Add notes for reassignment or escalation reason…"
        className="w-full bg-input border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary resize-none"
      />

      {msg && <div className="text-xs text-success">{msg}</div>}
      {err && <div className="text-xs text-critical">{err}</div>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Reassign to Ward</div>
          <select
            value={wardId}
            onChange={e => setWardId(e.target.value)}
            className="w-full bg-input border border-border rounded px-2 py-1.5 text-sm"
          >
            {Array.from({ length: 19 }, (_, i) => i + 1).map(n => (
              <option key={n} value={String(n)}>Ward {n}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={handleReassign}
            disabled={reassigning}
            className="w-full px-3 py-2 rounded-md text-sm border border-primary/60 text-primary hover:bg-primary/10 disabled:opacity-50 flex items-center justify-center gap-1"
          >
            {reassigning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Reassign to Ward
          </button>
        </div>
      </div>

      <button
        onClick={handleEscalate}
        disabled={escalating || escalated}
        className="w-full px-3 py-2 rounded-md text-sm border border-critical/60 text-critical hover:bg-critical/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {escalating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {escalated ? "Already Escalated" : "Escalate Critical — Creates Admin Alert"}
      </button>
    </div>
  );
}