// Reports read the shared ERP snapshot only — they never mutate business data.
import type { ErpState } from "@/lib/erp";
import { returnStatus } from "@/lib/erp";

export const REPORT_TYPES = ["Sales", "Inventory", "Returns", "Commission"] as const;
export type ReportType = (typeof REPORT_TYPES)[number];
export type Report = { title: string; money: boolean; kpis: { label: string; value: number | null; money: boolean }[]; rows: { label: string; value: number | string; note?: string | undefined }[] };
type Range = { from: number; to: number };
const r2 = (n: number) => Math.round(n * 100) / 100;

export function buildReport(s: ErpState, type: ReportType | "Overview", { from, to }: Range): Report {
  const inR = (at: number) => at >= from && at <= to;
  const sales = s.sales.filter((x) => inR(x.at));
  const rets = s.returns.filter((x) => inR(x.at));
  const gross = sales.reduce((a, x) => a + x.total, 0);
  const returned = rets.reduce((a, x) => a + x.amount, 0);
  const cogs = sales.reduce((a, x) => a + x.items.reduce((b, i) => b + (i.qty - i.returned) * i.cost, 0), 0);
  const kept = sales.reduce((a, x) => a + x.items.reduce((b, i) => b + (i.qty - i.returned) * i.price * (x.subtotal ? x.total / x.subtotal : 1), 0), 0);
  const stock = s.products.reduce((a, p) => a + p.qty * p.buy, 0);
  const comm = s.commissions.filter((x) => inR(x.at));
  if (type === "Overview") return { title: "Recent sales", money: true,
    kpis: [{ label: "Sales", value: r2(gross - returned), money: true }, { label: "Gross profit", value: r2(kept - cogs), money: true }, { label: "Returns", value: r2(returned), money: true }, { label: "Stock", value: r2(stock), money: true }, { label: "Expenses", value: r2(s.expenses.filter((x) => inR(x.at)).reduce((a, x) => a + x.amount, 0)), money: true }],
    rows: sales.slice(0, 10).map((x) => ({ label: x.ref, value: x.total, note: returnStatus(x) === "NOT RETURNED" ? undefined : returnStatus(x) })) };
  if (type === "Sales") {
    const byP = new Map<string, number>();
    sales.forEach((x) => x.items.forEach((i) => byP.set(i.name, (byP.get(i.name) ?? 0) + (i.qty - i.returned) * i.price)));
    return { title: "Sales by product", money: true,
      kpis: [{ label: "Sales", value: r2(gross - returned), money: true }, { label: "Transactions", value: sales.length, money: false }, { label: "Average sale", value: sales.length ? r2(gross / sales.length) : 0, money: true }, { label: "Gross profit", value: r2(kept - cogs), money: true }],
      rows: [...byP].sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value: r2(value) })) };
  }
  if (type === "Inventory") return { title: "Stock valuation", money: true,
    kpis: [{ label: "Products", value: s.products.length, money: false }, { label: "Stock value", value: r2(stock), money: true }, { label: "Low stock", value: s.products.filter((p) => p.qty > 0 && p.qty <= (p.minStock ?? 0)).length, money: false }, { label: "Out of stock", value: s.products.filter((p) => p.qty <= 0).length, money: false }],
    rows: s.products.map((p) => ({ label: `${p.name} × ${p.qty}`, value: r2(p.qty * p.buy) })) };
  if (type === "Returns") return { title: "Returns history", money: true,
    kpis: [{ label: "Sales returns", value: rets.length, money: false }, { label: "Purchase returns", value: s.purchaseReturns.filter((x) => inR(x.at)).length, money: false }, { label: "Refunded", value: r2(rets.filter((x) => x.refund !== "credit").reduce((a, x) => a + x.amount, 0)), money: true }, { label: "Credit", value: r2(rets.filter((x) => x.refund === "credit").reduce((a, x) => a + x.amount, 0)), money: true }],
    rows: rets.map((x) => ({ label: `${x.ref} • ${x.saleRef}`, value: x.amount, note: x.refund === "credit" ? "Customer credit" : undefined })) };
  const byE = new Map<string, number>();
  comm.forEach((x) => byE.set(x.employeeId, (byE.get(x.employeeId) ?? 0) + x.amount));
  return { title: "Commission by employee", money: true,
    kpis: [{ label: "Commission", value: r2(comm.reduce((a, x) => a + x.amount, 0)), money: true }, { label: "Adjustments", value: r2(comm.filter((x) => x.amount < 0).reduce((a, x) => a + x.amount, 0)), money: true }, { label: "Employees", value: byE.size, money: false }],
    rows: [...byE].map(([id, value]) => ({ label: s.employees.find((e) => e.id === id)?.name ?? "—", value: r2(value) })) };
}

export function toCsv(r: Report) {
  const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [[r.title], ...r.kpis.map((k) => [k.label, k.value ?? ""]), [], ["Item", "Value", "Note"], ...r.rows.map((x) => [x.label, x.value, x.note ?? ""])].map((row) => row.map(q).join(",")).join("\n");
}
