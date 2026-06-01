import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, Settings } from "lucide-react";
import { Logo } from "./Logo";

export function DashboardShell({
  title, subtitle, context, head, children,
}: {
  title: string; subtitle: string; context: string; head: string; children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <header className="border-b border-border bg-surface/60 backdrop-blur px-6 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-6">
          <Logo />
          <div className="hidden md:block w-px h-10 bg-border" />
          <div className="hidden md:block">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest border border-primary/60 text-primary rounded px-1.5 py-0.5">PRIVATE</span>
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            </div>
            <div className="font-display font-bold tracking-wider">{title}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">{context}</div>
          <div className="text-xs">Head: <span className="text-foreground font-semibold">{head}</span> <span className="font-mono text-muted-foreground ml-3">{new Date().toLocaleString()}</span></div>
        </div>
      </header>
      <div className="flex flex-1 min-h-0">
        <DashSidebar />
        <main className="flex-1 min-w-0 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}

function DashSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const items = [
    { to: "/", icon: Home, label: "Public" },
    { to: "/admin", icon: LayoutGrid, label: "Admin" },
    { to: "/login", icon: Settings, label: "Switch" },
  ] as const;
  return (
    <nav className="w-14 border-r border-border bg-surface/40 flex flex-col items-center py-4 gap-2 shrink-0">
      {items.map((it) => {
        const active = path === it.to;
        return (
          <Link key={it.to} to={it.to} className={`w-10 h-10 rounded flex items-center justify-center transition ${active ? "bg-primary/15 text-primary glow-cyan" : "text-muted-foreground hover:text-foreground hover:bg-surface"}`}>
            <it.icon className="w-4 h-4" />
          </Link>
        );
      })}
    </nav>
  );
}
