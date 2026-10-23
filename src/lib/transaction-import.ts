// Universal Import Center — historical Sales & Purchases (phase 2).
// One row per line item; rows sharing a type + receipt/invoice number form ONE transaction.
// Groups post atomically with their original dates, payments and credit; importKey blocks re-import.
import { commit, ErpError, uid, type ErpState, type Method, type Product } from "@/lib/erp";
import type { Sheet } from "@/lib/opening-import";

export const TX_FIELDS = [
  { key: "type", label: "Sale or purchase", required: false, aliases: ["type", "transaction type", "kind", "document type", "doc type"] },
  { key: "ref", label: "Receipt / invoice number", required: true, aliases: ["ref", "receipt", "receipt no", "receipt number", "invoice", "invoice no", "invoice number", "transaction id", "transaction no", "bill no", "order no", "number", "doc no"] },
  { key: "date", label: "Date", required: true, aliases: ["date", "transaction date", "sale date", "purchase date", "invoice date"] },
  { key: "party", label: "Customer / supplier", required: false, aliases: ["customer", "supplier", "customer/supplier", "party", "customer name", "supplier name", "client", "vendor"] },
  { key: "phone", label: "Customer / supplier phone", required: false, aliases: ["phone", "phone number", "mobile"] },
  { key: "product", label: "Product (name, SKU or barcode)", required: true, aliases: ["product", "item", "product name", "item name", "sku", "barcode", "description"] },
  { key: "qty", label: "Quantity", required: true, aliases: ["qty", "quantity", "units", "pcs"] },
  { key: "price", label: "Unit price / cost", required: true, aliases: ["price", "unit price", "unit cost", "cost", "rate", "selling price", "buying price"] },
  { key: "discount", label: "Discount (whole transaction)", required: false, aliases: ["discount", "disc", "discount whole transaction", "discount (whole transaction)", "transaction discount"] },
  { key: "total", label: "Transaction total", required: false, aliases: ["total", "grand total", "invoice total", "net total"] },
  { key: "cash", label: "Paid cash", required: false, aliases: ["cash", "paid cash", "cash paid"] },
  { key: "mpesa", label: "Paid M-Pesa", required: false, aliases: ["mpesa", "m-pesa", "paid mpesa", "mpesa paid"] },
  { key: "bank", label: "Paid bank", required: false, aliases: ["bank", "paid bank", "bank paid", "card"] },
  { key: "paid", label: "Amount paid (with method column)", required: false, aliases: ["paid", "amount paid", "payment", "paid amount"] },
  { key: "method", label: "Payment method", required: false, aliases: ["method", "payment method", "mode", "payment mode", "paid via"] },
] as const;
export type TXField = (typeof TX_FIELDS)[number]["key"];
export type TXMapping = Partial<Record<TXField, string>>;
export type TXIssue = { file: string; sheet: string; row: number; field: string; problem: string; suggestion: string };
export type TXLine = { row: number; product: string; productId?: string; qty: number; price: number };
export type TXGroup = {
  key: string; kind: "SALE" | "PURCHASE"; ref: string; at: number; file: string; sheet: string; rows: number[];
  party: string; phone: string; partyId?: string; createParty?: boolean; lines: TXLine[]; subtotal: number; discount: number; total: number;
  pay: Record<Method, number>; status: "VALID" | "DUPLICATE" | "INVALID"; issues: TXIssue[]; createProducts: string[]; excluded?: boolean;
};
export type TXOptions = { stock: "update" | "record"; createProducts: boolean; dateFmt: "auto" | "DMY" | "MDY" | "YMD" };

const n = (x: unknown) => String(x ?? "").trim();
const k = (x: unknown) => n(x).toLowerCase().replace(/[^a-z0-9]/g, "");
const r2 = (x: number) => Math.round(x * 100) / 100;
const num = (x: unknown) => { const v = n(x).replace(/ksh|kes|,|\s/gi, ""); if (!v) return 0; const neg = /^\(.*\)$/.test(v); const y = Number(v.replace(/[()]/g, "")); return Number.isFinite(y) ? (neg ? -y : y) : NaN; };

