// Universal Import Center — Opening Balances (phase 1).
// Opening balances are posted as OPENING rows in the shared payments ledger, never as
// sales, purchases, expenses or deposits, so income/expense history stays untouched.
// Every row carries an importKey, so re-importing the same file never posts twice.
import * as XLSX from "xlsx";
import { commit, ErpError, uid, type ErpState, type Method } from "@/lib/erp";

export type RawRow = Record<string, unknown>;
export type Sheet = { file: string; sheet: string; columns: string[]; rows: RawRow[] };
export type OBKind = "cash" | "mpesa" | "bank" | "receivable" | "payable";
export const OB_FIELDS = [
  { key: "type", label: "Account type", required: true, aliases: ["type", "account type", "category", "kind", "balance type"] },
  { key: "account", label: "Account / customer / supplier", required: false, aliases: ["account", "name", "account name", "customer", "supplier", "party", "entity", "contact"] },
  { key: "phone", label: "Phone", required: false, aliases: ["phone", "phone number", "mobile", "tel"] },
  { key: "amount", label: "Opening amount", required: true, aliases: ["amount", "opening", "opening balance", "balance", "opening amount", "value"] },
  { key: "currency", label: "Currency", required: false, aliases: ["currency", "ccy"] },
  { key: "date", label: "Effective date", required: false, aliases: ["date", "effective date", "as at", "as of", "opening date"] },
  { key: "sourceId", label: "Source ID", required: false, aliases: ["id", "source id", "ref", "reference", "code", "account id"] },
] as const;
export type OBField = (typeof OB_FIELDS)[number]["key"];
export type OBMapping = Partial<Record<OBField, string>>;
export type OBIssue = { file: string; sheet: string; row: number; field: string; problem: string; suggestion: string };
export type OBRow = {
  file: string; sheet: string; row: number; kind?: OBKind; account: string; phone: string; amount: number; currency: string; at: number; sourceId: string;
  key: string; status: "VALID" | "DUPLICATE" | "INVALID"; issues: OBIssue[]; matchId?: string; matchName?: string; createParty?: boolean; conflict?: string; excluded?: boolean;
};
export type ImportBatch = { id: string; at: number; user: string; files: string[]; categories: string[]; status: "Completed" | "Completed with Errors" | "Failed"; created: number; updated: number; skipped: number; rejected: number; reconciliation: string[]; errors: OBIssue[] };

const n = (x: unknown) => String(x ?? "").trim();
const k = (x: unknown) => n(x).toLowerCase().replace(/[^a-z0-9]/g, "");
const HISTORY = "shopbook.importBatches";
export const batches = (): ImportBatch[] => { try { const x = JSON.parse(localStorage.getItem(HISTORY) || "[]"); return Array.isArray(x) ? x : []; } catch { return []; } };
export const saveBatch = (b: ImportBatch) => { localStorage.setItem(HISTORY, JSON.stringify([b, ...batches()].slice(0, 50))); window.dispatchEvent(new Event("shopbook-prefs")); };

/** Reads every worksheet of every file (CSV/XLSX), finding the heading row in each. */
export async function readSheets(files: File[]): Promise<Sheet[]> {
  const out: Sheet[] = [];
  for (const f of files) {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext ?? "")) throw new Error(`${f.name}: choose CSV or XLSX files`);
    const wb = XLSX.read(await f.arrayBuffer(), { type: "array", cellDates: true });
    for (const name of wb.SheetNames) {
      const ws = wb.Sheets[name]; if (!ws) continue;
      const grid = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: "", raw: false, blankrows: false });
      let hi = 0, best = -1;
      grid.slice(0, 15).forEach((r, i) => { const c = r.filter((x) => n(x) && Number.isNaN(Number(n(x).replace(/,/g, "")))).length; if (c > best) { best = c; hi = i; } });
      const heads = (grid[hi] ?? []).map((h, i) => n(h) || `Column ${i + 1}`);
      const rows = grid.slice(hi + 1).filter((r) => r.some((c) => n(c))).map((r) => Object.fromEntries(heads.map((h, i) => [h, r[i] ?? ""])))
        .filter((o) => !/^(total|grand total|subtotal)$/i.test(n(Object.values(o)[0])));
      if (rows.length) out.push({ file: f.name, sheet: name, columns: heads, rows });
    }
  }
  if (!out.length) throw new Error("No table with headings was found in these files");
  return out;
}

