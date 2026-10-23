import { beforeEach, expect, it } from "vitest";
import * as erp from "@/lib/erp";
import { backupJson, restoreJson } from "@/lib/backup";
import { performance, position } from "@/lib/summary";

beforeEach(() => localStorage.clear());

it("summarises sales and restores a backup, rejecting damaged files", () => {
  const p = erp.addProduct({ name: "Soap", buy: 50, sell: 100, qty: 10 } as erp.NewProduct);
  const c = erp.addCustomer("Jane");
  erp.confirmSale({ cart: [{ productId: p.id, qty: 4 }], discount: 0, pay: { cash: 300, mpesa: 0, bank: 0, credit: 100 }, customerId: c.id, channel: "POS" });
  const perf = performance(erp.load(), 0);
  expect(perf).toMatchObject({ total: 400, paid: 300, credit: 100, grossProfit: 200 });
  expect(position(erp.load())).toMatchObject({ stock: 300, receivables: 100 });
  const file = backupJson("Shop");
  erp.stockOut(p.id, 6, "Damaged");
  expect(() => restoreJson("{bad")).toThrow();
  expect(() => restoreJson(JSON.stringify({ app: "SHOPBOOK", data: { products: "x" } }))).toThrow();
  expect(erp.load().products[0]?.qty).toBe(0);
  restoreJson(file);
  expect(erp.load().products[0]?.qty).toBe(6);
  expect(erp.load().audit[0]?.action).toBe("BACKUP RESTORED");
});
