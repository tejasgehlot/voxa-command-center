import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { type Complaint, sevHex, VADODARA_CENTER } from "@/lib/voxa-data";

// Fix default icon paths
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function Resizer() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

interface Props {
  complaints: Complaint[];
  height?: string;
  center?: [number, number];
  zoom?: number;
  onSelect?: (c: Complaint) => void;
  className?: string;
}

export function LeafletMapInner({
  complaints,
  height = "100%",
  center = VADODARA_CENTER,
  zoom = 13,
  onSelect,
  className = "",
}: Props) {
  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ height }}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; OSM &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Resizer />
        {complaints.map((c) => {
          const color = sevHex(c.severity);
          return (
            <CircleMarker
              key={c.id}
              center={[c.lat, c.lng]}
              radius={c.severity === "critical" ? 9 : 7}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.7,
                weight: 2,
                className: c.severity === "critical" ? "voxa-pulse" : undefined,
              }}
              eventHandlers={{ click: () => onSelect?.(c) }}
            >
              <Popup>
                <div className="text-xs">
                  <div className="font-mono text-primary">{c.id}</div>
                  <div className="font-semibold">{c.title}</div>
                  <div className="text-muted-foreground">{c.ward}</div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      <style>{`.voxa-pulse { animation: leaflet-pulse 1.6s infinite; }
@keyframes leaflet-pulse { 0%,100%{stroke-opacity:1;stroke-width:2px} 50%{stroke-opacity:0.4;stroke-width:8px} }`}</style>
    </div>
  );
}