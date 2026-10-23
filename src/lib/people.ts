import { commit, uid, ErpError, type ContactDetails, type NewEmployee, type PayrollDraft, type Method } from "@/lib/erp";
import { floatBalances } from "@/lib/finance";

export type ContactInput = ContactDetails & { name: string; phone?: string | undefined; category?: string | undefined; info?: string | undefined };
export function saveContact(kind: "customers" | "suppliers" | "otherContacts", input: ContactInput, id?: string) {
  return commit((s, c) => {
    if (!input.name.trim()) throw new ErpError("Enter a name");
    if (input.email && !/^\S+@\S+\.\S+$/.test(input.email)) throw new ErpError("Enter a valid email");
    const rows = s[kind];
    if (rows.some((x) => x.id !== id && ((input.phone && x.phone === input.phone.trim()) || x.name.toLowerCase() === input.name.trim().toLowerCase()))) throw new ErpError("Contact already exists");
    const data = { ...input, name: input.name.trim(), phone: input.phone?.trim(), active: input.active ?? true };
    if (id) {
      const x = rows.find((x) => x.id === id); if (!x) throw new ErpError("Contact not found");
      const before = JSON.stringify(x); Object.assign(x, data);
      c.audit("CONTACT EDITED", `${kind} • ${before} → ${JSON.stringify(x)}`); return x;
    }
    const x = { ...data, id: uid(), balance: 0, createdAt: Date.now() };
    rows.push(x); c.audit("CONTACT CREATED", `${kind} • ${x.name}`); return x;
  });
}
export const addContactCategory = (name: string) => commit((s, c) => {
  if (!name.trim()) throw new ErpError("Enter a name");
  if (s.contactCategories.some((x) => x.name.toLowerCase() === name.trim().toLowerCase())) throw new ErpError("Category already exists");
  s.contactCategories.push({ id: uid(), name: name.trim() }); c.audit("CONTACT CATEGORY", name.trim());
});
export function editEmployee(id: string, input: NewEmployee) {
  return commit((s, c) => {
    const x = s.employees.find((e) => e.id === id); if (!x) throw new ErpError("Employee not found");
    if (!input.name.trim() || !Number.isFinite(input.salary) || input.salary < 0 || (input.comp !== "commission" && input.salary <= 0)) throw new ErpError("Enter a valid name and salary");
    if (!Number.isFinite(input.rule.value) || input.rule.value < 0 || (input.rule.kind !== "fixed" && input.rule.value > 100)) throw new ErpError("Enter a valid commission rule");
    const before = JSON.stringify(x); Object.assign(x, input, { name: input.name.trim() }); c.audit("EMPLOYEE EDITED", `${before} → ${JSON.stringify(x)}`); return x;
  });
}
export const savePayrollDraft = (input: Omit<PayrollDraft, "id" | "at">, id?: string) => commit((s, c) => {
  if (!s.employees.some((e) => e.id === input.employeeId) || !(input.to >= input.from) || !(input.deductions >= 0)) throw new ErpError("Choose a valid employee and period");
  const x = { ...input, id: id ?? uid(), at: Date.now() };
  const i = s.payrollDrafts.findIndex((d) => d.id === id); if (i >= 0) s.payrollDrafts[i] = x; else s.payrollDrafts.unshift(x);
  c.audit("PAYROLL DRAFT", x.id); return x;
});
/** Multiple actual methods are validated and written in one transaction, never halfway. */
export function settlePeople(kind: "customer" | "supplier" | "payroll", id: string, parts: Record<Method, number>) {
  return commit((s, c) => {
    const total = parts.cash + parts.mpesa + parts.bank;
    if (![parts.cash, parts.mpesa, parts.bank, parts.credit].every((v) => Number.isFinite(v) && v >= 0) || !(total > 0)) throw new ErpError("Enter a valid payment");
    const person = kind === "customer" ? s.customers.find((x) => x.id === id) : kind === "supplier" ? s.suppliers.find((x) => x.id === id) : s.payrolls.find((x) => x.id === id);
    if (!person) throw new ErpError("Record not found");
    const due = "balance" in person ? person.balance : person.net - person.paid;
    if (total > due + 0.001) throw new ErpError("Amount is more than the outstanding balance");
    const b = floatBalances(s);
    if (kind !== "customer" && (["cash", "mpesa", "bank"] as const).some((m) => parts[m] > b[m] + 0.001)) throw new ErpError("Not enough money in the account");
    if ("balance" in person) person.balance = Math.round((person.balance - total) * 100) / 100; else person.paid = Math.round((person.paid + total) * 100) / 100;
    if (kind !== "payroll") {
      let left = total;
      const docs = kind === "customer" ? s.sales.filter((x) => x.customerId === id) : s.purchases.filter((x) => x.supplierId === id);
      for (const doc of docs.sort((a, b) => a.at - b.at)) {
        const returns = kind === "customer" ? s.returns.filter((r) => r.saleId === doc.id && r.refund === "credit") : s.purchaseReturns.filter((r) => r.purchaseId === doc.id && r.refund === "credit");
        const balance = Math.max(0, doc.pay.credit - (doc.settled ?? 0) - returns.reduce((a, x) => a + x.amount, 0));
        const take = Math.min(left, balance); doc.settled = Math.round(((doc.settled ?? 0) + take) * 100) / 100; left -= take;
      }
    }
    for (const method of ["cash", "mpesa", "bank"] as const) {
      if (!parts[method]) continue;
      const ref = c.nextRef(kind === "payroll" ? "PP" : "PAY");
      if (kind === "payroll" && "employeeId" in person) {
        s.payrollPayments.unshift({ id: uid(), ref, at: Date.now(), payrollId: id, employeeId: person.employeeId, method, amount: parts[method], user: c.user });
        if (method === "cash") s.cash.unshift({ id: uid(), at: Date.now(), type: "CASH OUT", amount: parts[method], note: `Payroll ${person.ref}`, user: c.user });
      } else if ("name" in person) s.payments.unshift({ id: uid(), ref, at: Date.now(), method, amount: kind === "customer" ? parts[method] : -parts[method], kind: kind === "customer" ? "DEBT" : "SUPPLIER PAYMENT", source: person.name, customerId: kind === "customer" ? id : undefined, user: c.user });
    }
    c.audit("PAYMENT", `${kind} • ${id} • ${JSON.stringify(parts)}`); return true;
  });
}