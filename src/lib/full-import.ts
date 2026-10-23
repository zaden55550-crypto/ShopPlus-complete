// Full Business Import: one workbook (or many files) → detect each sheet's category, map, validate,
// preview and import in dependency order, reusing the existing category importers so every rule
// (importKeys, duplicate checks, opening-balance separation) stays in one place.
// The whole run is all-or-nothing: if any stage fails, shop data and history are restored.
import { load } from "@/lib/erp";
import { applyImport, detectType, FIELDS, previewRows, suggestMapping, type ImportType } from "@/lib/import-center";
import { applyOB, looksLikeOpening, OB_FIELDS, previewOB, saveBatch, suggestOB, type DateFmt, type ImportBatch, type OBIssue, type OBMapping, type Sheet } from "@/lib/opening-import";
import { applyTX, looksLikeTransactions, previewTX, suggestTX, TX_FIELDS, type TXMapping, type TXOptions } from "@/lib/transaction-import";
import { applyHistory, HISTORY_CATS, HISTORY_FIELDS, suggestHistory, type HistoryCat } from "@/lib/history-import";
import { applyRT, previewRT, RT_FIELDS, suggestRT, type RTMapping } from "@/lib/return-import";

type RecordCat = Exclude<ImportType, "Product Images">;
export type FullCat = RecordCat | "Opening Balances" | "Sales & Purchases" | "Returns" | HistoryCat | "Skip";
/** Import order: masters first so later sheets can link to them. */
export const FULL_ORDER: Exclude<FullCat, "Skip">[] = ["Categories", "Brands", "Products", "Customers", "Suppliers", "Other Contacts", "Employees", "Opening Stock", "Product Prices", "Opening Balances", "Sales & Purchases", "Returns", "Expenses", ...HISTORY_CATS];
export type Field = { key: string; label: string; required?: boolean };
export const fieldsFor = (c: FullCat): readonly Field[] => c === "Skip" ? [] : c === "Opening Balances" ? OB_FIELDS : c === "Sales & Purchases" ? TX_FIELDS : c === "Returns" ? RT_FIELDS : (HISTORY_CATS as FullCat[]).includes(c) ? HISTORY_FIELDS[c as HistoryCat] : FIELDS[c as RecordCat];
/** field key → column name */
export type FieldMap = Record<string, string | undefined>;
export type Plan = { id: string; sheet: Sheet; cat: FullCat; map: FieldMap; reason: string };
export type StageResult = { cat: Exclude<FullCat, "Skip">; sheets: string[]; total: number; created: number; updated: number; skipped: number; rejected: number; issues: OBIssue[]; error?: string };
export type FullOptions = { dateFmt: DateFmt; stock: TXOptions["stock"]; existing?: "skip" | "update" };

const NAME_HINTS: [RegExp, FullCat][] = [[/cash ?-?up|till count/, "Cash-ups"], [/customer ?(payment|repay|receipt)|debt ?pay/, "Customer Payments"], [/supplier ?pay/, "Supplier Payments"], [/payroll|salar|wage/, "Payroll History"], [/float|cash ?book|deposit|withdraw/, "Float Movements"], [/transfer/, "Stock Transfers"], [/adjust|stock ?take|stock ?count/, "Stock Adjustments"], [/opening|balance/, "Opening Balances"], [/return|refund|credit ?note/, "Returns"], [/sale|purchase|invoice|receipt|transaction/, "Sales & Purchases"], [/product|item|inventory|stock ?list/, "Products"], [/customer|client|debtor/, "Customers"], [/supplier|vendor|creditor/, "Suppliers"], [/employee|staff|payroll/, "Employees"], [/expense/, "Expenses"], [/categor/, "Categories"], [/brand/, "Brands"], [/price/, "Product Prices"]];

export function suggestFor(cat: FullCat, cols: string[]): FieldMap {
  if (cat === "Skip") return {};
  if (cat === "Opening Balances") return suggestOB(cols);
  if (cat === "Sales & Purchases") return suggestTX(cols);
  if (cat === "Returns") return suggestRT(cols);
  if ((HISTORY_CATS as FullCat[]).includes(cat)) return suggestHistory(cat as HistoryCat, cols);
  const m = suggestMapping(cols, cat as RecordCat), out: FieldMap = {};
  for (const [col, f] of Object.entries(m)) if (f) out[f] = col;
  return out;
}
export const missing = (p: Plan) => fieldsFor(p.cat).filter((f) => f.required && !p.map[f.key]).map((f) => f.label);

