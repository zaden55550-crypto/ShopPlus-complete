// Universal Import Center — historical Sales & Purchase Returns (phase 3).
// One row per returned item; rows sharing a return number form ONE return against its original receipt/invoice.
// Returns post atomically with original dates; the return number blocks re-import.
import { commit, ErpError, uid, type ErpState, type Method } from "@/lib/erp";
import type { Sheet } from "@/lib/opening-import";
import { findProduct, type TXIssue } from "@/lib/transaction-import";

export const RT_FIELDS = [
  { key: "type", label: "Sale or purchase return", required: false, aliases: ["type", "return type", "kind"] },
  { key: "ref", label: "Return number", required: true, aliases: ["return no", "return number", "return ref", "credit note", "credit note no", "ref", "return id"] },
  { key: "original", label: "Original receipt / invoice", required: true, aliases: ["original", "original receipt", "receipt", "receipt no", "invoice", "invoice no", "sale ref", "purchase ref", "original ref", "original transaction", "original transaction id", "original id", "transaction id", "sale id", "purchase id", "source id", "original sale", "original purchase", "original invoice"] },
  { key: "date", label: "Date", required: true, aliases: ["date", "return date"] },
  { key: "product", label: "Product (name, SKU or barcode)", required: true, aliases: ["product", "item", "product name", "sku", "barcode"] },
  { key: "qty", label: "Quantity returned", required: true, aliases: ["qty", "quantity", "returned", "qty returned"] },
  { key: "refund", label: "Refund method", required: false, aliases: ["refund", "refund method", "method", "payment method"] },
] as const;
export type RTField = (typeof RT_FIELDS)[number]["key"];
export type RTMapping = Partial<Record<RTField, string>>;
export type RTGroup = {
  key: string; kind: "SALE" | "PURCHASE"; ref: string; original: string; originalId?: string; at: number; refund: Method;
  lines: { product: string; productId?: string; qty: number; amount: number }[]; amount: number; rows: number[];
  status: "VALID" | "DUPLICATE" | "INVALID"; issues: TXIssue[]; excluded?: boolean;
};

const n = (x: unknown) => String(x ?? "").trim();
const k = (x: unknown) => n(x).toLowerCase().replace(/[^a-z0-9]/g, "");
const r2 = (x: number) => Math.round(x * 100) / 100;

export function suggestRT(cols: string[]): RTMapping {
  const m: RTMapping = {}; const used = new Set<string>();
  for (const f of RT_FIELDS) { const c = cols.find((c) => !used.has(c) && (f.aliases as readonly string[]).some((a) => k(a) === k(c))); if (c) { m[f.key] = c; used.add(c); } }
  return m;
}
export const rtMappingProblems = (m: RTMapping) => RT_FIELDS.filter((f) => f.required && !m[f.key]).map((f) => `${f.label} is not mapped`);
const methodOf = (x: unknown): Method | undefined => { const v = k(x); if (!v) return "cash"; if (/mpesa|mobile/.test(v)) return "mpesa"; if (/bank|card/.test(v)) return "bank"; if (/cash/.test(v)) return "cash"; if (/credit|account|balance/.test(v)) return "credit"; return undefined; };
const dateOf = (x: unknown) => { if (x instanceof Date) return x.getTime(); const p = n(x).split(/[\/\-. ]/).map(Number); if (p.length >= 3 && p.slice(0, 3).every(Number.isFinite)) { let [d, m, y] = p[0]! > 31 ? [p[2]!, p[1]!, p[0]!] : [p[0]!, p[1]!, p[2]!]; if (y < 100) y += 2000; if (m >= 1 && m <= 12 && d >= 1 && d <= 31) return new Date(y, m - 1, d, 12).getTime(); } const t = Date.parse(n(x)); return Number.isFinite(t) ? t : null; };

