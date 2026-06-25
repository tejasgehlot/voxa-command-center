import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useCallback } from "react";
import { X, ThumbsUp, MessageCircle, Send, Loader2 } from "lucide-react";
import { PublicNav } from "@/components/voxa/PublicNav";
import { VoxaMap } from "@/components/voxa/VoxaMap";
import { ComplaintCard } from "@/components/voxa/ComplaintCard";
import { type Complaint, type Severity, type Status, type Category, sevBg } from "@/lib/voxa-data";
import { pinToComplaint, summaryToComplaint } from "@/lib/adapters";
import { getMapPins, getComplaints, getComplaintById, upvoteComplaint, addComment, getComments } from "@/lib/apiService";

export const Route = createFileRoute("/map")({
  head: () => ({ meta: [{ title: "Live Map — VOXA" }, { name: "description", content: "Live map of civic complaints across Vadodara." }] }),
  component: PublicMap,
});

const cats: Category[] = ["Pothole", "Garbage", "Street Light", "Water", "Electricity", "Sanitation"];
const sevs: Severity[] = ["critical", "medium", "low", "resolved"];
const sts:  Status[]   = ["submitted", "assigned", "in_progress", "resolved"];

// Reverse map: UI category → backend category for filter queries
const categoryToBackend: Record<Category, string> = {
  Pothole:       "POTHOLE",
  Garbage:       "GARBAGE",
  "Street Light":"STREETLIGHT",
  Water:         "WATER",
  Electricity:   "OTHER",
  Sanitation:    "SEWAGE",
};
const statusToBackend: Record<Status, string> = {
  submitted:   "OPEN",
  ai_analysed: "OPEN",
  assigned:    "OPEN",
  in_progress: "IN_PROGRESS",
  resolved:    "RESOLVED",
};

