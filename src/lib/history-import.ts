// Historical imports for Payroll, Float movements, Stock transfers and Stock adjustments.
// Each sheet is applied in ONE ERP commit; rows go through the same records the apps use
// (payrolls/payrollPayments, payments ledger, transfers + movements, ADJUSTMENT movements),
// so Float, Accounting and Reports read them with no separate totals.
// Every row gets an import key stored in seq["__import:<key>"], so re-importing never posts twice.
import { commit, uid, type ErpState, type Method } from "@/lib/erp";
import { parseDate, type DateFmt, type OBIssue, type Sheet } from "@/lib/opening-import";

export type HistoryCat = "Stock Adjustments" | "Stock Transfers" | "Float Movements" | "Payroll History" | "Customer Payments" | "Supplier Payments" | "Cash-ups";
export const HISTORY_CATS: HistoryCat[] = ["Stock Adjustments", "Stock Transfers", "Float Movements", "Payroll History", "Customer Payments", "Supplier Payments", "Cash-ups"];
type F = { key: string; label: string; required?: boolean; aliases: string[] };
const PRODUCT: F = { key: "product", label: "Product", required: true, aliases: ["product", "item", "product name", "item name", "sku", "barcode"] };
const DATE: F = { key: "date", label: "Date", aliases: ["date", "day", "transaction date"] };
const REF: F = { key: "ref", label: "Reference", aliases: ["ref", "reference", "ref no", "number", "id"] };
export const HISTORY_FIELDS: Record<HistoryCat, F[]> = {
  "Stock Adjustments": [DATE, PRODUCT, { key: "counted", label: "Counted quantity", aliases: ["counted", "counted qty", "counted quantity", "physical count", "new qty", "actual"] }, { key: "change", label: "Quantity change", aliases: ["change", "qty change", "quantity change", "adjustment", "difference", "variance"] }, { key: "reason", label: "Reason", aliases: ["reason", "note", "notes", "remarks"] }, REF],
  "Stock Transfers": [DATE, PRODUCT, { key: "qty", label: "Quantity", required: true, aliases: ["qty", "quantity", "units"] }, { key: "from", label: "From shop", aliases: ["from", "from shop", "source", "origin"] }, { key: "to", label: "To shop", required: true, aliases: ["to", "to shop", "destination", "branch"] }, { key: "status", label: "Status", aliases: ["status", "state"] }, REF],
  "Float Movements": [DATE, { key: "type", label: "Movement type", required: true, aliases: ["type", "movement type", "movement", "kind"] }, { key: "account", label: "Account", required: true, aliases: ["account", "from account", "method", "wallet"] }, { key: "toAccount", label: "To account", aliases: ["to account", "to", "destination account"] }, { key: "amount", label: "Amount", required: true, aliases: ["amount", "value", "total"] }, { key: "note", label: "Note", aliases: ["note", "notes", "description", "details"] }, REF],
  "Customer Payments": [DATE, { key: "party", label: "Customer", required: true, aliases: ["customer", "customer name", "name", "client", "debtor"] }, { key: "amount", label: "Amount", required: true, aliases: ["amount", "amount paid", "paid", "value"] }, { key: "method", label: "Payment method", required: true, aliases: ["method", "payment method", "paid via", "account"] }, REF],
  "Supplier Payments": [DATE, { key: "party", label: "Supplier", required: true, aliases: ["supplier", "supplier name", "name", "vendor", "creditor"] }, { key: "amount", label: "Amount", required: true, aliases: ["amount", "amount paid", "paid", "value"] }, { key: "method", label: "Payment method", required: true, aliases: ["method", "payment method", "paid via", "account"] }, REF],
  "Cash-ups": [DATE, { key: "expected", label: "Expected cash", aliases: ["expected", "expected cash", "system cash"] }, { key: "counted", label: "Counted cash", required: true, aliases: ["counted", "counted cash", "actual cash", "cash counted"] }, { key: "note", label: "Note", aliases: ["note", "notes", "remarks"] }],
  "Payroll History": [{ key: "employee", label: "Employee", required: true, aliases: ["employee", "staff", "name", "employee name"] }, { key: "from", label: "Period from", aliases: ["from", "period from", "start", "period start"] }, { key: "to", label: "Period to", aliases: ["to", "period to", "end", "period end"] }, { key: "salary", label: "Salary", aliases: ["salary", "basic", "basic pay"] }, { key: "commission", label: "Commission", aliases: ["commission"] }, { key: "deductions", label: "Deductions", aliases: ["deductions", "deduction"] }, { key: "paid", label: "Amount paid", aliases: ["paid", "amount paid", "payment"] }, { key: "method", label: "Payment method", aliases: ["method", "payment method", "paid via", "account"] }, { key: "date", label: "Payment date", aliases: ["payment date", "date", "paid on"] }, REF],
};

