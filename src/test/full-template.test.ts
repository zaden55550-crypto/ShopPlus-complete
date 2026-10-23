import { test, expect } from "vitest";
import * as XLSX from "xlsx";
import { fullTemplateBytes, planSheets } from "@/lib/full-import";
test("tpl", async () => { const wb = XLSX.read(new Uint8Array(await fullTemplateBytes()), { type: "array" }); expect(wb.SheetNames.length).toBe(21);
 const sheets = wb.SheetNames.slice(1).map((n) => { const cols = (XLSX.utils.sheet_to_json<string[]>(wb.Sheets[n]!, { header: 1 })[0]) as string[]; return { file: "t", sheet: n, columns: cols, rows: [Object.fromEntries(cols.map(c=>[c,"x"]))] }; });
 expect(planSheets(sheets as never).map((p) => p.cat)).not.toContain("Skip"); });
