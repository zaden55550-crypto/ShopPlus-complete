import { clean } from "@/lib/format";
import { useMemo, useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { toast } from "sonner";
import { ShopButton } from "@/components/ui/shop-button";
import { useErp } from "@/components/shopbook/product-search";
import { issuesCsv, readSheets, saveBatch, type ImportBatch, type Sheet } from "@/lib/opening-import";
import { applyRT, exportRT, previewRT, RT_FIELDS, RT_TEMPLATE, rtMappingProblems, suggestRT, type RTGroup, type RTMapping } from "@/lib/return-import";

import { download } from "@/lib/download";

/** Historical returns: rows sharing a return number become one return against its original sale or purchase. */
export function ReturnImport({ tr }: { tr: (x: string) => string }) {
  const s = useErp(), ref = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<"upload" | "map" | "preview" | "done">("upload");
  const [sheets, setSheets] = useState<Sheet[]>([]), [maps, setMaps] = useState<Record<string, RTMapping>>({});
  const [groups, setGroups] = useState<RTGroup[]>([]), [busy, setBusy] = useState(false), [result, setResult] = useState<ImportBatch | null>(null);
  const id = (x: Sheet) => `${x.file}::${x.sheet}`;
  const problems = useMemo(() => sheets.flatMap((x) => rtMappingProblems(maps[id(x)] ?? {}).map((p) => `${x.sheet}: ${p}`)), [sheets, maps]);
  const read = async (l: FileList) => { try { const all = await readSheets([...l]); setSheets(all); setMaps(Object.fromEntries(all.map((x) => [id(x), suggestRT(x.columns)]))); setStage("map"); } catch (e) { toast.error(e instanceof Error ? e.message : "Files could not be read"); } };
  const live = groups.filter((g) => g.status === "VALID" && !g.excluded);
  const money = (x: number) => clean(x).toLocaleString(undefined, { maximumFractionDigits: 2 });
  const run = () => {
    if (busy) return; setBusy(true);
    const files = [...new Set(sheets.map((x) => x.file))], errors = groups.flatMap((g) => g.issues);
    try {
      const r = applyRT(groups);
      const b: ImportBatch = { id: `IMP-${Date.now().toString().slice(-6)}`, at: Date.now(), user: "Admin", files, categories: ["Returns"], status: r.rejected ? "Completed with Errors" : "Completed", created: r.sales + r.purchases, updated: 0, skipped: r.skipped, rejected: r.rejected, reconciliation: [`${r.sales} sales returns • ${r.purchases} purchase returns`], errors };
      saveBatch(b); setResult(b); setStage("done"); toast.success(b.reconciliation[0]!);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Import failed; nothing was saved"); } finally { setBusy(false); }
  };
  return <>
    {stage === "upload" && <>
      <p className="import-note">{tr("One row per returned item. Rows with the same return number become one return against the original receipt or invoice; stock, refunds and balances update.")}</p>
      <input ref={ref} hidden multiple type="file" accept=".csv,.xlsx,.xls" onChange={(e) => e.target.files?.length && void read(e.target.files)} />
      <ShopButton className="inventory-save" onClick={() => ref.current?.click()}><Upload className="h-4 w-4" />{tr("Choose files (CSV or XLSX)")}</ShopButton>
      <ShopButton variant="outline" className="inventory-save" onClick={() => download("shopbook-returns-template.csv", RT_TEMPLATE)}><Download className="h-4 w-4" />{tr("Download template")}</ShopButton>
      <ShopButton variant="outline" className="inventory-save" onClick={() => download("shopbook-returns.csv", exportRT(s))}><Download className="h-4 w-4" />{tr("Export returns")}</ShopButton>
    </>}
    {stage === "map" && <>
      {sheets.map((x) => { const m = maps[id(x)] ?? {}; return <div key={id(x)} className="import-history" style={{ padding: 8 }}>
        <p className="text-[10px] font-semibold">{x.file} • {x.sheet} • {x.rows.length} {tr("rows")}</p>
        <div className="import-map">{RT_FIELDS.map((f) => <div className="contents" key={f.key}><span>{tr(f.label)}{f.required ? " *" : ""}</span><select className="inventory-input" value={m[f.key] ?? ""} onChange={(e) => setMaps({ ...maps, [id(x)]: { ...m, [f.key]: e.target.value || undefined } })}><option value="">{tr("Not in file")}</option>{x.columns.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>)}</div>
      </div>; })}
      {problems.map((p) => <p key={p} className="import-note text-destructive">{p}</p>)}
      <ShopButton className="inventory-save" disabled={problems.length > 0} onClick={() => { setGroups(previewRT(s, sheets.map((x) => ({ sheet: x, mapping: maps[id(x)] ?? {} })))); setStage("preview"); }}>{tr("Validate & preview")}</ShopButton>
    </>}
    {stage === "preview" && <>
      <div className="import-summary"><span>{tr("Returns")}<b>{groups.length}</b></span><span>{tr("Valid")}<b>{groups.filter((g) => g.status === "VALID").length}</b></span><span>{tr("Duplicates")}<b>{groups.filter((g) => g.status === "DUPLICATE").length}</b></span><span>{tr("Errors")}<b>{groups.filter((g) => g.status === "INVALID").length}</b></span></div>
      <div className="import-preview">{groups.slice(0, 300).map((g, n) => <div key={g.key + n} className={g.excluded ? "opacity-50" : ""}>
        <span><input type="checkbox" className="mr-1 align-middle" aria-label={tr("Include return")} disabled={g.status !== "VALID"} checked={g.status === "VALID" && !g.excluded} onChange={(e) => setGroups(groups.map((y) => y === g ? { ...y, excluded: !e.target.checked } : y))} />{g.kind === "SALE" ? tr("Sales return") : tr("Purchase return")} {g.ref || "—"} → {g.original || "—"} • {money(g.amount)}</span>
        <b className={`import-${g.status === "VALID" ? "new" : g.status.toLowerCase()}`}>{g.status}</b>
        <small>{g.lines.map((l) => `${l.product} × ${l.qty}`).join(", ") || "—"} • {tr("Refund")}: {g.refund}</small>
        {g.issues.slice(0, 3).map((i, k) => <small key={k}>Row {i.row} • {i.field}: {i.problem} → {i.suggestion}</small>)}
      </div>)}</div>
      {groups.some((g) => g.issues.length) && <ShopButton variant="outline" className="inventory-save" onClick={() => download("shopbook-import-errors.csv", issuesCsv(groups.flatMap((g) => g.issues)))}>{tr("Download error report")}</ShopButton>}
      <ShopButton variant="outline" className="inventory-save" onClick={() => setStage("map")}>{tr("Back to mapping")}</ShopButton>
      <ShopButton className="inventory-save" disabled={!live.length || busy} onClick={run}>{busy ? tr("Processing…") : `${tr("Import")} ${live.length} ${tr("returns")}`}</ShopButton>
    </>}
    {stage === "done" && result && <div className="import-done"><FileSpreadsheet className="h-8 w-8 text-primary" /><b>{tr(result.status)}</b><span>✓ {tr("Created")}: {result.created}</span><span>⚠ {tr("Skipped")}: {result.skipped}</span><span>✕ {tr("Rejected")}: {result.rejected}</span><ShopButton className="inventory-save" onClick={() => { setStage("upload"); setSheets([]); setGroups([]); }}>{tr("New import")}</ShopButton></div>}
  </>;
}