export function previewRT(s: ErpState, sheets: { sheet: Sheet; mapping: RTMapping }[]): RTGroup[] {
  const groups = new Map<string, RTGroup>();
  const existing = new Set([...s.returns, ...s.purchaseReturns].map((r) => k(r.ref)));
  const left = new Map<string, number>(); // remaining returnable qty per original line, across the whole file
  for (const { sheet, mapping } of sheets) sheet.rows.forEach((r, i) => {
    const g = (f: RTField) => (mapping[f] ? r[mapping[f]!] : ""); const row = i + 2;
    const t = k(g("type")) || k(sheet.sheet), kind: "SALE" | "PURCHASE" = /purchase|supplier/.test(t) ? "PURCHASE" : "SALE";
    const ref = n(g("ref")), gk = `RT:${kind}:${k(ref)}`;
    let grp = groups.get(gk);
    const iss = (field: string, problem: string, suggestion: string) => grp!.issues.push({ file: sheet.file, sheet: sheet.sheet, row, field, problem, suggestion });
    if (!grp) {
      const original = n(g("original")), at = dateOf(g("date")), refund = methodOf(g("refund"));
      grp = { key: gk, kind, ref, original, at: at ?? 0, refund: refund ?? "cash", lines: [], amount: 0, rows: [], status: "VALID", issues: [] };
      groups.set(gk + (ref ? "" : `:${row}`), grp);
      if (!ref) iss("Return number", "Missing return number", "Each return needs its own number");
      if (at === null) iss("Date", `“${n(g("date")) || "blank"}” is not a valid date`, "Use DD/MM/YYYY");
      if (!refund) iss("Refund method", `“${n(g("refund"))}” is not Cash, M-Pesa, Bank or Credit`, "Use Cash, M-Pesa, Bank or Credit");
      const doc = kind === "SALE" ? s.sales.find((x) => k(x.ref) === k(original)) : s.purchases.find((x) => k(x.ref) === k(original));
      if (!doc) iss("Original receipt / invoice", `${original || "blank"} is not in your ${kind === "SALE" ? "sales" : "purchases"}`, "Import the original sale or purchase first");
      else {
        grp.originalId = doc.id;
        const party = kind === "SALE" ? (doc as ErpState["sales"][number]).customerId : (doc as ErpState["purchases"][number]).supplierId;
        if (grp.refund === "credit" && !party) iss("Refund method", "Credit refund needs a named customer/supplier on the original", "Use Cash, M-Pesa or Bank");
      }
      if (ref && existing.has(k(ref))) { grp.status = "DUPLICATE"; iss("Return number", `${ref} already exists in your shop`, "Skipped so it isn't counted twice"); }
    }
    grp.rows.push(row);
    const product = n(g("product")), qty = Number(n(g("qty")).replace(/,/g, ""));
    if (!(qty > 0)) { iss("Quantity returned", `“${n(g("qty")) || "blank"}” is not a valid quantity`, "Use a positive number"); return; }
    const doc = grp.originalId ? (kind === "SALE" ? s.sales.find((x) => x.id === grp!.originalId) : s.purchases.find((x) => x.id === grp!.originalId)) : undefined;
    if (!doc) return;
    const p = findProduct(s.products, product), it = (doc.items as { productId: string; name: string; qty: number; returned: number; price?: number; cost?: number }[]).find((x) => x.productId === p?.id || k(x.name) === k(product));
    if (!it) { iss("Product", `“${product || "blank"}” is not on ${doc.ref}`, "Check the product name or original receipt"); return; }
    const lk = `${doc.id}:${it.productId}`, rem = left.get(lk) ?? it.qty - it.returned;
    if (qty > rem + 1e-9) { iss("Quantity returned", `Only ${rem} of ${it.name} can still be returned on ${doc.ref}`, "Reduce the quantity"); return; }
    left.set(lk, rem - qty);
    const sale = kind === "SALE" ? (doc as ErpState["sales"][number]) : undefined, ratio = sale && sale.subtotal ? sale.total / sale.subtotal : 1;
    const amount = r2(qty * (kind === "SALE" ? (it.price ?? 0) * ratio : it.cost ?? 0));
    grp.lines.push({ product: it.name, productId: it.productId, qty, amount }); grp.amount = r2(grp.amount + amount);
  });
  const all = [...groups.values()];
  all.forEach((g) => { if (g.status !== "DUPLICATE" && g.issues.length) g.status = "INVALID"; });
  return all;
}

