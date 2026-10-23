import { beforeEach, expect, it } from "vitest";
import * as erp from "@/lib/erp";

beforeEach(() => localStorage.clear());

it("earns commission on sale, adjusts on return, and pays payroll partially", () => {
  const p = erp.addProduct({ name: "Lotion", buy: 600, sell: 1000, qty: 20 } as erp.NewProduct);
  const e = erp.addEmployee({ name: "Amina", role: "Seller", comp: "salary+commission", salary: 30000, rule: { kind: "percent", value: 5, paidOnly: false } });
  const sale = erp.confirmSale({ cart: [{ productId: p.id, qty: 5 }], discount: 0, pay: { cash: 0, mpesa: 5000, bank: 0, credit: 0 }, channel: "POS", sellerId: e.id });
  expect(erp.load().commissions[0]?.amount).toBe(250);
  erp.returnSale(sale.id, [{ productId: p.id, qty: 2 }], "mpesa");
  const s = erp.load();
  expect(s.commissions[0]).toMatchObject({ kind: "RETURN ADJUSTMENT", amount: -100 });
  expect(erp.returnStatus(s.sales[0]!)).toBe("PARTIALLY RETURNED");
  expect(s.products[0]?.qty).toBe(17);
  const run = erp.confirmPayroll(e.id, 0, Date.now(), 1000);
  expect(run.net).toBe(29150);
  expect(() => erp.confirmPayroll(e.id, 0, Date.now(), 0)).toThrow();
  erp.payPayroll(run.id, "mpesa", 20000);
  expect(erp.load().payrolls[0]?.paid).toBe(20000);
  expect(() => erp.payPayroll(run.id, "bank", 10000)).toThrow();
});
