import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import { DashboardShell } from "@/components/voxa/DashboardShell";
import { VoxaMap } from "@/components/voxa/VoxaMap";
import { ComplaintCard } from "@/components/voxa/ComplaintCard";
import { complaints, type Complaint, sevBg } from "@/lib/voxa-data";

export const Route = createFileRoute("/ward-officer")({
  head: () => ({ meta: [{ title: "Ward Officer — VOXA" }] }),
  component: WardOfficer,
});

function WardOfficer() {
  const wardComplaints = useMemo(() => complaints.filter((c) => c.ward === "Ward 5").sort((a, b) => b.combinedScore - a.combinedScore), []);
  const [selected, setSelected] = useState<Complaint | null>(wardComplaints[0] ?? null);
  const [status, setStatus] = useState("In Progress");

  return (
    <DashboardShell
      title="WARD OFFICER — Ward 5 Dashboard"
      subtitle="daily work tool for VMC ward-level staff"
      context="CITY: VADODARA · WARD: 5 (VMC)"
      head="Rajesh Patel · AUTO-REFRESH 58s"
    >
      <div className="h-full flex">
        {/* sidebar list */}
        <aside className="w-[320px] border-r border-border bg-surface/30 overflow-y-auto p-4 space-y-3 shrink-0">
          <div className="text-xs tracking-widest text-muted-foreground">COMPLAINTS IN WARD 5 ({wardComplaints.length} TOTAL)</div>
          <div className="grid grid-cols-3 gap-1 text-[10px]">
            {["Pothole", "Streetlight", "Garbage"].map((t) => <span key={t} className="panel text-center py-1">{t}</span>)}
          </div>
          <select className="w-full panel px-2 py-1.5 text-xs bg-surface"><option>Combined Score</option><option>Severity</option><option>Time</option></select>
          {wardComplaints.map((c) => (
            <ComplaintCard key={c.id} c={c} active={selected?.id === c.id} onClick={() => setSelected(c)} />
          ))}
        </aside>

        {/* main */}
        <section className="flex-1 min-w-0 flex flex-col">
          {!selected ? (
            <>
              <div className="flex-1"><VoxaMap complaints={wardComplaints} /></div>
              <div className="border-t border-border p-4 grid grid-cols-4 gap-3 shrink-0">
                {[
                  { l: "OPEN", v: wardComplaints.filter((c) => c.status !== "resolved").length, c: "text-warning" },
                  { l: "CRITICAL", v: wardComplaints.filter((c) => c.severity === "critical").length, c: "text-critical" },
                  { l: "RESOLVED", v: wardComplaints.filter((c) => c.severity === "resolved").length, c: "text-success" },
                  { l: "AVG SCORE", v: Math.round(wardComplaints.reduce((s, c) => s + c.severityScore, 0) / wardComplaints.length), c: "text-primary" },
                ].map((k) => (
                  <div key={k.l} className="panel p-3">
                    <div className="text-[10px] tracking-widest text-muted-foreground">{k.l}</div>
                    <div className={`font-mono text-2xl font-bold ${k.c}`}>{k.v}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <DetailPanel c={selected} status={status} setStatus={setStatus} onClose={() => setSelected(null)} extra={null} />
          )}
        </section>
      </div>
    </DashboardShell>
  );
}

export function DetailPanel({ c, status, setStatus, onClose, extra }: {
  c: Complaint; status: string; setStatus: (s: string) => void; onClose: () => void; extra?: React.ReactNode;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <button onClick={onClose} className="flex items-center gap-1 text-sm text-primary mb-4"><ChevronLeft className="w-4 h-4" /> Back to Ward Map</button>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h2 className="text-2xl font-display font-bold">COMPLAINT {c.id} DETAILS</h2>
        <span className="text-sm text-muted-foreground">— {c.ward}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <img src={c.photo} alt="" className="w-full h-48 object-cover rounded-lg col-span-1" />
        <div className="panel p-4">
          <div className="text-xs tracking-widest text-muted-foreground">CATEGORY</div>
          <div className="font-display font-bold text-lg mt-1">{c.category}</div>
          <div className="text-xs tracking-widest text-muted-foreground mt-3">SEVERITY SCORE</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded border uppercase ${sevBg(c.severity)}`}>{c.severity}</span>
            <span className="font-mono text-2xl font-bold text-critical">{c.severityScore}</span>
          </div>
          <div className="text-xs tracking-widest text-muted-foreground mt-3">CITIZEN</div>
          <div className="font-mono text-sm">{c.citizen} · {c.phone}</div>
        </div>
        <div className="panel p-4">
          <div className="text-xs tracking-widest text-muted-foreground">COMBINED SCORE</div>
          <div className="font-mono text-3xl font-bold text-primary text-glow-cyan">{c.combinedScore}</div>
          <div className="text-xs text-muted-foreground">Severity: {c.severityScore} · Upvotes: {c.upvotes}</div>
          <div className="text-xs tracking-widest text-muted-foreground mt-3">AI RESULT</div>
          <div className="text-xs">Category: {c.category}, Severity: {c.severity}, Routing: VMC {c.department} Dept.</div>
          <div className="text-xs tracking-widest text-muted-foreground mt-3">TRACKING ID</div>
          <div className="font-mono text-sm">{c.id}</div>
        </div>
      </div>

      <div className="panel p-4 mt-4">
        <div className="text-sm font-semibold mb-1">Citizen Note to Officer</div>
        <div className="text-sm text-muted-foreground">"{c.citizen} says: 'Road is severely cratered, impossible for two-wheelers.'"</div>
      </div>

      <div className="panel p-4 mt-4 space-y-3">
        <div className="text-xs tracking-widest text-muted-foreground">STATUS UPDATER, officer</div>
        <div className="flex flex-wrap gap-2">
          {["Submitted", "Assigned", "In Progress", "Resolved"].map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded text-xs border ${status === s ? "border-primary text-primary glow-cyan bg-primary/10" : "border-border text-muted-foreground hover:border-primary/40"}`}>{s}</button>
          ))}
        </div>
        <div className="text-xs tracking-widest text-muted-foreground mt-3">NOTE TO CITIZEN</div>
        <textarea rows={3} defaultValue="Crews dispatched for inspection. Estimated repair within 48 hours." className="w-full bg-input border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary" />
        <div className="flex gap-3 pt-2">
          <button className="btn-glow px-5 py-2 rounded-md text-sm flex-1">Update Status & Note</button>
          <button className="px-5 py-2 rounded-md text-sm border border-critical/60 text-critical hover:bg-critical/10 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Escalate Critical</button>
        </div>
      </div>

      {extra}
    </div>
  );
}
