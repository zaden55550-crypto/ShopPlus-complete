import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { ShopButton } from "@/components/ui/shop-button";
import { BackupStatus } from "@/components/shopbook/backup-status";
import { backupJson, restoreJson, validateBackup } from "@/lib/backup";
import { load } from "@/lib/erp";
import { getSnapshot, listSnapshots, markRestoreTested } from "@/lib/snapshot.functions";
import { backUpNow, EVENT, getPrefs, lastFailure, lastVerified, nextDue, setPrefs } from "@/lib/snapshots";

type Row = Awaited<ReturnType<typeof listSnapshots>>[number];
type Preview = { id?: string; text: string; shop: string; at: number; rows: [string, number, number][] };
const when = (t: number) => (t ? new Date(t).toLocaleString() : "—");
const kb = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const COUNTED = ["products", "customers", "suppliers", "sales", "purchases", "expenses", "payments", "movements", "employees", "payrolls"];

export function BackupHub({ tr, shopName }: { tr: (x: string) => string; shopName: string }) {
  const [signed, setSigned] = useState(false), [rows, setRows] = useState<Row[]>([]), [busy, setBusy] = useState(""), [prefs, setP] = useState(getPrefs()), [, tick] = useState(0), [preview, setPreview] = useState<Preview | null>(null), file = useRef<HTMLInputElement>(null);
  const refresh = () => listSnapshots().then(setRows).catch(() => undefined);
  useEffect(() => { const f = () => supabase.auth.getSession().then(({ data }) => setSigned(!!data.session)); f(); const a = supabase.auth.onAuthStateChange(f); const e = () => { tick((n) => n + 1); refresh(); }; window.addEventListener(EVENT, e); return () => { a.data.subscription.unsubscribe(); window.removeEventListener(EVENT, e); }; }, []);
  useEffect(() => { if (signed) refresh(); }, [signed]);
  const fail = lastFailure().split("|");

  const now = async () => { setBusy("backup"); try { await backUpNow("manual"); toast.success(tr("Backup completed and verified.")); } catch (e) { toast.error(`${e instanceof Error ? e.message : "Backup failed"} ${tr("Your previous verified backup is still available.")}`); } finally { setBusy(""); } };
  const download = () => { const u = URL.createObjectURL(new Blob([backupJson(shopName)], { type: "application/json" })); const a = document.createElement("a"); a.href = u; a.download = `shopbook-full-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(u); };
  const open = (text: string, id?: string) => {
    const f = JSON.parse(text); validateBackup(f); const cur = load() as unknown as Record<string, unknown[]>; const d = f.data as unknown as Record<string, unknown[]>;
    setPreview({ text, ...(id ? { id } : {}), shop: f.shop, at: f.at, rows: COUNTED.map((k) => [k, (cur[k] ?? []).length, (d[k] ?? []).length]) });
  };
  const pick = async (id: string) => { setBusy(id); try { open(await getSnapshot({ data: { id } }), id); } catch (e) { toast.error(e instanceof Error ? e.message : "Backup unavailable"); } finally { setBusy(""); } };
  const restore = async () => {
    if (!preview) return; setBusy("restore");
    try {
      if (signed) await backUpNow("pre-restore");
      else { download(); }
      restoreJson(preview.text);
      const after = load() as unknown as Record<string, unknown[]>; const bad = preview.rows.filter(([k, , n]) => (after[k] ?? []).length !== n);
      if (bad.length) throw new Error(`${tr("Restore check failed for")}: ${bad.map((b) => b[0]).join(", ")}`);
      if (preview.id) await markRestoreTested({ data: { id: preview.id } });
      toast.success(tr("Backup restored and checked. A safety copy of your previous data was saved first.")); setPreview(null); refresh();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Restore failed"); } finally { setBusy(""); }
  };
  const other = preview && preview.shop.trim().toLowerCase() !== shopName.trim().toLowerCase();

  return <div className="import-center">
    <BackupStatus className="px-0" />
    {!signed && <><p className="settings-note">{tr("Sign in to keep verified backups in the cloud. Without it, use Download Full Backup.")}</p><ShopButton className="inventory-save" onClick={() => lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })}>{tr("Sign in with Google")}</ShopButton></>}
    <div className="settings-inline"><span>{tr("Last verified backup")}</span><b>{when(lastVerified())}</b></div>
    <div className="settings-inline"><span>{tr("Next automatic backup")}</span><b>{prefs.auto ? (signed ? when(nextDue()) : tr("Needs sign-in")) : tr("Off")}</b></div>
    {fail[1] && <p className="text-destructive text-xs">{tr("Last backup failed")} ({when(Date.parse(fail[0] ?? ""))}): {fail[1]}. {tr("Check your connection and tap Back Up Now.")}</p>}
    <ShopButton className="inventory-save" disabled={!signed || !!busy} onClick={now}>{busy === "backup" ? tr("Backing up and verifying...") : tr("Back Up Now")}</ShopButton>
    <ShopButton variant="outline" className="inventory-save" onClick={download}>{tr("Download Full Backup")}</ShopButton>
    <p className="money-heading">{tr("Automatic Backups")}</p>
    <label className="settings-toggle"><span>{tr("Automatic backups")}</span><input type="checkbox" checked={prefs.auto} onChange={(e) => { const p = { ...prefs, auto: e.target.checked }; setP(p); setPrefs(p); }} /></label>
    <label className="settings-inline"><span>{tr("How often")}</span><select value={prefs.hours} onChange={(e) => { const p = { ...prefs, hours: Number(e.target.value) }; setP(p); setPrefs(p); }}><option value={6}>{tr("Every 6 hours")}</option><option value={12}>{tr("Every 12 hours")}</option><option value={24}>{tr("Daily")}</option><option value={168}>{tr("Weekly")}</option></select></label>
    <label className="settings-inline"><span>{tr("Keep last")}</span><select value={prefs.keep} onChange={(e) => { const p = { ...prefs, keep: Number(e.target.value) }; setP(p); setPrefs(p); }}>{[7, 14, 30, 60].map((n) => <option key={n} value={n}>{n} {tr("backups")}</option>)}</select></label>
    <p className="settings-note">{tr("Automatic backups run while the app is open on this device. Older copies are removed only after a new one is verified.")}</p>
    <p className="money-heading">{tr("Backup History")}</p>
    {signed && !rows.length && <p className="settings-note">{tr("No cloud backups yet")}</p>}
    {rows.map((r) => <div className="settings-audit" key={r.id}>
      <b>{when(Date.parse(r.created_at))} • {tr(r.kind)}</b>
      <span>{r.shop_name} • {r.record_count} {tr("records")} • {kb(r.size_bytes)} • {tr("checksum")} {r.checksum.slice(0, 8)}</span>
      <small>{r.verified_at ? `✓ ${tr("Verified")}` : `✗ ${tr("Not verified")}`}{r.restore_tested_at ? ` • ✓ ${tr("Restore tested")} ${when(Date.parse(r.restore_tested_at))}` : ` • ${tr("Restore not tested")}`}</small>
      {r.verified_at && <ShopButton variant="outline" className="settings-mini" disabled={!!busy} onClick={() => pick(r.id)}>{busy === r.id ? "..." : tr("Restore")}</ShopButton>}
    </div>)}
    <input ref={file} hidden type="file" accept=".json,application/json" onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ""; if (!f) return; try { open(await f.text()); } catch (x) { toast.error(x instanceof Error ? x.message : "Not a SHOPBOOK backup file"); } }} />
    <ShopButton variant="outline" className="inventory-save" onClick={() => file.current?.click()}>{tr("Restore from file")}</ShopButton>
    {preview && <div className="import-center">
      <p className="money-heading">{tr("Restore preview")}</p>
      <p className="settings-note">{preview.shop} • {when(preview.at)}</p>
      {preview.rows.map(([k, cur, next]) => <div className="settings-inline" key={k}><span>{tr(k)}</span><b>{cur} → {next}</b></div>)}
      {other ? <p className="text-destructive text-xs">{tr("This backup belongs to another shop and cannot be restored here.")}</p>
        : <p className="settings-note">{tr("Everything on this device will be replaced by the backup. Records made after the backup will be lost. A safety copy of your current data is made first.")}</p>}
      <ShopButton className="inventory-save bg-destructive text-destructive-foreground" disabled={!!other || !!busy} onClick={restore}>{busy === "restore" ? tr("Restoring...") : tr("Yes, restore this backup")}</ShopButton>
      <ShopButton variant="outline" className="inventory-save" disabled={busy === "restore"} onClick={() => setPreview(null)}>{tr("Cancel")}</ShopButton>
    </div>}
  </div>;
}
