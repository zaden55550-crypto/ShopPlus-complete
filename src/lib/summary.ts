// Read-only business performance over a period, computed from the shared ERP snapshot.
import { purchaseTotals } from "@/lib/finance";
import { METHODS, type ErpState, type Method } from "@/lib/erp";

export type Period = "Today" | "Week" | "Month" | "Year" | "All time";
export const PERIODS: Period[] = ["Today", "Week", "Month", "Year", "All time"];
const r2 = (n: number) => Math.round(n * 100) / 100;

export function periodStart(p: Period, now = new Date()) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (p === "Today") return d.getTime();
  if (p === "Week") return d.getTime() - 6 * 864e5;
  if (p === "Month") return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  if (p === "Year") return new Date(now.getFullYear(), 0, 1).getTime();
  return 0;
}

export function performance(s: ErpState, from: number, to = Date.now()) {
  const inR = (at: number) => at >= from && at <= to;
  const sales = s.sales.filter((x) => inR(x.at));
  const rets = s.returns.filter((x) => inR(x.at));
  const total = sales.reduce((a, x) => a + x.total, 0);
  const credit = sales.reduce((a, x) => a + x.pay.credit, 0);
  const returned = rets.reduce((a, x) => a + x.amount, 0);
  const byMethod = Object.fromEntries(METHODS.map((m) => [m, r2(sales.reduce((a, x) => a + x.pay[m], 0))])) as Record<Method, number>;
  const cogs = sales.reduce((a, x) => a + x.items.reduce((b, i) => b + (i.qty - i.returned) * i.cost, 0), 0);
  const kept = sales.reduce((a, x) => a + x.items.reduce((b, i) => b + (i.qty - i.returned) * i.price * (x.subtotal ? x.total / x.subtotal : 1), 0), 0);
  const products = new Map<string, { qty: number; value: number }>();
  sales.forEach((x) => x.items.forEach((i) => { const p = products.get(i.name) ?? { qty: 0, value: 0 }; p.qty += i.qty - i.returned; p.value += (i.qty - i.returned) * i.price; products.set(i.name, p); }));
  const sellers = new Map<string, number>();
  sales.forEach((x) => { const n = s.employees.find((e) => e.id === x.sellerId)?.name ?? "Admin"; sellers.set(n, (sellers.get(n) ?? 0) + x.total); });
  return {
    sales: r2(total - returned), total: r2(total), paid: r2(total - credit), credit: r2(credit), returned: r2(returned),
    grossProfit: r2(kept - cogs), transactions: sales.length, byMethod,
    top: [...products].sort((a, b) => b[1].value - a[1].value).slice(0, 5).map(([name, v]) => ({ name, qty: v.qty, value: r2(v.value) })),
    bySeller: [...sellers].map(([name, value]) => ({ name, value: r2(value) })),
  };
}

export function position(s: ErpState) {
  const stock = s.products.reduce((a, p) => a + p.qty * p.buy, 0);
  const retail = s.products.reduce((a, p) => a + p.qty * p.sell, 0);
  const receivables = s.customers.reduce((a, c) => a + Math.max(0, c.balance), 0);
  const customerCredit = s.customers.reduce((a, c) => a + Math.max(0, -c.balance), 0);
  const payroll = s.payrolls.reduce((a, p) => a + p.net - p.paid, 0);
  const low = s.products.filter((p) => p.qty > 0 && p.qty <= (p.minStock ?? 0)).length;
  const out = s.products.filter((p) => p.qty <= 0).length;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const lastUp = s.cash.find((e) => e.type === "CASH UP")?.at ?? 0;
  const cashUpPending = s.payments.some((p) => p.method === "cash" && p.at > lastUp && p.at < today.getTime());
  return { payables: purchaseTotals(s).payables, stock: r2(stock), retail: r2(retail), receivables: r2(receivables), customerCredit: r2(customerCredit), payroll: r2(payroll), low, out, cashUpPending };
}

/** Daily net sales for the last `days` days, oldest first. */
export function trend(s: ErpState, days: number, now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - (days - 1) * 864e5;
  return Array.from({ length: days }, (_, i) => {
    const a = start + i * 864e5, b = a + 864e5;
    const v = s.sales.filter((x) => x.at >= a && x.at < b).reduce((t, x) => t + x.total, 0) - s.returns.filter((x) => x.at >= a && x.at < b).reduce((t, x) => t + x.amount, 0);
    return { day: a, value: r2(v) };
  });
}
