import { useEffect, useRef, useState } from "react";
import { ScanLine, Search, X } from "lucide-react";
import { ShopButton } from "@/components/ui/shop-button";
import * as erp from "@/lib/erp";

type Tr = (t: string) => string;
export const inputCls = "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary";
export function useErp() {
  const [s, set] = useState<erp.ErpState>(() => erp.load());
  useEffect(() => { set(erp.load()); return erp.subscribe(() => set(erp.load())); }, []);
  return s;
}
// ---------- Shared search + scan (reused by Sales/POS/Purchases later) ----------
export function ProductSearch({ q, setQ, onScan, tr }: { q: string; setQ: (v: string) => void; onScan: (code: string) => void; tr: Tr }) {
  const [scan, setScan] = useState(false);
  return (
    <>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("Search product...")} className="h-11 flex-1 bg-transparent text-sm outline-none" />
        <button onClick={() => setScan(true)} className="flex items-center gap-1 text-xs font-bold text-primary"><ScanLine className="h-4 w-4" />{tr("SCAN")}</button>
      </div>
      {scan && <Scanner tr={tr} onClose={() => setScan(false)} onCode={(c) => { setScan(false); onScan(c); }} />}
    </>
  );
}

export function Scanner({ onCode, onClose, tr }: { onCode: (c: string) => void; onClose: () => void; tr: Tr }) {
  const video = useRef<HTMLVideoElement>(null);
  const [manual, setManual] = useState("");
  const [camOk, setCamOk] = useState(true);
  const [denied, setDenied] = useState(false);
  const cb = useRef(onCode); cb.current = onCode;
  useEffect(() => {
    let stream: MediaStream | null = null; let stop = false;
    type Det = { detect: (v: HTMLVideoElement) => Promise<{ rawValue: string }[]> };
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("no camera");
        // Asks the phone for camera permission only now, when the user chose to scan.
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (stop) { stream.getTracks().forEach((t) => t.stop()); return; }
        if (!video.current) return;
        video.current.srcObject = stream; await video.current.play();
        const Native = (window as unknown as { BarcodeDetector?: new () => Det }).BarcodeDetector;
        const det: Det = Native ? new Native() : new (await import("barcode-detector/ponyfill")).BarcodeDetector() as unknown as Det;
        const tick = async () => {
          if (stop || !video.current) return;
          try { const r = await det.detect(video.current); if (r[0]?.rawValue) { if (navigator.vibrate) navigator.vibrate(60); cb.current(r[0].rawValue); return; } } catch { /* keep scanning */ }
          setTimeout(tick, 150);
        };
        tick();
      } catch (e) { setDenied(e instanceof DOMException && (e.name === "NotAllowedError" || e.name === "SecurityError")); setCamOk(false); }
    })();
    return () => { stop = true; stream?.getTracks().forEach((t) => t.stop()); };
  }, []);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 px-6 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between"><p className="font-semibold">{tr("Scan barcode")}</p><button onClick={onClose} aria-label={tr("Close")}><X className="h-5 w-5" /></button></div>
        {camOk ? <video ref={video} playsInline muted className="aspect-video w-full rounded-xl bg-muted object-cover" />
          : <p className="mb-2 text-xs text-muted-foreground">{tr(denied ? "Camera permission is needed for barcode scanning. Allow camera access in your browser settings, or type the barcode or search instead." : "Camera scanning isn't available on this device. Type the barcode instead.")}</p>}
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (manual.trim()) onCode(manual.trim()); }}>
          <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder={tr("Barcode")} className={inputCls} />
          <ShopButton className="h-11 w-24">{tr("OK")}</ShopButton>
        </form>
      </div>
    </div>
  );
}

