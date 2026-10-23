// Read-only chart datasets over the shared ERP snapshot; financial series use Accounting's journal.
import { journal, balances, profitAndLoss } from "@/lib/accounting";
import { METHODS, METHOD_LABEL, type ErpState } from "@/lib/erp";
import { moneyActivity } from "@/lib/money-activity";

export type ChartPoint = { label: string; value: number; secondary?: number; third?: number };
export type ChartModule = "sales" | "purchases" | "inventory" | "expenses" | "financial" | "contacts" | "returns" | "commission" | "payroll" | "float";
export type ChartRange = { from: number; to: number };
export type ChartGroup = "Daily" | "Weekly" | "Monthly" | "Yearly";
export const totalPoints = (rows: ChartPoint[]) => rows.reduce((a, p) => a + p.value, 0);
export function rank(rows: { label: string; value: number }[]): ChartPoint[] {
  const out = new Map<string, number>();
  rows.forEach((r) => out.set(r.label, (out.get(r.label) ?? 0) + r.value));
  return [...out].map(([label, value]) => ({ label, value })).filter((p) => p.value !== 0).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
}
export function chartSeries(s: ErpState, module: ChartModule, range: ChartRange, group?: ChartGroup): ChartPoint[] {
  const entries = journal(s);
  const moneyRows = moneyActivity(s);
  const records = module === "inventory" ? s.movements : module === "float" ? moneyRows : module === "financial" ? entries : module === "sales" ? [...s.sales, ...s.returns] : module === "purchases" ? [...s.purchases, ...s.purchaseReturns] : module === "expenses" ? s.expenses : module === "contacts" ? [...s.customers, ...s.suppliers].map((x) => ({ at: x.createdAt })) : module === "returns" ? [...s.returns, ...s.purchaseReturns] : module === "payroll" ? s.payrolls : s.commissions;
  const selected = records.filter((r) => r.at >= range.from && r.at <= range.to);
  if (!selected.length) return [];
  const first = range.from || Math.min(...selected.map((r) => r.at));
  const span = range.to - first;
  const grouping = group ?? (span <= 32 * 864e5 ? "Daily" : span <= 150 * 864e5 ? "Weekly" : "Monthly");
  const floor = (at: number) => { const d = new Date(at); d.setHours(0, 0, 0, 0); if (grouping === "Weekly") d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); if (grouping === "Monthly") d.setDate(1); if (grouping === "Yearly") { d.setMonth(0); d.setDate(1); } return d; };
  const buckets: { from: number; to: number; label: string }[] = [];
  let d = floor(first);
  while (d.getTime() <= range.to && buckets.length < 400) {
    const next = new Date(d); if (grouping === "Monthly") next.setMonth(next.getMonth() + 1); else if (grouping === "Yearly") next.setFullYear(next.getFullYear() + 1); else next.setDate(next.getDate() + (grouping === "Weekly" ? 7 : 1));
    buckets.push({ from: Math.max(first, d.getTime()), to: Math.min(range.to, next.getTime() - 1), label: d.toLocaleDateString("en-GB", grouping === "Yearly" ? { year: "numeric" } : grouping === "Monthly" ? { month: "short", year: "2-digit" } : { day: "2-digit", month: "short" }) }); d = next;
  }
  return buckets.map((b) => {
    const inR = (at: number) => at >= b.from && at <= b.to;
    if (module === "financial") { const p = profitAndLoss(s, b.from, b.to); return { label: b.label, value: p.sales - p.returns, secondary: p.expenses + p.salaries + p.stockAdj, third: p.net }; }
    if (module === "inventory") return { label: b.label, value: s.movements.filter((x) => inR(x.at) && x.qty > 0).reduce((a, x) => a + x.qty, 0), secondary: s.movements.filter((x) => inR(x.at) && x.qty < 0).reduce((a, x) => a - x.qty, 0) };
    if (module === "float") return { label: b.label, value: moneyRows.filter((x) => inR(x.at) && x.amount > 0).reduce((a, x) => a + x.amount, 0), secondary: moneyRows.filter((x) => inR(x.at) && x.amount < 0).reduce((a, x) => a - x.amount, 0) };
    if (module === "sales") return { label: b.label, value: s.sales.filter((x) => inR(x.at)).reduce((a, x) => a + x.total, 0) - s.returns.filter((x) => inR(x.at)).reduce((a, x) => a + x.amount, 0) };
    if (module === "purchases") return { label: b.label, value: s.purchases.filter((x) => inR(x.at)).reduce((a, x) => a + x.total, 0) - s.purchaseReturns.filter((x) => inR(x.at)).reduce((a, x) => a + x.amount, 0) };
    if (module === "expenses") return { label: b.label, value: s.expenses.filter((x) => inR(x.at)).reduce((a, x) => a + x.amount, 0) };
    if (module === "payroll") return { label: b.label, value: s.payrolls.filter((x) => inR(x.at)).reduce((a, x) => a + x.net, 0), secondary: s.payrollPayments.filter((x) => inR(x.at)).reduce((a, x) => a + x.amount, 0) };
    if (module === "commission") return { label: b.label, value: s.commissions.filter((x) => inR(x.at) && !x.pending).reduce((a, x) => a + x.amount, 0) };
    if (module === "returns") return { label: b.label, value: s.returns.filter((x) => inR(x.at)).reduce((a, x) => a + x.amount, 0), secondary: s.purchaseReturns.filter((x) => inR(x.at)).reduce((a, x) => a + x.amount, 0) };
    return { label: b.label, value: selected.filter((x) => inR(x.at)).length };
  });
}
export function chartBreakdown(s: ErpState, module: ChartModule, range: ChartRange): { title: string; points: ChartPoint[]; count?: boolean } {
  const inR = (at: number) => at >= range.from && at <= range.to;
  if (module === "sales" || module === "purchases") {
    const rows = (module === "sales" ? s.sales : s.purchases).filter((x) => inR(x.at));
    return { title: module === "sales" ? "Sales by payment method" : "Purchases by payment method", points: METHODS.map((m) => ({ label: METHOD_LABEL[m], value: rows.reduce((a, x) => a + x.pay[m], 0) })) };
  }
  if (module === "expenses") return { title: "Expenses by category", points: rank(s.expenses.filter((x) => inR(x.at)).map((x) => ({ label: x.category, value: x.amount }))) };
  if (module === "inventory") return { title: "Current stock valuation", points: rank(s.products.map((p) => ({ label: s.categories.find((c) => c.id === p.categoryId)?.name ?? "Uncategorized", value: p.qty * p.buy }))) };
  if (module === "contacts") return { title: "Outstanding balances", points: [{ label: "Receivables", value: s.customers.reduce((a, x) => a + Math.max(0, x.balance), 0) }, { label: "Payables", value: s.suppliers.reduce((a, x) => a + Math.max(0, x.balance), 0) }] };
  if (module === "returns") return { title: "Return value", points: [{ label: "Sales returns", value: s.returns.filter((x) => inR(x.at)).reduce((a, x) => a + x.amount, 0) }, { label: "Purchase returns", value: s.purchaseReturns.filter((x) => inR(x.at)).reduce((a, x) => a + x.amount, 0) }] };
  if (module === "commission" || module === "payroll") return { title: module === "commission" ? "Commission by employee" : "Payroll by employee", points: rank((module === "commission" ? s.commissions.filter((x) => !x.pending) : s.payrolls).filter((x) => inR(x.at)).map((x) => ({ label: s.employees.find((e) => e.id === x.employeeId)?.name ?? "—", value: "net" in x ? x.net : x.amount }))) };
  const b = balances(journal(s));
  return { title: "Account balances", points: ["cash", "mpesa", "bank"].map((m) => ({ label: METHOD_LABEL[m as "cash" | "mpesa" | "bank"], value: b[m as "cash" | "mpesa" | "bank"].net })) };
}

/** Historical book balances from recorded accounting entries, not invented stock-price history. */
export function balanceTrend(s: ErpState, metric: "Inventory" | "Cash", range: ChartRange): ChartPoint[] {
  const entries = journal(s), selected = entries.filter((e) => e.at >= range.from && e.at <= range.to);
  if (!selected.length) return [];
  const start = range.from || Math.min(...selected.map((e) => e.at));
  const span = range.to - start, count = Math.min(24, Math.max(1, Math.ceil(span / 864e5)));
  return Array.from({ length: count }, (_, i) => {
    const end = start + (span * (i + 1) / count), b = balances(entries, 0, end);
    return { label: new Date(end).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), value: metric === "Inventory" ? b.inventory.net : b.cash.net + b.mpesa.net + b.bank.net };
  });
}