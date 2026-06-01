import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { X, ThumbsUp, MessageCircle, Send } from "lucide-react";
import { PublicNav } from "@/components/voxa/PublicNav";
import { VoxaMap } from "@/components/voxa/VoxaMap";
import { ComplaintCard } from "@/components/voxa/ComplaintCard";
import { complaints, type Complaint, type Severity, type Status, type Category, sevBg } from "@/lib/voxa-data";

export const Route = createFileRoute("/map")({
  head: () => ({ meta: [{ title: "Live Map — VOXA" }, { name: "description", content: "Live map of civic complaints across Vadodara." }] }),
  component: PublicMap,
});

const cats: Category[] = ["Pothole", "Garbage", "Street Light", "Water", "Electricity", "Sanitation"];
const sevs: Severity[] = ["critical", "medium", "low", "resolved"];
const sts: Status[] = ["submitted", "assigned", "in_progress", "resolved"];

function PublicMap() {
  const [cat, setCat] = useState<Category | "all">("all");
  const [sev, setSev] = useState<Severity | "all">("all");
  const [st, setSt] = useState<Status | "all">("all");
  const [selected, setSelected] = useState<Complaint | null>(null);

  const filtered = useMemo(
    () => complaints.filter((c) =>
      (cat === "all" || c.category === cat) &&
      (sev === "all" || c.severity === sev) &&
      (st === "all" || c.status === st)
    ),
    [cat, sev, st],
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      <PublicNav />
      {/* filters */}
      <div className="border-b border-border bg-surface/50 px-6 py-3 flex flex-wrap gap-3 items-center">
        <Filter label="Category" value={cat} onChange={(v) => setCat(v as Category | "all")} options={["all", ...cats]} />
        <Filter label="Severity" value={sev} onChange={(v) => setSev(v as Severity | "all")} options={["all", ...sevs]} />
        <Filter label="Status" value={st} onChange={(v) => setSt(v as Status | "all")} options={["all", ...sts]} />
        <span className="ml-auto text-xs font-mono text-muted-foreground">{filtered.length} ACTIVE PINS</span>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 relative">
          <VoxaMap complaints={filtered} onSelect={setSelected} />
        </div>
        <aside className="w-[380px] border-l border-border bg-background overflow-y-auto relative">
          {selected ? (
            <div className="p-4 fade-in-up">
              <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-3">
                <X className="w-4 h-4" /> CLOSE
              </button>
              <img src={selected.photo} alt={selected.title} className="w-full h-44 object-cover rounded-lg" />
              <div className="mt-3 flex items-center justify-between">
                <span className={`text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded border uppercase ${sevBg(selected.severity)}`}>{selected.severity}</span>
                <span className="font-mono text-xs text-muted-foreground">{selected.id}</span>
              </div>
              <h3 className="font-display font-bold text-lg mt-2">{selected.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <Field label="Ward" value={selected.ward} />
                <Field label="Dept" value={selected.department} />
                <Field label="Citizen" value={selected.citizen} />
                <Field label="Score" value={String(selected.severityScore)} />
              </div>
              <button className="btn-glow w-full mt-4 py-2 rounded-md text-sm flex items-center justify-center gap-2">
                <ThumbsUp className="w-4 h-4" /> UPVOTE ({selected.upvotes})
              </button>
              <div className="mt-4">
                <div className="text-xs tracking-widest text-muted-foreground mb-2">COMMENTS</div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {["Major safety issue, two-wheelers struggling.", "Same problem near my house, please prioritize.", "Reported last week, glad it's tracked now."].map((t, i) => (
                    <div key={i} className="panel p-2 text-xs">
                      <div className="text-primary">@citizen{i + 1}</div>
                      <div className="text-muted-foreground">{t}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input className="flex-1 bg-input border border-border rounded px-2 py-1.5 text-sm" placeholder="Add a comment..." />
                  <button className="btn-glow px-3 rounded"><Send className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <div className="text-xs tracking-widest text-muted-foreground">FEED — {filtered.length}</div>
              {filtered.map((c) => (
                <ComplaintCard key={c.id} c={c} onClick={() => setSelected(c)} />
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

function MessageIcon() { return <MessageCircle className="w-3 h-3" />; }