export function suggestTX(columns: string[]): TXMapping {
  const m: TXMapping = {}; const used = new Set<string>();
  for (const f of TX_FIELDS) { const c = columns.find((c) => !used.has(c) && (f.aliases as readonly string[]).some((a) => k(a) === k(c))); if (c) { m[f.key] = c; used.add(c); } }
  return m;
}
export const looksLikeTransactions = (cols: string[]) => { const m = suggestTX(cols); return !!(m.ref && m.product && m.qty); };
export function txMappingProblems(m: TXMapping) {
  const p: string[] = []; TX_FIELDS.filter((f) => f.required && !m[f.key]).forEach((f) => p.push(`${f.label} is not mapped`));
  if (m.paid && !m.method && !(m.cash || m.mpesa || m.bank)) p.push("Amount paid needs a Payment method column");
  const v = Object.values(m).filter(Boolean); v.forEach((x, i) => { if (v.indexOf(x) !== i) p.push(`Column “${x}” is mapped twice`); });
  return [...new Set(p)];
}
function kindOf(x: string, sheet: string): "SALE" | "PURCHASE" | undefined {
  const v = k(x) || k(sheet);
  if (/purchase|bill|grn|supplier|buy|^po$/.test(v)) return "PURCHASE";
  if (/sale|pos|receipt|invoice|sell|customer/.test(v)) return "SALE";
  return undefined;
}
function methodOf(x: unknown): Method | undefined { const v = k(x); if (!v) return undefined; if (/mpesa|mobile/.test(v)) return "mpesa"; if (/bank|card|cheque|transfer/.test(v)) return "bank"; if (/cash/.test(v)) return "cash"; if (/credit|debt|unpaid/.test(v)) return "credit"; return undefined; }
function dateOf(x: unknown, fmt: TXOptions["dateFmt"]): number | null {
  if (x instanceof Date) return x.getTime();
  const v = n(x); if (!v) return null; const p = v.split(/[\/\-. T:]/).map(Number);
  if (p.length >= 3 && p.slice(0, 3).every(Number.isFinite)) {
    const [a, b, c] = p as [number, number, number]; const f = a > 31 ? "YMD" : fmt === "auto" ? (b > 12 ? "MDY" : "DMY") : fmt;
    let [d, m, y] = f === "YMD" ? [c, b, a] : f === "MDY" ? [b, a, c] : [a, b, c]; if (y < 100) y += 2000;
    return m >= 1 && m <= 12 && d >= 1 && d <= 31 ? new Date(y, m - 1, d, 12).getTime() : null;
  }
  const t = Date.parse(v); return Number.isFinite(t) ? t : null;
}
export const findProduct = (list: Product[], x: string) => { const v = k(x); return v ? list.find((p) => k(p.sku) === v) ?? list.find((p) => k(p.barcode) === v) ?? list.find((p) => k(p.name) === v) : undefined; };
const findParty = <T extends { id: string; name: string; phone?: string | undefined }>(list: T[], name: string, phone: string) => (phone && list.find((x) => k(x.phone) === k(phone))) || (name && list.find((x) => k(x.name) === k(name))) || undefined;