export function suggestOB(columns: string[]): OBMapping {
  const m: OBMapping = {}; const used = new Set<string>();
  for (const f of OB_FIELDS) { const c = columns.find((c) => !used.has(c) && (f.aliases as readonly string[]).some((a) => k(a) === k(c))) ?? columns.find((c) => !used.has(c) && (f.aliases as readonly string[]).some((a) => k(c).includes(k(a)) && k(a).length > 3)); if (c) { m[f.key] = c; used.add(c); } }
  return m;
}
export const looksLikeOpening = (cols: string[]) => { const m = suggestOB(cols); return !!m.amount && (!!m.type || cols.some((c) => /opening/i.test(c))); };
export const mappingProblems = (m: OBMapping) => {
  const p: string[] = []; OB_FIELDS.filter((f) => f.required && !m[f.key]).forEach((f) => p.push(`${f.label} is not mapped`));
  const vals = Object.values(m).filter(Boolean); vals.forEach((v, i) => { if (vals.indexOf(v) !== i) p.push(`Column “${v}” is mapped twice`); });
  return [...new Set(p)];
};

export function kindOf(x: unknown): OBKind | undefined {
  const v = k(x);
  if (!v) return undefined;
  if (/cash|drawer|till/.test(v)) return "cash";
  if (/mpesa|mobilemoney|mobile/.test(v)) return "mpesa";
  if (/bank/.test(v)) return "bank";
  if (/receivable|customer|debtor|owedtous|customerdebt/.test(v)) return "receivable";
  if (/payable|supplier|creditor|weowe|supplierdebt/.test(v)) return "payable";
  return undefined;
}
export type DateFmt = "auto" | "DMY" | "MDY" | "YMD";
export function parseDate(x: unknown, fmt: DateFmt): number | null {
  if (x instanceof Date) return x.getTime();
  const v = n(x); if (!v) return null;
  const p = v.split(/[\/\-. ]/).map(Number);
  if (p.length >= 3 && p.slice(0, 3).every(Number.isFinite)) {
    let [a, b, c] = p as [number, number, number]; let d: number, m: number, y: number;
    const f = a > 31 ? "YMD" : fmt === "auto" ? (b > 12 ? "MDY" : "DMY") : fmt;
    if (f === "YMD") [y, m, d] = [a, b, c]; else if (f === "MDY") [m, d, y] = [a, b, c]; else [d, m, y] = [a, b, c];
    if (y < 100) y += 2000;
    const t = new Date(y, m - 1, d).getTime();
    return m >= 1 && m <= 12 && d >= 1 && d <= 31 && Number.isFinite(t) ? t : null;
  }
  const t = Date.parse(v); return Number.isFinite(t) ? t : null;
}
const amountOf = (x: unknown) => { const v = n(x).replace(/ksh|kes|,|\s/gi, ""); const neg = /^\(.*\)$/.test(v); const num = Number(v.replace(/[()]/g, "")); return v && Number.isFinite(num) ? (neg ? -num : num) : NaN; };
const party = (s: ErpState, kind: OBKind, name: string, phone: string) => {
  const list = kind === "receivable" ? s.customers : s.suppliers;
  return (phone && list.find((x) => k(x.phone) === k(phone))) || (name && list.find((x) => k(x.name) === k(name))) || undefined;
};
const LABEL: Record<OBKind, string> = { cash: "Cash at hand", mpesa: "M-Pesa", bank: "Bank", receivable: "Customer receivable", payable: "Supplier payable" };
export const obLabel = (x?: OBKind) => (x ? LABEL[x] : "—");

