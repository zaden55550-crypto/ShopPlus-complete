import { describe, it, expect, beforeEach } from "vitest";
import * as XLSX from "xlsx";
import { importFull, planSheets, previewFull } from "@/lib/full-import";
import { readSheets } from "@/lib/opening-import";
import { load } from "@/lib/erp";
import { balanceSheet } from "@/lib/accounting";

const book = () => {
  const wb = XLSX.utils.book_new();
  const add = (name: string, rows: (string | number)[][]) => XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), name);
  add("Products", [["Product Name", "SKU", "Buying Price", "Selling Price", "Quantity"], ["Sugar 1kg", "SUG1", 120, 150, 20], ["Rice 2kg", "RIC2", 200, 260, 10]]);
  add("Customers", [["Customer Name", "Phone"], ["Amina Hassan", "0711000111"]]);
  add("Opening", [["Account Type", "Account", "Opening Amount", "Effective Date"], ["Cash", "Drawer", 5000, "01/01/2026"], ["M-Pesa", "Till", 2000, "01/01/2026"]]);
  add("Sales", [["Type", "Receipt No", "Date", "Customer", "Product", "Qty", "Unit Price", "Cash"], ["Sale", "R-1", "02/01/2026", "Amina Hassan", "Sugar 1kg", 2, 150, 300], ["Sale", "R-2", "03/01/2026", "", "Rice 2kg", 1, 260, 260]]);
  add("Returns", [["Type", "Return No", "Original Receipt", "Date", "Product", "Qty", "Refund"], ["Sale Return", "RET-1", "R-1", "04/01/2026", "Sugar 1kg", 1, "Cash"]]);
  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  const f = new File([buf], "business.xlsx"); Object.defineProperty(f, "arrayBuffer", { value: async () => buf }); return f;
};
const o = { dateFmt: "DMY" as const, stock: "update" as const };

describe("full business import", () => {
  beforeEach(() => localStorage.clear());
  it("detects every sheet, previews without saving, imports in order and never duplicates", async () => {
    const plans = planSheets(await readSheets([book()]));
    expect(plans.map((p) => p.cat)).toEqual(["Products", "Customers", "Opening Balances", "Sales & Purchases", "Returns"]);
    const before = localStorage.getItem("shopbook.erp");
    const pre = previewFull(plans, o);
    expect(pre.every((r) => !r.error)).toBe(true);
    expect(pre.find((r) => r.cat === "Returns")!.created).toBe(1); // links to a sale from the same workbook
    expect(localStorage.getItem("shopbook.erp")).toBe(before);
    const { results, batch } = importFull(plans, o);
    expect(results.map((r) => [r.cat, r.created])).toEqual([["Products", 2], ["Customers", 1], ["Opening Balances", 2], ["Sales & Purchases", 2], ["Returns", 1]]);
    const s = load();
    expect(s.products.find((p) => p.sku === "SUG1")!.qty).toBe(19);
    expect(s.sales.length).toBe(2);
    expect(s.payments.filter((p) => p.kind === "OPENING").length).toBe(2);
    expect(balanceSheet(s).balanced).toBe(true);
    expect(batch.categories[0]).toBe("Full Business Import");
    const again = importFull(plans, o);
    expect(again.results.reduce((a, r) => a + r.created, 0)).toBe(0);
    expect(load().sales.length).toBe(2);
    expect(load().payments.filter((p) => p.kind === "OPENING").length).toBe(2);
  });
});
