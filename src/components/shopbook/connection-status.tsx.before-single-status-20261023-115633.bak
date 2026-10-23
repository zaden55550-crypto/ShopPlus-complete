// Three-state connection indicator (Online / Connecting / Offline) with a small details panel.
// Browser online status alone is not trusted: a lightweight backend health check confirms the service.
import { useCallback, useEffect, useRef, useState } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { ShopButton } from "@/components/ui/shop-button";
import { useLanguage } from "@/hooks/use-language";
import { useBackupStatus } from "@/lib/cloud-backup";
import { useSyncStatus } from "@/lib/shop-sync";
import { cn } from "@/lib/utils";

export type Conn = "online" | "connecting" | "offline";

async function checkBackend(timeoutMs = 6000): Promise<boolean> {
  const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined, key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined;
  if (!url) return false;
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), timeoutMs);
  try { const r = await fetch(`${url}/auth/v1/health`, { headers: { apikey: key ?? "" }, signal: ctl.signal, cache: "no-store" }); return r.ok; }
  catch { return false; } finally { clearTimeout(t); }
}

export function useConnection() {
  const [conn, setConn] = useState<Conn>("connecting");
  const [lastOk, setLastOk] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const delay = useRef(15000);
  const check = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    if (!navigator.onLine) { setConn("offline"); return; }
    setConn((c) => (c === "online" ? c : "connecting"));
    const ok = await checkBackend();
    if (ok) { setConn("online"); setLastOk(Date.now()); delay.current = 30000; }
    else { setConn(navigator.onLine ? "connecting" : "offline"); delay.current = Math.min(120000, delay.current * 2) * (0.8 + Math.random() * 0.4); }
    if (document.visibilityState === "visible") timer.current = setTimeout(check, ok ? 30000 : delay.current);
  }, []);
  useEffect(() => {
    const off = () => setConn("offline");
    const on = () => { delay.current = 5000; void check(); };
    const vis = () => { if (document.visibilityState === "visible") void check(); };
    window.addEventListener("offline", off); window.addEventListener("online", on); document.addEventListener("visibilitychange", vis);
    void check();
    return () => { if (timer.current) clearTimeout(timer.current); window.removeEventListener("offline", off); window.removeEventListener("online", on); document.removeEventListener("visibilitychange", vis); };
  }, [check]);
  return { conn, lastOk, retry: check };
}

const STATES: { k: Conn; label: string; dot: string }[] = [
  { k: "online", label: "Online", dot: "bg-success" },
  { k: "connecting", label: "Connecting", dot: "bg-warning" },
  { k: "offline", label: "Offline", dot: "bg-destructive" },
];

export function ConnectionStatus({ className }: { className?: string }) {
  const { tr } = useLanguage();
  const { conn, lastOk, retry } = useConnection();
  const sync = useSyncStatus(), backup = useBackupStatus();
  const [open, setOpen] = useState(false);
  const message = conn === "offline" ? tr("Offline — working from saved data. Changes are saved on this phone and will sync when back online.")
    : conn === "connecting" ? tr("Connecting — service not confirmed yet. Changes are saved on this phone.")
    : sync.phase === "syncing" || backup.phase === "syncing" ? tr("Online — syncing changes")
    : sync.phase === "local" ? tr("Online — sign in to sync this shop")
    : sync.phase === "failed" || backup.phase === "failed" ? tr("Sync issue — will retry automatically")
    : tr("Online — all changes synced");
  const syncedAt = Math.max(sync.at, backup.at, 0);
  return (
    <div className={cn("relative flex min-w-0 items-center justify-center", className)}>
      <div role="group" aria-label={tr("Connection status")} className="flex items-center gap-0.5 rounded-full border border-border bg-card/60 p-0.5">
        {STATES.map((s) => {
          const active = conn === s.k;
          return (
            <ShopButton key={s.k} variant="bare" aria-pressed={active} title={tr(s.label)} onClick={() => setOpen((o) => !o)}
              className={cn("flex h-6 w-auto items-center gap-1 rounded-full px-1.5 text-[10px] font-semibold transition-colors", active ? "bg-muted text-foreground" : "text-muted-foreground opacity-60")}>
              {s.k === "offline" ? <WifiOff className="h-3 w-3" /> : s.k === "connecting" ? <RefreshCw className={cn("h-3 w-3", active && "animate-spin")} /> : <Wifi className="h-3 w-3" />}
              <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
              <span className={cn(!active && "hidden sm:inline")}>{tr(s.label)}</span>
            </ShopButton>
          );
        })}
      </div>
      {open && (
        <div role="dialog" aria-label={tr("Connection details")} className="absolute left-1/2 top-8 z-40 w-64 -translate-x-1/2 rounded-xl border border-border bg-popover p-3 text-start text-xs shadow-lg">
          <p className="font-semibold">{message}</p>
          <p className="mt-2 text-muted-foreground">{tr("Last server check")}: {lastOk ? new Date(lastOk).toLocaleTimeString() : "—"}</p>
          <p className="text-muted-foreground">{tr("Last sync")}: {syncedAt ? new Date(syncedAt).toLocaleTimeString() : "—"}</p>
          {(sync.error || backup.error) && conn === "online" && <p className="mt-1 text-destructive">{tr("Last sync error — retrying")}</p>}
          <div className="mt-3 flex gap-2">
            <ShopButton className="h-8 flex-1 text-xs" onClick={() => { void retry(); window.dispatchEvent(new Event("shopbook-erp")); }}>{tr("Retry now")}</ShopButton>
            <ShopButton variant="outline" className="h-8 flex-1 text-xs" onClick={() => setOpen(false)}>{tr("Close")}</ShopButton>
          </div>
        </div>
      )}
    </div>
  );
}
