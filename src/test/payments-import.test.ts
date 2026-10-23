import { expect, test } from "vitest";
import { pastedSheet, detect } from "@/lib/full-import";
test("paste + detect customer payments", () => {
  const sh = pastedSheet("Date\tCustomer\tAmount\tPayment Method\n2026-09-01\tAli\t500\tCash");
  expect(sh.rows[0]!["Customer"]).toBe("Ali");
  expect(detect({ ...sh, sheet: "Customer Payments" }).cat).toBe("Customer Payments");
});
