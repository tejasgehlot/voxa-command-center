import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Cpu, CheckCircle2, MapPin, Navigation, Languages, Eye } from "lucide-react";
import { PublicNav } from "@/components/voxa/PublicNav";
import { VoxaMap } from "@/components/voxa/VoxaMap";
import { complaints } from "@/lib/voxa-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VOXA — Vadodara's Civic Voice" },
      { name: "description", content: "Snap a photo. Report a problem. Watch your city heal. AI-powered civic complaint resolution." },
    ],
  }),
  component: Landing,
});

const resolvedFeed = complaints.filter((c) => c.severity === "resolved").slice(0, 8);

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <VoxaMap complaints={complaints.slice(0, 20)} height="100%" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none" />
        <div className="relative max-w-[1400px] mx-auto px-6 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 fade-in-up">
            <div className="text-primary font-mono text-sm tracking-[0.3em] text-glow-cyan">CONNECT. RESOLVE.</div>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.05]">
              Vadodara's<br />
              <span className="text-primary text-glow-cyan">Civic Voice.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Because silence never fixed a pothole.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/report" className="btn-glow px-6 py-3 rounded-md text-sm">REPORT A PROBLEM</Link>
              <Link to="/map" className="btn-outline-glow px-6 py-3 rounded-md text-sm">VIEW LIVE MAP</Link>
            </div>
          </div>
          <div />
        </div>
      </section>

      {/* Stats bar */}
      <section className="max-w-[1400px] mx-auto px-6 -mt-8 relative z-10">
        <div className="panel-glow px-8 py-6 flex flex-wrap items-center gap-6 justify-between">
          <div>
            <div className="font-mono text-4xl md:text-5xl font-bold text-primary text-glow-cyan">14,567+</div>
            <div className="text-xs tracking-widest text-muted-foreground mt-1">TOTAL COMPLAINTS RESOLVED</div>
          </div>
          <div className="hidden md:block w-px h-12 bg-border" />
          <div>
            <div className="font-mono text-3xl font-bold text-success text-glow-green">92</div>
            <div className="text-xs tracking-widest text-muted-foreground mt-1">CITY HEALTH SCORE</div>
          </div>
          <div className="hidden md:block w-px h-12 bg-border" />
          <div>
            <div className="font-mono text-3xl font-bold text-foreground">3.1 hrs</div>
            <div className="text-xs tracking-widest text-muted-foreground mt-1">AVG RESOLUTION TIME</div>
          </div>
          <div className="hidden md:block w-px h-12 bg-border" />
          <div>
            <div className="font-mono text-3xl font-bold text-warning">248</div>
            <div className="text-xs tracking-widest text-muted-foreground mt-1">CRITICAL ACTIVE</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-[1400px] mx-auto px-6 py-24">
        <h2 className="text-center text-xs font-semibold tracking-[0.4em] text-muted-foreground mb-12">HOW IT WORKS</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Camera, title: "SNAP A PHOTO", desc: "Open your camera, capture the civic issue, and tag your location." },
            { icon: Cpu, title: "AI ANALYSIS", desc: "Neural networks categorize, score severity, and route to the right department." },
            { icon: CheckCircle2, title: "PROBLEM FIXED", desc: "Track resolution in real time. Get notified the moment it's done." },
          ].map((s, i) => (
            <div key={i} className="panel p-8 text-center hover:border-primary/60 transition group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full border border-primary/40 flex items-center justify-center group-hover:glow-cyan transition">
                <s.icon className="w-7 h-7 text-primary" />
              </div>
              <div className="font-display font-bold tracking-wider mb-2">{s.title}</div>
              <div className="text-sm text-muted-foreground">{s.desc}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { icon: Cpu, t: "AI AUTOMATIC", s: "CLASSIFICATION" },
            { icon: Navigation, t: "DIRECT VMC", s: "WARD ROUTING" },
            { icon: Languages, t: "BILINGUAL", s: "(English / Gujarati)" },
            { icon: Eye, t: "REAL-TIME", s: "TRANSPARENCY" },
          ].map((f, i) => (
            <div key={i} className="panel p-5 flex flex-col items-center text-center">
              <f.icon className="w-6 h-6 text-primary mb-3" />
              <div className="font-display font-bold text-sm tracking-wider">{f.t}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{f.s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Resolved feed */}
      <section className="max-w-[1400px] mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-semibold tracking-[0.4em] text-muted-foreground">RESOLVED COMPLAINTS FEED</h2>
          <Link to="/map" className="text-xs text-primary hover:text-glow-cyan tracking-widest">VIEW ALL →</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
          {resolvedFeed.map((c) => (
            <div key={c.id} className="panel min-w-[280px] max-w-[280px] snap-start overflow-hidden">
              <img src={c.photo} alt={c.title} className="w-full h-40 object-cover" loading="lazy" />
              <div className="p-4">
                <div className="text-[10px] tracking-widest text-muted-foreground">{c.category.toUpperCase()}</div>
                <div className="font-semibold mt-1">{c.title}</div>
                <div className="flex items-center justify-between mt-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{c.ward}</span>
                  <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded border bg-success/15 text-success border-success/40">RESOLVED</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-[1400px] mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-display font-bold tracking-widest"><span>VO</span><span className="text-primary">X</span><span>A</span></div>
            <div className="text-xs text-muted-foreground mt-1">BECAUSE SILENCE NEVER FIXED A POTHOLE.</div>
          </div>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link to="/">About</Link>
            <Link to="/map">How it Works</Link>
            <Link to="/track">Track</Link>
            <Link to="/login" className="text-primary">AUTHORITY LOGIN</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