/** Detects a sheet's category from its columns first, then the sheet/file name. */
export function detect(sheet: Sheet): { cat: FullCat; reason: string } {
  const cols = sheet.columns, name = `${sheet.sheet} ${sheet.file}`.toLowerCase();
  const rt = suggestRT(cols), hinted = NAME_HINTS.find(([r]) => r.test(name))?.[1];
  const ok = (c: FullCat) => missing({ id: "", sheet, cat: c, map: suggestFor(c, cols), reason: "" }).length === 0;
  const exact = FULL_ORDER.find((c) => c.replace(/[\\/?*[\]:&]/g, "-").toLowerCase() === sheet.sheet.trim().toLowerCase());
  if (exact && ok(exact)) return { cat: exact, reason: `Template sheet “${sheet.sheet}”` };
  if (hinted && ok(hinted)) return { cat: hinted, reason: `Sheet name “${sheet.sheet}”` };
  if (rt.ref && rt.original && cols.some((c) => /return/i.test(c)) && ok("Returns")) return { cat: "Returns", reason: "Return columns" };
  if (looksLikeOpening(cols)) return { cat: "Opening Balances", reason: "Opening balance columns" };
  if (looksLikeTransactions(cols) && ok("Sales & Purchases")) return { cat: "Sales & Purchases", reason: "Receipt, product and quantity columns" };
  const t = detectType(cols);
  if (t) return { cat: t, reason: "Matching column names" };
  return { cat: hinted ?? "Skip", reason: hinted ? `Sheet name “${sheet.sheet}” (needs mapping)` : "Not recognised" };
}
export const planSheets = (sheets: Sheet[]): Plan[] => sheets.map((sheet) => { const d = detect(sheet); return { id: `${sheet.file}::${sheet.sheet}`, sheet, cat: d.cat, map: suggestFor(d.cat, sheet.columns), reason: d.reason }; });

const KEYS = ["shopbook.erp", "shopbook.importBatches", "shopbook.importHistory"];
const snapshot = () => KEYS.map((key) => [key, localStorage.getItem(key)] as const);
const restore = (snap: ReturnType<typeof snapshot>) => { for (const [key, v] of snap) v === null ? localStorage.removeItem(key) : localStorage.setItem(key, v); window.dispatchEvent(new Event("shopbook-erp")); window.dispatchEvent(new Event("shopbook-prefs")); };

function runStage(cat: Exclude<FullCat, "Skip">, plans: Plan[], o: FullOptions): StageResult {
  const sheets = plans.map((p) => `${p.sheet.file} • ${p.sheet.sheet}`), base: StageResult = { cat, sheets, total: 0, created: 0, updated: 0, skipped: 0, rejected: 0, issues: [] };
  if (cat === "Opening Balances") {
    const rows = previewOB(load(), plans.map((p) => ({ sheet: p.sheet, mapping: p.map as OBMapping })), o.dateFmt);
    const b = applyOB(rows, [...new Set(plans.map((p) => p.sheet.file))]);
    return { ...base, total: rows.length, created: b.created, skipped: b.skipped, rejected: b.rejected, issues: rows.flatMap((r) => r.issues) };
  }
  if (cat === "Sales & Purchases") {
    const opt: TXOptions = { stock: o.stock, createProducts: true, dateFmt: o.dateFmt };
    const groups = previewTX(load(), plans.map((p) => ({ sheet: p.sheet, mapping: p.map as TXMapping })), opt);
    const r = applyTX(groups, opt);
    return { ...base, total: groups.length, created: r.sales + r.purchases, skipped: r.skipped, rejected: r.rejected, issues: groups.flatMap((g) => g.issues) };
  }
  if (cat === "Returns") {
    const groups = previewRT(load(), plans.map((p) => ({ sheet: p.sheet, mapping: p.map as RTMapping })));
    const r = applyRT(groups);
    return { ...base, total: groups.length, created: r.sales + r.purchases, skipped: r.skipped, rejected: r.rejected, issues: groups.flatMap((g) => g.issues) };
  }
  if ((HISTORY_CATS as FullCat[]).includes(cat)) {
    const h = applyHistory(cat as HistoryCat, plans.map((p) => ({ sheet: p.sheet, map: p.map })), { dateFmt: o.dateFmt, stock: o.stock });
    return { ...base, ...h };
  }
  const rc = cat as RecordCat;
  for (const p of plans) {
    const colMap: Record<string, string> = {}; for (const [f, c] of Object.entries(p.map)) if (c) colMap[c] = f;
    const rows = previewRows(load(), p.sheet.rows, rc, colMap, new Set(Object.keys(p.map).filter((f) => p.map[f])));
    // Opening Stock and Product Prices exist to change existing products, so they always update; others follow the chosen mode.
    const h = applyImport(rc, p.sheet.file, rows, colMap, cat === "Opening Stock" || cat === "Product Prices" ? "updateOnly" : o.existing ?? "skip");
    base.total += h.total; base.created += h.imported; base.updated += h.updated; base.skipped += h.skipped; base.rejected += h.failed;
    base.issues.push(...h.errors.map((e) => ({ ...e, file: p.sheet.file, sheet: p.sheet.sheet })));
  }
  return base;
}

