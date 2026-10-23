import { describe, it, expect, beforeEach } from "vitest";
import { previewTX, suggestTX, type TXOptions } from "@/lib/transaction-import";
import type { Sheet } from "@/lib/opening-import";
import { load } from "@/lib/erp";
const o: TXOptions = { stock: "record", createProducts: true, dateFmt: "DMY" };
const sh = (h: string[], rows: string[][]): Sheet => ({ file: "t", sheet: "Sales", columns: h, rows: rows.map((r) => Object.fromEntries(h.map((c, i) => [c, r[i] ?? ""]))) });
const H = ["Type", "Receipt No", "Date", "Customer", "Product", "Qty", "Unit Price", "Amount Paid", "Payment Method"];
const run = (rows: string[][]) => previewTX(load(), [{ sheet: sh(H, rows), mapping: suggestTX(H) }], o);
describe("import payments", () => {
  beforeEach(() => localStorage.clear());
  it("counts a payment repeated on every item line once", () => {
    const g = run([["Sale", "SAL-003", "01/02/2026", "Ali", "Meat", "0.5", "800", "1000", "Cash"], ["Sale", "SAL-003", "01/02/2026", "Ali", "Fabric", "3.25", "200", "1000", "Cash"]]);
    expect(g[0]!.total).toBe(1050); expect(g[0]!.pay).toEqual({ cash: 1000, mpesa: 0, bank: 0, credit: 50 }); expect(g[0]!.status).toBe("VALID");
  });
  it("splits mixed payments across rows and rejects 'Mixed'", () => {
    const g = run([["Sale", "S1", "01/02/2026", "", "A", "1", "400", "400", "Cash"], ["Sale", "S1", "01/02/2026", "", "B", "1", "300", "200", "M-Pesa"], ["Sale", "S1", "01/02/2026", "", "C", "0", "0", "100", "Bank"]]);
    expect(g[0]!.pay.cash + g[0]!.pay.mpesa + g[0]!.pay.bank).toBe(700);
    const bad = run([["Sale", "S2", "01/02/2026", "", "A", "1", "100", "100", "Mixed"]]);
    expect(bad[0]!.status).toBe("INVALID"); expect(bad[0]!.issues[0]!.problem).toMatch(/Mixed/);
  });
});
