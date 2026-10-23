// SHOPBOOK ERP Core — shared business data + one transaction engine.
// Every module (Inventory, Sales, POS, Purchases, Returns, Reports) reads and
// writes through `commit`, which validates and applies a whole transaction or nothing.

export type Product = {
  id: string; name: string; buy: number; sell: number; qty: number;
  sku?: string | undefined; barcode?: string | undefined; categoryId?: string | undefined; brandId?: string | undefined;
  unit?: string | undefined; image?: string | undefined; minStock?: number | undefined; createdAt: number;
};
export type Named = { id: string; name: string };
export type MoveType = "OPENING" | "PURCHASE" | "STOCK IN" | "SALE" | "STOCK OUT" | "ADJUSTMENT" | "RETURN" | "TRANSFER OUT" | "TRANSFER IN" | "TRANSFER CANCEL";
export type Movement = {
  id: string; at: number; type: MoveType; productId: string; qty: number;
  prev: number; next: number; reason?: string | undefined; source?: string | undefined; user: string;
};
export type Transfer = {
  id: string; ref: string; productId: string; qty: number; from: string; to: string;
  status: "PENDING" | "SENT" | "RECEIVED" | "CANCELLED"; at: number; user: string;
};
export type Audit = { id: string; at: number; action: string; detail: string; user: string };
export type ErpState = {
  products: Product[]; categories: Named[]; brands: Named[];
  movements: Movement[]; transfers: Transfer[]; audit: Audit[]; seq: Record<string, number>;
  customers: Customer[]; sales: Sale[]; payments: Payment[]; returns: SaleReturn[]; cash: CashEvent[];
  employees: Employee[]; commissions: Commission[]; payrolls: PayrollRun[]; payrollPayments: PayrollPayment[];
  suppliers: Supplier[]; purchases: Purchase[]; purchaseReturns: PurchaseReturn[]; expenses: Expense[]; expenseCategories: Named[];
  otherContacts: OtherContact[]; contactCategories: Named[]; payrollDrafts: PayrollDraft[];
};
export type ContactDetails = { email?: string | undefined; address?: string | undefined; notes?: string | undefined; active?: boolean | undefined };
export type OtherContact = ContactDetails & { id: string; name: string; phone?: string | undefined; category?: string | undefined; createdAt: number };
export type PayrollDraft = { id: string; employeeId: string; from: number; to: number; deductions: number; notes?: string; at: number };
export type Supplier = { id: string; name: string; phone?: string | undefined; email?: string | undefined; address?: string | undefined; info?: string | undefined; notes?: string | undefined; balance: number; createdAt: number };
export type PurchaseItem = { productId: string; name: string; qty: number; cost: number; returned: number };
export type Purchase = { id: string; ref: string; at: number; supplierId?: string | undefined; items: PurchaseItem[]; total: number; pay: Record<Method, number>; user: string; settled?: number | undefined; importKey?: string | undefined };
export type PurchaseReturn = { id: string; ref: string; at: number; purchaseId: string; purchaseRef: string; items: { productId: string; name: string; qty: number; amount: number }[]; amount: number; refund: Method; reason?: string | undefined; user: string };
export type Expense = { id: string; ref: string; at: number; category: string; description?: string | undefined; note?: string | undefined; amount: number; method: Method; user: string };
export type CommissionRule = { kind: "none" | "percent" | "fixed" | "profit"; value: number; paidOnly: boolean; products?: { productId: string; kind: "percent" | "fixed" | "profit"; value: number }[] | undefined };
export type Employee = { id: string; name: string; phone?: string | undefined; notes?: string; role: string; comp: "salary" | "salary+commission" | "commission"; salary: number; rule: CommissionRule; active: boolean; createdAt: number };
/** Commission ledger: adjustments are new negative rows, never edits/deletes. */
export type Commission = { id: string; at: number; employeeId: string; source: string; amount: number; kind: "EARNED" | "RETURN ADJUSTMENT"; pending: boolean; payrollId?: string | undefined; productAmounts?: Record<string, number> };
export type PayrollRun = { id: string; ref: string; at: number; employeeId: string; from: number; to: number; salary: number; commission: number; deductions: number; net: number; paid: number; user: string };
export type PayrollPayment = { id: string; ref: string; at: number; payrollId: string; employeeId: string; method: Method; amount: number; user: string };
export type Method = "cash" | "mpesa" | "bank" | "credit";
export const METHODS: Method[] = ["cash", "mpesa", "bank", "credit"];
export const METHOD_LABEL: Record<Method, string> = { cash: "Cash", mpesa: "M-Pesa", bank: "Bank", credit: "Credit" };
export type Customer = ContactDetails & { id: string; name: string; phone?: string | undefined; balance: number; createdAt: number };
export type SaleItem = { productId: string; name: string; qty: number; price: number; cost: number; returned: number };
export type Sale = {
  id: string; ref: string; at: number; items: SaleItem[]; subtotal: number; discount: number; total: number;
  pay: Record<Method, number>; customerId?: string | undefined; cashier: string; channel: "POS" | "Sales"; sellerId?: string | undefined;
  /** Credit paid off after the sale; `pay` stays as recorded at sale time so accounting never double counts. */
  settled?: number | undefined;
  /** VAT included in `total` (0 when VAT is off). */
  vat?: number | undefined;
  /** Set when the sale came from the Universal Import Center; blocks re-import. */
  importKey?: string | undefined;
};
export type Payment = { id: string; ref: string; at: number; method: Method; amount: number; kind: "SALE" | "DEBT" | "REFUND" | "PURCHASE" | "SUPPLIER PAYMENT" | "SUPPLIER REFUND" | "EXPENSE" | "TRANSFER" | "DEPOSIT" | "WITHDRAWAL" | "OPENING"; source: string; customerId?: string | undefined; supplierId?: string | undefined; importKey?: string | undefined; user: string };
export type SaleReturn = { id: string; ref: string; at: number; saleId: string; saleRef: string; items: { productId: string; name: string; qty: number; amount: number }[]; amount: number; refund: Method; user: string };
export type CashEvent = { id: string; at: number; type: "OPENING" | "CASH IN" | "CASH OUT" | "CASH UP"; amount: number; note?: string | undefined; expected?: number | undefined; counted?: number | undefined; user: string };

