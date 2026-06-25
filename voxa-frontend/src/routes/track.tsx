import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  Clock3,
  Database,
  FileSearch,
  Gauge,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  UserRound,
  AlertCircle,
} from "lucide-react";
import { PublicNav } from "@/components/voxa/PublicNav";
import { sevBg } from "@/lib/voxa-data";
import type { Complaint, Status } from "@/lib/voxa-data";
import type { ComplaintDetail, TimelineEntry } from "@/lib/types";
import { trackComplaint } from "@/lib/apiService";
import { trackedDetailToComplaint } from "@/lib/adapters";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Complaint - VOXA" },
      {
        name: "description",
        content: "Track your civic complaint with a phone number or tracking ID.",
      },
    ],
  }),
  component: Track,
});

const locatingStages = [
  { label: "Searching Database", detail: "Scanning civic records", icon: Database },
  { label: "Complaint Found", detail: "Matching complaint profile", icon: CheckCircle2 },
  { label: "Verifying Information", detail: "Checking citizen and ward data", icon: ShieldCheck },
  { label: "Preparing Timeline", detail: "Sequencing officer activity", icon: Activity },
  { label: "Loading Details", detail: "Building your tracking view", icon: Sparkles },
];

const statusStages = [
  { key: "submitted", label: "Submitted" },
  { key: "assigned", label: "Assigned" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
] as const;

const statusPosition: Record<Status, number> = {
  submitted: 0,
  ai_analysed: 0,
  assigned: 1,
  in_progress: 2,
  resolved: 3,
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, rotateX: -8, scale: 0.96 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { delay, type: "spring", stiffness: 150, damping: 18 },
  }),
};

const toneStyles = {
  blue: {
    border: "border-cyan-300/45 shadow-[0_18px_55px_rgba(34,211,238,0.16)]",
    glow: "from-cyan-300/0 via-cyan-300/70 to-cyan-300/0",
    icon: "border-cyan-300/50 bg-cyan-300/10 text-cyan-200",
    text: "text-cyan-200",
    fill: "bg-cyan-300",
  },
  purple: {
    border: "border-violet-300/45 shadow-[0_18px_55px_rgba(167,139,250,0.17)]",
    glow: "from-violet-300/0 via-violet-300/70 to-violet-300/0",
    icon: "border-violet-300/50 bg-violet-300/10 text-violet-200",
    text: "text-violet-200",
    fill: "bg-violet-300",
  },
  orange: {
    border: "border-orange-300/45 shadow-[0_18px_55px_rgba(251,146,60,0.15)]",
    glow: "from-orange-300/0 via-orange-300/70 to-orange-300/0",
    icon: "border-orange-300/50 bg-orange-300/10 text-orange-200",
    text: "text-orange-200",
    fill: "bg-orange-300",
  },
  green: {
    border: "border-emerald-300/45 shadow-[0_18px_55px_rgba(52,211,153,0.16)]",
    glow: "from-emerald-300/0 via-emerald-300/70 to-emerald-300/0",
    icon: "border-emerald-300/50 bg-emerald-300/10 text-emerald-200",
    text: "text-emerald-200",
    fill: "bg-emerald-300",
  },
  cyan: {
    border: "border-sky-300/45 shadow-[0_18px_55px_rgba(125,211,252,0.16)]",
    glow: "from-sky-300/0 via-sky-300/70 to-sky-300/0",
    icon: "border-sky-300/50 bg-sky-300/10 text-sky-200",
    text: "text-sky-200",
    fill: "bg-sky-300",
  },
};

interface TrackedComplaint {
  complaint: Complaint;
  timeline: TimelineEntry[];
}