function runAll(plans: Plan[], o: FullOptions, stopOnError: boolean): StageResult[] {
  const out: StageResult[] = [];
  for (const cat of FULL_ORDER) {
    const group = plans.filter((p) => p.cat === cat); if (!group.length) continue;
    try { out.push(runStage(cat, group, o)); }
    catch (e) { const msg = e instanceof Error ? e.message : String(e); if (stopOnError) throw Object.assign(new Error(`${cat}: ${msg}`), { results: out }); out.push({ cat, sheets: group.map((p) => p.sheet.sheet), total: 0, created: 0, updated: 0, skipped: 0, rejected: 0, issues: [], error: msg }); }
  }
  return out;
}
const usable = (plans: Plan[]) => plans.filter((p) => p.cat !== "Skip" && !missing(p).length);

/** Validates by really running every stage in order on the current shop data, then restoring it.
 * Later sheets see records created by earlier ones, so results match the real import exactly. */
export function previewFull(plans: Plan[], o: FullOptions): StageResult[] {
  const snap = snapshot();
  try { return runAll(usable(plans), o, false); } finally { restore(snap); }
}

/** All-or-nothing import. Records one combined batch in Import History. */
export function importFull(plans: Plan[], o: FullOptions): { results: StageResult[]; batch: ImportBatch } {
  const snap = snapshot(), go = usable(plans);
  let results: StageResult[];
  try { results = runAll(go, o, true); }
  catch (e) { restore(snap); throw e; }
  // Replace the per-stage history entries with one combined Full Business Import entry.
  for (const [key, v] of snap) if (key !== "shopbook.erp") v === null ? localStorage.removeItem(key) : localStorage.setItem(key, v);
  const sum = (f: "created" | "updated" | "skipped" | "rejected") => results.reduce((a, r) => a + r[f], 0);
  const batch: ImportBatch = { id: `IMP-${Date.now().toString().slice(-6)}`, at: Date.now(), user: "Admin", files: [...new Set(go.map((p) => p.sheet.file))], categories: ["Full Business Import", ...results.map((r) => r.cat)], status: sum("rejected") ? "Completed with Errors" : "Completed", created: sum("created"), updated: sum("updated"), skipped: sum("skipped"), rejected: sum("rejected"), reconciliation: results.map((r) => `${r.cat}: ${r.created} new, ${r.updated} updated, ${r.skipped} skipped, ${r.rejected} rejected`), errors: results.flatMap((r) => r.issues) } as ImportBatch;
  saveBatch(batch);
  return { results, batch };
}

/** Official template built from the importer's own field list, so every header is recognised on upload.
 * Pass one category for a single-category file. Examples sit on the Instructions sheet only, so they are never imported. */
export async function fullTemplateBytes(only?: Exclude<FullCat, "Skip">): Promise<ArrayBuffer> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new(), cats = only ? [only] : FULL_ORDER;
  const head = (f: Field) => { const a = (f as Field & { aliases?: string[] }).aliases?.find((x) => x.includes(" ")); return a ? a.replace(/\b\w/g, (m) => m.toUpperCase()) : f.label; };
  const help: (string | number)[][] = [["SHOPBOOK " + (only ?? "Full Business") + " Import template"], ["Fill one row per record. One field per column. Leave sheets you don't need empty — they are skipped."], ["Dates: YYYY-MM-DD. Amounts: numbers only. Payment method: Cash, M-Pesa or Bank. Sales/Purchases/Returns: one item per row; rows sharing a receipt number become one transaction."], ["Rows on this Instructions sheet are examples and are never imported."], only ? [] : ["Import order is automatic: " + FULL_ORDER.join(" → ")], []];
  for (const c of cats) { const fs = fieldsFor(c); help.push([c, "Required: " + fs.filter((f) => f.required).map(head).join(", "), "Optional: " + fs.filter((f) => !f.required).map(head).join(", ")]); }
  if (cats.includes("Products")) help.push([], ["Products example"], ["Product Name", "Buying Price", "Selling Price", "Quantity", "Minimum Stock", "Category", "Brand", "Unit"], ["Example Product A", 100, 150, 20, 5, "Beverages", "Example Brand", "Piece"]);
  const ins = XLSX.utils.aoa_to_sheet(help); ins["!cols"] = [{ wch: 22 }, { wch: 60 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ins, "Instructions");
  const allHeads: string[][] = [];
  for (const c of cats) {
    const heads = fieldsFor(c).map(head), ws = XLSX.utils.aoa_to_sheet([heads]);
    ws["!cols"] = heads.map((h) => ({ wch: Math.max(12, h.length + 2) }));
    XLSX.utils.book_append_sheet(wb, ws, c.replace(/[\\/?*[\]:&]/g, "-").slice(0, 31));
    allHeads.push(heads);
  }
  return polishTemplate(XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer, allHeads);
}

