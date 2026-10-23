import { describe, expect, it } from "vitest";
import { loadDemoData } from "../lib/demo";
import { load } from "../lib/erp";
import { resetData } from "../lib/reset-data";
describe("Delete & Reset", () => {
  it("deletes only chosen groups", () => { localStorage.clear(); loadDemoData(); resetData(["Expenses"], false); const s = load(); expect(s.expenses).toHaveLength(0); expect(s.sales.length).toBeGreaterThan(0); });
  it("delete everything leaves a new-user shop", () => { localStorage.clear(); loadDemoData(); localStorage.setItem("shopbook.reconcile", "[]"); resetData([], true); const s = load(); expect(s.products.length + s.sales.length + s.customers.length + s.purchases.length).toBe(0); expect(localStorage.getItem("shopbook.reconcile")).toBeNull(); });
});
