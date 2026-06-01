import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, Satellite, Smile, AlertTriangle } from "lucide-react";
import { PublicNav } from "@/components/voxa/PublicNav";
import { VoxaMap } from "@/components/voxa/VoxaMap";
import { complaints } from "@/lib/voxa-data";

export const Route = createFileRoute("/report")({
  head: () => ({ meta: [{ title: "Report a Problem — VOXA" }, { name: "description", content: "Report a civic issue. AI categorizes and routes to the right department." }] }),
  component: Report,
});

function Report() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [desc, setDesc] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<null | { category: string; severity: number; dept: string; letter: string; letterGu: string }>(null);
  const [lang, setLang] = useState<"en" | "gu">("en");
  const [submitted, setSubmitted] = useState<string | null>(null);

  function onFile(f: File | null) {
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPhoto(url);
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      setScanning(false);
      setResult({
        category: "Pothole",
        severity: 92,
        dept: "VMC WARD 5 Roads",
        letter: "A major road issue described for wider area. Wins meaningful to complaint entry consumer and revert his problem-pension-aluminizing the complaint relion of natural issue.",
        letterGu: "મુખ્ય રસ્તાનો મુદ્દો વ્યાપક વિસ્તાર માટે વર્ણવેલ છે. ફરિયાદ નોંધાવી, સંબંધિત વિભાગને માહિતગાર કરી, સત્તાવાર ધોરણે નિવારણ માટેના પગલાંની માગણી.",
      });
    }, 2500);
  }

  function submit() {
    const id = `VX-${Math.floor(10000 + Math.random() * 90000)}`;
    setSubmitted(id);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />
      <div className="max-w-[1400px] w-full mx-auto px-6 py-8 flex-1">
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-6">REPORT A PROBLEM</h1>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* LEFT FORM */}
          <div className="lg:col-span-4 panel p-6 space-y-4">
            <Field label="Full Name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Citizen Name" className="input" /></Field>
            <Field label="Phone Number"><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className="input" /></Field>
            <Field label="Describe the Problem"><textarea rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Detail the civic issue..." className="input" /></Field>
            <div>
              <div className="text-xs tracking-widest text-muted-foreground mb-2">UPLOAD PHOTO</div>
              <label className="relative block border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/60 transition overflow-hidden">
                {photo ? (
                  <img src={photo} alt="upload" className="w-full h-40 object-cover rounded" />
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <div className="text-xs text-muted-foreground">Drag & drop or click to upload</div>
                  </>
                )}
                {scanning && (
                  <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="relative w-full h-20 overflow-hidden border-y border-primary/40">
                      <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary/60 to-transparent laser-sweep" />
                    </div>
                    <div className="font-mono text-primary text-glow-cyan mt-3 tracking-widest">AI SCANNING...</div>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
              </label>
            </div>
          </div>

          {/* CENTER MAP */}
          <div className="lg:col-span-4 panel overflow-hidden relative">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] panel px-3 py-1.5 flex items-center gap-2 text-xs">
              <Satellite className="w-3.5 h-3.5 text-primary" /> <span className="font-mono">GPS Auto-Detecting</span>
            </div>
            <VoxaMap complaints={complaints.slice(0, 1)} height="100%" />
          </div>

          {/* RIGHT AI RESULT */}
          <div className="lg:col-span-4">
            {!result && !scanning && (
              <div className="panel p-6 h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <AlertTriangle className="w-10 h-10 mb-3 text-muted-foreground/50" />
                <div className="text-sm">Upload a photo to trigger AI analysis.</div>
              </div>
            )}
            {result && (
              <div className="panel-glow p-6 space-y-4 fade-in-up">
                <div>
                  <div className="text-xs tracking-widest text-muted-foreground">CATEGORY</div>
                  <div className="font-display font-bold text-xl">{result.category.toUpperCase()}</div>
                </div>
                <div>
                  <div className="text-xs tracking-widest text-muted-foreground">SEVERITY SCORE</div>
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-3xl font-bold text-critical">CRITICAL, {result.severity}</div>
                    <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded border bg-critical/15 text-critical border-critical/40">ALARM RED</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs tracking-widest text-muted-foreground">RESPONSIBLE DEPARTMENT</div>
                  <div className="font-display font-bold text-foreground">{result.dept}</div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs tracking-widest text-muted-foreground">DRAFT COMPLAINT LETTER</div>
                    <button onClick={() => setLang(lang === "en" ? "gu" : "en")} className="text-xs flex items-center gap-2">
                      <span className={lang === "en" ? "text-primary" : "text-muted-foreground"}>EN</span>
                      <span className="w-8 h-4 rounded-full bg-input relative">
                        <span className={`absolute top-0.5 ${lang === "en" ? "left-0.5" : "left-4"} w-3 h-3 bg-primary rounded-full transition-all`} />
                      </span>
                      <span className={lang === "gu" ? "text-primary" : "text-muted-foreground"}>GU</span>
                    </button>
                  </div>
                  <textarea readOnly value={lang === "en" ? result.letter : result.letterGu} rows={6} className="input mt-1" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-4">
          <span className="text-xs text-muted-foreground">leads to full confirmation page</span>
          <button onClick={submit} disabled={!result} className="btn-glow px-10 py-3 rounded-md disabled:opacity-40 disabled:cursor-not-allowed">SUBMIT</button>
        </div>
      </div>

      {submitted && (
        <div className="fixed inset-0 z-[1000] bg-background/80 backdrop-blur flex items-center justify-center p-4">
          <div className="panel-glow max-w-md w-full p-8 text-center fade-in-up">
            <Smile className="w-12 h-12 text-success mx-auto mb-4 text-glow-green" />
            <h3 className="text-2xl font-display font-bold mb-2">Complaint Filed</h3>
            <p className="text-sm text-muted-foreground mb-4">Your tracking ID is</p>
            <div className="font-mono text-3xl font-bold text-primary text-glow-cyan tracking-wider">{submitted}</div>
            <div className="mt-6 flex gap-3 justify-center">
              <button onClick={() => navigate({ to: "/track" })} className="btn-glow px-5 py-2 rounded-md text-sm">TRACK NOW</button>
              <button onClick={() => { setSubmitted(null); setPhoto(null); setResult(null); }} className="btn-outline-glow px-5 py-2 rounded-md text-sm">CLOSE</button>
            </div>
          </div>
        </div>
      )}

      <style>{`.input{width:100%;background:var(--input);border:1px solid var(--border);border-radius:6px;padding:0.55rem 0.75rem;font-size:0.875rem;color:var(--foreground);outline:none}.input:focus{border-color:var(--primary);box-shadow:0 0 0 3px oklch(0.82 0.16 220 / 0.15)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs tracking-widest text-muted-foreground mb-1">{label.toUpperCase()}</div>
      {children}
    </div>
  );
}
