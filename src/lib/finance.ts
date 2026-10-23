// Purchases, Expenses, Suppliers and Float — all written through the shared ERP `commit`.
// Money moves are rows in the one `payments` ledger (negative = money out), so Float,
// POS cash-up, Accounting, Dashboard and Summary all read the same records.
import { commit, cashSession, ErpError, uid, METHODS, payStatus, type ErpState, type Method, type Purchase, type Supplier } from "@/lib/erp";

export const ACCOUNTS: Method[] = ["cash", "mpesa", "bank"];
const r2 = (n: number) => Math.round(n * 100) / 100;

/** Live balance of Cash / M-Pesa / Bank from every recorded money movement. */
export function floatBalances(s: ErpState): Record<"cash" | "mpesa" | "bank", number> {
  const out = { cash: 0, mpesa: 0, bank: 0 };
  s.payments.forEach((p) => { if (p.method !== "credit") out[p.method] += p.amount; });
  s.payrollPayments.forEach((p) => { if (p.method !== "credit") out[p.method] -= p.amount; });
  s.cash.forEach((e) => {
    if (e.type === "CASH IN") out.cash += e.amount;
    if (e.type === "CASH OUT" && !e.note?.startsWith("Payroll")) out.cash -= e.amount;
  });
  return { cash: r2(out.cash), mpesa: r2(out.mpesa), bank: r2(out.bank) };
}

function ensureFunds(s: ErpState, m: Method, amount: number) {
  if (m === "credit") return;
  if (m === "cash" && amount > cashSession(s).expected + 0.001) throw new ErpError("Not enough cash in the drawer");
  if (m !== "cash" && amount > floatBalances(s)[m] + 0.001) throw new ErpError(`Not enough money in ${m === "mpesa" ? "M-Pesa" : "Bank"}`);
}

// ---------- Suppliers ----------
export type SupplierExtra = { email?: string; address?: string; info?: string; notes?: string };
export const addSupplier = (name: string, phone?: string, extra: SupplierExtra = {}) => commit((s, c) => {
  const n = name.trim(); if (!n) throw new ErpError("Enter a supplier name");
  if (n.length > 100) throw new ErpError("Name is too long");
  const sup: Supplier = { id: uid(), name: n, phone: phone?.trim() || undefined, email: extra.email?.trim() || undefined, address: extra.address?.trim() || undefined, info: extra.info?.trim() || undefined, notes: extra.notes?.trim() || undefined, balance: 0, createdAt: Date.now() };
  s.suppliers.unshift(sup); c.audit("SUPPLIER CREATED", n); return sup;
});

export const paySupplier = (supplierId: string, amount: number, method: Method) => commit((s, c) => {
  const sup = s.suppliers.find((x) => x.id === supplierId); if (!sup) throw new ErpError("Supplier not found");
  if (method === "credit") throw new ErpError("Choose Cash, M-Pesa or Bank");
  if (!(amount > 0)) throw new ErpError("Enter an amount");
  if (amount > sup.balance + 0.001) throw new ErpError("Amount is more than the outstanding balance");
  ensureFunds(s, method, amount);
  sup.balance = r2(sup.balance - amount);
  allocateToPurchases(s, sup.id, amount);
  s.payments.unshift({ id: uid(), ref: c.nextRef("PAY"), at: Date.now(), method, amount: -amount, kind: "SUPPLIER PAYMENT", source: sup.name, user: c.user });
  c.audit("SUPPLIER PAYMENT", `${sup.name} • ${amount}`);
});

