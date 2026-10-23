import { describe, it, expect, beforeEach } from "vitest";
import { applyImport, previewRows, suggestMapping } from "@/lib/import-center";
import { load } from "@/lib/erp";
const raw = [{ Name: "Soap", "Buying Price": "50", "Selling Price": "80", Quantity: "10", SKU: "S1" }, { Name: "Rice", "Buying Price": "100", "Selling Price": "130", Quantity: "5", SKU: "R1" }, { Name: "", "Buying Price": "1", "Selling Price": "2", Quantity: "1", SKU: "" }];
const run = (action: "skip" | "update") => { const m = suggestMapping(Object.keys(raw[0]!), "Products"); const rows = previewRows(load(), raw, "Products", m, new Set(Object.values(m).filter(Boolean))); return applyImport("Products", "t.csv", rows, m, action); };
describe("import persistence", () => {
  beforeEach(() => localStorage.clear());
  it("saves valid rows, reports invalid, and skips repeats honestly", () => {
    const a = run("skip"); expect(a.imported).toBe(2); expect(a.failed).toBe(1);
    expect(load().products.filter((p) => ["Soap", "Rice"].includes(p.name)).map((p) => p.qty).sort()).toEqual([10, 5].sort());
    const b = run("skip"); expect(b.imported + b.updated).toBe(0); expect(load().products.length).toBe(2);
    const c = run("update"); expect(c.updated).toBe(2); expect(load().products.length).toBe(2);
  });
});
import { mergeErp } from "@/lib/shop-sync";
import { resetData } from "@/lib/reset-data";
describe("duplicate details & reset", () => {
  beforeEach(() => localStorage.clear());
  it("explains changed vs identical duplicates and never blanks values", () => {
    run("skip");
    const changed = [{ Name: "Soap", "Buying Price": "50", "Selling Price": "95", Quantity: "", SKU: "S1" }, { ...raw[1]! }];
    const m = suggestMapping(Object.keys(changed[0]!), "Products");
    const rows = previewRows(load(), changed, "Products", m, new Set(Object.values(m).filter(Boolean)));
    expect(rows[0]!.matchField).toBe("SKU"); expect(rows[0]!.diffs?.find((d) => d.field === "Selling price")).toEqual({ field: "Selling price", existing: "80", uploaded: "95" });
    expect(rows[1]!.identical).toBe(true);
    const r = applyImport("Products", "t.csv", rows, m, "updateOnly"); expect(r.updated).toBe(2);
    const soap = load().products.find((p) => p.sku === "S1")!; expect(soap.sell).toBe(95); expect(soap.qty).toBe(10);
  });
  it("reset is not undone by an old phone's sync data", () => {
    run("skip"); const old = load(); resetData([], true);
    const merged = mergeErp(load(), old); expect(merged.products.length).toBe(0);
  });
});
describe("opening stock root cause", () => {
  beforeEach(() => localStorage.clear());
  it("flags unmatched opening-stock rows instead of showing NEW and silently skipping", () => {
    const f = [{ SKU: "X9", "Opening Stock": "4" }];
    const m = suggestMapping(Object.keys(f[0]!), "Opening Stock");
    const rows = previewRows(load(), f, "Opening Stock", m, new Set(Object.values(m).filter(Boolean)));
    expect(rows[0]!.status).toBe("INVALID"); expect(rows[0]!.issues[0]!.suggestion).toMatch(/Products/);
  });
});
