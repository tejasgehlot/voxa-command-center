import { useEffect, useState } from "react";
import { type Complaint, VADODARA_CENTER } from "@/lib/voxa-data";

interface Props {
  complaints: Complaint[];
  height?: string;
  center?: [number, number];
  zoom?: number;
  onSelect?: (c: Complaint) => void;
  className?: string;
}

// ── Public export — SSR-safe wrapper ──────────────────────────
// Never imports react-leaflet/leaflet until confirmed running in the browser.
export function VoxaMap(props: Props) {
  const [isClient, setIsClient] = useState(false);
  const [LeafletMap, setLeafletMap] = useState<React.ComponentType<Props> | null>(null);

  useEffect(() => {
    setIsClient(true);
    // Dynamic import — only runs in the browser, after mount
    import("./VoxaMapInner").then((mod) => {
      setLeafletMap(() => mod.LeafletMapInner);
    });
  }, []);

  if (!isClient || !LeafletMap) {
    return (
      <div
        className={`relative w-full overflow-hidden bg-surface flex items-center justify-center ${props.className ?? ""}`}
        style={{ height: props.height ?? "100%" }}
      >
        <span className="text-xs text-muted-foreground font-mono">Loading map...</span>
      </div>
    );
  }

  return <LeafletMap {...props} />;
}

export type { Props as VoxaMapProps };
export { VADODARA_CENTER };