import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Download, Upload, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { ShopButton } from "@/components/ui/shop-button";
import { useErp } from "@/components/shopbook/product-search";
import { moneyFor, useAccount } from "@/components/shopbook/selling";
import { Empty, ErpShell } from "@/components/shopbook/erp-shell";
import { Kpi, KpiRow } from "@/components/shopbook/kpi";
import { useLanguage } from "@/hooks/use-language";
import { parseImportFile } from "@/lib/import-center";
import { autoMatch, candidates, loadRecon, RECON_KINDS, reconTemplate, reconTotals, saveRecon, stageRows, type ReconKind, type ReconRow } from "@/lib/reconciliation";

export const Route = createFileRoute("/reconciliation")({ head: () => ({ meta: [
  { title: "Reconciliation — SHOPBOOK ERP" }, { name: "description", content: "Import historical sales, purchases and payments, then match them to real shop records without double counting." },
  { property: "og:title", content: "Reconciliation — SHOPBOOK ERP" }, { property: "og:description", content: "Match historical financial imports to real SHOPBOOK records." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
] }), component: Reconciliation });

const MENUS: Record<string, readonly string[]> = { Unmatched: [], Matched: [], Ignored: [], Import: [] };
function Reconciliation() {
  const acct = useAccount("plus"), { tr } = useLanguage(), s = useErp(), fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRowsState] = useState<ReconRow[]>(() => typeof window === "undefined" ? [] : loadRecon());
  const [menu, setMenu] = useState("Unmatched"), [kind, setKind] = useState<ReconKind>("Sale"), [open, setOpen] = useState<string | null>(null);
  const setRows = (r: ReconRow[]) => { setRowsState(r); saveRecon(r); };
  const taken = useMemo(() => new Set(rows.flatMap((r) => r.matchId ? [r.matchId] : [])), [rows]);
  if (!acct) return <main className="app-screen" />;
  const money = moneyFor(acct.currency || "KSh"), t = reconTotals(rows), day = (n: number) => new Date(n).toLocaleDateString();
  const update = (id: string, patch: Partial<ReconRow>) => setRows(rows.map((r) => r.id === id ? { ...r, ...patch } : r));
  const read = async (f: File) => { try { const { rows: add, errors } = stageRows(await parseImportFile(f), f.name, kind); setRows([...add, ...rows]); toast.success(`${add.length} ${tr("rows staged")}${errors.length ? ` • ${errors.length} ${tr("skipped")}` : ""}`); if (errors[0]) toast.error(errors[0]); setMenu("Unmatched"); } catch (e) { toast.error(e instanceof Error ? e.message : "File could not be read"); } };
  const auto = () => { const x = autoMatch(s, rows); setRows(x.rows); toast.success(`${x.matched} ${tr("matched")}`); };
  const download = () => { const u = URL.createObjectURL(new Blob([reconTemplate()], { type: "text/csv" })); const a = document.createElement("a"); a.href = u; a.download = "shopbook-reconciliation-template.csv"; a.click(); URL.revokeObjectURL(u); };
  const list = rows.filter((r) => r.status === menu.toLowerCase());
  return <ErpShell title="Reconciliation" shop={acct.shopName} menus={MENUS} menu={menu} sub="" onMenu={setMenu} onSub={() => {}} deps={rows}>
    <KpiRow><Kpi label={tr("Imported")} value={t.total} /><Kpi label={tr("Matched")} value={t.matched} /><Kpi label={tr("Unmatched")} value={t.unmatched} tone={t.unmatched ? "warn" : undefined} /><Kpi label={tr("Unmatched value")} value={money(t.unmatchedValue)} /></KpiRow>
    {menu === "Import" ? <div className="import-center">
      <p className="import-note">{tr("Historical sales, purchases, payments, expenses, payroll and returns land here only. Nothing changes stock or money until you match it to a real record.")}</p>
      <label className="inventory-field"><span>{tr("Type when the file has no Type column")}</span><select className="inventory-input" value={kind} onChange={(e) => setKind(e.target.value as ReconKind)}>{RECON_KINDS.map((x) => <option key={x} value={x}>{tr(x)}</option>)}</select></label>
      <input ref={fileRef} hidden type="file" accept=".csv,.xlsx,.xls,.json" onChange={(e) => { const f = e.target.files?.[0]; if (f) void read(f); e.target.value = ""; }} />
      <ShopButton className="inventory-save" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" />{tr("Choose file")}</ShopButton>
      <ShopButton variant="outline" className="inventory-save" onClick={download}><Download className="h-4 w-4" />{tr("Download template")}</ShopButton>
    </div> : <>
      {menu === "Unmatched" && t.unmatched > 0 && <ShopButton className="inventory-save mb-2 w-full" onClick={auto}><Wand2 className="h-4 w-4" />{tr("Auto-match confident rows")}</ShopButton>}
      {!list.length ? <Empty>{rows.length ? tr("Nothing here") : tr("Import a historical file to start")}</Empty> : list.map((r) => {
        const c = open === r.id ? candidates(s, r, taken) : [];
        return <div key={r.id} className="pur-row flex-col !items-stretch">
          <div className="flex items-center justify-between gap-2 whitespace-nowrap text-[10px]" onClick={() => setOpen(open === r.id ? null : r.id)}><span className="truncate">{day(r.at)} • {tr(r.kind)} • {r.ref || r.party || `#${r.row}`}</span><b>{money(r.amount)}</b></div>
          {r.status === "matched" && <div className="flex items-center justify-between text-[9px] text-muted-foreground"><span>↔ {r.matchRef}</span><ShopButton variant="outline" className="h-6 px-2 text-[9px]" onClick={() => update(r.id, { status: "unmatched", matchId: undefined, matchRef: undefined })}>{tr("Unmatch")}</ShopButton></div>}
          {r.status === "ignored" && <ShopButton variant="outline" className="h-6 self-end px-2 text-[9px]" onClick={() => update(r.id, { status: "unmatched" })}>{tr("Restore")}</ShopButton>}
          {r.status === "unmatched" && open === r.id && <div className="mt-1 space-y-1">
            {c.length ? c.map((x) => <div key={x.id} className="flex items-center justify-between gap-2 whitespace-nowrap text-[9px]"><span className="truncate">{x.ref} • {day(x.at)} • {money(Math.abs(x.amount))} • {x.reasons.join(", ")}</span><ShopButton className="h-6 px-2 text-[9px]" onClick={() => { update(r.id, { status: "matched", matchId: x.id, matchRef: x.ref }); setOpen(null); }}>{tr("Match")}</ShopButton></div>) : <p className="text-[9px] text-muted-foreground">{tr("No matching shop record. Record it in the right app, then match it here.")}</p>}
            <ShopButton variant="outline" className="h-6 px-2 text-[9px]" onClick={() => update(r.id, { status: "ignored" })}>{tr("Ignore")}</ShopButton>
          </div>}
        </div>;
      })}
    </>}
  </ErpShell>;
}
