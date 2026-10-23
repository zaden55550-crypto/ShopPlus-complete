import type { ErpState } from "@/lib/erp";
import { financialActivity, type MoneyActivity } from "@/lib/money-activity";

/** Device-local staging area for historical financial imports. Never writes ERP records,
 * so matching an imported row to a real shop record can never double-count stock or money. */
export const RECON_KEY = "shopbook.reconcile";
export const RECON_KINDS = ["Sale", "Purchase", "Expense", "Customer payment", "Supplier payment", "Payroll payment", "Return"] as const;
export type ReconKind = (typeof RECON_KINDS)[number];
export type ReconStatus = "unmatched" | "matched" | "ignored";
export type ReconRow = { id: string; file: string; row: number; kind: ReconKind; at: number; ref: string; party: string; amount: number; method: string; status: ReconStatus; matchId?: string | undefined; matchRef?: string | undefined };

const ACCEPT: Record<ReconKind, string[]> = { Sale: ["Sale"], Purchase: ["Purchase"], Expense: ["Expense"], "Customer payment": ["Customer payment"], "Supplier payment": ["Supplier payment"], "Payroll payment": ["Payroll payment"], Return: ["Sales return", "Purchase return"] };
const ALIASES: Record<string, string[]> = { kind: ["type", "kind", "transaction type", "record type"], at: ["date", "transaction date", "time"], ref: ["ref", "reference", "receipt", "invoice", "number", "no"], party: ["customer", "supplier", "party", "name", "employee", "description", "payee"], amount: ["amount", "total", "value", "paid"], method: ["method", "payment method", "paid via", "account"] };
const k = (v: unknown) => String(v ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
const num = (v: unknown) => { const n = Number(String(v ?? "").replace(/[^0-9.-]/g, "")); return Number.isFinite(n) ? n : NaN; };
const kindOf = (v: unknown, fallback: ReconKind): ReconKind => { const x = k(v); if (!x) return fallback; if (x.includes("return") || x.includes("refund")) return "Return"; if (x.includes("payroll") || x.includes("salary") || x.includes("wage")) return "Payroll payment"; if (x.includes("supplier")) return "Supplier payment"; if (x.includes("customer") || x.includes("debt") || x.includes("collection")) return "Customer payment"; if (x.includes("purchase")) return "Purchase"; if (x.includes("expense")) return "Expense"; return x.includes("sale") ? "Sale" : fallback; };
const dateOf = (v: unknown) => { if (typeof v === "number" && v > 20000 && v < 80000) return Math.round((v - 25569) * 864e5); const s = String(v ?? "").trim(); const m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/); const t = m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])).getTime() : new Date(s).getTime(); return Number.isFinite(t) ? t : NaN; };

export const loadRecon = (): ReconRow[] => { try { const v = JSON.parse(localStorage.getItem(RECON_KEY) ?? "[]"); return Array.isArray(v) ? v : []; } catch { return []; } };
export const saveRecon = (rows: ReconRow[]) => { localStorage.setItem(RECON_KEY, JSON.stringify(rows)); window.dispatchEvent(new Event("shopbook-prefs")); };

export function stageRows(raw: Record<string, unknown>[], file: string, fallback: ReconKind) {
  const cols = Object.keys(raw[0] ?? {}), pick = (f: string) => cols.find((c) => ALIASES[f]!.some((a) => k(a) === k(c)));
  const col = { kind: pick("kind"), at: pick("at"), ref: pick("ref"), party: pick("party"), amount: pick("amount"), method: pick("method") };
  const rows: ReconRow[] = [], errors: string[] = [];
  raw.forEach((r, i) => { const amount = num(col.amount ? r[col.amount] : undefined), at = dateOf(col.at ? r[col.at] : undefined);
    if (!Number.isFinite(amount) || amount === 0) return void errors.push(`Row ${i + 2}: amount missing`);
    if (!Number.isFinite(at)) return void errors.push(`Row ${i + 2}: date missing`);
    rows.push({ id: crypto.randomUUID(), file, row: i + 2, kind: kindOf(col.kind ? r[col.kind] : undefined, fallback), at, ref: String((col.ref && r[col.ref]) ?? "").trim(), party: String((col.party && r[col.party]) ?? "").trim(), amount: Math.abs(amount), method: String((col.method && r[col.method]) ?? "").trim(), status: "unmatched" }); });
  return { rows, errors };
}

export type Candidate = MoneyActivity & { score: number; reasons: string[] };
export function candidates(s: ErpState, row: ReconRow, taken: Set<string>, pool = financialActivity(s)): Candidate[] {
  return pool.filter((a) => ACCEPT[row.kind].includes(a.kind) && !taken.has(a.id)).map((a) => {
    const reasons: string[] = []; let score = 0; const diff = Math.abs(Math.abs(a.amount) - row.amount), days = Math.abs(a.at - row.at) / 864e5;
    if (row.ref && k(a.ref) === k(row.ref)) { score += 4; reasons.push("Same ref"); }
    if (diff < 1) { score += 3; reasons.push("Same amount"); } else if (diff <= row.amount * 0.02) { score += 1; reasons.push("Amount ±2%"); }
    if (days < 1) { score += 2; reasons.push("Same day"); } else if (days <= 3) { score += 1; reasons.push("Within 3 days"); }
    if (row.party && k(a.source).includes(k(row.party))) { score += 1; reasons.push("Same party"); }
    return { ...a, score, reasons };
  }).filter((c) => c.score >= 3).sort((a, b) => b.score - a.score || Math.abs(a.at - row.at) - Math.abs(b.at - row.at)).slice(0, 4);
}
/** Confident matches only: same amount plus same ref or same day. */
export function autoMatch(s: ErpState, rows: ReconRow[]) {
  const pool = financialActivity(s), taken = new Set(rows.flatMap((r) => r.matchId ? [r.matchId] : [])); let n = 0;
  const next = rows.map((r) => { if (r.status !== "unmatched") return r; const best = candidates(s, r, taken, pool)[0]; if (!best || best.score < 5) return r; taken.add(best.id); n++; return { ...r, status: "matched" as const, matchId: best.id, matchRef: best.ref }; });
  return { rows: next, matched: n };
}
export function reconTotals(rows: ReconRow[]) { const sum = (st: ReconStatus) => rows.filter((r) => r.status === st); return { total: rows.length, matched: sum("matched").length, unmatched: sum("unmatched").length, ignored: sum("ignored").length, unmatchedValue: sum("unmatched").reduce((a, r) => a + r.amount, 0) }; }
export const reconTemplate = () => `"Type","Date","Ref","Party","Amount","Payment Method"\n"Sale","07/10/2026","SL-0001","Amina","2500","Cash"\n"Supplier payment","06/10/2026","","Wadani Supplies","10000","M-Pesa"`;
