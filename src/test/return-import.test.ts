import { describe, it, expect, beforeEach } from "vitest";
import { applyTX, previewTX, suggestTX, TX_TEMPLATE, type TXOptions } from "@/lib/transaction-import";
import { applyRT, previewRT, suggestRT, RT_TEMPLATE } from "@/lib/return-import";
import type { Sheet } from "@/lib/opening-import";
import { load } from "@/lib/erp";
import { balanceSheet } from "@/lib/accounting";
const csv = (t: string): Sheet => { const [h, ...r] = t.trim().split("\n").map((l) => l.split(",")); return { file: "t.csv", sheet: "Sheet1", columns: h!, rows: r.map((x) => Object.fromEntries(h!.map((c, i) => [c, x[i] ?? ""]))) }; };
const o: TXOptions = { stock: "update", createProducts: true, dateFmt: "DMY" };
const rt = (t: string) => { const s = csv(t); return previewRT(load(), [{ sheet: s, mapping: suggestRT(s.columns) }]); };
describe("returns import", () => {
  beforeEach(() => { localStorage.clear(); const s = csv(TX_TEMPLATE); applyTX(previewTX(load(), [{ sheet: s, mapping: suggestTX(s.columns) }], o), o); });
  it("posts sale and purchase returns against originals, once", () => {
    const g = rt(RT_TEMPLATE); expect(g.map((x) => x.status)).toEqual(["VALID", "VALID"]);
    expect(applyRT(g)).toMatchObject({ sales: 1, purchases: 1 });
    const s = load();
    expect(s.products.find((p) => p.name === "Sugar 1kg")!.qty).toBe(18);
    expect(s.products.find((p) => p.name === "Rice 2kg")!.qty).toBe(2);
    expect(s.suppliers.find((x) => x.name === "Bidco Ltd")!.balance).toBe(1950);
    expect(new Date(s.returns[0]!.at).getDate()).toBe(7);
    expect(balanceSheet(s).balanced).toBe(true);
    expect(rt(RT_TEMPLATE).every((x) => x.status === "DUPLICATE")).toBe(true);
  });
  it("rejects unknown originals and over-returns", () => {
    const g = rt("Type,Return No,Original Receipt,Date,Product,Qty,Refund\nSale,X1,NOPE,01/02/2026,Sugar 1kg,1,Cash\nSale,X2,R-1001,01/02/2026,Sugar 1kg,5,Cash");
    expect(g.map((x) => x.status)).toEqual(["INVALID", "INVALID"]);
  });
});
