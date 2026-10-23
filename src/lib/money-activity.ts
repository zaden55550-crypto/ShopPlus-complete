import type { ErpState, Method } from "@/lib/erp";
import { METHOD_LABEL, METHODS } from "@/lib/erp";
import { floatBalances } from "@/lib/finance";

export type MoneyActivity = { id: string; ref: string; at: number; kind: string; group: string; amount: number; method: string; source: string; user: string };
const methods = (pay: Record<Method, number>) => METHODS.filter((m) => pay[m] > 0).map((m) => METHOD_LABEL[m]).join(" + ");
/** Financial documents once each, with later money collections shown separately. */
export function financialActivity(s: ErpState): MoneyActivity[] {
  return [
    ...s.sales.map((x) => ({ id: x.id, ref: x.ref, at: x.at, kind: "Sale", group: "Sales", amount: x.total, method: methods(x.pay), source: x.items.map((i) => i.name).join(", "), user: x.cashier })),
    ...s.purchases.map((x) => ({ id: x.id, ref: x.ref, at: x.at, kind: "Purchase", group: "Purchases", amount: x.total, method: methods(x.pay), source: s.suppliers.find((v) => v.id === x.supplierId)?.name ?? x.items.map((i) => i.name).join(", "), user: x.user })),
    ...s.expenses.map((x) => ({ id: x.id, ref: x.ref, at: x.at, kind: "Expense", group: "Expenses", amount: x.amount, method: [...new Set(s.payments.filter((p) => p.kind === "EXPENSE" && p.source === x.ref).map((p) => METHOD_LABEL[p.method]))].join(" + ") || "Credit", source: x.description || x.category, user: x.user })),
    ...s.returns.map((x) => ({ id: x.id, ref: x.ref, at: x.at, kind: "Sales return", group: "Returns", amount: x.amount, method: METHOD_LABEL[x.refund], source: x.saleRef, user: x.user })),
    ...s.purchaseReturns.map((x) => ({ id: x.id, ref: x.ref, at: x.at, kind: "Purchase return", group: "Returns", amount: x.amount, method: METHOD_LABEL[x.refund], source: x.purchaseRef, user: x.user })),
    ...s.payments.filter((p) => ["DEBT", "SUPPLIER PAYMENT", "DEPOSIT", "WITHDRAWAL", "TRANSFER"].includes(p.kind)).map((p) => ({ ...p, kind: p.kind === "DEBT" ? "Customer payment" : p.kind === "SUPPLIER PAYMENT" ? "Supplier payment" : p.kind, group: ["TRANSFER", "DEPOSIT", "WITHDRAWAL"].includes(p.kind) ? "Transfers" : "Payments", method: METHOD_LABEL[p.method] })),
    ...s.payrollPayments.map((p) => ({ ...p, kind: "Payroll payment", group: "Payments", method: METHOD_LABEL[p.method], source: s.employees.find((e) => e.id === p.employeeId)?.name ?? p.payrollId })),
  ].sort((a, b) => b.at - a.at);
}
/** Actual account movements: no credit, no duplicate sale/purchase documents. */
export function moneyActivity(s: ErpState): MoneyActivity[] {
  return [
    ...s.payments.filter((p) => p.method !== "credit").map((p) => ({ ...p, group: p.kind, method: METHOD_LABEL[p.method] })),
    ...s.payrollPayments.filter((p) => p.method !== "credit").map((p) => ({ ...p, amount: -p.amount, kind: "Payroll payment", group: "Payments", method: METHOD_LABEL[p.method], source: s.employees.find((e) => e.id === p.employeeId)?.name ?? p.payrollId })),
    ...s.cash.filter((e) => (e.type === "CASH IN" || e.type === "CASH OUT") && !e.note?.startsWith("Payroll")).map((e) => ({ ...e, ref: e.type, kind: e.type, group: "Cash", amount: e.type === "CASH OUT" ? -e.amount : e.amount, method: "Cash", source: e.note ?? e.type })),
  ].sort((a, b) => b.at - a.at);
}
export function cashFlow(s: ErpState, from: number) {
  const rows = moneyActivity(s).filter((x) => x.at >= from);
  const incoming = rows.filter((x) => x.amount > 0).reduce((a, x) => a + x.amount, 0);
  const outgoing = -rows.filter((x) => x.amount < 0).reduce((a, x) => a + x.amount, 0);
  const balances = floatBalances(s);
  return { incoming, outgoing, net: incoming - outgoing, ...balances };
}