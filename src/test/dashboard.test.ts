import { describe, expect, it } from "vitest";
import { dashboardTotals } from "../lib/dashboard";
import { addProduct, confirmSale, load, returnSale } from "../lib/erp";

describe("Dashboard totals", () => {
  it("reads actual sales, returns and stock without changing ERP records", () => {
    localStorage.removeItem("shopbook.erp");
    const product = addProduct({ name: "Cable", buy: 100, sell: 200, qty: 10 });
    const sale = confirmSale({ cart: [{ productId: product.id, qty: 3 }], discount: 0, pay: { cash: 600, bank: 0, mpesa: 0, credit: 0 }, channel: "POS" });
    returnSale(sale.id, [{ productId: product.id, qty: 1 }], "cash");
    const before = localStorage.getItem("shopbook.erp");
    expect(dashboardTotals(load())).toEqual({ sales: 400, stock: 800, purchases: 0, expenses: 0, profit: 200 });
    expect(localStorage.getItem("shopbook.erp")).toBe(before);
    localStorage.removeItem("shopbook.erp");
  });
});