const colName = (i: number) => { let s = ""; for (i++; i; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + ((i - 1) % 26)) + s; return s; };
const TEXT_COL = /phone|barcode|sku|code|\bid\b|receipt|reference|ref\b|no\b|number|invoice|bill/i;
const LISTS: [RegExp, string][] = [[/payment method|refund method|^method$/i, "Cash,M-Pesa,Bank,Credit"], [/^(transaction )?type$|transaction type/i, "Sale,Purchase"], [/return type/i, "Sale Return,Purchase Return"], [/account type/i, "Cash,M-Pesa,Bank,Customer,Supplier"]];
/** Adds what SheetJS can't write: frozen header row, text-format ID/phone/barcode columns (keeps leading zeros) and dropdown lists. */
async function polishTemplate(buf: ArrayBuffer, heads: string[][]): Promise<ArrayBuffer> {
  const { default: JSZip } = await import("jszip");
  const z = await JSZip.loadAsync(buf);
  let styles = await z.file("xl/styles.xml")!.async("string");
  const n = Number(styles.match(/<cellXfs count="(\d+)"/)?.[1] ?? 1);
  styles = styles.replace(/<cellXfs count="\d+">([\s\S]*?)<\/cellXfs>/, (_, x) => `<cellXfs count="${n + 1}">${x}<xf numFmtId="49" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs>`);
  z.file("xl/styles.xml", styles);
  for (let s = 0; s < heads.length; s++) {
    const path = `xl/worksheets/sheet${s + 2}.xml`, f = z.file(path); if (!f) continue;
    const h = heads[s]!; let x = await f.async("string");
    x = x.replace(/<sheetView workbookViewId="0"\/>/, `<sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView>`);
    x = x.replace(/<col min="(\d+)" max="\d+" ([^/]*)\/>/g, (m, i, rest) => TEXT_COL.test(h[Number(i) - 1] ?? "") ? `<col min="${i}" max="${i}" ${rest} style="${n}"/>` : m);
    const dv = h.flatMap((name, i) => { const l = LISTS.find(([r]) => r.test(name)); return l ? [`<dataValidation type="list" allowBlank="1" showErrorMessage="0" sqref="${colName(i)}2:${colName(i)}5000"><formula1>"${l[1]}"</formula1></dataValidation>`] : []; });
    if (dv.length) x = x.replace("</sheetData>", `</sheetData><dataValidations count="${dv.length}">${dv.join("")}</dataValidations>`);
    z.file(path, x);
  }
  return z.generateAsync({ type: "arraybuffer" });
}
export const fullTemplate = async (only?: Exclude<FullCat, "Skip">) => new Blob([await fullTemplateBytes(only)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
export const templateName = (only?: string) => `SHOPBOOK_${(only ?? "Complete Business").replace(/[^A-Za-z0-9]+/g, "_")}_Import_Template.xlsx`;

/** Turns cells copied from Excel/Google Sheets (tab separated) into a sheet; first non-empty row is the header. */
export function pastedSheet(text: string): Sheet {
  const lines = text.replace(/\r/g, "").split("\n").filter((l) => l.trim());
  if (lines.length < 2) throw new Error("Paste a header row and at least one data row");
  const sep = lines[0]!.includes("\t") ? "\t" : ",";
  const columns = lines[0]!.split(sep).map((c, i) => c.trim() || `Column ${i + 1}`);
  const rows = lines.slice(1).map((l) => { const v = l.split(sep); return Object.fromEntries(columns.map((c, i) => [c, (v[i] ?? "").trim()])); });
  return { file: "Pasted data", sheet: "Pasted", columns, rows } as Sheet;
}
