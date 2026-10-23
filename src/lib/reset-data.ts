import { commit, empty, type ErpState } from "@/lib/erp";

/** Groups of ERP collections the owner can wipe. Linked records are removed together so balances never point at missing documents. */
export const RESET_GROUPS: Record<string, (keyof ErpState)[]> = {
  "Sales & returns": ["sales", "returns", "commissions"],
  "Purchases & supplier returns": ["purchases", "purchaseReturns"],
  Expenses: ["expenses", "expenseCategories"],
  "Payments, Float & cash-up": ["payments", "cash"],
  "Products & stock": ["products", "categories", "brands", "movements", "transfers"],
  Contacts: ["customers", "suppliers", "otherContacts", "contactCategories"],
  Payroll: ["employees", "payrolls", "payrollPayments", "payrollDrafts"],
};
export const LOCAL_KEYS = ["shopbook.reconcile", "shopbook.importHistory", "shopbook.purchaseDrafts", "shopbook.savedReports"];

export function resetData(groups: string[], everything: boolean) {
  const keys = everything ? Object.values(RESET_GROUPS).flat() : groups.flatMap((g) => RESET_GROUPS[g] ?? []);
  if (!keys.length) throw new Error("Choose what to delete");
  const fresh = empty();
  commit((s, c) => {
    for (const k of keys) (s as Record<string, unknown>)[k] = fresh[k];
    // Money balances that depended on deleted documents are zeroed.
    if (keys.includes("sales") || keys.includes("payments")) s.customers.forEach((x) => { x.balance = 0; });
    if (keys.includes("purchases") || keys.includes("payments")) s.suppliers.forEach((x) => { x.balance = 0; });
    if (keys.includes("movements")) s.products.forEach((p) => { p.qty = 0; });
    if (everything) { s.audit = []; s.seq = {}; }
    const now = Date.now(); for (const k of keys) s.seq[`__reset:${String(k)}`] = now;
    c.audit(everything ? "ALL DATA DELETED" : "DATA DELETED", everything ? "Shop reset to a new start" : groups.join(", "));
  });
  if (everything) LOCAL_KEYS.forEach((k) => localStorage.removeItem(k));
  window.dispatchEvent(new Event("shopbook-prefs"));
}
