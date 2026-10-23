import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { empty, load, type ErpState } from "@/lib/erp";
import type { Json } from "@/integrations/supabase/types";

/** Live multi-phone sync of the whole ERP for one signed-in owner.
 * Records carry ids, so phones merge by id (union); for the same id the side doing the merge keeps its own copy. */
export type SyncState = { phase: "local" | "offline" | "syncing" | "live" | "failed"; at: number; error?: string };
let state: SyncState = { phase: "local", at: 0 };
const EVT = "shopbook-sync-status";
const publish = (s: SyncState) => { state = s; window.dispatchEvent(new Event(EVT)); };
export function useSyncStatus() { const [s, set] = useState(state); useEffect(() => { const f = () => set(state); f(); window.addEventListener(EVT, f); return () => window.removeEventListener(EVT, f); }, []); return s; }

export function mergeErp(mine: ErpState, theirs: ErpState): ErpState {
  const out = empty() as Record<string, unknown>;
  for (const key of Object.keys(out) as (keyof ErpState)[]) {
    if (key === "seq") { const seq: Record<string, number> = { ...theirs.seq }; for (const [k, v] of Object.entries(mine.seq ?? {})) seq[k] = Math.max(v, seq[k] ?? 0); out["seq"] = seq; continue; }
    // Reset markers: records older than the newest reset of this collection are dropped, so an old phone can't bring deleted data back.
    const mk = `__reset:${String(key)}`, mr = mine.seq?.[mk] ?? 0, tr = theirs.seq?.[mk] ?? 0, R = Math.max(mr, tr);
    const keep = (own: number) => (x: { at?: number; createdAt?: number }) => own >= R || (x.at ?? x.createdAt ?? 0) > R;
    const a = ((mine[key] ?? []) as { id: string; at?: number; createdAt?: number }[]).filter(keep(mr)), b = ((theirs[key] ?? []) as { id: string; at?: number; createdAt?: number }[]).filter(keep(tr));
    const seen = new Set(a.map((x) => x.id)), merged = [...a, ...b.filter((x) => !seen.has(x.id))];
    if (merged.some((x) => typeof x.at === "number")) merged.sort((x, y) => (y.at ?? 0) - (x.at ?? 0));
    out[key] = merged;
  }
  const s = out as ErpState;
  // Stock follows the newest recorded movement so both phones agree on quantity.
  const latest = new Map<string, number>(); for (const m of s.movements) if (!latest.has(m.productId)) latest.set(m.productId, m.next);
  s.products = s.products.map((p) => latest.has(p.id) ? { ...p, qty: latest.get(p.id)! } : p);
  return s;
}
const KEY = "shopbook.erp", BASE = "shopbook.syncRevision";
const write = (s: ErpState) => { localStorage.setItem(KEY, JSON.stringify(s)); window.dispatchEvent(new Event("shopbook-erp-remote")); window.dispatchEvent(new Event("storage")); };

export function startShopSync() {
  let stopped = false, busy = false, again = false, timer: ReturnType<typeof setTimeout> | undefined, user = "", retry = 2000, lastPushed = "";
  const device = localStorage.getItem("shopbook.deviceId") || crypto.randomUUID(); localStorage.setItem("shopbook.deviceId", device);
  const schedule = (ms = 800) => { if (timer) clearTimeout(timer); timer = setTimeout(run, ms); };
  const run = async () => {
    if (stopped) return;
    if (!navigator.onLine) return publish({ phase: "offline", at: state.at });
    if (busy) { again = true; return; }
    busy = true;
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session || !localStorage.getItem("shopbook.account")) { user = ""; return publish({ phase: "local", at: 0 }); }
      user = data.session.user.id;
      const r = await supabase.from("shopbook_shop_sync").select("revision,device_id,payload,updated_at").eq("user_id", user).maybeSingle();
      if (r.error) throw new Error(r.error.message);
      const base = Number(localStorage.getItem(BASE) || 0), local = load();
      let next = local;
      if (r.data && r.data.revision > base) { next = mergeErp(local, { ...empty(), ...(r.data.payload as unknown as ErpState) }); if (JSON.stringify(next) !== JSON.stringify(local)) write(next); }
      const body = JSON.stringify(next), remoteSame = r.data && JSON.stringify(r.data.payload) === body;
      if (remoteSame || (r.data && body === lastPushed && r.data.revision <= base)) { localStorage.setItem(BASE, String(r.data!.revision)); return publish({ phase: "live", at: new Date(r.data!.updated_at).getTime() }); }
      publish({ phase: "syncing", at: state.at });
      const revision = (r.data?.revision ?? 0) + 1, payload = next as unknown as Json;
      const w = r.data
        ? await supabase.from("shopbook_shop_sync").update({ revision, device_id: device, payload }).eq("user_id", user).eq("revision", r.data.revision).select("revision,updated_at")
        : await supabase.from("shopbook_shop_sync").insert({ user_id: user, revision, device_id: device, payload }).select("revision,updated_at");
      if (w.error) throw new Error(w.error.message);
      if (!w.data?.length) { again = true; return; } // another phone saved first: merge again
      localStorage.setItem(BASE, String(revision)); lastPushed = body; retry = 2000;
      publish({ phase: "live", at: new Date(w.data[0]!.updated_at).getTime() });
    } catch (e) { publish({ phase: "failed", at: state.at, error: e instanceof Error ? e.message : "Sync failed" }); schedule(retry); retry = Math.min(60000, retry * 2); }
    finally { busy = false; if (again && !stopped) { again = false; schedule(300); } }
  };
  const changed = () => schedule();
  ["shopbook-erp", "online", "offline"].forEach((e) => window.addEventListener(e, changed));
  const auth = supabase.auth.onAuthStateChange((ev) => { if (ev === "SIGNED_IN" || ev === "SIGNED_OUT") { localStorage.removeItem(BASE); schedule(50); } });
  const channel = supabase.channel("shop-sync").on("postgres_changes", { event: "*", schema: "public", table: "shopbook_shop_sync" }, (p) => { const row = p.new as { device_id?: string; user_id?: string }; if (row?.user_id === user && row.device_id !== device) schedule(100); }).subscribe();
  const poll = setInterval(() => { if (document.visibilityState === "visible") schedule(0); }, 15000);
  const vis = () => { if (document.visibilityState === "visible") schedule(0); }; document.addEventListener("visibilitychange", vis);
  schedule(100);
  return () => { stopped = true; if (timer) clearTimeout(timer); clearInterval(poll); document.removeEventListener("visibilitychange", vis); ["shopbook-erp", "online", "offline"].forEach((e) => window.removeEventListener(e, changed)); auth.data.subscription.unsubscribe(); void supabase.removeChannel(channel); };
}
