import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { DashboardShell } from "@/components/voxa/DashboardShell";
import { VoxaMap } from "@/components/voxa/VoxaMap";
import { ComplaintCard } from "@/components/voxa/ComplaintCard";
import { complaints, type Complaint } from "@/lib/voxa-data";
import { DetailPanel } from "./ward-officer";

export const Route = createFileRoute("/department-head")({
  head: () => ({ meta: [{ title: "Department Head — VOXA" }] }),
  component: DeptHead,
});

function DeptHead() {
  const deptComplaints = useMemo(() => complaints.filter((c) => c.department === "Roads").sort((a, b) => b.combinedScore - a.combinedScore), []);
  const [selected, setSelected] = useState<Complaint | null>(deptComplaints[1] ?? null);
  const [status, setStatus] = useState("In Progress");

  return (
    <DashboardShell
      title="ROADS DEPARTMENT — Vadodara Head"
      subtitle="daily city-wide oversight filtered by department"
      context="Vadodara Context (all 19 wards)"
      head="Vikram Shah"
    >
      <div className="h-full flex">
        <aside className="w-[320px] border-r border-border bg-surface/30 overflow-y-auto p-4 space-y-3 shrink-0">
          <div className="text-xs tracking-widest text-muted-foreground">CITY-WIDE (Roads) — {deptComplaints.length} TOTAL</div>
          <select className="w-full panel px-2 py-1.5 text-xs bg-surface"><option>Pothole</option><option>All</option></select>
          <select className="w-full panel px-2 py-1.5 text-xs bg-surface"><option>Combined Score default sort</option></select>
          {deptComplaints.map((c) => (
            <ComplaintCard key={c.id} c={c} active={selected?.id === c.id} onClick={() => setSelected(c)} />
          ))}
        </aside>
        <section className="flex-1 min-w-0 flex flex-col">
          {!selected ? (
            <div className="flex-1"><VoxaMap complaints={deptComplaints} /></div>
          ) : (
            <DetailPanel
              c={selected} status={status} setStatus={setStatus} onClose={() => setSelected(null)}
              extra={
                <div className="panel-glow p-4 mt-4 space-y-3">
                  <div className="text-sm font-semibold">Internal Management Actions <span className="text-xs text-muted-foreground">(Not Visible to Citizen)</span></div>
                  <div className="text-xs tracking-widest text-muted-foreground">INTERNAL NOTES</div>
                  <textarea rows={3} placeholder="Add notes for internal tracking only..." className="w-full bg-input border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Reassign Complaint</div>
                      <select className="w-full bg-input border border-border rounded px-2 py-1.5 text-sm">
                        <option>Ward 11</option><option>Ward 12</option><option>Ward 14</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button className="w-full px-3 py-2 rounded-md text-sm border border-primary/60 text-primary hover:bg-primary/10">Reassign to Ward</button>
                    </div>
                  </div>
                  <button className="w-full px-3 py-2 rounded-md text-sm border border-critical/60 text-critical hover:bg-critical/10">Escalate Critical Complaint — Creates Admin alert</button>
                </div>
              }
            />
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
