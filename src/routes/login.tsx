import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Shield, Network, Key } from "lucide-react";
import { Logo } from "@/components/voxa/Logo";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Authority Login — VOXA" }, { name: "description", content: "Authority access gate for VOXA officials." }] }),
  component: Login,
});

const roles = [
  { id: "ward-officer", label: "WARD OFFICER", icon: MapPin, route: "/ward-officer" },
  { id: "admin", label: "ADMIN", icon: Shield, route: "/admin" },
  { id: "department-head", label: "DEPARTMENT HEAD", icon: Network, route: "/department-head" },
] as const;

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<typeof roles[number]["id"]>("admin");
  const selected = roles.find((r) => r.id === role)!;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: selected.route });
  }

  return (
    <div className="min-h-screen grid-bg bg-background flex flex-col items-center justify-center p-6">
      <Logo className="text-3xl mb-3" />
      <h1 className="text-2xl md:text-3xl font-display font-bold tracking-widest mb-10">AUTHORITY ACCESS GATE</h1>

      <div className="grid md:grid-cols-3 gap-4 w-full max-w-4xl">
        {roles.map((r) => {
          const active = r.id === role;
          return (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`relative p-6 rounded-lg border transition-all backdrop-blur-sm ${active ? "border-primary glow-cyan bg-surface" : "border-border bg-surface/60 hover:border-primary/40"}`}
            >
              {active && <span className="absolute top-2 right-2 text-[10px] font-mono tracking-widest border border-primary/60 rounded-full px-2 py-0.5 text-primary">SELECTED</span>}
              <r.icon className={`w-12 h-12 mx-auto mb-3 ${active ? "text-primary text-glow-cyan" : "text-muted-foreground"}`} />
              <div className={`text-center font-display font-bold tracking-widest ${active ? "text-foreground" : "text-muted-foreground"}`}>{r.label}</div>
            </button>
          );
        })}
      </div>

      <form onSubmit={submit} className="panel-glow mt-8 p-6 w-full max-w-md space-y-4 fade-in-up" key={role}>
        <div>
          <label className="text-xs tracking-widest text-muted-foreground">EMAIL ADDRESS</label>
          <input type="email" required placeholder="officer@voxa.gov.in" className="w-full mt-1 bg-input border border-border rounded px-3 py-2 outline-none focus:border-primary" />
        </div>
        <div>
          <label className="text-xs tracking-widest text-muted-foreground">PASSWORD</label>
          <div className="relative mt-1">
            <input type="password" required placeholder="••••••••" className="w-full bg-input border border-border rounded px-3 py-2 pr-9 outline-none focus:border-primary" />
            <Key className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        <button type="submit" className="btn-glow w-full py-3 rounded-md tracking-widest">LOGIN</button>
        <div className="text-xs text-center text-muted-foreground">Redirects to your dashboard. Authenticates via JWT.</div>
      </form>
      <div className="text-xs text-muted-foreground mt-6 text-center max-w-md">No public registration. Only Administrator-created accounts can access this portal.</div>
    </div>
  );
}
