import { describe, it, expect, beforeEach } from "vitest";
import { previewTX, suggestTX, type TXOptions } from "@/lib/transaction-import";
import type { Sheet } from "@/lib/opening-import";
import { load } from "@/lib/erp";
const o: TXOptions = { stock: "record", createProducts: true, dateFmt: "DMY" };
const H = ["Transaction Type","Receipt No","Transaction Date","Customer Name","Product Name","Quantity","Unit Price","Discount (whole transaction)","Grand Total","Paid Cash","Paid Mpesa","Paid Bank","Amount Paid","Payment Method"];
const sh = (rows: string[][]): Sheet => ({ file: "t", sheet: "Sales - Purchases", columns: H, rows: rows.map((r) => Object.fromEntries(H.map((c, i) => [c, r[i] ?? ""]))) });
describe("demo workbook fixes", () => {
  beforeEach(() => localStorage.clear());
  it("reads ISO dates, long discount header, and split payments once", () => {
    const g = previewTX(load(), [{ sheet: sh([["Sale","SAL-1","2026-09-10","","Rice","2.5","240","50","720","180","252","288","720","Cash"],["Sale","SAL-1","2026-09-10","","Sugar","2","85","50","720","180","252","288","720","Cash"]]), mapping: suggestTX(H) }], o);
    expect(g[0]!.issues).toEqual([]); expect(g[0]!.total).toBe(720);
    expect(g[0]!.pay).toEqual({ cash: 180, mpesa: 252, bank: 288, credit: 0 });
    expect(new Date(g[0]!.at).getDate()).toBe(10);
  });
});