/** All selected returns post in one commit; any failure saves nothing. */
export function applyRT(groups: RTGroup[]) {
  const go = groups.filter((g) => g.status === "VALID" && !g.excluded).sort((a, b) => a.at - b.at);
  let sales = 0, purchases = 0;
  commit((s, c) => {
    for (const g of go) {
      if ([...s.returns, ...s.purchaseReturns].some((r) => k(r.ref) === k(g.ref))) continue;
      if (g.kind === "SALE") {
        const doc = s.sales.find((x) => x.id === g.originalId); if (!doc) throw new ErpError(`${g.ref}: original ${g.original} not found`);
        g.lines.forEach((l) => { const it = doc.items.find((i) => i.productId === l.productId)!; if (l.qty > it.qty - it.returned + 1e-9) throw new ErpError(`${g.ref}: too many ${it.name} returned`); it.returned += l.qty; if (s.products.some((p) => p.id === it.productId)) { c.move(it.productId, "RETURN", l.qty, `Return of ${doc.ref}`, g.ref); s.movements[0]!.at = g.at; } });
        const cust = doc.customerId ? s.customers.find((x) => x.id === doc.customerId) : undefined;
        if (g.refund === "credit") { if (!cust) throw new ErpError(`${g.ref}: credit needs a customer`); cust.balance = r2(cust.balance - g.amount); }
        else s.payments.unshift({ id: uid(), ref: c.nextRef("PAY"), at: g.at, method: g.refund, amount: -g.amount, kind: "REFUND", source: g.ref, customerId: cust?.id, user: c.user });
        s.returns.unshift({ id: uid(), ref: g.ref, at: g.at, saleId: doc.id, saleRef: doc.ref, items: g.lines.map((l) => ({ productId: l.productId!, name: l.product, qty: l.qty, amount: l.amount })), amount: g.amount, refund: g.refund, user: c.user });
        sales++;
      } else {
        const doc = s.purchases.find((x) => x.id === g.originalId); if (!doc) throw new ErpError(`${g.ref}: original ${g.original} not found`);
        g.lines.forEach((l) => { const it = doc.items.find((i) => i.productId === l.productId)!; if (l.qty > it.qty - it.returned + 1e-9) throw new ErpError(`${g.ref}: too many ${it.name} returned`); it.returned += l.qty; c.move(it.productId, "STOCK OUT", -l.qty, `Return to supplier ${doc.ref}`, g.ref); s.movements[0]!.at = g.at; });
        const sup = doc.supplierId ? s.suppliers.find((x) => x.id === doc.supplierId) : undefined;
        if (g.refund === "credit") { if (!sup) throw new ErpError(`${g.ref}: credit needs a supplier`); sup.balance = r2(sup.balance - g.amount); }
        else s.payments.unshift({ id: uid(), ref: c.nextRef("PAY"), at: g.at, method: g.refund, amount: g.amount, kind: "SUPPLIER REFUND", source: g.ref, user: c.user });
        s.purchaseReturns.unshift({ id: uid(), ref: g.ref, at: g.at, purchaseId: doc.id, purchaseRef: doc.ref, items: g.lines.map((l) => ({ productId: l.productId!, name: l.product, qty: l.qty, amount: l.amount })), amount: g.amount, refund: g.refund, reason: "Imported history", user: c.user });
        purchases++;
      }
    }
    s.returns.sort((a, b) => b.at - a.at); s.purchaseReturns.sort((a, b) => b.at - a.at); s.payments.sort((a, b) => b.at - a.at); s.movements.sort((a, b) => b.at - a.at);
    c.audit("RETURNS IMPORTED", `${sales} sales returns • ${purchases} purchase returns`);
  });
  return { sales, purchases, skipped: groups.filter((g) => g.status === "DUPLICATE" || g.excluded).length, rejected: groups.filter((g) => g.status === "INVALID").length };
}

export const RT_TEMPLATE = "Type,Return No,Original Receipt,Date,Product,Qty,Refund\nSale Return,RET-501,R-1002,07/01/2026,Sugar 1kg,1,Cash\nPurchase Return,PRT-90,INV-77,08/01/2026,Rice 2kg,2,Credit\n";

export function exportRT(s: ErpState) {
  const c = (x: unknown) => `"${String(x ?? "").replaceAll('"', '""')}"`, d = (t: number) => new Date(t).toLocaleDateString("en-GB");
  const rows: unknown[][] = [];
  s.returns.forEach((r) => r.items.forEach((i) => rows.push(["Sale Return", r.ref, r.saleRef, d(r.at), i.name, i.qty, r.refund])));
  s.purchaseReturns.forEach((r) => r.items.forEach((i) => rows.push(["Purchase Return", r.ref, r.purchaseRef, d(r.at), i.name, i.qty, r.refund])));
  return [["Type", "Return No", "Original Receipt", "Date", "Product", "Qty", "Refund"], ...rows].map((r) => r.map(c).join(",")).join("\n");
}
