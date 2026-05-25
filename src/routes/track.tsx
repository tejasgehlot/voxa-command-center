import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ThumbsUp, MessageCircle } from "lucide-react";
import { PublicNav } from "@/components/voxa/PublicNav";
import { complaints, sevBg } from "@/lib/voxa-data";

export const Route = createFileRoute("/track")({
  head: () => ({ meta: [{ title: "Track Complaint — VOXA" }, { name: "description", content: "Track your civic complaint with phone number + tracking ID." }] }),
  component: Track,
});

const stages = [
  { key: "submitted", label: "Submitted", desc: "Initial citizen report received with photo & location data." },
  { key: "ai_analysed", label: "AI Analysed", desc: "AI categorization completed. Issue: Pothole. Severity: Critical. Routing to VMC WARD 5 Roads." },
  { key: "assigned", label: "Assigned to Officer", desc: "Officer assigned, site inspection scheduled." },
  { key: "in_progress", label: "In Progress", desc: "Repair crew dispatched, work order issued." },
  { key: "resolved", label: "Resolved", desc: "Pothole repaired. Final verification photo attached." },
] as const;

function Track() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const results = searched ? complaints.slice(0, 4) : [];

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-6">COMPLAINT TRACKING</h1>
        <div className="max-w-3xl mx-auto">
          <div className="panel-glow flex items-center gap-2 p-2">
            <input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Phone Number + Tracking ID (e.g., 9876543210 VX-123456)"
              className="flex-1 bg-transparent px-4 py-3 outline-none text-sm font-mono"
            />
            <button onClick={() => setSearched(true)} className="btn-glow px-6 py-3 rounded-md text-sm flex items-center gap-2">
              SEARCH <Search className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center text-xs text-muted-foreground mt-3">Find all issues linked to your phone number. No login needed.</div>
        </div>

        {results.length > 0 && (
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {results.map((c) => {
              const stageIdx = stages.findIndex((s) => s.key === (c.status === "resolved" ? "resolved" : c.status));
              const active = expanded === c.id;
              return (
                <div key={c.id} className={active ? "md:col-span-3" : ""}>
                  <button onClick={() => setExpanded(active ? null : c.id)} className={`w-full text-left panel p-5 hover:border-primary/60 transition ${active ? "border-primary/60" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Tracking ID:</div>
                        <div className="font-mono text-xl font-bold">{c.id}</div>
                        <div className="font-semibold mt-2">{c.title}</div>
                      </div>
                      <span className={`text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded border uppercase ${sevBg(c.severity)}`}>{c.status.replace("_", " ")}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {c.upvotes}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {c.comments}</span>
                    </div>
                  </button>

                  {active && (
                    <div className="panel mt-3 p-6 fade-in-up">
                      <div className="flex items-center gap-3 mb-6">
                        <img src={c.photo} alt="" className="w-16 h-16 rounded object-cover" />
                        <div>
                          <div className="text-xs text-muted-foreground">Category</div>
                          <div className="font-display font-bold text-lg">{c.category.toUpperCase()}</div>
                        </div>
                        <div className="ml-auto">
                          <div className="text-xs text-muted-foreground">Current Status</div>
                          <div className={`font-display font-bold text-lg uppercase ${c.severity === "critical" ? "text-critical" : c.severity === "resolved" ? "text-success" : "text-warning"}`}>{c.status.replace("_", " ")}</div>
                        </div>
                      </div>

                      <div className="relative pl-8">
                        <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
                        {stages.map((s, i) => {
                          const done = i <= stageIdx;
                          const current = i === stageIdx;
                          return (
                            <div key={s.key} className="relative pb-6 last:pb-0">
                              <div className={`absolute -left-[22px] top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                done ? (current ? "bg-warning border-warning glow-cyan" : i === stages.length - 1 && done ? "bg-success border-success glow-green" : "bg-primary border-primary") : "bg-background border-border"
                              }`}>
                                {done && <div className="w-1.5 h-1.5 rounded-full bg-background" />}
                              </div>
                              <div className="flex items-baseline gap-3">
                                <div className="font-mono text-xs text-muted-foreground w-16">17:55 PM</div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">{s.label}:</span>
                                    <span className="text-sm text-muted-foreground">Rajesh Patel</span>
                                  </div>
                                  <div className="text-sm text-muted-foreground mt-0.5">{s.desc}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
