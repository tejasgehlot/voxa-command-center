import { ThumbsUp, MessageCircle } from "lucide-react";
import { type Complaint, sevBg } from "@/lib/voxa-data";

export function ComplaintCard({ c, active, onClick }: { c: Complaint; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg transition-all ${active ? "panel-glow" : "panel hover:border-primary/50"}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className={`text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded border uppercase ${sevBg(c.severity)}`}>
          {c.severity}
        </span>
        <span className="font-mono text-xs text-muted-foreground">{c.id}</span>
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-foreground truncate">{c.title}</div>
          <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{c.description}</div>
        </div>
        <div className={`font-mono text-2xl font-bold ${c.severity === "critical" ? "text-critical" : c.severity === "medium" ? "text-warning" : c.severity === "resolved" ? "text-success" : "text-foreground"}`}>
          {c.severityScore}
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {c.upvotes}</span>
        <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {c.comments}</span>
        <span className="ml-auto">{c.timeAgo}</span>
      </div>
    </button>
  );
}