export function previewOB(s: ErpState, sheets: { sheet: Sheet; mapping: OBMapping }[], fmt: DateFmt, currency = "KES"): OBRow[] {
  const out: OBRow[] = []; const seen = new Set<string>();
  const posted = new Set(s.payments.filter((p) => p.importKey).map((p) => p.importKey));
  for (const { sheet, mapping } of sheets) sheet.rows.forEach((r, i) => {
    const g = (f: OBField) => (mapping[f] ? r[mapping[f]!] : "");
    const row = i + 2, issues: OBIssue[] = [], iss = (field: string, problem: string, suggestion: string) => issues.push({ file: sheet.file, sheet: sheet.sheet, row, field, problem, suggestion });
    const kind = kindOf(g("type")) ?? kindOf(mapping.type ? "" : sheet.sheet);
    const account = n(g("account")), phone = n(g("phone")), amount = amountOf(g("amount")), cur = n(g("currency")).toUpperCase() || currency;
    const dateRaw = g("date"), at = n(dateRaw) || dateRaw instanceof Date ? parseDate(dateRaw, fmt) : Date.now();
    if (!kind) iss("Account type", `“${n(g("type")) || "blank"}” is not a supported account type`, "Use Cash, M-Pesa, Bank, Customer receivable or Supplier payable");
    if (!Number.isFinite(amount)) iss("Opening amount", `“${n(g("amount")) || "blank"}” is not a number`, "Enter a number such as 15000");
    else if (amount === 0) iss("Opening amount", "Amount is zero", "Remove the row or enter the real balance");
    else if (amount < 0 && (kind === "receivable" || kind === "payable")) iss("Opening amount", "Negative customer/supplier balance", "Enter what is owed as a positive number");
    if (at === null) iss("Effective date", `“${n(dateRaw)}” is not a valid date`, "Choose the correct date format or use DD/MM/YYYY");
    if (cur && cur !== currency && cur !== "KSH") iss("Currency", `${cur} differs from shop currency ${currency}`, "Convert to the shop currency before importing");
    if ((kind === "receivable" || kind === "payable") && !account && !phone) iss("Account / customer / supplier", "No customer or supplier named", "Add the name or phone");
    const sourceId = n(g("sourceId"));
    const key = /^OB:/i.test(sourceId) ? sourceId : `OB:${kind ?? "?"}:${sourceId ? `id:${k(sourceId)}` : `${k(account) || k(phone) || kind}`}`;
    const x: OBRow = { file: sheet.file, sheet: sheet.sheet, row, account, phone, amount: Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0, currency: cur, at: at ?? 0, sourceId, key, status: "VALID", issues, ...(kind ? { kind } : {}) };
    if (kind === "receivable" || kind === "payable") { const p = party(s, kind, account, phone); if (p) { x.matchId = p.id; x.matchName = p.name ?? ""; } else x.createParty = true; }
    if (issues.length) x.status = "INVALID";
    else if (posted.has(key)) { x.status = "DUPLICATE"; iss("Source ID", "Already imported in an earlier batch", "Nothing to do — it will be skipped"); }
    else if (seen.has(key)) { x.status = "DUPLICATE"; iss("Source ID", "Repeated in the uploaded files", "Keep one row per account"); }
    if (x.status === "VALID") { seen.add(key); const cf = conflictFor(s, x); if (cf) x.conflict = cf; }
    out.push(x);
  });
  return out;
}
/** Existing history that would make an opening balance double-count. */
function conflictFor(s: ErpState, x: OBRow): string | undefined {
  if (x.kind === "cash" || x.kind === "mpesa" || x.kind === "bank") {
    const m = x.kind as Method; const h = s.payments.filter((p) => p.method === m && p.kind !== "OPENING");
    const op = s.payments.find((p) => p.method === m && p.kind === "OPENING" && !p.customerId && !p.supplierId);
    if (op) return `${LABEL[x.kind]} already has an opening balance (${op.amount})`;
    if (h.length) return `${LABEL[x.kind]} already has ${h.length} recorded movements; the opening balance is added on top of them`;
  }
  if (x.kind === "receivable" && x.matchId) { const c = s.customers.find((y) => y.id === x.matchId); if (c && c.balance > 0) return `${c.name} already owes ${c.balance} from recorded sales`; }
  if (x.kind === "payable" && x.matchId) { const c = s.suppliers.find((y) => y.id === x.matchId); if (c && c.balance > 0) return `${c.name} is already owed ${c.balance} from recorded purchases`; }
  return undefined;
}

