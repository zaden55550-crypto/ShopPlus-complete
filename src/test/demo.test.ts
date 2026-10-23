import { describe, expect, it } from "vitest";
import { loadDemoData, resetDemoData, isDemo } from "../lib/demo";
import { load, stockStatus } from "../lib/erp";
import { floatBalances } from "../lib/finance";

describe("Demo seed", () => {
  it("builds the sample shop through real ERP actions and resets safely", () => {
    localStorage.clear();
    loadDemoData();
    const s = load();
    expect(isDemo()).toBe(true);
    expect(s.products).toHaveLength(25);
    expect(s.customers).toHaveLength(5);
    expect(s.customers.find((c) => c.name === "Brian Otieno")!.balance).toBe(25000);
    expect(s.customers.find((c) => c.name === "David Kiptoo")!.balance).toBe(0);
    expect(s.suppliers.find((x) => x.name === "East Africa Computers Ltd")!.balance).toBe(70000);
    expect(s.commissions.reduce((a, x) => a + x.amount, 0)).toBe(1900);
    expect(s.sales.filter((x) => !x.customerId).length).toBeGreaterThanOrEqual(3);
    expect(s.cash.find((e) => e.type === "CASH UP")!.amount).toBe(-1000);
    expect(stockStatus(s.products.find((p) => p.sku === "AUD-003")!)).toBe("OUT");
    expect(Object.values(floatBalances(s)).every((v) => v >= 0)).toBe(true);
    expect(() => loadDemoData()).toThrow();
    resetDemoData("TechPoint Electronics");
    expect(load().products).toHaveLength(25);
    expect(load().audit.some((a) => a.action === "DEMO DATA RESET")).toBe(true);
    localStorage.clear();
  });
});
