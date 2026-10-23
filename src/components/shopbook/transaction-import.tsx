import { clean } from "@/lib/format";
import { useMemo, useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { toast } from "sonner";
import { ShopButton } from "@/components/ui/shop-button";
import { useErp } from "@/components/shopbook/product-search";
import { issuesCsv, readSheets, saveBatch, type ImportBatch, type Sheet } from "@/lib/opening-import";
import { applyTX, exportTX, looksLikeTransactions, previewTX, suggestTX, TX_FIELDS, TX_TEMPLATE, txMappingProblems, type TXGroup, type TXMapping, type TXOptions } from "@/lib/transaction-import";

import { download } from "@/lib/download";

/** Historical Sales & Purchases: many line rows → one transaction per receipt/invoice number. */
export function TransactionImport({ tr, onDone }: { tr: (x: string) => string; onDone?: () => void }) {
  const s = useErp(), ref = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<"upload" | "map" | "preview" | "done">("upload");
  const [sheets, setSheets] = useState<Sheet[]>([]), [use, setUse] = useState<Record<string, boolean>>({}), [maps, setMaps] = useState<Record<string, TXMapping>>({});
  const [o, setO] = useState<TXOptions>({ stock: "update", createProducts: false, dateFmt: "auto" });
  const [groups, setGroups] = useState<TXGroup[]>([]), [busy, setBusy] = useState(false), [result, setResult] = useState<ImportBatch | null>(null);
  const id = (x: Sheet) => `${x.file}::${x.sheet}`, chosen = sheets.filter((x) => use[id(x)]);
  const problems = useMemo(() => chosen.flatMap((x) => txMappingProblems(maps[id(x)] ?? {}).map((p) => `${x.file} • ${x.sheet}: ${p}`)), [chosen, maps]);
  const reset = () => { setStage("upload"); setSheets([]); setGroups([]); setResult(null); };
  const read = async (l: FileList) => { try { const all = await readSheets([...l]); setSheets(all); setUse(Object.fromEntries(all.map((x) => [id(x), looksLikeTransactions(x.columns) || all.length === 1]))); setMaps(Object.fromEntries(all.map((x) => [id(x), suggestTX(x.columns)]))); setStage("map"); } catch (e) { toast.error(e instanceof Error ? e.message : "Files could not be read"); } };
  const review = () => { setGroups(previewTX(s, chosen.map((x) => ({ sheet: x, mapping: maps[id(x)] ?? {} })), o)); setStage("preview"); };
  const live = groups.filter((g) => g.status === "VALID" && !g.excluded);
  const run = () => {
    if (busy) return; setBusy(true);
    const files = [...new Set(chosen.map((x) => x.file))], errors = groups.flatMap((g) => g.issues.map((i) => ({ ...i })));
    try {
      const r = applyTX(groups, o);
      const b: ImportBatch = { id: `IMP-${Date.now().toString().slice(-6)}`, at: Date.now(), user: "Admin", files, categories: ["Sales & Purchases"], status: r.rejected ? "Completed with Errors" : "Completed", created: r.sales + r.purchases, updated: 0, skipped: r.skipped, rejected: r.rejected, reconciliation: [`${r.sales} sales • ${live.filter((g) => g.kind === "SALE").reduce((a, g) => a + g.total, 0).toLocaleString()}`, `${r.purchases} purchases • ${live.filter((g) => g.kind === "PURCHASE").reduce((a, g) => a + g.total, 0).toLocaleString()}`, `Credit: ${live.reduce((a, g) => a + g.pay.credit, 0).toLocaleString()}`], errors };
      saveBatch(b); setResult(b); setStage("done"); toast.success(`${r.sales} ${tr("sales")} • ${r.purchases} ${tr("purchases")}`); onDone?.();
    } catch (e) {
      saveBatch({ id: `IMP-${Date.now().toString().slice(-6)}`, at: Date.now(), user: "Admin", files, categories: ["Sales & Purchases"], status: "Failed", created: 0, updated: 0, skipped: 0, rejected: groups.length, reconciliation: [e instanceof Error ? e.message : "Failed"], errors });
      toast.error(e instanceof Error ? e.message : "Import failed; nothing was saved");
    } finally { setBusy(false); }
  };
  const money = (x: number) => clean(x).toLocaleString(undefined, { maximumFractionDigits: 2 });

  return <>
    {stage === "upload" && <>
      <p className="import-note">{tr("One row per item. Rows with the same receipt or invoice number become one sale or purchase, keeping the original date, payments and credit.")}</p>
      <input ref={ref} hidden multiple type="file" accept=".csv,.xlsx,.xls" onChange={(e) => e.target.files?.length && void read(e.target.files)} />
      <ShopButton className="inventory-save" onClick={() => ref.current?.click()}><Upload className="h-4 w-4" />{tr("Choose files (CSV or XLSX)")}</ShopButton>
      <ShopButton variant="outline" className="inventory-save" onClick={() => download("shopbook-sales-purchases-template.csv", TX_TEMPLATE)}><Download className="h-4 w-4" />{tr("Download template")}</ShopButton>
      <ShopButton variant="outline" className="inventory-save" onClick={() => download("shopbook-sales-purchases.csv", exportTX(s))}><Download className="h-4 w-4" />{tr("Export sales & purchases")}</ShopButton>
    </>}
    {stage === "map" && <>
      {sheets.map((x) => { const m = maps[id(x)] ?? {}; return <div key={id(x)} className="import-history" style={{ padding: 8 }}>
        <label className="flex items-center gap-1 text-[10px] font-semibold"><input type="checkbox" checked={!!use[id(x)]} onChange={(e) => setUse({ ...use, [id(x)]: e.target.checked })} />{x.file} • {x.sheet} • {x.rows.length} {tr("rows")}</label>
        {use[id(x)] && <div className="import-map">{TX_FIELDS.map((f) => <div className="contents" key={f.key}><span>{tr(f.label)}{f.required ? " *" : ""}</span><select className="inventory-input" value={m[f.key] ?? ""} onChange={(e) => setMaps({ ...maps, [id(x)]: { ...m, [f.key]: e.target.value || undefined } })}><option value="">{tr("Not in file")}</option>{x.columns.map((c) => <option key={c} value={c}>{c}{x.rows[0]?.[c] !== undefined && String(x.rows[0][c]) ? ` (e.g. ${String(x.rows[0][c]).slice(0, 16)})` : ""}</option>)}</select></div>)}</div>}
      </div>; })}
      <label className="inventory-field"><span>{tr("Date format in file")}</span><select className="inventory-input" value={o.dateFmt} onChange={(e) => setO({ ...o, dateFmt: e.target.value as TXOptions["dateFmt"] })}><option value="auto">{tr("Detect automatically")}</option><option value="DMY">DD/MM/YYYY</option><option value="MDY">MM/DD/YYYY</option><option value="YMD">YYYY-MM-DD</option></select></label>
      <label className="inventory-field"><span>{tr("Stock")}</span><select className="inventory-input" value={o.stock} onChange={(e) => setO({ ...o, stock: e.target.value as TXOptions["stock"] })}><option value="update">{tr("Update stock (purchases add, sales remove)")}</option><option value="record">{tr("Record history only (stock already counted)")}</option></select></label>
      <label className="flex items-center gap-1 text-[10px]"><input type="checkbox" checked={o.createProducts} onChange={(e) => setO({ ...o, createProducts: e.target.checked })} />{tr("Create missing products")}</label>
      {problems.map((p) => <p key={p} className="import-note text-destructive">{p}</p>)}
      <ShopButton className="inventory-save" disabled={!chosen.length || problems.length > 0} onClick={review}>{tr("Validate & preview")}</ShopButton>
    </>}
    {stage === "preview" && <>
      <div className="import-summary"><span>{tr("Transactions")}<b>{groups.length}</b></span><span>{tr("Valid")}<b>{groups.filter((g) => g.status === "VALID").length}</b></span><span>{tr("Duplicates")}<b>{groups.filter((g) => g.status === "DUPLICATE").length}</b></span><span>{tr("Errors")}<b>{groups.filter((g) => g.status === "INVALID").length}</b></span></div>
      <div className="import-preview">{groups.slice(0, 300).map((g) => <div key={g.key + g.rows[0]} className={g.excluded ? "opacity-50" : ""}>
        <span><input type="checkbox" className="mr-1 align-middle" aria-label={tr("Include transaction")} disabled={g.status !== "VALID"} checked={g.status === "VALID" && !g.excluded} onChange={(e) => setGroups(groups.map((y) => y === g ? { ...y, excluded: !e.target.checked } : y))} />{g.kind === "SALE" ? tr("Sale") : tr("Purchase")} {g.ref || "—"} • {g.at ? new Date(g.at).toLocaleDateString("en-GB") : "—"} • {g.lines.length} {tr("items")} • {money(g.total)}</span>
        <b className={`import-${g.status === "VALID" ? "new" : g.status.toLowerCase()}`}>{g.status}</b>
        <small>{g.party || tr("Walk-in")} • {tr("Cash")} {money(g.pay.cash)} • M-Pesa {money(g.pay.mpesa)} • {tr("Bank")} {money(g.pay.bank)} • {tr("Credit")} {money(g.pay.credit)}</small>
        {g.createParty && g.status === "VALID" && <small>{tr("New contact will be created")}</small>}
        {g.createProducts.length > 0 && g.status === "VALID" && <small>{tr("New products")}: {g.createProducts.join(", ")}</small>}
        {g.issues.slice(0, 3).map((i, n) => <small key={n}>Row {i.row} • {i.field}: {i.problem} → {i.suggestion}</small>)}
      </div>)}</div>
      {groups.some((g) => g.issues.length) && <ShopButton variant="outline" className="inventory-save" onClick={() => download("shopbook-import-errors.csv", issuesCsv(groups.flatMap((g) => g.issues)))}>{tr("Download error report")}</ShopButton>}
      <ShopButton variant="outline" className="inventory-save" onClick={() => setStage("map")}>{tr("Back to mapping")}</ShopButton>
      <ShopButton className="inventory-save" disabled={!live.length || busy} onClick={run}>{busy ? tr("Processing…") : `${tr("Import")} ${live.length} ${tr("transactions")}`}</ShopButton>
    </>}
    {stage === "done" && result && <div className="import-done"><FileSpreadsheet className="h-8 w-8 text-primary" /><b>{tr(result.status)}</b><span>✓ {tr("Created")}: {result.created}</span><span>⚠ {tr("Skipped")}: {result.skipped}</span><span>✕ {tr("Rejected")}: {result.rejected}</span>{result.reconciliation.map((x) => <span key={x}>{x}</span>)}{result.errors.length > 0 && <ShopButton variant="outline" className="inventory-save" onClick={() => download("shopbook-import-errors.csv", issuesCsv(result.errors))}>{tr("Download error report")}</ShopButton>}<ShopButton className="inventory-save" onClick={reset}>{tr("New import")}</ShopButton></div>}
  </>;
}
