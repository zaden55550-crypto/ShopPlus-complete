import { test, expect, beforeEach } from "vitest";
import { load } from "@/lib/erp";
import { applyHistory } from "@/lib/history-import";
import { floatBalances } from "@/lib/finance";
beforeEach(() => localStorage.clear());
const sh = (rows: Record<string, unknown>[]) => ({ file: "f", sheet: "s", columns: Object.keys(rows[0]!), rows });
test("float, adjustments, dedupe", () => {
  const o = { dateFmt: "auto" as const, stock: "update" as const };
  const fl = sh([{ Date: "2026-01-02", Type: "Deposit", Account: "Cash", Amount: 1000 }, { Date: "2026-01-03", Type: "Transfer", Account: "Cash", "To account": "Bank", Amount: 400 }]);
  const map = { date: "Date", type: "Type", account: "Account", toAccount: "To account", amount: "Amount" };
  expect(applyHistory("Float Movements", [{ sheet: fl, map }], o).created).toBe(2);
  expect(applyHistory("Float Movements", [{ sheet: fl, map }], o).skipped).toBe(2);
  const b = floatBalances(load()); expect(b.cash).toBe(600); expect(b.bank).toBe(400);
}); 
