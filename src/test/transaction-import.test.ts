import { describe, it, expect, beforeEach } from "vitest";
import { applyTX, exportTX, previewTX, suggestTX, TX_TEMPLATE, type TXOptions } from "@/lib/transaction-import";
import type { Sheet } from "@/lib/opening-import";
import { load, addProduct } from "@/lib/erp";
import { floatBalances } from "@/lib/finance";
import { balanceSheet } from "@/lib/accounting";
const csv = (t: string): Sheet => { const [h, ...r] = t.trim().split("\n").map((l) => l.split(",")); return { file: "t.csv", sheet: "Sheet1", columns: h!, rows: r.map((x) => Object.fromEntries(h!.map((c, i) => [c, x[i] ?? ""]))) }; };
const o: TXOptions = { stock: "update", createProducts: true, dateFmt: "DMY" };
const prev = (t: string, opt = o) => { const s = csv(t); return previewTX(load(), [{ sheet: s, mapping: suggestTX(s.columns) }], opt); };
describe("sales & purchases import", () => {
  beforeEach(() => localStorage.clear());
  it("groups lines into one transaction each with original dates, payments, credit and stock", () => {
    const g = prev(TX_TEMPLATE);
    expect(g.map((x) => [x.ref, x.status, x.lines.length])).toEqual([["INV-77", "VALID", 2], ["R-1001", "VALID", 1], ["R-1002", "VALID", 2]]);
    const r = applyTX(g, o); expect(r).toMatchObject({ sales: 2, purchases: 1 });
    const s = load();
    const sale = s.sales.find((x) => x.ref === "R-1002")!; expect(sale.items.length).toBe(2); expect(sale.total).toBe(500); expect(sale.pay).toEqual({ cash: 0, mpesa: 200, bank: 0, credit: 300 });
    expect(new Date(sale.at).getDate()).toBe(5);
    expect(s.customers.find((c) => c.name === "Amina Hassan")!.balance).toBe(300);
    expect(s.suppliers.find((c) => c.name === "Bidco Ltd")!.balance).toBe(2450);
    expect(s.products.find((p) => p.name === "Sugar 1kg")!.qty).toBe(17); expect(s.products.find((p) => p.name === "Rice 2kg")!.qty).toBe(4);
    expect(floatBalances(s)).toEqual({ cash: -700, mpesa: 200, bank: 0 });
    expect(balanceSheet(s).balanced).toBe(true);
    const again = prev(TX_TEMPLATE); expect(again.every((x) => x.status === "DUPLICATE")).toBe(true);
    expect(applyTX(again, o).sales).toBe(0); expect(load().sales.length).toBe(2);
  });
  it("rejects bad totals, overpayment, unknown products, unpaid walk-ins and missing stock with reasons", () => {
    addProduct({ name: "Soap", buy: 50, sell: 80, qty: 1 } as never);
    const g = prev(`Type,Receipt No,Date,Product,Qty,Unit Price,Total,Cash
Sale,A1,01/02/2026,Soap,1,80,99,80
Sale,A2,01/02/2026,Soap,1,80,,200
Sale,A3,01/02/2026,Ghost,1,10,,10
Sale,A4,01/02/2026,Soap,1,80,,0
Sale,A5,01/02/2026,Soap,5,80,,400`, { ...o, createProducts: false });
    expect(g.every((x) => x.status === "INVALID")).toBe(true);
    expect(g.map((x) => x.issues[0]!.field)).toEqual(["Transaction total", "Payments", "Product", "Customer / supplier", "Quantity"]);
  });
  it("exported sales & purchases re-import as duplicates", () => {
    applyTX(prev(TX_TEMPLATE), o);
    const t = exportTX(load()).replaceAll('"', "");
    expect(prev(t).every((x) => x.status === "DUPLICATE")).toBe(true);
  });
});