function Track() {
  const [phone, setPhone] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [searched, setSearched] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [searchRun, setSearchRun] = useState(0);
  const [results, setResults] = useState<TrackedComplaint[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setSearched(false);
    setIsLocating(true);
    setSearchRun((r) => r + 1);

    try {
      const details: ComplaintDetail[] = await trackComplaint(
        phone,
        trackingId.trim() || undefined
      );

      // Hold the locating animation for its full choreography (2.6s) for the visual effect,
      // even though the real API call usually returns much faster.
      await new Promise((res) => setTimeout(res, 2600));

      setResults(
        details.map((d) => ({
          complaint: trackedDetailToComplaint(d),
          timeline:  d.timeline,
        }))
      );
      setIsLocating(false);
      setSearched(true);
    } catch (err: unknown) {
      await new Promise((res) => setTimeout(res, 1200));
      setIsLocating(false);
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(
        axiosErr?.response?.data?.message ||
        "No complaints found for this phone number."
      );
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:py-10">
        <section className="relative overflow-hidden rounded-lg border border-cyan-300/25 bg-white/[0.035] px-5 py-8 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl md:px-8">
          <div className="absolute inset-0 grid-bg opacity-70" />
          <motion.div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent"
            animate={{ x: ["-30%", "30%", "-30%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="mb-3 text-xs font-semibold tracking-[0.34em] text-primary text-glow-cyan">
              CIVIC TRACKING ARRAY
            </div>
            <h1 className="text-3xl font-display font-bold md:text-5xl">COMPLAINT TRACKING</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Enter your mobile number (and optionally a tracking ID to narrow results) and VOXA
              will locate the complaint record, verify the match, and assemble the timeline.
            </p>

            {error && (
              <div className="mx-auto mt-5 flex max-w-3xl items-center gap-2 rounded-md border border-critical/40 bg-critical/10 px-4 py-2.5 text-left">
                <AlertCircle className="h-4 w-4 text-critical shrink-0" />
                <span className="text-sm text-critical">{error}</span>
              </div>
            )}

            <form
              onSubmit={handleSearch}
              className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 rounded-lg border border-cyan-300/35 bg-background/70 p-2 shadow-[0_0_40px_rgba(34,211,238,0.12)] backdrop-blur-xl sm:flex-row"
            >
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
                aria-label="Mobile number"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-sm outline-none placeholder:text-muted-foreground/70"
                maxLength={10}
              />
              <input
                value={trackingId}
                onChange={(event) => setTrackingId(event.target.value.toUpperCase())}
                placeholder="Tracking ID (optional, e.g. VXA-P05)"
                aria-label="Tracking ID"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-sm outline-none placeholder:text-muted-foreground/70 border-t border-cyan-300/20 sm:border-t-0 sm:border-l"
              />
              <button
                type="submit"
                disabled={isLocating}
                className="btn-glow inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLocating ? "LOCATING" : "TRACK COMPLAINT"}
                <Search className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-3 text-xs text-muted-foreground">
              Find all issues linked to your phone number. No login needed.
            </div>
          </div>
        </section>

        <AnimatePresence mode="wait">
          {isLocating && <LocatingSequence key={`locating-${searchRun}`} query={phone} />}
          {!isLocating && searched && results.length > 0 && (
            <ResultsReveal key={`results-${searchRun}`} results={results} query={phone} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function LocatingSequence({ query }: { query: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35 }}
      className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-lg border border-cyan-300/35 bg-white/[0.035] p-5 shadow-[0_26px_90px_rgba(34,211,238,0.12)] backdrop-blur-xl md:p-7"
      aria-live="polite"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-xs font-semibold tracking-[0.34em] text-cyan-200">
            LOCATING COMPLAINT
          </div>
          <h2 className="mt-3 text-2xl font-display font-bold md:text-3xl">
            Searching Complaint...
          </h2>
          <div className="mt-2 font-mono text-xs text-muted-foreground">
            {query.trim() || "Public tracking query"} locked for lookup
          </div>
        </div>
        <div className="relative h-24 overflow-hidden rounded-lg border border-cyan-300/25 bg-background/70 lg:w-[360px]">
          <div className="absolute inset-0 grid-bg opacity-60" />
          <motion.div
            className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent blur-sm"
            animate={{ left: ["-35%", "110%"] }}
            transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-x-6 top-1/2 h-px bg-cyan-300/20">
            <motion.div
              className="h-full rounded-full bg-cyan-200 shadow-[0_0_24px_rgba(125,211,252,0.8)]"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.35, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>

      <div className="mt-7 grid gap-3 md:grid-cols-5">
        {locatingStages.map((stage, stageIndex) => {
          const StageIcon = stage.icon;
          return (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + stageIndex * 0.36, duration: 0.35 }}
              className="relative overflow-hidden rounded-lg border border-cyan-300/20 bg-background/55 p-4"
            >
              <motion.div
                className="absolute inset-x-0 bottom-0 h-0.5 bg-cyan-300"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.28 + stageIndex * 0.36, duration: 0.28 }}
                style={{ transformOrigin: "left" }}
              />
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-md border border-cyan-300/35 bg-cyan-300/10 text-cyan-200">
                  <StageIcon className="h-4 w-4" />
                </div>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.42 + stageIndex * 0.36,
                    type: "spring",
                    stiffness: 240,
                    damping: 14,
                  }}
                  className="grid h-6 w-6 place-items-center rounded-full bg-emerald-300 text-background"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </motion.div>
              </div>
              <div className="text-sm font-semibold">{stage.label}</div>
              <div className="mt-1 text-xs leading-5 text-muted-foreground">{stage.detail}</div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

function ResultsReveal({ results, query }: { results: TrackedComplaint[]; query: string }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-10"
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-semibold tracking-[0.34em] text-primary text-glow-cyan">
            COMPLAINT LOCATED
          </div>
          <h2 className="mt-2 text-2xl font-display font-bold md:text-3xl">
            {results.length} matched complaint record{results.length !== 1 ? "s" : ""}
          </h2>
        </div>
        <div className="rounded-md border border-cyan-300/25 bg-white/[0.04] px-4 py-3 font-mono text-xs text-muted-foreground">
          Query: <span className="text-foreground">{query.trim() || "Public lookup"}</span>
        </div>
      </div>

      <div className="space-y-10">
        {results.map((result, complaintIndex) => (
          <ComplaintReveal
            key={result.complaint.id}
            complaint={result.complaint}
            timeline={result.timeline}
            complaintIndex={complaintIndex}
          />
        ))}
      </div>
    </motion.section>
  );
}

function ComplaintReveal({
  complaint,
  timeline,
  complaintIndex,
}: {
  complaint: Complaint;
  timeline: TimelineEntry[];
  complaintIndex: number;
}) {
  const currentStatusIndex = statusPosition[complaint.status];
  const progress = (currentStatusIndex / (statusStages.length - 1)) * 100;
  const baseDelay = complaintIndex * 0.42;
  const realTimeline = formatRealTimeline(timeline);

  return (
    <article className="relative">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="font-mono text-xs tracking-[0.26em] text-muted-foreground">
          TRACKING RECORD {String(complaintIndex + 1).padStart(2, "0")}
        </div>
        <span
          className={`rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${sevBg(complaint.severity)}`}
        >
          {formatStatus(complaint.status)}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <PremiumCard
          tone="blue"
          icon={CheckCircle2}
          eyebrow="Complaint Found"
          title={complaint.id}
          delay={baseDelay}
          className="lg:col-span-4"
        >
          <div className="mt-5 rounded-md border border-cyan-300/20 bg-cyan-300/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Success indicator</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-300 text-background shadow-[0_0_22px_rgba(52,211,153,0.55)]">
                <CheckCircle2 className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-3 text-sm font-semibold text-cyan-100">Found in system</div>
          </div>
        </PremiumCard>

        <PremiumCard
          tone="purple"
          icon={UserRound}
          eyebrow="Photo Evidence"
          title="Submitted Photo"
          delay={baseDelay + 0.14}
          className="lg:col-span-4"
        >
          {complaint.photo ? (
            <img
              src={complaint.photo}
              alt="Complaint evidence"
              className="mt-4 h-32 w-full rounded-md object-cover border border-violet-300/20"
            />
          ) : (
            <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-violet-300/25 bg-violet-300/10 px-3 py-2 text-xs font-semibold text-violet-100">
              <ShieldCheck className="h-4 w-4" />
              No photo available
            </div>
          )}
        </PremiumCard>

        <PremiumCard
          tone="orange"
          icon={FileSearch}
          eyebrow="Complaint Information"
          title={complaint.title}
          delay={baseDelay + 0.28}
          className="lg:col-span-4"
        >
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{complaint.description}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <DataPoint label="Complaint Category" value={complaint.category} />
            <DataPoint
              label="Priority Level"
              value={`${complaint.severity.toUpperCase()} - ${complaint.severityScore}`}
            />
            <DataPoint label="Location" value={complaint.ward || "—"} />
            <DataPoint label="Department" value={complaint.department || "—"} />
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" />
              {complaint.upvotes} upvotes
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {complaint.comments} comments
            </span>
          </div>
        </PremiumCard>

        <PremiumCard
          tone="green"
          icon={Gauge}
          eyebrow="Current Status"
          title={formatStatus(complaint.status)}
          delay={baseDelay + 0.42}
          className="lg:col-span-5"
        >
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-emerald-300/10">
            <motion.div
              className="h-full rounded-full bg-emerald-300 shadow-[0_0_22px_rgba(52,211,153,0.7)]"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: baseDelay + 0.72, duration: 0.75, ease: "easeOut" }}
            />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {statusStages.map((stage, stageIndex) => {
              const done = stageIndex <= currentStatusIndex;
              const current = stageIndex === currentStatusIndex;

              return (
                <div key={stage.key} className="min-w-0">
                  <motion.div
                    className={`mx-auto mb-2 grid h-9 w-9 place-items-center rounded-full border ${
                      done
                        ? "border-emerald-300 bg-emerald-300 text-background"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                    animate={
                      current
                        ? { scale: [1, 1.12, 1], boxShadow: "0 0 24px rgba(52,211,153,0.55)" }
                        : {}
                    }
                    transition={{ duration: 1.15, repeat: current ? Infinity : 0 }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </motion.div>
                  <div
                    className={`text-center text-xs font-semibold ${current ? "text-emerald-200" : "text-muted-foreground"}`}
                  >
                    {stage.label}
                  </div>
                </div>
              );
            })}
          </div>
        </PremiumCard>

        <PremiumCard
          tone="cyan"
          icon={Clock3}
          eyebrow="Timeline"
          title="Activity trail"
          delay={baseDelay + 0.56}
          className="lg:col-span-7"
        >
          <div className="relative mt-5 pl-8">
            <motion.div
              className="absolute bottom-3 left-[9px] top-3 w-px origin-top rounded-full bg-gradient-to-b from-sky-200 via-cyan-300 to-transparent"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: baseDelay + 0.82, duration: 0.85, ease: "easeOut" }}
            />
            <div className="space-y-5">
              {realTimeline.map((entry, timelineIndex) => (
                <motion.div
                  key={`${entry.label}-${timelineIndex}`}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: baseDelay + 0.9 + timelineIndex * 0.14, duration: 0.35 }}
                  className="relative"
                >
                  <motion.div
                    className="absolute -left-[31px] top-1.5 grid h-5 w-5 place-items-center rounded-full border border-sky-200 bg-background shadow-[0_0_16px_rgba(125,211,252,0.5)]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: baseDelay + 0.96 + timelineIndex * 0.14,
                      type: "spring",
                      stiffness: 260,
                      damping: 14,
                    }}
                  >
                    <span className="h-2 w-2 rounded-full bg-sky-200" />
                  </motion.div>
                  <div className="grid gap-1 sm:grid-cols-[150px_minmax(0,1fr)]">
                    <div>
                      <div className="text-xs font-semibold text-sky-100">{entry.label}</div>
                      <div className="font-mono text-xs text-muted-foreground">{entry.value}</div>
                    </div>
                    <div className="text-sm leading-6 text-muted-foreground">{entry.detail}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </PremiumCard>
      </div>
    </article>
  );
}

function PremiumCard({
  tone,
  icon: Icon,
  eyebrow,
  title,
  delay,
  className = "",
  children,
}: {
  tone: keyof typeof toneStyles;
  icon: typeof CheckCircle2;
  eyebrow: string;
  title: string;
  delay: number;
  className?: string;
  children: React.ReactNode;
}) {
  const styles = toneStyles[tone];

  return (
    <motion.div
      variants={cardVariants}
      custom={delay}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.15 }}
      className={`relative overflow-hidden rounded-lg border bg-white/[0.045] p-5 backdrop-blur-xl transition duration-150 hover:bg-white/[0.065] ${styles.border} ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <motion.div
        aria-hidden
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${styles.glow}`}
        initial={{ x: "-70%" }}
        animate={{ x: "70%" }}
        transition={{ delay: delay + 0.15, duration: 1.15, ease: "easeOut" }}
      />
      <div className="flex items-start gap-3">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-md border ${styles.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className={`text-xs font-semibold tracking-[0.22em] ${styles.text}`}>{eyebrow}</div>
          <h3 className="mt-2 break-words text-xl font-display font-bold leading-tight">{title}</h3>
        </div>
      </div>
      {children}
      <div className={`absolute bottom-0 left-5 right-5 h-px ${styles.fill} opacity-20`} />
    </motion.div>
  );
}

function DataPoint({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-white/10 bg-background/45 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 break-words text-sm font-semibold">{value}</div>
    </div>
  );
}

// ── Convert real backend TimelineEntry[] into display rows ──────
function formatRealTimeline(timeline: TimelineEntry[]) {
  const stageLabels: Record<string, string> = {
    SUBMITTED:    "Submission Time",
    AI_ANALYSED:  "AI Analysis",
    ASSIGNED:     "Assignment Time",
    IN_PROGRESS:  "Officer Update",
    RESOLVED:     "Resolution Time",
  };

  if (timeline.length === 0) {
    return [
      { label: "Submission Time", value: "—", detail: "No timeline events yet." },
    ];
  }

  return timeline.map((entry) => ({
    label: stageLabels[entry.stage] || entry.stage,
    value: new Date(entry.at).toLocaleString("en-IN", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    }),
    detail: entry.note
      ? entry.note
      : entry.actor
        ? `Updated by ${entry.actor}.`
        : "Automatically recorded by the system.",
  }));
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}