export function previewTX(s: ErpState, sheets: { sheet: Sheet; mapping: TXMapping }[], o: TXOptions): TXGroup[] {
  const groups = new Map<string, TXGroup>(); const stray: TXGroup[] = []; const paidSeen = new Map<TXGroup, Set<string>>();
  for (const { sheet, mapping } of sheets) sheet.rows.forEach((r, i) => {
    const g = (f: TXField) => (mapping[f] ? r[mapping[f]!] : ""); const row = i + 2;
    const kind = kindOf(n(g("type")), sheet.sheet), ref = n(g("ref"));
    const issue = (grp: TXGroup, field: string, problem: string, suggestion: string) => grp.issues.push({ file: sheet.file, sheet: sheet.sheet, row, field, problem, suggestion });
    const gk = `TX:${kind ?? "?"}:${k(ref)}`;
    let grp = ref && kind ? groups.get(gk) : undefined;
    if (!grp) {
      const at = dateOf(g("date"), o.dateFmt);
      grp = { key: gk, kind: kind ?? "SALE", ref, at: at ?? 0, file: sheet.file, sheet: sheet.sheet, rows: [], party: n(g("party")), phone: n(g("phone")), lines: [], subtotal: 0, discount: 0, total: 0, pay: { cash: 0, mpesa: 0, bank: 0, credit: 0 }, status: "VALID", issues: [], createProducts: [] };
      if (!kind) issue(grp, "Sale or purchase", `“${n(g("type")) || "blank"}” is not Sale or Purchase`, "Add a Type column or name the sheet Sales/Purchases");
      if (!ref) issue(grp, "Receipt / invoice number", "Missing receipt or invoice number", "Each transaction needs its number so its items stay together");
      if (at === null) issue(grp, "Date", `“${n(g("date")) || "blank"}” is not a valid date`, "Choose the right date format or use DD/MM/YYYY");
      if (ref && kind) groups.set(gk, grp); else stray.push(grp);
    }
    grp.rows.push(row);
    // Header values: first non-blank wins; a different value later is a conflict.
    const head = (f: "discount" | "total" | "cash" | "mpesa" | "bank", set: (v: number) => void, cur: number) => { const raw = n(g(f)); if (!raw) return; const v = num(raw); if (!Number.isFinite(v) || v < 0) { issue(grp!, f, `“${raw}” is not a valid amount`, "Enter a positive number"); return; } if (cur && Math.abs(cur - v) > 0.001) { issue(grp!, f, `Different ${f} values in one transaction (${cur} vs ${v})`, "Repeat the same value or fill it on one row only"); return; } set(v); };
    head("discount", (v) => (grp!.discount = v), grp.discount); head("total", (v) => (grp!.total = v), grp.total);
    (["cash", "mpesa", "bank"] as const).forEach((m) => head(m, (v) => (grp!.pay[m] = v), grp!.pay[m]));
    if (mapping.paid && !(mapping.cash || mapping.mpesa || mapping.bank)) { const raw = n(g("paid")); if (raw) { const v = num(raw), mraw = n(g("method")), m = methodOf(mraw); const seen = paidSeen.get(grp) ?? new Set<string>(); paidSeen.set(grp, seen);
      if (!Number.isFinite(v) || v < 0) issue(grp, "Amount paid", `“${raw}” is not a valid amount`, "Enter a positive number");
      else if (/mix|split|multiple/i.test(mraw)) issue(grp, "Payment method", "“Mixed” is not a payment method", "Put each part on its own row (Cash, M-Pesa, Bank) or use the Paid cash / Paid M-Pesa / Paid bank columns");
      else if (!m) issue(grp, "Payment method", `“${mraw || "blank"}” is not Cash, M-Pesa, Bank or Credit`, "Use Cash, M-Pesa, Bank or Credit");
      // The same method + amount repeated on every item line of one receipt is one payment, not one per line.
      else if (m !== "credit" && !seen.has(`${m}:${v}`)) { seen.add(`${m}:${v}`); grp.pay[m] = r2(grp.pay[m] + v); } } }
    if (!grp.party) grp.party = n(g("party")); if (!grp.phone) grp.phone = n(g("phone"));
    // Party typed in an unlabeled extra column (e.g. supplier beside a "Customer Name" heading): use it when it names a known contact.
    if (!grp.party) { const known = grp.kind === "SALE" ? s.customers : s.suppliers; const hit = Object.entries(r).find(([c, v]) => /^column \d+$/i.test(c) && n(v) && known.some((x) => k(x.name) === k(v))); if (hit) grp.party = n(hit[1]); }
    const product = n(g("product")), qty = num(g("qty")), price = num(g("price"));
    if (!product) issue(grp, "Product", "Missing product", "Enter the product name, SKU or barcode");
    if (!(qty > 0)) issue(grp, "Quantity", `“${n(g("qty")) || "blank"}” is not a valid quantity`, "Use a positive number; decimals like 0.5 are allowed");
    if (!(price >= 0) || !n(g("price"))) issue(grp, "Unit price / cost", `“${n(g("price")) || "blank"}” is not a valid price`, "Enter the unit price");
    const p = findProduct(s.products, product);
    if (product && !p) { if (o.createProducts) { if (!grp.createProducts.includes(product)) grp.createProducts.push(product); } else issue(grp, "Product", `“${product}” is not in your shop`, "Import it under Products first, or tick “Create missing products”"); }
    grp.lines.push({ row, product, qty: Math.round(qty * 1000) / 1000, price: r2(price), ...(p ? { productId: p.id } : {}) });
  });

  const all = [...groups.values(), ...stray];
  const importedKeys = new Set([...s.sales, ...s.purchases].map((x) => x.importKey).filter(Boolean));
  const refs = { SALE: new Set(s.sales.map((x) => k(x.ref))), PURCHASE: new Set(s.purchases.map((x) => k(x.ref))) };
  const stock = new Map(s.products.map((p) => [p.id, p.qty]));
  const pending = new Map<string, number>(); // created products start at 0
  for (const g of all.sort((a, b) => a.at - b.at)) {
    const iss = (field: string, problem: string, suggestion: string) => g.issues.push({ file: g.file, sheet: g.sheet, row: g.rows[0] ?? 0, field, problem, suggestion });
    const seen = new Set<string>();
    g.lines.forEach((l) => { const id = l.productId ?? `new:${k(l.product)}`; if (seen.has(id)) iss("Product", `“${l.product}” appears twice in ${g.ref}`, "Combine the quantities into one line"); seen.add(id); });
    g.subtotal = r2(g.lines.reduce((a, l) => a + l.qty * l.price, 0));
    const expected = r2(g.subtotal - g.discount);
    if (g.discount > g.subtotal) iss("Discount", "Discount is larger than the items total", "Check the discount");
    if (g.total && Math.abs(g.total - expected) > 0.01) iss("Transaction total", `File total ${g.total} ≠ items ${g.subtotal} − discount ${g.discount} = ${expected}`, "Fix the line prices/quantities or the total");
    g.total = expected;
    const paid = r2(g.pay.cash + g.pay.mpesa + g.pay.bank);
    if (paid > g.total + 0.01) iss("Payments", `Payments ${paid} exceed the total ${g.total}`, "Check the paid amounts");
    g.pay.credit = Math.max(0, r2(g.total - paid));
    const list = g.kind === "SALE" ? s.customers : s.suppliers;
    const party = findParty(list, g.party, g.phone);
    if (party) g.partyId = party.id; else if (g.party || g.phone) g.createParty = true;
    if (g.pay.credit > 0 && !party && !g.party && !g.phone) iss("Customer / supplier", `${g.pay.credit} is unpaid but no ${g.kind === "SALE" ? "customer" : "supplier"} is named`, "Walk-in sales must be fully paid; add the name for credit");
    if (!g.issues.length) {
      if (importedKeys.has(g.key)) { g.status = "DUPLICATE"; iss("Receipt / invoice number", "Already imported in an earlier batch", "Nothing to do — it will be skipped"); continue; }
      if (refs[g.kind].has(k(g.ref))) { g.status = "DUPLICATE"; iss("Receipt / invoice number", `${g.ref} already exists in your shop`, "Skipped so it isn't counted twice"); continue; }
    }
    if (g.issues.length) { g.status = "INVALID"; continue; }
    if (o.stock === "update") {
      const short = g.lines.find((l) => { const id = l.productId ?? `new:${k(l.product)}`; const have = l.productId ? stock.get(id)! : pending.get(id) ?? 0; return g.kind === "SALE" && l.qty > have + 1e-9; });
      if (short) { g.status = "INVALID"; iss("Quantity", `Not enough stock for “${short.product}” on ${new Date(g.at).toLocaleDateString("en-GB")}`, "Import its purchases or opening stock first, or choose “Record history only”"); continue; }
      g.lines.forEach((l) => { const id = l.productId ?? `new:${k(l.product)}`, d = g.kind === "SALE" ? -l.qty : l.qty; if (l.productId) stock.set(id, stock.get(id)! + d); else pending.set(id, (pending.get(id) ?? 0) + d); });
    }
  }
  return all;
}

