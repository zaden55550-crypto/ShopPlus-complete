import { supabase } from "@/integrations/supabase/client";
import { backupJson } from "@/lib/backup";
import { createSnapshot } from "@/lib/snapshot.functions";

export type SnapshotPrefs = { auto: boolean; hours: number; keep: number };
const PREFS = "shopbook.snapshotPrefs", LAST = "shopbook.lastVerifiedBackup", FAIL = "shopbook.lastBackupFailure";
export const EVENT = "shopbook-snapshots";
export const getPrefs = (): SnapshotPrefs => ({ auto: true, hours: 24, keep: 14, ...JSON.parse(localStorage.getItem(PREFS) || "{}") });
export const setPrefs = (p: SnapshotPrefs) => { localStorage.setItem(PREFS, JSON.stringify(p)); window.dispatchEvent(new Event(EVENT)); };
export const lastVerified = () => Number(localStorage.getItem(LAST) || 0);
export const lastFailure = () => localStorage.getItem(FAIL) || "";
export const nextDue = () => { const p = getPrefs(); return p.auto ? Math.max(Date.now(), lastVerified() + p.hours * 3600000) : 0; };
const device = () => { const d = localStorage.getItem("shopbook.deviceId") || crypto.randomUUID(); localStorage.setItem("shopbook.deviceId", d); return d; };

let running = false;
export async function backUpNow(kind: "manual" | "automatic" | "pre-restore") {
  if (running && kind !== "pre-restore") throw new Error("A backup is already running");
  running = true;
  try {
    const acct = JSON.parse(localStorage.getItem("shopbook.account") || "null");
    if (!acct) throw new Error("Open your shop first");
    const r = await createSnapshot({ data: { deviceId: device(), kind, keep: getPrefs().keep, text: backupJson(acct.shopName) } });
    localStorage.setItem(LAST, String(new Date(r.verified_at ?? r.created_at).getTime())); localStorage.removeItem(FAIL);
    window.dispatchEvent(new Event(EVENT));
    return r;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Backup failed";
    localStorage.setItem(FAIL, `${new Date().toISOString()}|${msg}`); window.dispatchEvent(new Event(EVENT));
    throw e;
  } finally { running = false; }
}

/** Mounted once at root: makes an automatic verified backup when one is due. */
export function startAutoSnapshots() {
  const tick = async () => {
    const p = getPrefs();
    if (!p.auto || !navigator.onLine || Date.now() < lastVerified() + p.hours * 3600000) return;
    const { data } = await supabase.auth.getSession(); if (!data.session || !localStorage.getItem("shopbook.account")) return;
    const owner = localStorage.getItem("shopbook.backupOwner"); if (owner && owner !== data.session.user.id) return;
    try { await backUpNow("automatic"); } catch { /* failure recorded for the status line */ }
  };
  const first = setTimeout(tick, 15000), t = setInterval(tick, 10 * 60000);
  return () => { clearTimeout(first); clearInterval(t); };
}
