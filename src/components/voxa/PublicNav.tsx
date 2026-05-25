import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";

const links = [
  { to: "/map", label: "VIEW LIVE MAP" },
  { to: "/report", label: "REPORT A PROBLEM" },
  { to: "/track", label: "TRACK" },
] as const;

export function PublicNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 h-16">
        <Link to="/"><Logo /></Link>
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-widest">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`relative py-2 transition ${path === l.to ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {l.label}
              {path === l.to && <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-primary glow-cyan" />}
            </Link>
          ))}
        </nav>
        <Link to="/login" className="btn-outline-glow px-4 py-2 rounded-md text-xs">
          AUTHORITY LOGIN
        </Link>
      </div>
    </header>
  );
}