/** One atomic commit: all valid rows post, or nothing does. */
export function applyOB(rows: OBRow[], files: string[], user = "Admin"): ImportBatch {
  const go = rows.filter((r) => r.status === "VALID" && !r.excluded);
  const rejected = rows.filter((r) => r.status === "INVALID");
  let created = 0;
  const recon: string[] = [];
  try {
    commit((s, c) => {
      const posted = new Set(s.payments.filter((p) => p.importKey).map((p) => p.importKey));
      for (const r of go) {
        if (posted.has(r.key)) continue;
        if (!r.kind) throw new ErpError(`Row ${r.row}: missing account type`);
        const ref = c.nextRef("OB"), base = { id: uid(), ref, at: r.at, amount: r.amount, kind: "OPENING" as const, importKey: r.key, user: c.user };
        if (r.kind === "receivable" || r.kind === "payable") {
          const list = r.kind === "receivable" ? s.customers : s.suppliers;
          let p = (r.matchId && list.find((x) => x.id === r.matchId)) || party(s, r.kind, r.account, r.phone);
          if (!p) { p = { id: uid(), name: r.account || r.phone, balance: 0, createdAt: Date.now(), ...(r.phone ? { phone: r.phone } : {}) }; list.push(p as never); c.audit(r.kind === "receivable" ? "CUSTOMER CREATED" : "SUPPLIER CREATED", `${p.name} (opening balance import)`); }
          p.balance = Math.round((p.balance + r.amount) * 100) / 100;
          s.payments.unshift({ ...base, method: "credit", source: p.name, ...(r.kind === "receivable" ? { customerId: p.id } : { supplierId: p.id }) });
        } else s.payments.unshift({ ...base, method: r.kind, source: r.account || LABEL[r.kind] });
        posted.add(r.key); created++;
      }
      const sum = (kd: OBKind) => go.filter((r) => r.kind === kd).reduce((a, r) => a + r.amount, 0);
      (["cash", "mpesa", "bank", "receivable", "payable"] as OBKind[]).forEach((kd) => { const v = sum(kd); if (v) recon.push(`${LABEL[kd]}: ${Math.round(v * 100) / 100}`); });
      c.audit("OPENING BALANCES IMPORTED", `${created} rows from ${files.join(", ")}`);
    });
  } catch (e) {
    const b: ImportBatch = { id: `IMP-${Date.now().toString().slice(-6)}`, at: Date.now(), user, files, categories: ["Opening Balances"], status: "Failed", created: 0, updated: 0, skipped: 0, rejected: rows.length, reconciliation: [e instanceof Error ? e.message : "Import failed; nothing was saved"], errors: rejected.flatMap((r) => r.issues) };
    saveBatch(b); throw e;
  }
  const b: ImportBatch = { id: `IMP-${Date.now().toString().slice(-6)}`, at: Date.now(), user, files, categories: ["Opening Balances"], status: rejected.length ? "Completed with Errors" : "Completed", created, updated: 0, skipped: rows.length - created - rejected.length, rejected: rejected.length, reconciliation: recon, errors: rows.flatMap((r) => r.issues) };
  saveBatch(b); return b;
}

export const OB_TEMPLATE = "Source ID,Account Type,Account,Phone,Opening Amount,Currency,Effective Date\nOB-1,Cash,Cash drawer,,15000,KES,01/01/2026\nOB-2,M-Pesa,Till 123456,,42000,KES,01/01/2026\nOB-3,Bank,Equity Bank,,120000,KES,01/01/2026\nOB-4,Customer receivable,Amina Hassan,0712345678,3500,KES,01/01/2026\nOB-5,Supplier payable,Bidco Ltd,0722000000,18000,KES,01/01/2026\n";
export function issuesCsv(issues: OBIssue[]) { const c = (x: unknown) => `"${String(x ?? "").replaceAll('"', '""')}"`; return [["File", "Worksheet", "Row", "Field", "Problem", "Suggested correction"], ...issues.map((i) => [i.file, i.sheet, i.row, i.field, i.problem, i.suggestion])].map((r) => r.map(c).join(",")).join("\n"); }
/** Export opening balances in the same format so they can be re-imported. */
export function exportOB(s: ErpState) {
  const rows = s.payments.filter((p) => p.kind === "OPENING").map((p) => [p.importKey ?? p.ref, p.customerId ? "Customer receivable" : p.supplierId ? "Supplier payable" : LABEL[p.method as OBKind] ?? p.method, p.source, "", p.amount, "KES", new Date(p.at).toLocaleDateString("en-GB")]);
  const c = (x: unknown) => `"${String(x ?? "").replaceAll('"', '""')}"`;
  return [["Source ID", "Account Type", "Account", "Phone", "Opening Amount", "Currency", "Effective Date"], ...rows].map((r) => r.map(c).join(",")).join("\n");
}
