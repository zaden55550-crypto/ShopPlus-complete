import { useMemo, useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { ShopButton } from "@/components/ui/shop-button";
import { useErp } from "@/components/shopbook/product-search";
import { ImportCenter } from "@/components/shopbook/import-center";
import { TransactionImport } from "@/components/shopbook/transaction-import";
import { ReturnImport } from "@/components/shopbook/return-import";
import { FullImport } from "@/components/shopbook/full-import";
import { applyOB, batches, exportOB, issuesCsv, looksLikeOpening, mappingProblems, OB_FIELDS, OB_TEMPLATE, obLabel, previewOB, readSheets, suggestOB, type DateFmt, type ImportBatch, type OBMapping, type OBRow, type Sheet } from "@/lib/opening-import";

import { download } from "@/lib/download";
type Cat = "Opening Balances" | "Sales & Purchases" | "Returns" | "Products, contacts & other records";
type Stage = "upload" | "map" | "preview" | "done";

/** Universal Import Center: one workspace, multi-file, multi-sheet, staged and atomic. */
export function UniversalImport({ tr }: { tr: (x: string) => string }) {
  const s = useErp(), ref = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"full" | "category">("full");
  const [cat, setCat] = useState<Cat>("Opening Balances");
  const [stage, setStage] = useState<Stage>("upload");
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [use, setUse] = useState<Record<string, boolean>>({});
  const [maps, setMaps] = useState<Record<string, OBMapping>>({});
  const [fmt, setFmt] = useState<DateFmt>("auto");
  const [rows, setRows] = useState<OBRow[]>([]);
  const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportBatch | null>(null);
  const id = (x: Sheet) => `${x.file}::${x.sheet}`;
  const chosen = sheets.filter((x) => use[id(x)]);
  const problems = useMemo(() => chosen.flatMap((x) => mappingProblems(maps[id(x)] ?? {}).map((p) => `${x.file} • ${x.sheet}: ${p}`)), [chosen, maps]);
  const reset = () => { setStage("upload"); setSheets([]); setRows([]); setResult(null); setAck(false); };

  const read = async (list: FileList) => {
    try {
      const all = await readSheets([...list]);
      setSheets(all); setUse(Object.fromEntries(all.map((x) => [id(x), looksLikeOpening(x.columns) || all.length === 1])));
      setMaps(Object.fromEntries(all.map((x) => [id(x), suggestOB(x.columns)]))); setStage("map");
      toast.success(`${all.length} ${tr("worksheets detected")}`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Files could not be read"); }
  };
  const review = () => { setRows(previewOB(s, chosen.map((x) => ({ sheet: x, mapping: maps[id(x)] ?? {} })), fmt)); setAck(false); setStage("preview"); };
  const live = rows.filter((r) => r.status === "VALID" && !r.excluded), conflicts = live.filter((r) => r.conflict);
  const run = () => {
    if (busy) return; setBusy(true);
    try { const b = applyOB(rows, [...new Set(chosen.map((x) => x.file))]); setResult(b); setStage("done"); b.created ? toast.success(`${b.created} ${tr("opening balances saved")}`) : toast.warning(tr("Nothing new was saved")); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Import failed; nothing was saved"); }
    finally { setBusy(false); }
  };

  return <div className="import-center">
    <div className="flex items-center justify-between"><h3>{tr("Universal Import Center")}</h3>{mode === "category" && stage !== "upload" && <ShopButton variant="bare" className="inventory-icon-button" aria-label={tr("Cancel")} onClick={reset}><X className="h-4 w-4" /></ShopButton>}</div>
    <div className="grid grid-cols-2 gap-1" role="tablist">{(["full", "category"] as const).map((m) => <ShopButton key={m} role="tab" aria-selected={mode === m} variant={mode === m ? "primary" : "outline"} className="h-8 text-[11px]" onClick={() => setMode(m)}>{tr(m === "full" ? "Full Business Import" : "Import by Category")}</ShopButton>)}</div>
    {mode === "full" ? <FullImport tr={tr} /> : <>
    {stage === "upload" && <label className="inventory-field"><span>{tr("Data category")}</span><select className="inventory-input" value={cat} onChange={(e) => setCat(e.target.value as Cat)}><option value="Opening Balances">{tr("Opening Balances")}</option><option value="Sales & Purchases">{tr("Sales & Purchases")}</option><option value="Returns">{tr("Returns")}</option><option value="Products, contacts & other records">{tr("Products, contacts & other records")}</option></select></label>}
    {cat === "Sales & Purchases" ? <TransactionImport tr={tr} /> : cat === "Returns" ? <ReturnImport tr={tr} /> : cat !== "Opening Balances" ? <ImportCenter tr={tr} /> : <>
      {stage === "upload" && <>
        <p className="import-note">{tr("Cash, M-Pesa, Bank, customer receivables and supplier payables. Opening balances are kept separate from sales, purchases and expenses.")}</p>
        <input ref={ref} hidden multiple type="file" accept=".csv,.xlsx,.xls" onChange={(e) => e.target.files?.length && void read(e.target.files)} />
        <ShopButton className="inventory-save" onClick={() => ref.current?.click()}><Upload className="h-4 w-4" />{tr("Choose files (CSV or XLSX)")}</ShopButton>
        <ShopButton variant="outline" className="inventory-save" onClick={() => download("shopbook-opening-balances-template.csv", OB_TEMPLATE)}><Download className="h-4 w-4" />{tr("Download template")}</ShopButton>
        <ShopButton variant="outline" className="inventory-save" onClick={() => download("shopbook-opening-balances.csv", exportOB(s))}><Download className="h-4 w-4" />{tr("Export current opening balances")}</ShopButton>
        <History tr={tr} />
      </>}
      {stage === "map" && <>
        {sheets.map((x) => { const m = maps[id(x)] ?? {}; return <div key={id(x)} className="import-history" style={{ padding: 8 }}>
          <label className="flex items-center gap-1 text-[10px] font-semibold"><input type="checkbox" checked={!!use[id(x)]} onChange={(e) => setUse({ ...use, [id(x)]: e.target.checked })} />{x.file} • {x.sheet} • {x.rows.length} {tr("rows")}</label>
          {use[id(x)] && <div className="import-map">{OB_FIELDS.map((f) => <div className="contents" key={f.key}><span>{tr(f.label)}{f.required ? " *" : ""}</span><select className="inventory-input" value={m[f.key] ?? ""} onChange={(e) => setMaps({ ...maps, [id(x)]: { ...m, [f.key]: e.target.value || undefined } })}><option value="">{tr("Not in file")}</option>{x.columns.map((c) => <option key={c} value={c}>{c} {x.rows[0]?.[c] !== undefined && String(x.rows[0][c]) ? `(e.g. ${String(x.rows[0][c]).slice(0, 18)})` : ""}</option>)}</select></div>)}</div>}
        </div>; })}
        <label className="inventory-field"><span>{tr("Date format in file")}</span><select className="inventory-input" value={fmt} onChange={(e) => setFmt(e.target.value as DateFmt)}><option value="auto">{tr("Detect automatically")}</option><option value="DMY">DD/MM/YYYY</option><option value="MDY">MM/DD/YYYY</option><option value="YMD">YYYY-MM-DD</option></select></label>
        {problems.map((p) => <p key={p} className="import-note text-destructive">{p}</p>)}
        <ShopButton className="inventory-save" disabled={!chosen.length || problems.length > 0} onClick={review}>{tr("Validate & preview")}</ShopButton>
      </>}
      {stage === "preview" && <>
        <div className="import-summary"><span>{tr("Total")}<b>{rows.length}</b></span><span>{tr("Valid")}<b>{rows.filter((r) => r.status === "VALID").length}</b></span><span>{tr("Duplicates")}<b>{rows.filter((r) => r.status === "DUPLICATE").length}</b></span><span>{tr("Errors")}<b>{rows.filter((r) => r.status === "INVALID").length}</b></span></div>
        <div className="import-preview">{rows.slice(0, 300).map((r) => <div key={`${r.file}${r.sheet}${r.row}`} className={r.excluded ? "opacity-50" : ""}>
          <span><input type="checkbox" className="mr-1 align-middle" aria-label={tr("Include row")} disabled={r.status !== "VALID"} checked={r.status === "VALID" && !r.excluded} onChange={(e) => setRows(rows.map((y) => y === r ? { ...y, excluded: !e.target.checked } : y))} />#{r.row} • {obLabel(r.kind)} • {r.account || r.phone || "—"} • {r.amount.toLocaleString()}</span>
          <b className={`import-${r.status === "VALID" ? "new" : r.status.toLowerCase()}`}>{r.status}</b>
          {r.createParty && r.status === "VALID" && <small>{tr("New contact will be created")}</small>}
          {r.matchName && <small>{tr("Matches")} “{r.matchName}”</small>}
          {r.conflict && <small>⚠ {r.conflict}</small>}
          {r.issues[0] && <small>{r.issues[0].field}: {r.issues[0].problem} → {r.issues[0].suggestion}</small>}
        </div>)}</div>
        {conflicts.length > 0 && <label className="flex items-start gap-1 text-[10px]"><input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />{tr("I understand")} {conflicts.length} {tr("rows overlap existing records and could double-count. Untick those rows above if their history is already recorded.")}</label>}
        {rows.some((r) => r.issues.length) && <ShopButton variant="outline" className="inventory-save" onClick={() => download("shopbook-import-errors.csv", issuesCsv(rows.flatMap((r) => r.issues)))}>{tr("Download error report")}</ShopButton>}
        <ShopButton variant="outline" className="inventory-save" onClick={() => setStage("map")}>{tr("Back to mapping")}</ShopButton>
        <ShopButton className="inventory-save" disabled={!live.length || busy || (conflicts.length > 0 && !ack)} onClick={run}>{busy ? tr("Processing…") : `${tr("Import")} ${live.length} ${tr("opening balances")}`}</ShopButton>
      </>}
      {stage === "done" && result && <div className="import-done"><FileSpreadsheet className="h-8 w-8 text-primary" /><b>{tr(result.status)}</b><span>✓ {tr("Created")}: {result.created}</span><span>⚠ {tr("Skipped")}: {result.skipped}</span><span>✕ {tr("Rejected")}: {result.rejected}</span>{result.reconciliation.map((x) => <span key={x}>{x}</span>)}{result.errors.length > 0 && <ShopButton variant="outline" className="inventory-save" onClick={() => download("shopbook-import-errors.csv", issuesCsv(result.errors))}>{tr("Download error report")}</ShopButton>}<ShopButton className="inventory-save" onClick={reset}>{tr("New import")}</ShopButton></div>}
    </>}
    </>}
  </div>;
}

function History({ tr }: { tr: (x: string) => string }) {
  const list = batches();
  return <div className="mt-3"><p className="money-heading">{tr("Import History")}</p>{list.length ? list.map((b) => <details className="import-history" key={b.id}><summary>{b.id} — {b.categories.join(", ")} — {tr(b.status)}</summary><p>{new Date(b.at).toLocaleString()} • {b.user} • {b.files.join(", ")}</p><p>✓ {b.created} • ⚠ {b.skipped} • ✕ {b.rejected}</p>{b.reconciliation.map((x) => <p key={x}>{x}</p>)}{b.errors.length > 0 && <ShopButton variant="outline" className="h-6 px-2 text-[9px]" onClick={() => download(`${b.id}-errors.csv`, issuesCsv(b.errors))}>{tr("Download error report")}</ShopButton>}</details>) : <p className="import-note">{tr("No imports yet")}</p>}</div>;
}