const KEY = "shopbook.erp";
const EVT = "shopbook-erp";
export const empty = (): ErpState => ({ products: [], categories: [], brands: [], movements: [], transfers: [], audit: [], seq: {}, customers: [], sales: [], payments: [], returns: [], cash: [], employees: [], commissions: [], payrolls: [], payrollPayments: [], suppliers: [], purchases: [], purchaseReturns: [], expenses: [], expenseCategories: [], otherContacts: [], contactCategories: [], payrollDrafts: [] });
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export function load(): ErpState {
  if (typeof window === "undefined") return empty();
  try { return { ...empty(), ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return empty(); }
}

export class ErpError extends Error {}

/** Atomic transaction: works on a copy; saves only if every step succeeds. */
export function commit<T>(fn: (s: ErpState, ctx: Ctx) => T): T {
  const draft: ErpState = structuredClone(load());
  const ctx = makeCtx(draft);
  const out = fn(draft, ctx); // throws → nothing is saved
  localStorage.setItem(KEY, JSON.stringify(draft));
  window.dispatchEvent(new Event(EVT));
  return out;
}

type Ctx = ReturnType<typeof makeCtx>;
function makeCtx(s: ErpState) {
  const user = currentUser();
  return {
    user,
    nextRef(prefix: string) { s.seq[prefix] = (s.seq[prefix] ?? 0) + 1; return `${prefix}-${String(s.seq[prefix]).padStart(6, "0")}`; },
    audit(action: string, detail: string) { s.audit.unshift({ id: uid(), at: Date.now(), action, detail, user }); },
    move(productId: string, type: MoveType, delta: number, reason?: string, source?: string) {
      const p = s.products.find((x) => x.id === productId);
      if (!p) throw new ErpError("Product not found");
      if (!Number.isFinite(delta) || delta === 0) throw new ErpError("Enter a valid quantity");
      const next = Math.round((p.qty + delta) * 1000) / 1000;
      if (next < 0) throw new ErpError(`Not enough stock for ${p.name} (available ${p.qty})`);
      s.movements.unshift({ id: uid(), at: Date.now(), type, productId, qty: delta, prev: p.qty, next, reason, source, user });
      p.qty = next;
    },
  };
}

function currentUser() {
  try { const a = JSON.parse(localStorage.getItem("shopbook.account") || "null"); return a?.shopName ? `Admin` : "Admin"; } catch { return "Admin"; }
}

export function subscribe(cb: () => void) {
  window.addEventListener(EVT, cb); window.addEventListener("storage", cb);
  return () => { window.removeEventListener(EVT, cb); window.removeEventListener("storage", cb); };
}

// ---------- Shared product search (Inventory, Sales, POS, Purchases) ----------
export function searchProducts(s: ErpState, q: string) {
  const t = q.trim().toLowerCase();
  if (!t) return s.products;
  return s.products.filter((p) => [p.name, p.sku, p.barcode].some((v) => v?.toLowerCase().includes(t)));
}
export const findByCode = (s: ErpState, code: string) =>
  s.products.find((p) => p.barcode === code || p.sku?.toLowerCase() === code.toLowerCase());

export function stockStatus(p: Product): "OK" | "LOW" | "OUT" {
  if (p.qty <= 0) return "OUT";
  if (p.qty <= (p.minStock ?? 5)) return "LOW";
  return "OK";
}

// ---------- Inventory actions ----------
export type NewProduct = Omit<Product, "id" | "createdAt">;
export const addProduct = (input: NewProduct) => commit((s, c) => {
  if (!input.name.trim()) throw new ErpError("Product name is required");
  if (input.buy < 0 || input.sell < 0 || input.qty < 0) throw new ErpError("Prices and quantity can't be negative");
  if (input.barcode && s.products.some((p) => p.barcode === input.barcode)) throw new ErpError("Barcode already used by another product");
  const suppliedSku = input.sku;
  if (suppliedSku && s.products.some((p) => p.sku?.toLowerCase() === suppliedSku.toLowerCase())) throw new ErpError("SKU already used");
  const sku = input.sku || c.nextRef("SKU").replace("SKU-0000", "SKU-");
  const p: Product = { ...input, qty: 0, sku, id: uid(), createdAt: Date.now() };
  s.products.unshift(p);
  if (input.qty > 0) c.move(p.id, "OPENING", input.qty, "Opening stock");
  c.audit("PRODUCT CREATED", `${p.name} (${sku})`);
  return p;
});

export const updateProduct = (id: string, patch: Partial<Omit<Product, "qty" | "id">>) => commit((s, c) => {
  const p = s.products.find((x) => x.id === id); if (!p) throw new ErpError("Product not found");
  Object.assign(p, patch); c.audit("PRODUCT EDITED", p.name);
});

export const deleteProduct = (id: string) => commit((s, c) => {
  const p = s.products.find((x) => x.id === id); if (!p) return;
  if (s.transfers.some((t) => t.productId === id && (t.status === "PENDING" || t.status === "SENT"))) throw new ErpError("Product has an open transfer");
  s.products = s.products.filter((x) => x.id !== id); c.audit("PRODUCT DELETED", p.name);
});

export const stockIn = (productId: string, qty: number, reason: string) => commit((_s, c) => {
  if (qty <= 0) throw new ErpError("Quantity must be more than 0");
  c.move(productId, reason === "Purchase" ? "PURCHASE" : reason === "Return" ? "RETURN" : "STOCK IN", qty, reason, c.nextRef("SI"));
  c.audit("STOCK IN", `+${qty} • ${reason}`);
});

export const stockOut = (productId: string, qty: number, reason: string) => commit((_s, c) => {
  if (qty <= 0) throw new ErpError("Quantity must be more than 0");
  c.move(productId, "STOCK OUT", -qty, reason, c.nextRef("SO"));
  c.audit("STOCK OUT", `-${qty} • ${reason}`);
});

export const adjustStock = (productId: string, counted: number, reason: string) => commit((s, c) => {
  const p = s.products.find((x) => x.id === productId); if (!p) throw new ErpError("Product not found");
  if (!reason.trim()) throw new ErpError("A reason is required");
  if (counted < 0) throw new ErpError("Counted stock can't be negative");
  const delta = counted - p.qty; if (delta === 0) throw new ErpError("Counted stock matches the system");
  const prev = p.qty;
  c.move(productId, "ADJUSTMENT", delta, reason, c.nextRef("ADJ"));
  c.audit("STOCK ADJUSTMENT", `${p.name} • Previous ${prev} • Adjustment ${delta > 0 ? "+" : ""}${delta} • New ${counted} • ${reason}`);
});

// Transfers: stock leaves on SEND, arrives (to the other shop) on RECEIVE, returns on CANCEL.
export const createTransfer = (productId: string, qty: number, to: string, from: string) => commit((s, c) => {
  if (qty <= 0) throw new ErpError("Quantity must be more than 0");
  if (!to.trim()) throw new ErpError("Choose a destination shop");
  const t: Transfer = { id: uid(), ref: c.nextRef("TR"), productId, qty, from, to: to.trim(), status: "PENDING", at: Date.now(), user: c.user };
  s.transfers.unshift(t); c.audit("TRANSFER CREATED", `${t.ref} • ${qty} → ${t.to}`); return t;
});
export const sendTransfer = (id: string) => commit((s, c) => {
  const t = s.transfers.find((x) => x.id === id); if (!t || t.status !== "PENDING") throw new ErpError("Transfer can't be sent");
  c.move(t.productId, "TRANSFER OUT", -t.qty, `To ${t.to}`, t.ref); t.status = "SENT"; c.audit("TRANSFER SENT", t.ref);
});
export const receiveTransfer = (id: string) => commit((s, c) => {
  const t = s.transfers.find((x) => x.id === id);
  if (!t || t.status !== "SENT") throw new ErpError("Already received or not sent"); // prevents double receiving
  t.status = "RECEIVED"; c.audit("TRANSFER RECEIVED", `${t.ref} at ${t.to}`);
});
export const cancelTransfer = (id: string) => commit((s, c) => {
  const t = s.transfers.find((x) => x.id === id);
  if (!t || t.status === "RECEIVED" || t.status === "CANCELLED") throw new ErpError("Transfer can't be cancelled");
  if (t.status === "SENT") c.move(t.productId, "TRANSFER CANCEL", t.qty, "Transfer cancelled", t.ref);
  t.status = "CANCELLED"; c.audit("TRANSFER CANCELLED", t.ref);
});

export const addNamed = (kind: "categories" | "brands", name: string) => commit((s, c) => {
  const n = name.trim(); if (!n) throw new ErpError("Enter a name");
  if (s[kind].some((x) => x.name.toLowerCase() === n.toLowerCase())) throw new ErpError("Already exists");
  s[kind].push({ id: uid(), name: n }); c.audit(kind === "brands" ? "BRAND CREATED" : "CATEGORY CREATED", n);
});
export const renameNamed = (kind: "categories" | "brands", id: string, name: string) => commit((s) => {
  const x = s[kind].find((v) => v.id === id); if (x && name.trim()) x.name = name.trim();
});
export const removeNamed = (kind: "categories" | "brands", id: string) => commit((s) => {
  s[kind] = s[kind].filter((v) => v.id !== id);
  const key = kind === "brands" ? "brandId" : "categoryId";
  s.products.forEach((p) => { if (p[key] === id) delete p[key]; });
});

// ---------- Selling engine (shared by Sales → New Sale and POS → Sell) ----------
/** `price` is a one-sale override (manual/wholesale); the product's default price is never changed. Quantities may be fractional (3 decimals). */
export type CartLine = { productId: string; qty: number; price?: number | undefined; priceReason?: string | undefined };
export const roundQty = (q: number) => Math.round(q * 1000) / 1000;
/** Units sold only in whole numbers (packets, pieces, boxes…). Weight/volume/length units allow fractions. */
const WHOLE_UNITS = new Set(["pcs", "pc", "piece", "pieces", "packet", "packets", "pkt", "box", "boxes", "bottle", "bottles", "carton", "cartons", "dozen", "pack", "packs", "bag", "bags", "tin", "tins", "unit", "units", "item", "items", "roll", "rolls", "pair", "pairs", "sachet", "sachets", "bar", "bars", "can", "cans", "crate", "crates"]);
export const isWholeUnit = (unit?: string) => WHOLE_UNITS.has((unit || "pcs").trim().toLowerCase());
export const linePrice = (s: ErpState, l: CartLine) => l.price ?? s.products.find((p) => p.id === l.productId)?.sell ?? 0;
export const lineAmount = (s: ErpState, l: CartLine) => Math.round(linePrice(s, l) * l.qty * 100) / 100;
export const lineTotal = (s: ErpState, cart: CartLine[]) => Math.round(cart.reduce((a, l) => a + lineAmount(s, l), 0) * 100) / 100;
/** Option B: quantity for a money amount at the unit price. Exact only if amount/price fits 3 decimals. */
export function qtyForAmount(amount: number, price: number) { if (!(amount > 0) || !(price > 0)) return null; const raw = amount / price, qty = roundQty(raw); return { qty, exact: Math.abs(qty * price - amount) < 0.005 }; }
export const methodOf = (pay: Record<Method, number>) => {
  const used = METHODS.filter((m) => pay[m] > 0);
  return used.length ? used.map((m) => METHOD_LABEL[m]).join(" + ") : "—";
};

// ---------- Payment status (P.PAY = part paid, rest still owed) ----------
export type PayStatus = "Paid" | "P.PAY" | "Credit" | "Cancelled";
const r2x = (n: number) => Math.round(n * 100) / 100;
export function saleBalance(s: ErpState, x: Sale) {
  const credRet = s.returns.filter((r) => r.saleId === x.id && r.refund === "credit").reduce((a, r) => a + r.amount, 0);
  return Math.max(0, r2x(x.pay.credit - (x.settled ?? 0) - credRet));
}
export function payStatus(total: number, balance: number, fullyReturned: boolean): PayStatus {
  if (fullyReturned) return "Cancelled";
  if (balance <= 0.001) return "Paid";
  return balance >= total - 0.001 ? "Credit" : "P.PAY";
}
export const saleStatus = (s: ErpState, x: Sale) => payStatus(x.total, saleBalance(s, x), x.items.every((i) => i.returned >= i.qty));
/** Pays down a customer's open sales oldest-first so each sale shows its own balance. */
function allocateToSales(s: ErpState, customerId: string, amount: number, onlySaleId?: string) {
  let left = amount;
  const open = s.sales.filter((x) => x.customerId === customerId && (!onlySaleId || x.id === onlySaleId)).sort((a, b) => a.at - b.at);
  for (const x of open) { if (left <= 0.001) break; const b = saleBalance(s, x); if (b <= 0) continue; const take = Math.min(b, left); x.settled = r2x((x.settled ?? 0) + take); left -= take; }
}

export const confirmSale = (input: { cart: CartLine[]; discount: number; pay: Record<Method, number>; customerId?: string | undefined; channel: "POS" | "Sales"; sellerId?: string | undefined; vatRate?: number | undefined }) => commit((s, c) => {
  if (!input.cart.length) throw new ErpError("Cart is empty");
  const items: SaleItem[] = input.cart.map((l) => {
    const p = s.products.find((x) => x.id === l.productId);
    if (!p) throw new ErpError("Product not found");
    const qty = roundQty(l.qty);
    if (!(qty > 0) || !Number.isFinite(qty)) throw new ErpError(`Invalid quantity for ${p.name}`);
    if (qty > p.qty + 1e-9) throw new ErpError(`Insufficient stock: ${p.name} (available ${p.qty})`);
    if (isWholeUnit(p.unit) && !Number.isInteger(qty)) throw new ErpError(`${p.name} is sold in whole ${p.unit || "pcs"} only`);
    if (l.price !== undefined && !(l.price >= 0 && Number.isFinite(l.price))) throw new ErpError(`Invalid price for ${p.name}`);
    if (l.price !== undefined && l.price !== p.sell) c.audit("PRICE OVERRIDE", `${p.name}: ${p.sell} → ${l.price}${l.priceReason ? ` • ${l.priceReason}` : ""}`);
    return { productId: p.id, name: p.name, qty, price: l.price ?? p.sell, cost: p.buy, returned: 0 };
  });
  if (new Set(items.map((i) => i.productId)).size !== items.length) throw new ErpError("A product appears twice in the cart");
  const subtotal = Math.round(items.reduce((a, i) => a + i.qty * i.price, 0) * 100) / 100;
  const discount = Math.round(input.discount * 100) / 100;
  if (discount < 0 || discount > subtotal) throw new ErpError("Discount can't exceed the subtotal");
  const rate = Math.min(100, Math.max(0, input.vatRate ?? 0));
  const vat = Math.round((subtotal - discount) * rate) / 100;
  const total = Math.round((subtotal - discount + vat) * 100) / 100;
  if (METHODS.some((m) => !(input.pay[m] >= 0))) throw new ErpError("Payment amounts can't be negative");
  const allocated = METHODS.reduce((a, m) => a + input.pay[m], 0);
  if (allocated > total + 0.001) throw new ErpError("Payments exceed the total");
  if (allocated < total - 0.001) throw new ErpError("Allocate the full total (use Credit for the unpaid part)");
  const cust = input.customerId ? s.customers.find((x) => x.id === input.customerId) : undefined;
  if (input.pay.credit > 0 && !cust) throw new ErpError("Credit needs a registered customer");
  const ref = c.nextRef("S");
  items.forEach((i) => c.move(i.productId, "SALE", -i.qty, "Sale", ref));
  (["cash", "mpesa", "bank"] as Method[]).forEach((m) => { if (input.pay[m] > 0) s.payments.unshift({ id: uid(), ref: c.nextRef("PAY"), at: Date.now(), method: m, amount: input.pay[m], kind: "SALE", source: ref, customerId: cust?.id, user: c.user }); });
  if (cust && input.pay.credit > 0) cust.balance += input.pay.credit;
  const sale: Sale = { id: uid(), ref, at: Date.now(), items, subtotal, discount, total, vat: vat || undefined, pay: { ...input.pay }, customerId: cust?.id, cashier: c.user, channel: input.channel, sellerId: undefined };
  const seller = input.sellerId ? s.employees.find((e) => e.id === input.sellerId && e.active) : undefined;
  if (input.sellerId && !seller) throw new ErpError("Seller not found");
  if (seller) { sale.sellerId = seller.id; const amt = commissionFor(seller, sale); if (amt > 0) s.commissions.unshift({ id: uid(), at: Date.now(), employeeId: seller.id, source: ref, amount: amt, kind: "EARNED", pending: seller.rule.paidOnly && input.pay.credit > 0, productAmounts: commissionProducts(seller, sale) }); }
  s.sales.unshift(sale);
  c.audit("SALE", `${ref} • ${total}${cust ? ` • ${cust.name}` : ""}`);
  return sale;
});

export const addCustomer = (name: string, phone?: string) => commit((s, c) => {
  const n = name.trim(); if (!n) throw new ErpError("Enter a customer name");
  if (n.length > 100) throw new ErpError("Name is too long");
  const cu: Customer = { id: uid(), name: n, phone: phone?.trim() || undefined, balance: 0, createdAt: Date.now() };
  s.customers.unshift(cu); c.audit("CUSTOMER CREATED", n); return cu;
});

export const receiveDebt = (customerId: string, amount: number, method: Method) => commit((s, c) => {
  const cu = s.customers.find((x) => x.id === customerId); if (!cu) throw new ErpError("Customer not found");
  if (method === "credit") throw new ErpError("Choose Cash, M-Pesa or Bank");
  if (!(amount > 0)) throw new ErpError("Enter an amount");
  if (amount > cu.balance + 0.001) throw new ErpError("Amount is more than the outstanding balance");
  cu.balance -= amount;
  allocateToSales(s, customerId, amount);
  s.payments.unshift({ id: uid(), ref: c.nextRef("PAY"), at: Date.now(), method, amount, kind: "DEBT", source: cu.name, customerId, user: c.user });
  c.audit("DEBT PAYMENT", `${cu.name} • ${amount}`);
});

/** Adds a payment against one P.PAY/Credit sale. */
export const paySale = (saleId: string, amount: number, method: Method) => commit((s, c) => {
  const x = s.sales.find((v) => v.id === saleId); if (!x) throw new ErpError("Sale not found");
  const cu = x.customerId ? s.customers.find((v) => v.id === x.customerId) : undefined; if (!cu) throw new ErpError("Customer not found");
  if (method === "credit") throw new ErpError("Choose Cash, M-Pesa or Bank");
  if (!(amount > 0)) throw new ErpError("Enter an amount");
  if (amount > saleBalance(s, x) + 0.001) throw new ErpError("Amount is more than the outstanding balance");
  cu.balance -= amount;
  allocateToSales(s, cu.id, amount, x.id);
  s.payments.unshift({ id: uid(), ref: c.nextRef("PAY"), at: Date.now(), method, amount, kind: "DEBT", source: x.ref, customerId: cu.id, user: c.user });
  c.audit("SALE PAYMENT", `${x.ref} • ${amount}`);
});

/** Partial returns supported; the original sale stays intact apart from the returned counter. */
export const returnSale = (saleId: string, lines: { productId: string; qty: number }[], refund: Method) => commit((s, c) => {
  const sale = s.sales.find((x) => x.id === saleId); if (!sale) throw new ErpError("Sale not found");
  const picked = lines.filter((l) => l.qty > 0); if (!picked.length) throw new ErpError("Choose items to return");
  const ratio = sale.subtotal ? sale.total / sale.subtotal : 1;
  const ref = c.nextRef("RET");
  const items = picked.map((l) => {
    const it = sale.items.find((i) => i.productId === l.productId); if (!it) throw new ErpError("Item not in sale");
    if (l.qty > it.qty - it.returned) throw new ErpError(`Only ${it.qty - it.returned} of ${it.name} can be returned`);
    it.returned += l.qty;
    if (s.products.some((p) => p.id === it.productId)) c.move(it.productId, "RETURN", l.qty, `Return of ${sale.ref}`, ref);
    return { productId: it.productId, name: it.name, qty: l.qty, amount: Math.round(l.qty * it.price * ratio * 100) / 100 };
  });
  const amount = items.reduce((a, i) => a + i.amount, 0);
  const cust = sale.customerId ? s.customers.find((x) => x.id === sale.customerId) : undefined;
  if (refund === "credit") {
    if (!cust) throw new ErpError("Customer credit needs a registered customer");
    cust.balance = Math.round((cust.balance - amount) * 100) / 100; // reduces debt or creates credit in the customer's favour
  } else {
    s.payments.unshift({ id: uid(), ref: c.nextRef("PAY"), at: Date.now(), method: refund, amount: -amount, kind: "REFUND", source: ref, customerId: cust?.id, user: c.user });
  }
  s.returns.unshift({ id: uid(), ref, at: Date.now(), saleId, saleRef: sale.ref, items, amount, refund, user: c.user });
  const earned = s.commissions.filter((x) => x.source === sale.ref).reduce((a, x) => a + x.amount, 0);
  if (sale.sellerId && earned > 0 && sale.total > 0) {
    const original = s.commissions.find((x) => x.source === sale.ref && x.kind === "EARNED");
    const productAmounts = original?.productAmounts ? Object.fromEntries(items.map((i) => [i.productId, -Math.round((original.productAmounts?.[i.productId] ?? 0) * i.qty / (sale.items.find((x) => x.productId === i.productId)?.qty ?? 1) * 100) / 100])) : undefined;
    const adj = productAmounts ? -Math.min(earned, -Object.values(productAmounts).reduce((a, x) => a + x, 0)) : -Math.min(earned, Math.round(earned * (amount / sale.total) * 100) / 100);
    if (adj < 0) s.commissions.unshift({ id: uid(), at: Date.now(), employeeId: sale.sellerId, source: sale.ref, amount: adj, kind: "RETURN ADJUSTMENT", pending: false, ...(productAmounts ? { productAmounts } : {}) });
  }
  c.audit("SALES RETURN", `${ref} for ${sale.ref} • ${amount}`);
});

// ---------- POS cash drawer ----------
export function cashSession(s: ErpState) {
  const lastUp = s.cash.find((e) => e.type === "CASH UP")?.at ?? 0;
  const ev = s.cash.filter((e) => e.at > lastUp);
  const opening = ev.filter((e) => e.type === "OPENING").reduce((a, e) => a + e.amount, 0);
  const cin = ev.filter((e) => e.type === "CASH IN").reduce((a, e) => a + e.amount, 0);
  const cout = ev.filter((e) => e.type === "CASH OUT").reduce((a, e) => a + e.amount, 0);
  const cashPay = s.payments.filter((p) => p.at > lastUp && p.method === "cash");
  const sales = cashPay.filter((p) => p.kind !== "REFUND" && p.amount > 0).reduce((a, p) => a + p.amount, 0);
  const refunds = -cashPay.filter((p) => p.kind === "REFUND").reduce((a, p) => a + p.amount, 0);
  const paidOut = -cashPay.filter((p) => p.kind !== "REFUND" && p.amount < 0).reduce((a, p) => a + p.amount, 0);
  return { opening, cin, cout: cout + paidOut, sales, refunds, expected: opening + sales - refunds + cin - cout - paidOut, since: lastUp };
}
export const cashEvent = (type: "OPENING" | "CASH IN" | "CASH OUT", amount: number, note?: string) => commit((s, c) => {
  if (!(amount > 0)) throw new ErpError("Enter an amount");
  if (type === "CASH OUT" && amount > cashSession(s).expected) throw new ErpError("Not enough cash in the drawer");
  s.cash.unshift({ id: uid(), at: Date.now(), type, amount, note: note?.trim() || undefined, user: c.user });
  c.audit(type, String(amount));
});
export const cashUp = (counted: number, note?: string) => commit((s, c) => {
  if (!(counted >= 0) || !Number.isFinite(counted)) throw new ErpError("Enter the counted cash");
  const expected = cashSession(s).expected;
  s.cash.unshift({ id: uid(), at: Date.now(), type: "CASH UP", amount: counted - expected, expected, counted, note: note?.trim() || undefined, user: c.user });
  c.audit("CASH UP", `Expected ${expected} • Counted ${counted}${note?.trim() ? ` • ${note.trim()}` : ""}`);
});

/** Commission earned on a sale per the employee's rule (immediate by default). */
export function commissionProducts(e: Employee, sale: Pick<Sale, "items" | "total" | "subtotal">) {
  const total = commissionFor(e, sale), weights = sale.items.reduce((a, i) => a + i.qty * i.price, 0);
  const ratio = sale.subtotal ? sale.total / sale.subtotal : 1;
  let left = total;
  return Object.fromEntries(sale.items.map((i, index) => {
    const rule = e.rule.products?.find((x) => x.productId === i.productId) ?? e.rule;
    const revenue = i.qty * i.price * ratio;
    const raw = e.rule.products?.length ? rule.kind === "fixed" ? rule.value * i.qty : rule.kind === "profit" ? Math.max(0, revenue - i.qty * i.cost) * rule.value / 100 : revenue * rule.value / 100 : weights ? total * i.qty * i.price / weights : 0;
    const v = index === sale.items.length - 1 ? left : Math.round(raw * 100) / 100; left = Math.round((left - v) * 100) / 100;
    return [i.productId, v];
  }));
}
export function commissionFor(e: Employee, sale: Pick<Sale, "items" | "total" | "subtotal">) {
  if (e.comp === "salary" || e.rule.kind === "none" || !(e.rule.value > 0)) return 0;
  const ratio = sale.subtotal ? sale.total / sale.subtotal : 1;
  if (e.rule.products?.length) {
    const v = sale.items.reduce((sum, i) => {
      const override = e.rule.products?.find((r) => r.productId === i.productId);
      const rule = override ?? e.rule;
      const revenue = i.qty * i.price * ratio;
      return sum + (rule.kind === "fixed" ? rule.value * i.qty : rule.kind === "profit" ? Math.max(0, revenue - i.qty * i.cost) * rule.value / 100 : revenue * rule.value / 100);
    }, 0);
    return Math.round(v * 100) / 100;
  }
  const profit = sale.items.reduce((a, i) => a + i.qty * (i.price * ratio - i.cost), 0);
  const v = e.rule.kind === "percent" ? sale.total * e.rule.value / 100 : e.rule.kind === "profit" ? Math.max(0, profit) * e.rule.value / 100 : e.rule.value;
  return Math.round(v * 100) / 100;
}
export function returnStatus(sale: Sale): "NOT RETURNED" | "PARTIALLY RETURNED" | "FULLY RETURNED" {
  const r = sale.items.reduce((a, i) => a + i.returned, 0), q = sale.items.reduce((a, i) => a + i.qty, 0);
  return r === 0 ? "NOT RETURNED" : r >= q ? "FULLY RETURNED" : "PARTIALLY RETURNED";
}

// ---------- Payroll ----------
export type NewEmployee = Omit<Employee, "id" | "createdAt" | "active">;
function checkEmployee(e: NewEmployee) {
  if (!e.name.trim()) throw new ErpError("Enter an employee name");
  if (!(e.salary >= 0) || (e.comp !== "commission" && !(e.salary > 0))) throw new ErpError("Enter a valid salary");
  if (e.comp !== "salary" && (e.rule.kind === "none" || !(e.rule.value > 0))) throw new ErpError("Set a commission rule");
  if (e.rule.kind !== "fixed" && e.rule.value > 100) throw new ErpError("Percentage can't exceed 100");
}
export const addEmployee = (e: NewEmployee) => commit((s, c) => {
  checkEmployee(e);
  const emp: Employee = { ...e, name: e.name.trim(), salary: e.comp === "commission" ? 0 : e.salary, rule: e.comp === "salary" ? { kind: "none", value: 0, paidOnly: false } : e.rule, id: uid(), active: true, createdAt: Date.now() };
  s.employees.unshift(emp); c.audit("EMPLOYEE ADDED", emp.name); return emp;
});
export const setEmployeeActive = (id: string, active: boolean) => commit((s, c) => {
  const e = s.employees.find((x) => x.id === id); if (!e) throw new ErpError("Employee not found");
  e.active = active; c.audit(active ? "EMPLOYEE ACTIVATED" : "EMPLOYEE DEACTIVATED", e.name);
});
/** Paid-only commission becomes eligible once the customer has no outstanding credit from that sale's customer. */
export function eligibleCommission(s: ErpState, employeeId: string) {
  return s.commissions.filter((x) => x.employeeId === employeeId && !x.payrollId && (!x.pending || isPaid(s, x.source)));
}
function isPaid(s: ErpState, saleRef: string) {
  const sale = s.sales.find((x) => x.ref === saleRef); if (!sale?.customerId) return true;
  return saleBalance(s, sale) <= 0.001;
}
export function payrollPreview(s: ErpState, employeeId: string, deductions: number) {
  const e = s.employees.find((x) => x.id === employeeId); if (!e) throw new ErpError("Employee not found");
  const commission = Math.round(eligibleCommission(s, employeeId).reduce((a, x) => a + x.amount, 0) * 100) / 100;
  const gross = e.salary + commission;
  return { salary: e.salary, commission, deductions, net: Math.round((gross - deductions) * 100) / 100 };
}
export const confirmPayroll = (employeeId: string, from: number, to: number, deductions: number) => commit((s, c) => {
  if (!(to >= from)) throw new ErpError("Choose a valid period");
  if (!(deductions >= 0)) throw new ErpError("Deductions can't be negative");
  if (s.payrolls.some((p) => p.employeeId === employeeId && p.from <= to && p.to >= from)) throw new ErpError("Payroll already confirmed for this period");
  const pv = payrollPreview(s, employeeId, deductions);
  if (pv.net < 0) throw new ErpError("Deductions exceed gross pay");
  const run: PayrollRun = { id: uid(), ref: c.nextRef("PR"), at: Date.now(), employeeId, from, to, ...pv, paid: 0, user: c.user };
  eligibleCommission(s, employeeId).forEach((x) => { const row = s.commissions.find((y) => y.id === x.id); if (row) row.payrollId = run.id; });
  s.payrolls.unshift(run); c.audit("PAYROLL CONFIRMED", `${run.ref} • ${run.net}`); return run;
});
export const payPayroll = (payrollId: string, method: Method, amount: number) => commit((s, c) => {
  const r = s.payrolls.find((x) => x.id === payrollId); if (!r) throw new ErpError("Payroll not found");
  if (method === "credit") throw new ErpError("Choose Cash, M-Pesa or Bank");
  if (!(amount > 0)) throw new ErpError("Enter an amount");
  if (amount > r.net - r.paid + 0.001) throw new ErpError("Amount is more than the outstanding pay");
  if (method === "cash" && amount > cashSession(s).expected) throw new ErpError("Not enough cash in the drawer");
  r.paid = Math.round((r.paid + amount) * 100) / 100;
  const ref = c.nextRef("PP");
  s.payrollPayments.unshift({ id: uid(), ref, at: Date.now(), payrollId, employeeId: r.employeeId, method, amount, user: c.user });
  if (method === "cash") s.cash.unshift({ id: uid(), at: Date.now(), type: "CASH OUT", amount, note: `Payroll ${r.ref}`, user: c.user });
  c.audit("PAYROLL PAYMENT", `${ref} • ${r.ref} • ${amount}`);
});