/** All selected groups post in one commit; any failure saves nothing. */
export function applyTX(groups: TXGroup[], o: TXOptions) {
  const go = groups.filter((g) => g.status === "VALID" && !g.excluded).sort((a, b) => a.at - b.at);
  let sales = 0, purchases = 0;
  commit((s, c) => {
    const done = new Set([...s.sales, ...s.purchases].map((x) => x.importKey).filter(Boolean));
    for (const g of go) {
      if (done.has(g.key)) continue;
      const items = g.lines.map((l) => {
        let p = (l.productId && s.products.find((x) => x.id === l.productId)) || findProduct(s.products, l.product);
        if (!p) {
          if (!o.createProducts) throw new ErpError(`${g.ref}: product “${l.product}” not found`);
          p = { id: uid(), name: l.product, buy: g.kind === "PURCHASE" ? l.price : 0, sell: g.kind === "SALE" ? l.price : 0, qty: 0, createdAt: Date.now() };
          s.products.push(p); c.audit("PRODUCT CREATED", `${p.name} (transaction import)`);
        }
        return { p, l };
      });
      const list = g.kind === "SALE" ? s.customers : s.suppliers;
      let party = (g.partyId && list.find((x) => x.id === g.partyId)) || findParty(list, g.party, g.phone);
      if (!party && (g.party || g.phone)) { party = { id: uid(), name: g.party || g.phone, balance: 0, createdAt: Date.now(), ...(g.phone ? { phone: g.phone } : {}) }; list.push(party as never); c.audit(g.kind === "SALE" ? "CUSTOMER CREATED" : "SUPPLIER CREATED", `${party.name} (transaction import)`); }
      if (g.pay.credit > 0 && !party) throw new ErpError(`${g.ref}: credit needs a ${g.kind === "SALE" ? "customer" : "supplier"}`);
      if (o.stock === "update") items.forEach(({ p, l }) => { c.move(p.id, g.kind, g.kind === "SALE" ? -l.qty : l.qty, "Imported history", g.ref); s.movements[0]!.at = g.at; });
      const pay = { ...g.pay };
      (["cash", "mpesa", "bank"] as Method[]).forEach((m) => { if (pay[m] > 0) s.payments.unshift({ id: uid(), ref: c.nextRef("PAY"), at: g.at, method: m, amount: g.kind === "SALE" ? pay[m] : -pay[m], kind: g.kind, source: g.ref, ...(g.kind === "SALE" && party ? { customerId: party.id } : {}), user: c.user }); });
      if (party && pay.credit > 0) party.balance = r2(party.balance + pay.credit);
      if (g.kind === "SALE") {
        s.sales.unshift({ id: uid(), ref: g.ref, at: g.at, items: items.map(({ p, l }) => ({ productId: p.id, name: p.name, qty: l.qty, price: l.price, cost: p.buy, returned: 0 })), subtotal: g.subtotal, discount: g.discount, total: g.total, pay, customerId: party?.id, cashier: c.user, channel: "Sales", importKey: g.key });
        sales++;
      } else {
        s.purchases.unshift({ id: uid(), ref: g.ref, at: g.at, supplierId: party?.id, items: items.map(({ p, l }) => ({ productId: p.id, name: p.name, qty: l.qty, cost: l.price, returned: 0 })), total: g.total, pay, user: c.user, importKey: g.key });
        purchases++;
      }
      done.add(g.key);
    }
    s.sales.sort((a, b) => b.at - a.at); s.purchases.sort((a, b) => b.at - a.at); s.payments.sort((a, b) => b.at - a.at); s.movements.sort((a, b) => b.at - a.at);
    c.audit("TRANSACTIONS IMPORTED", `${sales} sales • ${purchases} purchases`);
  });
  return { sales, purchases, skipped: groups.filter((g) => g.status === "DUPLICATE" || g.excluded).length, rejected: groups.filter((g) => g.status === "INVALID").length };
}