function PublicMap() {
  const [cat, setCat] = useState<Category | "all">("all");
  const [sev, setSev] = useState<Severity | "all">("all");
  const [st,  setSt]  = useState<Status | "all">("all");

  const [pins,     setPins]     = useState<Complaint[]>([]);
  const [feed,      setFeed]    = useState<Complaint[]>([]);
  const [loading,   setLoading] = useState(true);
  const [selected,  setSelected] = useState<Complaint | null>(null);
  const [comments,  setComments] = useState<{ name: string; comment: string }[]>([]);
  const [newComment, setNewComment] = useState("");
  const [phone,      setPhone] = useState("");
  const [upvoting,   setUpvoting] = useState(false);

  // ── Fetch pins + feed whenever filters change ─────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filterParams = {
        category: cat !== "all" ? categoryToBackend[cat] : undefined,
        status:   st  !== "all" ? statusToBackend[st]    : undefined,
      };

      const [pinData, feedData] = await Promise.all([
        getMapPins(filterParams),
        getComplaints({ ...filterParams, size: 50 }),
      ]);

      let mappedPins = pinData.map(pinToComplaint);
      let mappedFeed = feedData.content.map(summaryToComplaint);

      // Severity filter applied client-side since backend uses LOW/MEDIUM/HIGH/CRITICAL labels
      if (sev !== "all") {
        mappedPins = mappedPins.filter((c) => c.severity === sev);
        mappedFeed = mappedFeed.filter((c) => c.severity === sev);
      }

      setPins(mappedPins);
      setFeed(mappedFeed);
    } catch (err) {
      console.error("Failed to fetch map data:", err);
    } finally {
      setLoading(false);
    }
  }, [cat, sev, st]);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 60 seconds — matches our backend design
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── When a complaint is selected, load its full detail + comments ──
  async function handleSelect(c: Complaint) {
    setSelected(c);
    try {
      const detail = await getComplaintById(c.id);
      setSelected({
        ...c,
        description: detail.description,
        ward:        detail.wardName,
        department:  detail.aiDepartment,
        upvotes:     detail.upvotes,
      });
      const commentData = await getComments(c.id);
      setComments(
        (commentData.content || []).map((cm: any) => ({
          name: cm.name, comment: cm.comment,
        }))
      );
    } catch (err) {
      console.error("Failed to load complaint detail:", err);
    }
  }

  async function handleUpvote() {
    if (!selected || !phone || phone.length !== 10) {
      alert("Enter your 10-digit phone number first to upvote.");
      return;
    }
    setUpvoting(true);
    try {
      const result = await upvoteComplaint(selected.id, phone);
      setSelected({ ...selected, upvotes: result.upvotes });
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not upvote.");
    } finally {
      setUpvoting(false);
    }
  }

  async function handleAddComment() {
    if (!selected || !newComment.trim() || !phone || phone.length !== 10) {
      alert("Enter your name above and a 10-digit phone number to comment.");
      return;
    }
    try {
      await addComment(selected.id, "Citizen", phone, newComment.trim());
      setComments([{ name: "You", comment: newComment.trim() }, ...comments]);
      setNewComment("");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not add comment.");
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <PublicNav />
      {/* filters */}
      <div className="border-b border-border bg-surface/50 px-6 py-3 flex flex-wrap gap-3 items-center">
        <Filter label="Category" value={cat} onChange={(v) => setCat(v as Category | "all")} options={["all", ...cats]} />
        <Filter label="Severity" value={sev} onChange={(v) => setSev(v as Severity | "all")} options={["all", ...sevs]} />
        <Filter label="Status"   value={st}  onChange={(v) => setSt(v as Status | "all")}   options={["all", ...sts]} />
        <span className="ml-auto text-xs font-mono text-muted-foreground flex items-center gap-2">
          {loading && <Loader2 className="w-3 h-3 animate-spin" />}
          {pins.length} ACTIVE PINS
        </span>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 relative">
          <VoxaMap complaints={pins} onSelect={handleSelect} />
        </div>
        <aside className="w-[380px] border-l border-border bg-background overflow-y-auto relative">
          {selected ? (
            <div className="p-4 fade-in-up">
              <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-3">
                <X className="w-4 h-4" /> CLOSE
              </button>
              {selected.photo && (
                <img src={selected.photo} alt={selected.title} className="w-full h-44 object-cover rounded-lg" />
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className={`text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded border uppercase ${sevBg(selected.severity)}`}>{selected.severity}</span>
                <span className="font-mono text-xs text-muted-foreground">{selected.id}</span>
              </div>
              <h3 className="font-display font-bold text-lg mt-2">{selected.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <Field label="Ward"  value={selected.ward || "—"} />
                <Field label="Dept"  value={selected.department || "—"} />
                <Field label="Score" value={String(selected.severityScore)} />
                <Field label="Status" value={selected.status} />
              </div>

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Your phone number (to upvote/comment)"
                className="w-full mt-3 bg-input border border-border rounded px-3 py-2 text-xs outline-none focus:border-primary"
                maxLength={10}
              />

              <button
                onClick={handleUpvote}
                disabled={upvoting}
                className="btn-glow w-full mt-2 py-2 rounded-md text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {upvoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                UPVOTE ({selected.upvotes})
              </button>

              <div className="mt-4">
                <div className="text-xs tracking-widest text-muted-foreground mb-2">COMMENTS</div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {comments.length === 0 && (
                    <div className="text-xs text-muted-foreground">No comments yet.</div>
                  )}
                  {comments.map((c, i) => (
                    <div key={i} className="panel p-2 text-xs">
                      <div className="text-primary">{c.name}</div>
                      <div className="text-muted-foreground">{c.comment}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 bg-input border border-border rounded px-2 py-1.5 text-sm"
                    placeholder="Add a comment..."
                    maxLength={300}
                  />
                  <button onClick={handleAddComment} className="btn-glow px-3 rounded">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <div className="text-xs tracking-widest text-muted-foreground">FEED — {feed.length}</div>
              {feed.map((c) => (
                <ComplaintCard key={c.id} c={c} onClick={() => handleSelect(c)} />
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground tracking-wider">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="panel px-2 py-1.5 text-xs capitalize bg-surface">
        {options.map((o) => <option key={o} value={o}>{o.replace("_", " ")}</option>)}
      </select>
    </label>
  );
}
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-2">
      <div className="text-[10px] tracking-widest text-muted-foreground">{label}</div>
      <div className="font-mono text-sm text-foreground">{value}</div>
    </div>
  );
}