// ---------- Purchase balances (P.PAY = part paid) ----------
export function purchaseBalance(s: ErpState, p: Purchase) {
  const credRet = s.purchaseReturns.filter((r) => r.purchaseId === p.id && r.refund === "credit").reduce((a, r) => a + r.amount, 0);
  return Math.max(0, r2(p.pay.credit - (p.settled ?? 0) - credRet));
}
export const purchaseStatus = (s: ErpState, p: Purchase) => payStatus(p.total, purchaseBalance(s, p), p.items.every((i) => i.returned >= i.qty));
function allocateToPurchases(s: ErpState, supplierId: string, amount: number, only?: string) {
  let left = amount;
  for (const p of s.purchases.filter((x) => x.supplierId === supplierId && (!only || x.id === only)).sort((a, b) => a.at - b.at)) {
    if (left <= 0.001) break; const b = purchaseBalance(s, p); if (b <= 0) continue;
    const take = Math.min(b, left); p.settled = r2((p.settled ?? 0) + take); left -= take;
  }
}
/** Pays one P.PAY/Credit purchase; supplier balance and money ledger move together. */
export const payPurchase = (purchaseId: string, amount: number, method: Method) => commit((s, c) => {
  const p = s.purchases.find((x) => x.id === purchaseId); if (!p) throw new ErpError("Purchase not found");
  const sup = s.suppliers.find((x) => x.id === p.supplierId); if (!sup) throw new ErpError("Supplier not found");
  if (method === "credit") throw new ErpError("Choose Cash, M-Pesa or Bank");
  if (!(amount > 0)) throw new ErpError("Enter an amount");
  if (amount > purchaseBalance(s, p) + 0.001) throw new ErpError("Amount is more than the outstanding balance");
  ensureFunds(s, method, amount);
  sup.balance = r2(sup.balance - amount);
  allocateToPurchases(s, sup.id, amount, p.id);
  s.payments.unshift({ id: uid(), ref: c.nextRef("PAY"), at: Date.now(), method, amount: -amount, kind: "SUPPLIER PAYMENT", source: sup.name, user: c.user });
  c.audit("SUPPLIER PAYMENT", `${p.ref} • ${sup.name} • ${amount}`);
});

// ---------- Purchases ----------
export type PurchaseLine = { productId: string; qty: number; cost: number };
export const confirmPurchase = (input: { lines: PurchaseLine[]; pay: Record<Method, number>; supplierId?: string | undefined; updateCost: boolean }) => commit((s, c) => {
  if (!input.lines.length) throw new ErpError("Add products to the purchase");
  const items = input.lines.map((l) => {
    const p = s.products.find((x) => x.id === l.productId); if (!p) throw new ErpError("Product not found");
    if (!(l.qty > 0)) throw new ErpError(`Invalid quantity for ${p.name}`);
    if (!(l.cost >= 0)) throw new ErpError(`Invalid cost for ${p.name}`);
    return { productId: p.id, name: p.name, qty: l.qty, cost: l.cost, returned: 0 };
  });
  const total = r2(items.reduce((a, i) => a + i.qty * i.cost, 0));
  if (METHODS.some((m) => !(input.pay[m] >= 0))) throw new ErpError("Payment amounts can't be negative");
  const allocated = METHODS.reduce((a, m) => a + input.pay[m], 0);
  if (Math.abs(allocated - total) > 0.001) throw new ErpError("Allocate the full total (use Credit for the unpaid part)");
  const sup = input.supplierId ? s.suppliers.find((x) => x.id === input.supplierId) : undefined;
  if (input.pay.credit > 0 && !sup) throw new ErpError("Credit needs a supplier");
  ACCOUNTS.forEach((m) => ensureFunds(s, m, input.pay[m]));
  const ref = c.nextRef("PO");
  items.forEach((i) => {
    c.move(i.productId, "PURCHASE", i.qty, "Purchase", ref);
    if (input.updateCost) { const p = s.products.find((x) => x.id === i.productId); if (p) p.buy = i.cost; }
  });
  ACCOUNTS.forEach((m) => { if (input.pay[m] > 0) s.payments.unshift({ id: uid(), ref: c.nextRef("PAY"), at: Date.now(), method: m, amount: -input.pay[m], kind: "PURCHASE", source: ref, user: c.user }); });
  if (sup && input.pay.credit > 0) sup.balance = r2(sup.balance + input.pay.credit);
  const pur: Purchase = { id: uid(), ref, at: Date.now(), supplierId: sup?.id, items, total, pay: { ...input.pay }, user: c.user };
  s.purchases.unshift(pur);
  c.audit("PURCHASE", `${ref} • ${total}${sup ? ` • ${sup.name}` : ""}`);
  return pur;
});

