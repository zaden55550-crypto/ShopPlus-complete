import { describe, it, expect, beforeEach } from "vitest";
import * as erp from "@/lib/erp";
const seed = () => erp.commit((s, c) => { s.products.push({ id: "m", name: "Meat", buy: 600, sell: 800, qty: 0, unit: "kg", createdAt: 1 }, { id: "f", name: "Fabric", buy: 100, sell: 200, qty: 0, unit: "yard", createdAt: 1 }, { id: "w", name: "Soap", buy: 70, sell: 100, qty: 0, createdAt: 1 }); c.move("m", "OPENING", 10); c.move("f", "OPENING", 10); c.move("w", "OPENING", 200); });
const pay = (cash: number) => ({ cash, mpesa: 0, bank: 0, credit: 0 });
describe("fractional, amount-based and override sales", () => {
  beforeEach(() => { localStorage.clear(); seed(); });
  it("KSh 100 of meat at 800/kg = 0.125 kg", () => {
    const r = erp.qtyForAmount(100, 800)!; expect(r).toEqual({ qty: 0.125, exact: true });
    const x = erp.confirmSale({ cart: [{ productId: "m", qty: r.qty }], discount: 0, pay: pay(100), channel: "POS" });
    expect(x.total).toBe(100); expect(erp.load().products.find((p) => p.id === "m")!.qty).toBe(9.875);
  });
  it("fabric fractions price correctly", () => { for (const [q, t] of [[0.25, 50], [0.75, 150], [3.25, 650], [4.75, 950]]) expect(erp.lineTotal(erp.load(), [{ productId: "f", qty: q! }])).toBe(t); });
  it("wholesale override keeps default price and is audited", () => {
    const x = erp.confirmSale({ cart: [{ productId: "w", qty: 100, price: 85, priceReason: "wholesale" }], discount: 0, pay: pay(8500), channel: "Sales" });
    const s = erp.load(); expect(x.total).toBe(8500); expect(s.products.find((p) => p.id === "w")!.sell).toBe(100); expect(s.audit.some((a) => a.action === "PRICE OVERRIDE")).toBe(true);
  });
  it("rejects duplicate cart lines", () => { expect(() => erp.confirmSale({ cart: [{ productId: "w", qty: 1 }, { productId: "w", qty: 1 }], discount: 0, pay: pay(200), channel: "POS" })).toThrow(); });
});
