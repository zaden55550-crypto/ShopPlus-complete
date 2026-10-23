import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { saveCloudBackup } from "@/lib/backup.functions";
import { snapshot, BACKUP_KEYS } from "@/lib/backup";
export type BackupState = { phase: "local" | "offline" | "syncing" | "backed" | "failed" | "account"; at: number; error?: string };
let state: BackupState = { phase: "local", at: 0 };
const EVENT = "shopbook-backup-status";
const publish = (s: BackupState) => { state = s; window.dispatchEvent(new Event(EVENT)); };
export function useBackupStatus() { const [s, set] = useState(state); useEffect(() => { const f = () => set(state); f(); window.addEventListener(EVENT, f); return () => window.removeEventListener(EVENT, f); }, []); return s; }
/** Mount once globally: captures all ERP actions, preferences, reports and drafts. No auto-restore or merges. */
export function startCloudBackup() {
  let stopped = false, busy = false, timer: ReturnType<typeof setTimeout> | undefined, retry = 2000, signature = "", boundUser = "";
  const device = localStorage.getItem("shopbook.deviceId") || crypto.randomUUID(); localStorage.setItem("shopbook.deviceId", device);
  const schedule = (ms = 1200) => { if (timer) clearTimeout(timer); timer = setTimeout(sync, ms); };
  const sync = async () => {
    if (stopped) return;
    if (!navigator.onLine) { publish({ phase: "offline", at: state.at }); return; }
    if (busy) { schedule(); return; }
    busy = true;
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { publish({ phase: "local", at: 0 }); return; }
      const owner = localStorage.getItem("shopbook.backupOwner");
      if (owner && owner !== data.session.user.id) { publish({ phase: "account", at: 0 }); return; }
      if (!localStorage.getItem("shopbook.account")) return;
      boundUser = data.session.user.id;
      const acct = JSON.parse(localStorage.getItem("shopbook.account") || "null");
      const payload = snapshot(acct?.shopName ?? "");
      const sig = JSON.stringify({ data: payload.data, settings: payload.settings, business: payload.business });
      if (sig === signature && state.phase === "backed") return;
      localStorage.setItem("shopbook.backupOwner", boundUser);
      publish({ phase: "syncing", at: state.at });
      const revision = Math.max(Date.now(), Number(localStorage.getItem("shopbook.backupRevision") || 0) + 1); localStorage.setItem("shopbook.backupRevision", String(revision));
      const result = await saveCloudBackup({ data: { deviceId: device, revision, shop: payload.shop, payload } });
      if (stopped) return;
      const session = await supabase.auth.getSession();
      if (session.data.session?.user.id !== boundUser) { signature = ""; publish({ phase: "local", at: 0 }); return; }
      signature = sig; retry = 2000;
      publish({ phase: "backed", at: new Date(result.updated_at).getTime() });
    } catch (e) { if (!stopped) { publish({ phase: "failed", at: state.at, error: e instanceof Error ? e.message : "Backup failed" }); schedule(retry); retry = Math.min(60000, retry * 2); } }
    finally { busy = false; }
  };
  const changed = () => { publish({ phase: navigator.onLine ? "syncing" : "offline", at: state.at }); schedule(); };
  const events = ["shopbook-erp", "shopbook-prefs", "shopbook-language", "storage", "online", "offline"];
  events.forEach((e) => window.addEventListener(e, changed));
  const auth = supabase.auth.onAuthStateChange(() => { signature = ""; schedule(50); });
  // Also captures older screens whose preference/draft setters do not dispatch events.
  const check = setInterval(() => { const keys = ["shopbook.erp", "shopbook.account", ...BACKUP_KEYS]; const current = keys.map((k) => localStorage.getItem(k)).join("|"); if (current !== last) { last = current; changed(); } }, 2000);
  let last = ""; schedule(50);
  return () => { stopped = true; if (timer) clearTimeout(timer); clearInterval(check); events.forEach((e) => window.removeEventListener(e, changed)); auth.data.subscription.unsubscribe(); };
}