/** Items go back to the supplier: stock out, then refund in money or reduce what we owe. */
export const returnPurchase = (purchaseId: string, lines: { productId: string; qty: number }[], refund: Method, reason?: string) => commit((s, c) => {
  const pur = s.purchases.find((x) => x.id === purchaseId); if (!pur) throw new ErpError("Purchase not found");
  const picked = lines.filter((l) => l.qty > 0); if (!picked.length) throw new ErpError("Choose items to return");
  const ref = c.nextRef("PRT");
  const items = picked.map((l) => {
    const it = pur.items.find((i) => i.productId === l.productId); if (!it) throw new ErpError("Item not in purchase");
    if (l.qty > it.qty - it.returned) throw new ErpError(`Only ${it.qty - it.returned} of ${it.name} can be returned`);
    it.returned += l.qty;
    c.move(it.productId, "STOCK OUT", -l.qty, `Return to supplier ${pur.ref}`, ref);
    return { productId: it.productId, name: it.name, qty: l.qty, amount: r2(l.qty * it.cost) };
  });
  const amount = r2(items.reduce((a, i) => a + i.amount, 0));
  const sup = pur.supplierId ? s.suppliers.find((x) => x.id === pur.supplierId) : undefined;
  if (refund === "credit") {
    if (!sup) throw new ErpError("Supplier credit needs a supplier");
    sup.balance = r2(sup.balance - amount);
  } else {
    s.payments.unshift({ id: uid(), ref: c.nextRef("PAY"), at: Date.now(), method: refund, amount, kind: "SUPPLIER REFUND", source: ref, user: c.user });
  }
  s.purchaseReturns.unshift({ id: uid(), ref, at: Date.now(), purchaseId, purchaseRef: pur.ref, items, amount, refund, reason: reason?.trim() || undefined, user: c.user });
  c.audit("PURCHASE RETURN", `${ref} for ${pur.ref} • ${amount}`);
});

// ---------- Expenses ----------
export const DEFAULT_EXPENSE_CATEGORIES = ["Rent", "Electricity", "Water", "Transport", "Internet", "Airtime", "Repairs", "Supplies", "Other"];
/** An expense may be fully paid, part paid (P.PAY) or unpaid (Credit); each money account paid is its own ledger row. */
export const addExpense = (input: { category: string; amount: number; method: Method; note?: string | undefined; description?: string | undefined; at?: number | undefined; pay?: Partial<Record<Method, number>> | undefined }) => commit((s, c) => {
  const cat = input.category.trim(); if (!cat) throw new ErpError("Choose a category");
  if (!(input.amount > 0)) throw new ErpError("Enter an amount");
  const pay = input.pay ?? (input.method === "credit" ? {} : { [input.method]: input.amount });
  const parts = ACCOUNTS.map((m) => [m, r2(pay[m] ?? 0)] as const).filter(([, v]) => v > 0);
  if (parts.some(([, v]) => v < 0)) throw new ErpError("Payment amounts can't be negative");
  const paid = parts.reduce((a, [, v]) => a + v, 0);
  if (paid > input.amount + 0.001) throw new ErpError("Paid amount is more than the total");
  if (input.method === "credit" && !input.pay) throw new ErpError("Choose Cash, M-Pesa or Bank");
  parts.forEach(([m, v]) => ensureFunds(s, m, v));
  const ref = c.nextRef("EXP");
  const at = input.at && input.at <= Date.now() ? input.at : Date.now();
  s.expenses.unshift({ id: uid(), ref, at, category: cat, description: input.description?.trim() || undefined, note: input.note?.trim() || undefined, amount: r2(input.amount), method: parts[0]?.[0] ?? "credit", user: c.user });
  parts.forEach(([m, v]) => s.payments.unshift({ id: uid(), ref: c.nextRef("PAY"), at, method: m, amount: -v, kind: "EXPENSE", source: ref, user: c.user }));
  c.audit("EXPENSE", `${ref} • ${cat} • ${input.amount}`);
  return s.expenses[0]!;
});
export const expensePaid = (s: ErpState, x: { ref: string }) => r2(s.payments.filter((p) => p.kind === "EXPENSE" && p.source === x.ref).reduce((a, p) => a - p.amount, 0));
export const expenseBalance = (s: ErpState, x: { ref: string; amount: number }) => Math.max(0, r2(x.amount - expensePaid(s, x)));
export const expenseStatus = (s: ErpState, x: { ref: string; amount: number }) => payStatus(x.amount, expenseBalance(s, x), false);
/** Pays (part of) what is still owed on an expense. */
export const payExpense = (expenseId: string, amount: number, method: Method, at?: number) => commit((s, c) => {
  const x = s.expenses.find((v) => v.id === expenseId); if (!x) throw new ErpError("Expense not found");
  if (method === "credit") throw new ErpError("Choose Cash, M-Pesa or Bank");
  if (!(amount > 0)) throw new ErpError("Enter an amount");
  if (amount > expenseBalance(s, x) + 0.001) throw new ErpError("Amount is more than the outstanding balance");
  ensureFunds(s, method, amount);
  s.payments.unshift({ id: uid(), ref: c.nextRef("PAY"), at: at && at <= Date.now() ? at : Date.now(), method, amount: -r2(amount), kind: "EXPENSE", source: x.ref, user: c.user });
  c.audit("EXPENSE PAYMENT", `${x.ref} • ${amount}`);
});
export const addExpenseCategory = (name: string) => commit((s, c) => {
  const n = name.trim(); if (!n) throw new ErpError("Enter a name");
  if ([...DEFAULT_EXPENSE_CATEGORIES, ...s.expenseCategories.map((x) => x.name)].some((x) => x.toLowerCase() === n.toLowerCase())) throw new ErpError("Category already exists");
  s.expenseCategories.push({ id: uid(), name: n }); c.audit("EXPENSE CATEGORY", n);
});
export const expenseCategories = (s: ErpState) => [...DEFAULT_EXPENSE_CATEGORIES, ...s.expenseCategories.map((x) => x.name)];

