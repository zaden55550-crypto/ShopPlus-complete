import { describe, it, expect, beforeEach } from "vitest";
import { applyOB, previewOB, suggestOB, exportOB, type Sheet } from "@/lib/opening-import";
import { load } from "@/lib/erp";
import { floatBalances } from "@/lib/finance";
import { profitAndLoss, balanceSheet } from "@/lib/accounting";
const rows = [
  { ID: "A1", Type: "Cash", Account: "Drawer", Amount: "15,000", Date: "01/01/2026" },
  { ID: "A2", Type: "M-Pesa", Account: "Till", Amount: "42000", Date: "01/01/2026" },
  { ID: "A3", Type: "Bank", Account: "Equity", Amount: "120000", Date: "01/01/2026" },
  { ID: "A4", Type: "Customer receivable", Account: "Amina", Amount: "3500", Date: "01/01/2026" },
  { ID: "A5", Type: "Supplier payable", Account: "Bidco", Amount: "18000", Date: "01/01/2026" },
  { ID: "A6", Type: "Lottery", Account: "x", Amount: "abc", Date: "99/99/2026" },
];
const sheet = (r = rows): Sheet => ({ file: "ob.csv", sheet: "Sheet1", columns: Object.keys(r[0]!), rows: r });
const prev = (r = rows) => previewOB(load(), [{ sheet: sheet(r), mapping: suggestOB(Object.keys(r[0]!)) }], "DMY");
describe("opening balances import", () => {
  beforeEach(() => localStorage.clear());
  it("posts balances separately from income, explains invalid rows, and never double-posts", () => {
    const p = prev(); expect(p.filter((r) => r.status === "VALID").length).toBe(5); expect(p[5]!.status).toBe("INVALID");
    const b = applyOB(p, ["ob.csv"]); expect(b.created).toBe(5); expect(b.rejected).toBe(1); expect(b.status).toBe("Completed with Errors");
    const s = load();
    expect(floatBalances(s)).toEqual({ cash: 15000, mpesa: 42000, bank: 120000 });
    expect(s.customers.find((c) => c.name === "Amina")!.balance).toBe(3500);
    expect(s.suppliers.find((c) => c.name === "Bidco")!.balance).toBe(18000);
    expect(s.sales.length + s.purchases.length + s.expenses.length).toBe(0);
    expect(profitAndLoss(s).net).toBeCloseTo(0); expect(balanceSheet(s).balanced).toBe(true);
    const again = prev(); expect(again.filter((r) => r.status === "DUPLICATE").length).toBe(5);
    expect(applyOB(again, ["ob.csv"]).created).toBe(0); expect(floatBalances(load()).cash).toBe(15000);
  });
  it("exported balances re-import as duplicates, not new postings", () => {
    applyOB(prev(), ["ob.csv"]);
    const lines = exportOB(load()).split("\n").map((l) => l.slice(1, -1).split('","'));
    const heads = lines[0]!; const r = lines.slice(1).map((l) => Object.fromEntries(heads.map((h, i) => [h, l[i] ?? ""])));
    const p = previewOB(load(), [{ sheet: { file: "e.csv", sheet: "S", columns: heads, rows: r }, mapping: suggestOB(heads) }], "DMY");
    expect(p.every((x) => x.status === "DUPLICATE")).toBe(true);
  });
});
