import { balances, journal, profitAndLoss, ACCOUNT_INFO, type AccountId } from "@/lib/accounting";
import { chartBreakdown, rank, type ChartModule, type ChartRange } from "@/lib/chart-data";
import { METHODS, METHOD_LABEL, type ErpState } from "@/lib/erp";
import { expenseBalance, purchaseBalance } from "@/lib/finance";
import { moneyActivity } from "@/lib/money-activity";
import { buildReport, type Report } from "@/lib/reports";

export const REPORT_MENUS: Record<string, readonly string[]> = {
  Sales: ["Sales Report", "Product Sales", "Payment Methods", "Customer Sales", "Seller Performance"],
  Purchases: ["Purchase Report", "Supplier Report", "Payment Report", "Return Report"],
  Inventory: ["Stock Report", "Movement", "Valuation", "Performance"],
  Expenses: ["Expense Report", "By Category", "Payment Methods", "Monthly", "Trends", "Top Expenses", "Outstanding"],
  Financial: ["Profit & Loss", "Balance Summary", "Cash Flow", "Receivables", "Payables", "VAT"],
  Contacts: ["Customers", "Suppliers", "Balances", "History"],
  Returns: ["Sales Returns", "Purchase Returns", "Return Summary"],
  Commission: ["Commission Report", "By Employee", "By Product", "By Sale"],
  Builder: ["Report Builder", "Saved Reports"],
};
export const reportModule = (menu: string): ChartModule => menu.toLowerCase() === "financial" ? "financial" : menu.toLowerCase() as ChartModule;
export function detailedReport(s: ErpState, menu: string, sub: string, range: ChartRange): Report {
  const inR = (at: number) => at >= range.from && at <= range.to;
  const rows = (rr: { label: string; value: number; note?: string }[]) => rank(rr).map((r) => ({ label: r.label, value: r.value }));
  const kpi = (label: string, value: number, money = true) => ({ label, value, money });
  const sum = (rr: { amount: number }[]) => rr.reduce((a, x) => a + x.amount, 0);
  if (menu === "Sales") {
    const report = buildReport(s, "Sales", range), sales = s.sales.filter((x) => inR(x.at));
    if (sub === "Sales Report") return { ...report, title: "Recent sales", rows: sales.map((x) => ({ label: x.ref, value: x.total, note: x.items[0]?.name })) };
    if (sub === "Payment Methods") return { ...report, title: sub, rows: chartBreakdown(s, "sales", range).points };
    if (sub === "Customer Sales") return { ...report, title: sub, rows: rows(sales.filter((x) => x.customerId && s.customers.some((c) => c.id === x.customerId)).map((x) => ({ label: s.customers.find((c) => c.id === x.customerId)?.name ?? "—", value: x.total }))) };
    if (sub === "Seller Performance") return { ...report, title: sub, rows: rows(sales.map((x) => ({ label: s.employees.find((e) => e.id === x.sellerId)?.name ?? "Admin", value: x.total }))) };
    return report;
  }
  if (menu === "Purchases") {
    const p = s.purchases.filter((x) => inR(x.at)), returns = s.purchaseReturns.filter((x) => inR(x.at));
    const total = p.reduce((a, x) => a + x.total, 0), paid = p.reduce((a, x) => a + x.pay.cash + x.pay.mpesa + x.pay.bank + (x.settled ?? 0), 0);
    return { title: sub, money: true, kpis: [kpi("Purchases", total), kpi("Paid", paid), kpi("Credit", p.reduce((a, x) => a + purchaseBalance(s, x), 0)), kpi("Returns", sum(returns))], rows: sub === "Supplier Report" ? rows(p.map((x) => ({ label: s.suppliers.find((c) => c.id === x.supplierId)?.name ?? "—", value: x.total }))) : sub === "Payment Report" ? chartBreakdown(s, "purchases", range).points : sub === "Return Report" ? returns.map((x) => ({ label: x.ref, value: x.amount, note: x.purchaseRef })) : p.map((x) => ({ label: x.ref, value: x.total, note: s.suppliers.find((c) => c.id === x.supplierId)?.name })) };
  }
  if (menu === "Inventory") {
    const r = buildReport(s, "Inventory", range);
    if (sub === "Movement") return { ...r, title: sub, money: false, rows: s.movements.filter((x) => inR(x.at)).map((x) => ({ label: s.products.find((p) => p.id === x.productId)?.name ?? x.productId, value: x.qty, note: x.type })) };
    if (sub === "Performance") return { ...r, title: sub, rows: buildReport(s, "Sales", range).rows };
    return { ...r, title: sub };
  }
  if (menu === "Expenses") {
    const e = s.expenses.filter((x) => inR(x.at)), total = sum(e), unpaid = e.reduce((a, x) => a + expenseBalance(s, x), 0);
    const kpis = [kpi("Expenses", total), kpi("Transactions", e.length, false), kpi("Average expense", e.length ? total / e.length : 0), kpi("Outstanding", unpaid)];
    return { title: sub, money: true, kpis, rows: sub === "By Category" ? rows(e.map((x) => ({ label: x.category, value: x.amount }))) : sub === "Payment Methods" ? METHODS.map((m) => ({ label: METHOD_LABEL[m], value: -sum(s.payments.filter((p) => p.kind === "EXPENSE" && p.method === m && inR(p.at))) })) : sub === "Monthly" ? rows(e.map((x) => ({ label: new Date(x.at).toLocaleDateString("en-GB", { month: "short", year: "numeric" }), value: x.amount }))) : (sub === "Outstanding" ? e.filter((x) => expenseBalance(s, x) > 0) : sub === "Top Expenses" ? [...e].sort((a, b) => b.amount - a.amount).slice(0, 10) : e).map((x) => ({ label: x.ref, value: sub === "Outstanding" ? expenseBalance(s, x) : x.amount, note: x.category })) };
  }
  if (menu === "Financial") {
    const p = profitAndLoss(s, range.from, range.to), b = balances(journal(s), 0, range.to);
    const report: Report = { title: sub, money: true, kpis: [kpi("Revenue", p.sales - p.returns), kpi("Expenses", p.expenses + p.salaries + p.stockAdj), kpi("Profit", p.net)], rows: [["Sales", p.sales], ["Returns", p.returns], ["Cost of goods sold", p.cogs], ["Gross profit", p.gross], ["Expenses", p.expenses], ["Payroll", p.salaries], ["Stock adjustments", p.stockAdj], ["Net profit", p.net]].map(([label, value]) => ({ label: String(label), value: Number(value) })) };
    if (sub === "Balance Summary") report.rows = (Object.keys(ACCOUNT_INFO) as AccountId[]).filter((k) => ["Asset", "Liability", "Equity"].includes(ACCOUNT_INFO[k].type)).map((k) => ({ label: ACCOUNT_INFO[k].name, value: ACCOUNT_INFO[k].type === "Asset" ? b[k].net : -b[k].net }));
    if (sub === "Cash Flow") { const activity = moneyActivity(s).filter((x) => inR(x.at)); report.rows = [{ label: "Money in", value: sum(activity.filter((x) => x.amount > 0)) }, { label: "Money out", value: -sum(activity.filter((x) => x.amount < 0)) }, { label: "Net movement", value: sum(activity) }]; }
    if (sub === "Receivables" || sub === "Payables") report.rows = (sub === "Receivables" ? s.customers : s.suppliers).filter((x) => x.balance > 0).map((x) => ({ label: x.name, value: x.balance }));
    if (sub === "VAT") report.rows = [{ label: "VAT payable", value: -b.vatPayable.net }];
    return report;
  }
  if (menu === "Contacts") {
    return { title: sub, money: sub !== "History", kpis: [kpi("Customers", s.customers.length, false), kpi("Suppliers", s.suppliers.length, false), kpi("Receivables", s.customers.reduce((a, x) => a + Math.max(0, x.balance), 0)), kpi("Payables", s.suppliers.reduce((a, x) => a + Math.max(0, x.balance), 0))], rows: sub === "History" ? s.audit.filter((x) => inR(x.at) && x.action.startsWith("CONTACT")).map((x) => ({ label: x.action, value: x.detail })) : (sub === "Customers" ? s.customers : sub === "Suppliers" ? s.suppliers : [...s.customers, ...s.suppliers].filter((x) => x.balance > 0)).map((x) => ({ label: x.name, value: x.balance, note: x.phone })) };
  }
  if (menu === "Returns") {
    const base = buildReport(s, "Returns", range);
    return { ...base, title: sub, rows: [...(sub !== "Purchase Returns" ? s.returns.filter((x) => inR(x.at)).map((x) => ({ label: x.ref, value: x.amount, note: `${x.saleRef} · ${METHOD_LABEL[x.refund]}` })) : []), ...(sub !== "Sales Returns" ? s.purchaseReturns.filter((x) => inR(x.at)).map((x) => ({ label: x.ref, value: x.amount, note: `${x.purchaseRef} · ${METHOD_LABEL[x.refund]}` })) : [])] };
  }
  const eligible = s.commissions.filter((x) => inR(x.at) && !x.pending), base = buildReport({ ...s, commissions: eligible }, "Commission", range);
  if (sub === "By Sale") return { ...base, title: sub, rows: rows(eligible.map((x) => ({ label: x.source, value: x.amount }))) };
  if (sub === "By Product") return { ...base, title: sub, rows: rows(eligible.flatMap((x) => Object.entries(x.productAmounts ?? {}).map(([id, value]) => ({ label: s.products.find((p) => p.id === id)?.name ?? id, value })))) };
  return { ...base, title: sub };
}