// ---------- Float ----------
export const floatDeposit = (method: Method, amount: number, kind: "DEPOSIT" | "WITHDRAWAL", note: string) => commit((s, c) => {
  if (method === "credit") throw new ErpError("Choose Cash, M-Pesa or Bank");
  if (!(amount > 0)) throw new ErpError("Enter an amount");
  if (kind === "WITHDRAWAL") ensureFunds(s, method, amount);
  s.payments.unshift({ id: uid(), ref: c.nextRef("FL"), at: Date.now(), method, amount: kind === "DEPOSIT" ? amount : -amount, kind, source: note.trim() || (kind === "DEPOSIT" ? "Owner deposit" : "Owner withdrawal"), user: c.user });
  c.audit(`FLOAT ${kind}`, `${method} • ${amount}`);
});
export const floatTransfer = (from: Method, to: Method, amount: number) => commit((s, c) => {
  if (from === to) throw new ErpError("Choose two different accounts");
  if (from === "credit" || to === "credit") throw new ErpError("Choose Cash, M-Pesa or Bank");
  if (!(amount > 0)) throw new ErpError("Enter an amount");
  ensureFunds(s, from, amount);
  const ref = c.nextRef("FT");
  s.payments.unshift({ id: uid(), ref, at: Date.now(), method: from, amount: -amount, kind: "TRANSFER", source: `→ ${to}`, user: c.user });
  s.payments.unshift({ id: uid(), ref, at: Date.now(), method: to, amount, kind: "TRANSFER", source: `← ${from}`, user: c.user });
  c.audit("FLOAT TRANSFER", `${from} → ${to} • ${amount}`);
});

// ---------- Read-only totals ----------
export function purchaseTotals(s: ErpState, from = 0, to = Date.now()) {
  const inR = (at: number) => at >= from && at <= to;
  const purchases = r2(s.purchases.filter((x) => inR(x.at)).reduce((a, x) => a + x.total, 0) - s.purchaseReturns.filter((x) => inR(x.at)).reduce((a, x) => a + x.amount, 0));
  const expenses = r2(s.expenses.filter((x) => inR(x.at)).reduce((a, x) => a + x.amount, 0));
  const payroll = r2(s.payrollPayments.filter((x) => inR(x.at)).reduce((a, x) => a + x.amount, 0));
  const payables = r2(s.suppliers.reduce((a, x) => a + Math.max(0, x.balance), 0));
  return { purchases, expenses, payroll, payables };
}
