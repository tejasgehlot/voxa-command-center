import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Camera, Cpu, CheckCircle2, MapPin, Navigation, Languages, Eye, ArrowRight, Zap, TrendingUp, AlertTriangle } from "lucide-react";
import { PublicNav } from "@/components/voxa/PublicNav";
import { getPublicStats, getComplaints } from "@/lib/apiService";
import type { PublicStats } from "@/lib/types";
import type { ComplaintSummary } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VOXA — Vadodara's Civic Voice" },
      { name: "description", content: "Snap a photo. Report a problem. Watch your city heal." },
    ],
  }),
  component: Landing,
});

// ── Animated counter ──────────────────────────────────────────
function Counter({ to, duration = 1800 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (to === 0) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(eased * to));
      if (progress < 1) requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { requestAnimationFrame(step); observer.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{val.toLocaleString()}</span>;
}

// ── Category chip colors ──────────────────────────────────────
const CAT_COLOR: Record<string, string> = {
  POTHOLE:     "text-orange-300 border-orange-300/40 bg-orange-300/10",
  GARBAGE:     "text-green-300 border-green-300/40 bg-green-300/10",
  STREETLIGHT: "text-yellow-300 border-yellow-300/40 bg-yellow-300/10",
  WATER:       "text-cyan-300 border-cyan-300/40 bg-cyan-300/10",
  SEWAGE:      "text-red-300 border-red-300/40 bg-red-300/10",
  ROAD_DAMAGE: "text-orange-400 border-orange-400/40 bg-orange-400/10",
  OTHER:       "text-slate-300 border-slate-300/40 bg-slate-300/10",
};

// ── Main ──────────────────────────────────────────────────────
function Landing() {
  const [stats,  setStats]  = useState<PublicStats | null>(null);
  const [feed,   setFeed]   = useState<ComplaintSummary[]>([]);
  const [feedIdx, setFeedIdx] = useState(0);

  useEffect(() => {
    getPublicStats().then(setStats).catch(() => {});
    getComplaints({ size: 12, status: "RESOLVED" })
      .then(r => setFeed(r.content))
      .catch(() => {});
  }, []);

  // Auto-scroll feed every 3s
  useEffect(() => {
    if (feed.length === 0) return;
    const t = setInterval(() => setFeedIdx(i => (i + 1) % Math.max(1, feed.length - 3)), 3000);
    return () => clearInterval(t);
  }, [feed.length]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <PublicNav />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center">
        {/* Video bg */}
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          src="/videos/sample-video-maps.mp4"
          autoPlay loop muted playsInline aria-hidden="true"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/20 pointer-events-none" />
        {/* Animated grid lines */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(oklch(0.4 0.05 235 / 0.07) 1px, transparent 1px), linear-gradient(90deg, oklch(0.4 0.05 235 / 0.07) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-[1400px] mx-auto px-6 py-32 w-full">
          <div className="max-w-2xl space-y-7">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/5 rounded-full px-4 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-primary font-mono text-xs tracking-[0.3em]">LIVE · VADODARA CIVIC NETWORK</span>
            </div>

            {/* Headline */}
            <h1 className="text-6xl md:text-8xl font-display font-bold leading-[1.0] tracking-tight">
              Vadodara's<br />
              <span className="text-primary text-glow-cyan relative">
                Civic Voice.
                {/* Underline accent */}
                <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 400 6" preserveAspectRatio="none">
                  <path d="M0 3 Q100 0 200 3 Q300 6 400 3" stroke="#00D4FF" strokeWidth="2" fill="none" strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 4px #00D4FF)" }} />
                </svg>
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-md leading-relaxed">
              Photo → AI analysis → VMC action.<br />
              <span className="text-foreground/80">Because silence never fixed a pothole.</span>
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/report"
                className="btn-glow px-7 py-3.5 rounded-lg text-sm font-semibold tracking-wider flex items-center gap-2 group">
                REPORT A PROBLEM
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/map"
                className="px-7 py-3.5 rounded-lg text-sm font-semibold tracking-wider border border-border hover:border-primary/60 hover:text-primary transition-all flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                VIEW LIVE MAP
              </Link>
            </div>

            {/* Mini trust indicators */}
            <div className="flex flex-wrap gap-6 pt-2 text-xs text-muted-foreground">
              {["Free to use", "No registration needed", "Response in 48h"].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Floating badge bottom-right */}
        <div className="absolute bottom-10 right-10 hidden lg:flex flex-col items-end gap-2">
          <div className="panel px-4 py-2 text-xs font-mono flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-warning" />
            AI-POWERED ROUTING
          </div>
          <div className="panel px-4 py-2 text-xs font-mono flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-primary" />
            REAL-TIME TRACKING
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-6 -mt-6 relative z-10">
        <div className="panel-glow px-8 py-7 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-border">
          {[
            {
              val:   stats?.totalResolved ?? 0,
              label: "COMPLAINTS RESOLVED",
              color: "text-primary text-glow-cyan",
              icon:  CheckCircle2,
              suffix: "+",
            },
            {
              val:   stats ? Math.round(stats.totalComplaints / Math.max(stats.totalWards, 1)) : 0,
              label: "AVG PER WARD",
              color: "text-foreground",
              icon:  MapPin,
              suffix: "",
            },
            {
              val:   stats?.avgResolutionDays ? Math.round(stats.avgResolutionDays * 24 * 10) / 10 : 0,
              label: "AVG RESOLUTION (HRS)",
              color: "text-foreground",
              icon:  TrendingUp,
              suffix: "",
              isFloat: true,
            },
            {
              val:   stats?.activeComplaints ?? 0,
              label: "ACTIVE RIGHT NOW",
              color: "text-warning",
              icon:  AlertTriangle,
              suffix: "",
            },
          ].map((k, i) => (
            <div key={i} className="md:px-8 flex flex-col gap-1">
              <k.icon className="w-4 h-4 text-muted-foreground mb-1" />
              <div className={`font-mono text-4xl font-bold ${k.color}`}>
                {k.isFloat
                  ? (stats?.avgResolutionDays ? (stats.avgResolutionDays * 24).toFixed(1) : "—")
                  : <><Counter to={k.val} />{k.suffix}</>
                }
              </div>
              <div className="text-[10px] tracking-widest text-muted-foreground">{k.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-6 py-28">
        <div className="text-center mb-16">
          <div className="text-xs font-mono tracking-[0.4em] text-muted-foreground mb-3">THE PROCESS</div>
          <h2 className="text-3xl md:text-4xl font-display font-bold">Three steps.<br />One fixed city.</h2>
        </div>

        {/* Steps with connector line */}
        <div className="relative grid md:grid-cols-3 gap-6">
          {/* connector */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {[
            { icon: Camera,       num: "01", title: "SNAP A PHOTO",   desc: "Open your camera, capture the civic issue, and tag your location. That's all you need.",      accent: "cyan"   },
            { icon: Cpu,          num: "02", title: "AI ANALYSIS",    desc: "Neural networks categorize, score severity 1–10, and route directly to the right VMC department.", accent: "violet" },
            { icon: CheckCircle2, num: "03", title: "PROBLEM FIXED",  desc: "Track resolution in real time via SMS + web. Get notified the moment work is complete.",         accent: "green"  },
          ].map((s) => {
            const accentMap: Record<string, string> = {
              cyan:   "border-cyan-400/40 bg-cyan-400/8 text-cyan-300",
              violet: "border-violet-400/40 bg-violet-400/8 text-violet-300",
              green:  "border-green-400/40 bg-green-400/8 text-green-300",
            };
            const glowMap: Record<string, string> = {
              cyan: "drop-shadow(0 0 12px rgba(0,212,255,0.5))",
              violet: "drop-shadow(0 0 12px rgba(167,139,250,0.5))",
              green: "drop-shadow(0 0 12px rgba(0,255,136,0.5))",
            };
            return (
              <div key={s.num}
                className="panel p-8 text-center hover:border-primary/50 transition-all duration-300 group relative">
                <div className="absolute top-4 right-4 font-mono text-[10px] text-muted-foreground/40">{s.num}</div>
                <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl border flex items-center justify-center transition-all duration-300 ${accentMap[s.accent]}`}
                  style={{ filter: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.filter = glowMap[s.accent])}
                  onMouseLeave={e => (e.currentTarget.style.filter = "none")}
                >
                  <s.icon className="w-7 h-7" />
                </div>
                <div className="font-display font-bold tracking-wider mb-3">{s.title}</div>
                <div className="text-sm text-muted-foreground leading-relaxed">{s.desc}</div>
              </div>
            );
          })}
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
          {[
            { icon: Cpu,        t: "AI AUTOMATIC",  s: "CLASSIFICATION"       },
            { icon: Navigation, t: "DIRECT VMC",    s: "WARD ROUTING"         },
            { icon: Languages,  t: "BILINGUAL",     s: "ENGLISH + GUJARATI"   },
            { icon: Eye,        t: "REAL-TIME",     s: "FULL TRANSPARENCY"    },
          ].map((f) => (
            <div key={f.t}
              className="panel p-4 flex items-center gap-3 hover:border-primary/40 transition-colors group">
              <div className="w-9 h-9 rounded-lg border border-primary/20 bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                <f.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="font-display font-bold text-xs tracking-wider">{f.t}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{f.s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── RESOLVED FEED ────────────────────────────────────── */}
      <section className="pb-28 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono tracking-[0.4em] text-muted-foreground mb-1">LIVE FEED</div>
            <h2 className="text-xl font-display font-bold">Recently Resolved</h2>
          </div>
          <Link to="/map" className="flex items-center gap-1.5 text-xs text-primary hover:text-glow-cyan tracking-widest transition-all">
            VIEW ALL <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Scrolling cards */}
        <div className="relative">
          {/* fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div
            className="flex gap-4 transition-transform duration-700 ease-in-out px-6"
            style={{ transform: `translateX(calc(-${feedIdx * 296}px))` }}
          >
            {(feed.length > 0 ? feed : Array(6).fill(null)).map((c, i) => (
              <div key={c?.complaintId ?? i}
                className="panel min-w-[280px] max-w-[280px] overflow-hidden shrink-0 group hover:border-success/40 transition-all duration-300">
                {c?.photoUrl ? (
                  <div className="relative h-40 overflow-hidden">
                    <img src={c.photoUrl} alt={c.aiCategory}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className={`absolute top-3 left-3 text-[9px] font-mono tracking-widest px-2 py-0.5 rounded border ${CAT_COLOR[c.aiCategory] ?? CAT_COLOR.OTHER}`}>
                      {c.aiCategory}
                    </span>
                  </div>
                ) : (
                  <div className="h-40 bg-surface/50 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border border-border animate-pulse" />
                  </div>
                )}
                <div className="p-4">
                  <div className="font-semibold text-sm truncate">
                    {c ? (c.aiCategory.charAt(0) + c.aiCategory.slice(1).toLowerCase().replace("_", " ")) : "Loading…"}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {c?.wardName ?? "—"}
                    </span>
                    <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded border bg-success/10 text-success border-success/30">
                      RESOLVED
                    </span>
                  </div>
                  {c && (
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>Severity {c.aiSeverity}/10</span>
                      <span>·</span>
                      <span>{c.upvotes} upvotes</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        {feed.length > 3 && (
          <div className="flex justify-center gap-1.5 mt-6">
            {Array.from({ length: Math.max(1, feed.length - 3) }).map((_, i) => (
              <button key={i} onClick={() => setFeedIdx(i)}
                className={`h-1 rounded-full transition-all duration-300 ${i === feedIdx ? "w-6 bg-primary" : "w-1.5 bg-border"}`} />
            ))}
          </div>
        )}
      </section>

      {/* ── CTA STRIP ────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-6 pb-24">
        <div className="panel-glow p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 50% at 50% 100%, oklch(0.5 0.15 210 / 0.12), transparent)" }} />
          <div className="relative">
            <div className="text-xs font-mono tracking-[0.4em] text-primary mb-4">YOUR CITY. YOUR VOICE.</div>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Seen a problem<br />on your street?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              It takes 30 seconds. One photo is all VMC needs to start fixing it.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/report" className="btn-glow px-8 py-4 rounded-lg font-semibold tracking-wider flex items-center gap-2 group">
                REPORT NOW <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/track" className="px-8 py-4 rounded-lg font-semibold tracking-wider border border-border hover:border-primary/60 hover:text-primary transition-all">
                TRACK EXISTING
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="max-w-[1400px] mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-display font-bold tracking-widest text-lg">
              VO<span className="text-primary">X</span>A
            </div>
            <div className="text-xs text-muted-foreground mt-1">BECAUSE SILENCE NEVER FIXED A POTHOLE.</div>
          </div>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/map" className="hover:text-foreground transition-colors">Live Map</Link>
            <Link to="/track" className="hover:text-foreground transition-colors">Track</Link>
            <Link to="/login" className="text-primary hover:text-glow-cyan transition-colors tracking-widest">AUTHORITY LOGIN</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}