export const TX_TEMPLATE = "Type,Receipt No,Date,Customer/Supplier,Phone,Product,Qty,Unit Price,Discount,Total,Cash,M-Pesa,Bank\nSale,R-1001,05/01/2026,,,Sugar 1kg,2,150,0,300,300,,\nSale,R-1002,05/01/2026,Amina Hassan,0712345678,Rice 2kg,1,320,20,500,,200,\nSale,R-1002,05/01/2026,Amina Hassan,0712345678,Sugar 1kg,1,200,20,500,,200,\nPurchase,INV-77,03/01/2026,Bidco Ltd,0722000000,Sugar 1kg,20,110,0,3450,1000,,\nPurchase,INV-77,03/01/2026,Bidco Ltd,0722000000,Rice 2kg,5,250,0,3450,1000,,\n";

/** Export sales & purchases in the import format (one row per line item) so they can be re-imported. */
export function exportTX(s: ErpState) {
  const c = (x: unknown) => `"${String(x ?? "").replaceAll('"', '""')}"`, d = (t: number) => new Date(t).toLocaleDateString("en-GB");
  const sku = (id: string) => { const p = s.products.find((x) => x.id === id); return p?.sku || p?.name || id; };
  const rows: unknown[][] = [];
  s.sales.forEach((x) => { const cu = s.customers.find((y) => y.id === x.customerId); x.items.forEach((i) => rows.push(["Sale", x.ref, d(x.at), cu?.name ?? "", cu?.phone ?? "", sku(i.productId), i.qty, i.price, x.discount, x.total, x.pay.cash, x.pay.mpesa, x.pay.bank])); });
  s.purchases.forEach((x) => { const su = s.suppliers.find((y) => y.id === x.supplierId); x.items.forEach((i) => rows.push(["Purchase", x.ref, d(x.at), su?.name ?? "", su?.phone ?? "", sku(i.productId), i.qty, i.cost, 0, x.total, x.pay.cash, x.pay.mpesa, x.pay.bank])); });
  return [["Type", "Receipt No", "Date", "Customer/Supplier", "Phone", "Product", "Qty", "Unit Price", "Discount", "Total", "Cash", "M-Pesa", "Bank"], ...rows].map((r) => r.map(c).join(",")).join("\n");
}