const k = (x: unknown) => String(x ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
const t = (x: unknown) => String(x ?? "").trim();
const num = (x: unknown) => { const v = t(x).replace(/ksh|kes|,|\s/gi, ""); const n = Number(v); return v && Number.isFinite(n) ? n : NaN; };
export function suggestHistory(cat: HistoryCat, cols: string[]): Record<string, string | undefined> {
  const used = new Set<string>(), out: Record<string, string | undefined> = {};
  for (const f of HISTORY_FIELDS[cat]) {
    const names = [f.label, ...f.aliases].map(k);
    const c = cols.find((c) => !used.has(c) && names.includes(k(c)));
    if (c) { out[f.key] = c; used.add(c); }
  }
  return out;
}
const account = (x: unknown): Exclude<Method, "credit"> | null => { const v = k(x); return /cash/.test(v) ? "cash" : /mpesa|mobile|till|paybill/.test(v) ? "mpesa" : /bank|cheque/.test(v) ? "bank" : null; };
const findProduct = (s: ErpState, v: string) => s.products.find((p) => k(p.sku) === k(v) && v) ?? s.products.find((p) => k(p.barcode) === k(v) && v) ?? s.products.find((p) => k(p.name) === k(v));
const marker = (key: string) => `__import:${key}`;

export type HistoryResult = { total: number; created: number; skipped: number; rejected: number; issues: OBIssue[] };

/** Applies one category's sheets. Bad rows are rejected with a reason; good rows save together. */
export function applyHistory(cat: HistoryCat, sheets: { sheet: Sheet; map: Record<string, string | undefined> }[], o: { dateFmt: DateFmt; stock: "update" | "record" }): HistoryResult {
  return commit((s, c) => {
    const r: HistoryResult = { total: 0, created: 0, skipped: 0, rejected: 0, issues: [] };
    for (const { sheet, map } of sheets) sheet.rows.forEach((row, i) => {
      const g = (f: string) => (map[f] ? row[map[f]!] : undefined);
      if (!Object.values(map).some((col) => col && t(row[col]))) return;
      r.total++;
      const bad = (field: string, problem: string, suggestion: string) => { r.rejected++; r.issues.push({ file: sheet.file, sheet: sheet.sheet, row: i + 2, field, problem, suggestion }); };
      const dRaw = g("date"), at = t(dRaw) || dRaw instanceof Date ? parseDate(dRaw, o.dateFmt) : Date.now();
      if (at === null) return bad("Date", `“${t(dRaw)}” is not a date`, "Use YYYY-MM-DD");
      const key = `${k(cat)}|${k(g("ref"))}|${Object.keys(map).map((f) => k(g(f))).join("|")}`;
      if (s.seq[marker(key)]) { r.skipped++; return; }
      try {
        if (cat === "Stock Adjustments" || cat === "Stock Transfers") {
          const p = findProduct(s, t(g("product"))); if (!p) return bad("Product", `“${t(g("product"))}” not found`, "Import the product first or fix the name/SKU");
          if (cat === "Stock Adjustments") {
            const counted = num(g("counted")), change = num(g("change"));
            const delta = Number.isFinite(change) ? change : Number.isFinite(counted) ? Math.round((counted - p.qty) * 1000) / 1000 : NaN;
            if (!Number.isFinite(delta)) return bad("Quantity", "No counted quantity or change", "Fill Counted quantity or Quantity change");
            if (delta === 0) { r.skipped++; return; }
            c.move(p.id, "ADJUSTMENT", delta, t(g("reason")) || "Imported adjustment", t(g("ref")) || c.nextRef("ADJ"));
            s.movements[0]!.at = at;
            c.audit("STOCK ADJUSTMENT", `Import • ${p.name} • ${delta > 0 ? "+" : ""}${delta}`);
          } else {
            const qty = num(g("qty")), to = t(g("to"));
            if (!(qty > 0)) return bad("Quantity", "Quantity must be more than 0", "Enter a positive number");
            if (!to) return bad("To shop", "Destination missing", "Enter the shop the stock went to");
            const st = k(g("status")), status = /cancel/.test(st) ? "CANCELLED" : /pend/.test(st) ? "PENDING" : /sent|transit/.test(st) ? "SENT" : "RECEIVED";
            const ref = t(g("ref")) || c.nextRef("TR");
            if ((status === "SENT" || status === "RECEIVED") && o.stock === "update") { c.move(p.id, "TRANSFER OUT", -qty, `To ${to}`, ref); s.movements[0]!.at = at; }
            s.transfers.unshift({ id: uid(), ref, productId: p.id, qty, from: t(g("from")) || "This shop", to, status, at, user: c.user });
            c.audit("TRANSFER IMPORTED", `${ref} • ${qty} → ${to} • ${status}`);
          }
        } else if (cat === "Float Movements") {
          const amt = Math.abs(num(g("amount"))), from = account(g("account")), ty = k(g("type"));
          if (!(amt > 0)) return bad("Amount", "Amount must be more than 0", "Enter numbers only");
          if (!from) return bad("Account", `“${t(g("account"))}” is not Cash, M-Pesa or Bank`, "Use Cash, M-Pesa or Bank");
          const ref = t(g("ref")) || c.nextRef(/transfer/.test(ty) ? "FT" : "FL"), note = t(g("note"));
          if (/transfer|move/.test(ty)) {
            const to = account(g("toAccount")); if (!to || to === from) return bad("To account", "Transfer needs a different To account", "Use Cash, M-Pesa or Bank");
            s.payments.unshift({ id: uid(), ref, at, method: from, amount: -amt, kind: "TRANSFER", source: `→ ${to}`, importKey: `${key}|out`, user: c.user });
            s.payments.unshift({ id: uid(), ref, at, method: to, amount: amt, kind: "TRANSFER", source: `← ${from}`, importKey: `${key}|in`, user: c.user });
          } else if (/deposit|in|add|topup/.test(ty) || /withdraw|out|drawing/.test(ty)) {
            const dep = !/withdraw|out|drawing/.test(ty);
            s.payments.unshift({ id: uid(), ref, at, method: from, amount: dep ? amt : -amt, kind: dep ? "DEPOSIT" : "WITHDRAWAL", source: note || (dep ? "Owner deposit" : "Owner withdrawal"), importKey: key, user: c.user });
          } else return bad("Movement type", `“${t(g("type"))}” not recognised`, "Use Deposit, Withdrawal or Transfer");
          c.audit("FLOAT IMPORTED", `${ref} • ${from} • ${amt}`);
        } else if (cat === "Customer Payments" || cat === "Supplier Payments") {
          const cust = cat === "Customer Payments", name = t(g("party")), amt = num(g("amount")), method = account(g("method"));
          const p = (cust ? s.customers : s.suppliers).find((x) => k(x.name) === k(name));
          if (!p) return bad(cust ? "Customer" : "Supplier", `“${name}” not found`, "Import the contact first");
          if (!(amt > 0)) return bad("Amount", "Amount must be more than 0", "Enter numbers only");
          if (!method) return bad("Payment method", `“${t(g("method"))}” is not Cash, M-Pesa or Bank`, "Use Cash, M-Pesa or Bank");
          if (amt > p.balance + 0.001) return bad("Amount", `More than the ${p.balance} owed`, "Import the credit sales/purchases first or fix the amount");
          p.balance = Math.round((p.balance - amt) * 100) / 100;
          let left = amt;
          const docs = (cust ? s.sales.filter((x) => x.customerId === p.id) : s.purchases.filter((x) => x.supplierId === p.id)).sort((a, b) => a.at - b.at);
          for (const d of docs) { if (left <= 0.001) break; const b = Math.max(0, d.pay.credit - (d.settled ?? 0)); if (b <= 0) continue; const take = Math.min(b, left); d.settled = Math.round(((d.settled ?? 0) + take) * 100) / 100; left -= take; }
          s.payments.unshift({ id: uid(), ref: t(g("ref")) || c.nextRef("PAY"), at, method, amount: cust ? amt : -amt, kind: cust ? "DEBT" : "SUPPLIER PAYMENT", source: p.name, customerId: cust ? p.id : undefined, supplierId: cust ? undefined : p.id, importKey: key, user: c.user });
          c.audit(cust ? "DEBT PAYMENT IMPORTED" : "SUPPLIER PAYMENT IMPORTED", `${p.name} • ${amt}`);
        } else if (cat === "Cash-ups") {
          const counted = num(g("counted")), exp = num(g("expected")), expected = Number.isFinite(exp) ? exp : counted;
          if (!(counted >= 0)) return bad("Counted cash", "Counted cash missing", "Enter numbers only");
          s.cash.unshift({ id: uid(), at, type: "CASH UP", amount: Math.round((counted - expected) * 100) / 100, expected, counted, note: t(g("note")) || "Imported cash-up", user: c.user });
          c.audit("CASH UP IMPORTED", `Expected ${expected} • Counted ${counted}`);
        } else {
          const name = t(g("employee")), e = s.employees.find((x) => k(x.name) === k(name));
          if (!e) return bad("Employee", `“${name}” not found`, "Import the employee first");
          const salary = num(g("salary")) || 0, commission = num(g("commission")) || 0, deductions = num(g("deductions")) || 0, paidRaw = num(g("paid")), paid = Number.isFinite(paidRaw) ? paidRaw : 0;
          const net = Math.round((salary + commission - deductions) * 100) / 100;
          if (salary < 0 || commission < 0 || deductions < 0 || paid < 0) return bad("Amount", "Amounts can't be negative", "Fix the numbers");
          if (net < 0) return bad("Deductions", "Deductions exceed gross pay", "Check salary, commission and deductions");
          if (paid > net + 0.001) return bad("Amount paid", "Paid is more than net pay", "Check the paid amount");
          const method = account(g("method")); if (paid > 0 && !method) return bad("Payment method", "Paid amount needs Cash, M-Pesa or Bank", "Fill Payment method");
          const pf = g("from"), pt = g("to"), from = t(pf) || pf instanceof Date ? parseDate(pf, o.dateFmt) : at, to = t(pt) || pt instanceof Date ? parseDate(pt, o.dateFmt) : at;
          if (from === null || to === null || to < from) return bad("Period", "Period dates are invalid", "Use YYYY-MM-DD and From ≤ To");
          if (s.payrolls.some((p) => p.employeeId === e.id && p.from <= to && p.to >= from)) return bad("Period", "Payroll already exists for this period", "Remove the row or change the period");
          const run = { id: uid(), ref: t(g("ref")) || c.nextRef("PR"), at, employeeId: e.id, from, to, salary, commission, deductions, net, paid, user: c.user };
          s.payrolls.unshift(run);
          if (paid > 0 && method) s.payrollPayments.unshift({ id: uid(), ref: c.nextRef("PP"), at, payrollId: run.id, employeeId: e.id, method, amount: paid, user: c.user });
          c.audit("PAYROLL IMPORTED", `${run.ref} • ${e.name} • ${net}`);
        }
        s.seq[marker(key)] = 1; r.created++;
      } catch (err) { bad("Row", err instanceof Error ? err.message : String(err), "Fix the row and import again"); }
    });
    return r;
  });
}
