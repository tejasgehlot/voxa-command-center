import { createFileRoute } from "@tanstack/react-router";
import { UserPlus, ListChecks } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";
import { DashboardShell } from "@/components/voxa/DashboardShell";
import { VoxaMap } from "@/components/voxa/VoxaMap";
import { complaints, complaintsOverTime, complaintsByWard, complaintsByDept, activityLog } from "@/lib/voxa-data";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin God View — VOXA" }] }),
  component: Admin,
});

function Admin() {
  const score = 92;
  const circumference = 2 * Math.PI * 90;
  const dash = (score / 100) * circumference;

  return (
    <DashboardShell
      title="MUNICIPAL COMMISSIONER — God View"
      subtitle="Admin Dashboard · Municipal Commissioner Level"
      context="GOD VIEW: Entire city, all departments, all wards, all roles"
      head="Vikram Shah"
    >
      <div className="h-full overflow-y-auto p-4 grid grid-cols-12 gap-4 auto-rows-min">
        {/* City health */}
        <div className="col-span-12 lg:col-span-3 panel p-5 flex flex-col items-center">
          <div className="text-[10px] tracking-widest text-muted-foreground">CITY HEALTH SCORE (0–100)</div>
          <div className="relative w-52 h-52 my-2">
            <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
              <circle cx="100" cy="100" r="90" fill="none" stroke="oklch(0.3 0.04 235 / 0.4)" strokeWidth="12" />
              <circle cx="100" cy="100" r="90" fill="none" stroke="#00FF88" strokeWidth="12"
                strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 8px #00FF88)" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-mono text-6xl font-bold text-success text-glow-green">{score}</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">AI Health Status: <span className="text-success">Highly Satisfactory</span></div>
        </div>

        {/* KPI banners */}
        <div className="col-span-12 lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { l: "TOTAL COMPLAINTS", v: "24,567", t: "" },
            { l: "RESOLVED TODAY", v: "1,209", t: "+1.2%", c: "text-success" },
            { l: "CRITICAL ACTIVE", v: "248", t: "Alarm Red", c: "text-critical", glow: true },
            { l: "AVG RESOLUTION TIME", v: "3.1 hrs", t: "" },
          ].map((k) => (
            <div key={k.l} className={k.glow ? "panel-glow p-4" : "panel p-4"}>
              <div className="text-[10px] tracking-widest text-muted-foreground">{k.l}</div>
              <div className={`font-mono text-3xl font-bold ${k.c ?? "text-foreground"}`}>{k.v}</div>
              {k.t && <div className={`text-xs ${k.c ?? "text-muted-foreground"}`}>{k.t}</div>}
            </div>
          ))}
          <div className="col-span-2 md:col-span-4 panel overflow-hidden h-72">
            <VoxaMap complaints={complaints} />
          </div>
        </div>

        {/* charts */}
        <div className="col-span-12 lg:col-span-4 panel p-4">
          <div className="font-display font-bold mb-2">Complaints Over Time</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={complaintsOverTime}>
              <CartesianGrid stroke="oklch(0.3 0.04 235 / 0.3)" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="#6B7FA3" fontSize={11} />
              <YAxis stroke="#6B7FA3" fontSize={11} />
              <Tooltip contentStyle={{ background: "#0F1623", border: "1px solid #00D4FF40" }} />
              <Line type="monotone" dataKey="count" stroke="#00D4FF" strokeWidth={2} dot={{ fill: "#00D4FF" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="col-span-12 lg:col-span-4 panel p-4">
          <div className="font-display font-bold mb-2">Complaints by Ward</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={complaintsByWard}>
              <CartesianGrid stroke="oklch(0.3 0.04 235 / 0.3)" strokeDasharray="3 3" />
              <XAxis dataKey="ward" stroke="#6B7FA3" fontSize={10} />
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
              <Pie data={complaintsByDept} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {complaintsByDept.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0F1623", border: "1px solid #00D4FF40" }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#6B7FA3" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Admin powers */}
        <div className="col-span-12 panel-glow p-4 grid md:grid-cols-2 gap-4">
          <div className="panel p-4 flex flex-col items-center text-center">
            <UserPlus className="w-8 h-8 text-primary mb-2" />
            <div className="font-display font-bold tracking-wider">CREATE AUTHORITY ACCOUNT</div>
            <div className="text-xs text-muted-foreground mt-1 mb-3">Ward Officers, Dept Heads, All roles</div>
            <button className="btn-glow px-5 py-2 rounded text-sm">+ NEW ACCOUNT</button>
          </div>
          <div className="panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <ListChecks className="w-5 h-5 text-primary" />
              <div className="font-display font-bold tracking-wider">FULL ACTIVITY LOG</div>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {activityLog.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <div className={`w-2 h-2 mt-1.5 rounded-full ${a.color === "critical" ? "bg-critical" : a.color === "warning" ? "bg-warning" : a.color === "success" ? "bg-success" : "bg-primary"}`} />
                  <div className="flex-1">
                    <span className="text-foreground font-semibold">{a.who}</span>
                    <span className="text-muted-foreground"> {a.what}</span>
                  </div>
                  <span className="font-mono text-muted-foreground">{a.when}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
