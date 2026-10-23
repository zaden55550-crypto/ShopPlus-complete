import { clean } from "@/lib/format";
import { ModuleCharts } from "@/components/shopbook/analytics-charts";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, FileText, MessageCircle, Minus, MinusCircle, Plus, Printer, ShoppingCart, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ShopButton } from "@/components/ui/shop-button";
import { ProductSearch, useErp } from "@/components/shopbook/product-search";
import { Receipt, ReceiptSheet, ReturnForm, moneyFor, run, useAccount } from "@/components/shopbook/selling";
import { Kpi, KpiRow } from "@/components/shopbook/kpi";
import { BigButton, Badge, Box, Dot, Empty, ErpShell, Row, Tabs, toneOf, type Tr } from "@/components/shopbook/erp-shell";
import { DocHead, DocLine, DocRule, PrintPreview, whatsapp } from "@/components/shopbook/print";
import { PayPicker, emptyPay, payInvalid, payRecord, type PayState } from "@/components/shopbook/pay-picker";
import { vatRate } from "@/lib/prefs";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
import { CartSheet, useCartDraft } from "@/components/shopbook/cart-sheet";
import * as erp from "@/lib/erp";

export const Route = createFileRoute("/pos")({
  head: () => ({
    meta: [
      { title: "POS — SHOPBOOK ERP" },
      { name: "description", content: "Fast till: scan, floating cart, part payments, receipts and cash-up." },
      { property: "og:title", content: "POS — SHOPBOOK ERP" },
      { property: "og:description", content: "Sell fast with search, scan, split and part payments, and receipts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Pos,
});

const MENUS = {
  Sell: [],
  Transactions: ["Today's Sales", "Completed", "Cancelled", "Returns", "Transaction Details"],
  Cash: ["Opening Cash", "Cash In", "Cash Out", "Cash Up", "Cash History"],
  Reports: ["Daily Sales", "Sales by Product", "Payment Methods", "Cash Summary", "Cashier Performance", "Best Selling Products"],
} as const;
type Menu = keyof typeof MENUS;
type Ctx = { s: erp.ErpState; money: (n: number) => string; tr: Tr; shop: string };
const ACC: erp.Method[] = ["cash", "mpesa", "bank"];
const tm = (n: number) => new Date(n).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const today0 = () => new Date(new Date().toDateString()).getTime();
const posSales = (s: erp.ErpState) => s.sales.filter((x) => x.channel === "POS");
const n = (v: number) => clean(Math.round(clean(v) * 100) / 100).toLocaleString("en-KE");

function Pos() {
  const acct = useAccount("basic");
  const { tr } = useLanguage();
  const s = useErp();
  const [menu, setMenu] = useState<Menu>("Sell");
  const [sub, setSub] = useState("");
  const [detail, setDetail] = useState<string | null>(null);
  if (!acct) return <main className="app-screen" />;
  const ctx: Ctx = { s, money: moneyFor(acct.currency || "KSh"), tr, shop: acct.shopName };
  const go = (m: Menu, sm?: string) => { setMenu(m); setSub(sm ?? MENUS[m][0] ?? ""); };
  const openSale = (id: string) => { setDetail(id); go("Transactions", "Transaction Details"); };
  return (
    <ErpShell title="POS" shop={acct.shopName} menus={MENUS} menu={menu} sub={sub} deps={s} onMenu={(m) => go(m as Menu)} onSub={setSub}>
      {menu === "Sell" && <Sell {...ctx} openSale={openSale} />}
      {menu === "Transactions" && (sub === "Transaction Details" ? <Details {...ctx} id={detail} back={() => go("Transactions")} /> : <Transactions {...ctx} view={sub} openSale={openSale} />)}
      {menu === "Cash" && <Cash {...ctx} view={sub} />}
      {menu === "Reports" && <Reports {...ctx} view={sub} />}
    </ErpShell>
  );
}

// ---------------- SELL ----------------
function Sell(c: Ctx & { openSale: (id: string) => void }) {
  const { s, money, tr } = c;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const { cart, setCart, saveDraft, clearDraft } = useCartDraft("POS");
  const [step, setStep] = useState<"list" | "cart" | "pay">("list");
  const [done, setDone] = useState<erp.Sale | null>(null);
  const cartBtn = useRef<HTMLButtonElement>(null);
  const cats = s.categories.filter((k) => s.products.some((p) => p.categoryId === k.id));
  const list = useMemo(() => erp.searchProducts(s, q).filter((p) => cat === "all" || p.categoryId === cat), [s, q, cat]);
  const count = cart.length;
  const prod = (id: string) => s.products.find((p) => p.id === id);
  const add = (id: string, from?: HTMLElement) => {
    const p = prod(id); if (!p) return;
    const inCart = cart.find((l) => l.productId === id)?.qty ?? 0;
    if (inCart + 1 > p.qty) { toast.error(`${tr("Insufficient stock")}: ${p.name} (${p.qty})`); return; }
    setCart((x) => (x.some((l) => l.productId === id) ? x.map((l) => (l.productId === id ? { ...l, qty: l.qty + 1 } : l)) : [...x, { productId: id, qty: 1 }]));
    if (from && cartBtn.current) fly(from, cartBtn.current);
  };
  const setQty = (id: string, raw: number) => { const qty = erp.roundQty(raw); const p = prod(id); if (p && qty > p.qty) { toast.error(`${tr("Insufficient stock")}: ${p.name} (${p.qty})`); return; } setCart((x) => (qty <= 0 ? x.filter((l) => l.productId !== id) : x.map((l) => (l.productId === id ? { ...l, qty } : l)))); };

  if (done) return <Done {...c} sale={done} onNew={() => { setDone(null); setStep("list"); }} openSale={c.openSale} />;
  if (step === "pay") return <Payment {...c} cart={cart} back={() => setStep("cart")} onDone={(x) => { setCart([]); clearDraft(); setDone(x); }} />;
  return <>
    <ProductSearch q={q} setQ={setQ} tr={tr} onScan={(code) => { const p = erp.findByCode(s, code); if (p) { add(p.id); toast.success(p.name); } else toast.error(tr("Barcode not found — add it in Inventory")); }} />
    {cats.length > 0 && <div className="mt-1.5"><Tabs small items={["all", ...cats.map((k) => k.id)]} value={cat} onChange={setCat} tr={(k) => (k === "all" ? tr("All") : cats.find((x) => x.id === k)?.name ?? k)} /></div>}
    <div className="pos-head"><span>{tr("Product")}</span><span>{tr("Stock")}</span><span>{tr("Price")}</span><span /></div>
    {list.length === 0 && <Empty>{s.products.length ? tr("No matching products") : tr("No products yet. Add products in Inventory.")}</Empty>}
    {list.map((p) => { const inCart = cart.find((l) => l.productId === p.id)?.qty ?? 0; return (
      <ShopButton variant="bare" key={p.id} aria-label={`${tr("Add")} ${p.name}`} disabled={p.qty <= 0} onClick={(e) => add(p.id, e.currentTarget)} className={cn("pos-row pos-product-button", inCart > 0 && "pos-row-on")}>
        <span className="flex min-w-0 items-center gap-1.5"><Dot tone={p.qty <= 0 ? "bad" : p.qty <= (p.minStock ?? 5) ? "warn" : "ok"} /><span className="truncate">{p.name}</span>{inCart > 0 && <span className="pos-chip">×{inCart}</span>}</span>
        <span className="text-center tabular-nums">{p.qty}</span>
        <span className="text-end tabular-nums">{n(p.sell)}</span>
        <span className="pos-add" aria-hidden="true"><Plus className="h-3.5 w-3.5" /></span>
      </ShopButton>); })}
    <button ref={cartBtn} aria-label={`${tr("Cart")} (${count})`} onClick={() => (cart.length ? setStep("cart") : toast(tr("Cart is empty")))} className="pos-fab"><ShoppingCart className="h-6 w-6" />{count > 0 && <span className="pos-fab-count">{count}</span>}</button>
    {step === "cart" && <CartSheet s={s} money={money} tr={tr} cart={cart}
      setLine={(l) => setCart((x) => x.map((v) => v.productId === l.productId ? l : v))}
      remove={(id) => setQty(id, 0)} clear={() => { setCart([]); clearDraft(); setStep("list"); }}
      close={() => setStep("list")} next={() => setStep("pay")} saveDraft={saveDraft} />}
  </>;
}

/** Short flying dot from the + button to the floating cart; skipped when the user prefers less motion. */
function fly(from: HTMLElement, to: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("animate" in Element.prototype)) return;
  const a = from.getBoundingClientRect(); const b = to.getBoundingClientRect();
  const dot = document.createElement("span");
  dot.className = "pos-fly";
  dot.style.left = `${a.left + a.width / 2 - 8}px`; dot.style.top = `${a.top + a.height / 2 - 8}px`;
  document.body.appendChild(dot);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2); const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  dot.animate([{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 40}px) scale(0.9)`, opacity: 1, offset: 0.5 }, { transform: `translate(${dx}px, ${dy}px) scale(0.4)`, opacity: 0.3 }], { duration: 420, easing: "ease-in" }).onfinish = () => dot.remove();
  to.animate([{ transform: "scale(1)" }, { transform: "scale(1.15)" }, { transform: "scale(1)" }], { duration: 220, delay: 400 });
}

function Payment({ s, money, tr, cart, back, onDone }: Ctx & { cart: erp.CartLine[]; back: () => void; onDone: (x: erp.Sale) => void }) {
  const [pay, setPay] = useState<PayState>(emptyPay());
  const [disc, setDisc] = useState("");
  const [cust, setCust] = useState("");
  const [seller, setSeller] = useState("");
  const [note, setNote] = useState("");
  const vr = vatRate();
  const sellers = s.employees.filter((e) => e.active);
  const subtotal = erp.lineTotal(s, cart);
  const discount = Math.min(subtotal, Math.max(0, +disc || 0));
  const vat = Math.round((subtotal - discount) * vr) / 100;
  const total = Math.round((subtotal - discount + vat) * 100) / 100;
  const rec = payRecord(pay, total);
  const count = cart.reduce((a, l) => a + l.qty, 0);
  const complete = () => {
    if (payInvalid(pay, total)) { toast.error(tr("Check the payment amounts")); return; }
    if (rec.credit > 0.001 && !cust) { toast.error(tr("Credit needs a registered customer")); return; }
    const sale = run(() => erp.confirmSale({ cart, discount, pay: rec, customerId: cust || undefined, channel: "POS", sellerId: seller || undefined, vatRate: vr }));
    if (sale) onDone(sale);
  };
  return <div className="inventory-form">
    <div className="flex items-center gap-2"><button aria-label={tr("Back")} onClick={back}><ArrowLeft className="h-4 w-4" /></button><p className="inventory-form-title m-0">{tr("Payment")}</p></div>
    <div className="inventory-box mt-0 pur-totals"><span>{tr("Items")} ({count})</span><b>{count}</b><span>{tr("Subtotal")}</span><b>{money(subtotal)}</b><span>{tr("Discount")}</span><b>{money(discount)}</b>{vr > 0 && <><span>{tr("VAT")} ({vr}%)</span><b>{money(vat)}</b></>}<span>{tr("Total")}</span><b className="text-primary">{money(total)}</b></div>
    <div className="grid grid-cols-2 gap-1.5">
      <label className="inventory-field"><span>{tr("Discount")}</span><input className="inventory-input" inputMode="decimal" placeholder="0" value={disc} onChange={(e) => setDisc(e.target.value)} /></label>
      <SellerSelect s={s} tr={tr} value={seller} onChange={setSeller} sellers={sellers} />
    </div>
    <PayPicker value={pay} onChange={setPay} total={total} money={money} tr={tr} creditNote="The unpaid balance needs a registered customer" />
    {(rec.credit > 0.001 || s.customers.length > 0) && <label className="inventory-field"><span>{tr(rec.credit > 0.001 ? "Customer" : "Customer (optional)")}{rec.credit > 0.001 && <span className="text-destructive"> *</span>}</span><select className="inventory-input" value={cust} onChange={(e) => setCust(e.target.value)}><option value="">{tr(rec.credit > 0.001 ? "Select customer" : "No Customer")}</option>{s.customers.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>}
    <label className="inventory-field"><span>{tr("Notes (Optional)")}</span><input className="inventory-input" placeholder={tr("Enter notes...")} value={note} onChange={(e) => setNote(e.target.value)} /></label>
    <ShopButton className="inventory-save" onClick={complete}>{tr("Complete Sale")}</ShopButton>
  </div>;
}

/** Seller defaults to Admin; other active staff can be picked when they exist. */
export function SellerSelect({ tr, value, onChange, sellers }: { s: erp.ErpState; tr: Tr; value: string; onChange: (v: string) => void; sellers: erp.ErpState["employees"] }) {
  return <label className="inventory-field"><span>{tr("Seller")}</span><select className="inventory-input" value={value} disabled={!sellers.length} onChange={(e) => onChange(e.target.value)}><option value="">{tr("Admin")}</option>{sellers.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select></label>;
}

const receiptText = (x: erp.Sale, money: (n: number) => string, shop: string, bal: number) => [shop, `${x.ref} • ${new Date(x.at).toLocaleString("en-GB")}`, ...x.items.map((i) => `${i.name} ${i.qty} × ${i.price} = ${i.qty * i.price}`), `Total ${money(x.total)}`, ...ACC.filter((m) => x.pay[m] > 0).map((m) => `${erp.METHOD_LABEL[m]} ${money(x.pay[m])}`), bal > 0 ? `Balance ${money(bal)} (P.PAY)` : ""].filter(Boolean).join("\n");

function Done({ s, money, tr, shop, sale, onNew, openSale }: Ctx & { sale: erp.Sale; onNew: () => void; openSale: (id: string) => void }) {
  const [print, setPrint] = useState(false);
  const live = s.sales.find((x) => x.id === sale.id) ?? sale;
  const A = ({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) => <button className="pur-action" onClick={onClick}>{icon}<span className="flex-1 text-start">{label}</span><ChevronRight className="h-4 w-4" /></button>;
  return <div className="grid gap-2">
    <div className="pur-done"><CheckCircle2 className="h-16 w-16 text-primary" /><p className="text-lg font-bold">{tr("Sale Completed")}</p><p className="text-[11px] text-muted-foreground">{tr("Transaction")} {live.ref} {tr("has been completed successfully.")}</p><Badge s={erp.saleStatus(s, live)} /></div>
    <A icon={<FileText className="h-4 w-4" />} label={tr("View Transaction")} onClick={() => openSale(live.id)} />
    <A icon={<Printer className="h-4 w-4" />} label={tr("Print Receipt")} onClick={() => setPrint(true)} />
    <A icon={<MessageCircle className="h-4 w-4 text-primary" />} label={tr("Send Receipt (WhatsApp)")} onClick={() => whatsapp(receiptText(live, money, shop, erp.saleBalance(s, live)))} />
    <BigButton onClick={onNew}><Plus className="h-4 w-4" />{tr("New Sale")}</BigButton>
    {print && <PrintPreview title="Receipt" onClose={() => setPrint(false)}><Receipt sale={live} s={s} money={money} tr={tr} shop={shop} /></PrintPreview>}
  </div>;
}

// ---------------- TRANSACTIONS ----------------
function Transactions({ s, money, tr, view, openSale }: Ctx & { view: string; openSale: (id: string) => void }) {
  if (view === "Returns") {
    const ids = new Set(posSales(s).map((x) => x.id));
    const rets = s.returns.filter((r) => ids.has(r.saleId));
    return <div className="inventory-box">{rets.length ? rets.map((r) => <Row key={r.id}><Dot tone="bad" /><b>{r.ref}</b><span className="pur-muted">{tm(r.at)}</span><span className="pur-name">{r.saleRef}</span><span className="pur-amt">{money(r.amount)}</span><Badge s="Completed" /></Row>) : <Empty>{tr("No returns yet")}</Empty>}</div>;
  }
  const list = posSales(s).filter((x) => { const st = erp.saleStatus(s, x); return view === "Completed" ? st !== "Cancelled" : view === "Cancelled" ? st === "Cancelled" : x.at >= today0(); });
  return <div className="inventory-box">
    <div className="pos-tx pos-tx-head"><span /><span>#</span><span>{tr("Time")}</span><span>{tr("Items")}</span><span>{tr("Total")}</span><span>{tr("Status")}</span></div>
    {list.length ? list.map((x) => { const st = erp.saleStatus(s, x); return <button key={x.id} className="pos-tx w-full text-start" onClick={() => openSale(x.id)}><Dot tone={toneOf(st)} /><b>{x.ref}</b><span>{tm(x.at)}</span><span>{x.items.reduce((a, i) => a + i.qty, 0)}</span><span className="tabular-nums">{n(x.total)}</span><Badge s={st} /></button>; }) : <Empty>{tr(view === "Today's Sales" ? "No sales today" : "No sales yet")}</Empty>}
  </div>;
}

function Details({ s, money, tr, shop, id, back }: Ctx & { id: string | null; back: () => void }) {
  const [ret, setRet] = useState(false);
  const x = id ? s.sales.find((v) => v.id === id) : posSales(s)[0];
  if (!x) return <Empty>{tr("Tap a transaction to see its details")}</Empty>;
  return <ReceiptSheet sale={x} s={s} money={money} tr={tr} shop={shop} onClose={back}>
    {!ret ? (x.items.some((i) => i.returned < i.qty) && <ShopButton variant="outline" className="mt-2 h-10 text-sm" onClick={() => setRet(true)}>{tr("Return items")}</ShopButton>)
      : <ReturnForm sale={x} s={s} money={money} tr={tr} onDone={() => setRet(false)} />}
  </ReceiptSheet>;
}

// ---------------- CASH ----------------
function Cash({ s, money, tr, shop, view }: Ctx & { view: string }) {
  const [amt, setAmt] = useState(""); const [note, setNote] = useState("");
  const [print, setPrint] = useState<erp.CashEvent | null>(null);
  const cs = erp.cashSession(s);
  const submit = () => {
    if (view === "Cash Up") { const before = erp.cashSession(s); const r = run(() => erp.cashUp(+amt), tr("Cash-up saved")); if (r !== undefined) { setPrint({ id: "x", at: Date.now(), type: "CASH UP", amount: +amt, counted: +amt, expected: before.expected, note, user: "" }); setAmt(""); setNote(""); } return; }
    const type = view === "Opening Cash" ? "OPENING" : view === "Cash In" ? "CASH IN" : "CASH OUT";
    if (run(() => erp.cashEvent(type, +amt, note), tr("Recorded")) !== undefined) { setAmt(""); setNote(""); }
  };
  const variance = amt === "" ? null : +amt - cs.expected;
  return <>
    <KpiRow>
      <Kpi label={tr("Opening Cash")} value={money(cs.opening)} />
      <Kpi label={tr("Cash In")} value={money(cs.cin + cs.sales)} />
      <Kpi label={tr("Cash Out")} value={money(cs.cout + cs.refunds)} />
      <Kpi label={tr("Current Cash")} value={money(cs.expected)} />
    </KpiRow>
    {view !== "Cash History" ? <div className="inventory-form mt-2">
      {view === "Cash Up" && <div className="inventory-box mt-0 pur-totals">
        <span>{tr("Opening Cash")}</span><b>{money(cs.opening)}</b>
        <span>{tr("Cash Sales")}</span><b>{money(cs.sales)}</b>
        <span>{tr("Cash In")}</span><b>{money(cs.cin)}</b>
        <span>{tr("Cash Out")}</span><b>{money(cs.cout + cs.refunds)}</b>
        <span>{tr("Expected Cash")}</span><b className="text-primary">{money(cs.expected)}</b>
        {variance !== null && <><span>{tr("Actual Cash")}</span><b>{money(+amt)}</b><span>{tr("Variance")}</span><b className={cn(variance < 0 && "text-destructive", variance > 0 && "text-warning")}>{money(variance)}</b></>}
      </div>}
      <label className="inventory-field"><span>{tr(view === "Cash Up" ? "Actual Cash" : "Amount")} <span className="text-destructive">*</span></span><input className="inventory-input" type="number" min="0" inputMode="decimal" placeholder="0" value={amt} onChange={(e) => setAmt(e.target.value)} /></label>
      {view !== "Opening Cash" && <label className="inventory-field"><span>{tr(view === "Cash Up" ? "Notes (Optional)" : "Reason")}</span><input className="inventory-input" maxLength={120} value={note} onChange={(e) => setNote(e.target.value)} /></label>}
      <ShopButton className="inventory-save" onClick={submit}>{tr(view === "Cash Up" ? "Confirm Cash-up" : "Save")}</ShopButton>
    </div> : <div className="inventory-box">
      {s.cash.length ? s.cash.map((e) => <Row key={e.id} onClick={e.type === "CASH UP" ? () => setPrint(e) : undefined}><Dot tone={e.type === "CASH OUT" ? "bad" : e.type === "CASH UP" ? "info" : "ok"} /><span className="pur-muted">{new Date(e.at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span><span className="pur-name">{tr(e.type)}{e.note ? ` • ${e.note}` : ""}</span><span className="pur-amt">{money(e.type === "CASH UP" ? e.counted ?? e.amount : e.amount)}</span>{e.type === "CASH UP" && e.expected !== undefined && <span className={cn("pur-muted", (e.counted ?? 0) - e.expected < 0 && "text-destructive")}>{money((e.counted ?? 0) - e.expected)}</span>}</Row>) : <Empty>{tr("No cash records yet")}</Empty>}
    </div>}
    {print && <PrintPreview title="Cash-up" onClose={() => setPrint(null)}>
      <DocHead shop={shop} title={tr("Cash-up")} />
      <DocLine k={tr("Date")} v={new Date(print.at).toLocaleString("en-GB")} />
      <DocRule />
      <DocLine k={tr("Expected Cash")} v={money(print.expected ?? 0)} />
      <DocLine k={tr("Actual Cash")} v={money(print.counted ?? 0)} bold />
      <DocLine k={tr("Variance")} v={money((print.counted ?? 0) - (print.expected ?? 0))} bold />
      {print.note && <p className="mt-2">{tr("Notes")}: {print.note}</p>}
    </PrintPreview>}
  </>;
}

// ---------------- REPORTS ----------------
function Reports({ s, money, tr, view }: Ctx & { view: string }) {
  const [range, setRange] = useState<"Today" | "7 days" | "All">("Today");
  const since = range === "Today" ? today0() : range === "7 days" ? Date.now() - 7 * 864e5 : 0;
  const sales = posSales(s).filter((x) => x.at >= since);
  const ids = new Set(sales.map((x) => x.id));
  const returned = s.returns.filter((r) => ids.has(r.saleId)).reduce((a, r) => a + r.amount, 0);
  const gross = sales.reduce((a, x) => a + x.total, 0);
  const byProd = new Map<string, { q: number; v: number }>();
  sales.forEach((x) => x.items.forEach((i) => { const o = byProd.get(i.name) ?? { q: 0, v: 0 }; o.q += i.qty - i.returned; o.v += (i.qty - i.returned) * i.price; byProd.set(i.name, o); }));
  const byCashier = new Map<string, { c: number; v: number }>();
  sales.forEach((x) => { const o = byCashier.get(x.cashier) ?? { c: 0, v: 0 }; o.c++; o.v += x.total; byCashier.set(x.cashier, o); });
  const byDay = new Map<string, number>(); sales.forEach((x) => { const k = new Date(x.at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }); byDay.set(k, (byDay.get(k) ?? 0) + x.total); });
  const cs = erp.cashSession(s);
  return <>
    <div className="mb-1.5"><Tabs small items={["Today", "7 days", "All"]} value={range} onChange={(v) => setRange(v as typeof range)} tr={tr} /></div>
    <KpiRow><Kpi label={tr("Sales")} value={money(gross - returned)} /><Kpi label={tr("Transactions")} value={sales.length} /><Kpi label={tr("Returns")} value={money(returned)} /><Kpi label="P.PAY" value={sales.filter((x) => erp.saleStatus(s, x) === "P.PAY").length} /></KpiRow>
    <ModuleCharts s={{ ...s, sales: posSales(s), returns: s.returns.filter((r) => posSales(s).some((x) => x.id === r.saleId)) }} module="sales" from={since} money={money} tr={tr} single={view !== "Payment Methods"} />
    {view === "Daily Sales" && <Box title={tr("Daily Sales")}>{byDay.size ? [...byDay].map(([k, v]) => <Row key={k}><span className="pur-name">{k}</span><span className="pur-amt">{money(v)}</span></Row>) : <Empty>{tr("No sales yet")}</Empty>}</Box>}
    {(view === "Sales by Product" || view === "Best Selling Products") && <Box title={tr(view)}>{byProd.size ? [...byProd].sort((a, b) => (view === "Best Selling Products" ? b[1].q - a[1].q : b[1].v - a[1].v)).slice(0, view === "Best Selling Products" ? 10 : 99).map(([k, o]) => <Row key={k}><span className="pur-name">{k}</span><span className="pur-muted">× {o.q}</span><span className="pur-amt">{money(o.v)}</span></Row>) : <Empty>{tr("No sales yet")}</Empty>}</Box>}
    {view === "Payment Methods" && <Box title={tr("Payment Methods")}>{erp.METHODS.map((m) => <Row key={m}><span className="pur-name">{tr(erp.METHOD_LABEL[m])}</span><span className="pur-amt">{money(sales.reduce((a, x) => a + x.pay[m], 0))}</span></Row>)}</Box>}
    {view === "Cash Summary" && <Box title={tr("Cash Summary")}><div className="pur-totals"><span>{tr("Opening Cash")}</span><b>{money(cs.opening)}</b><span>{tr("Cash Sales")}</span><b>{money(cs.sales)}</b><span>{tr("Cash In")}</span><b>{money(cs.cin)}</b><span>{tr("Cash Out")}</span><b>{money(cs.cout + cs.refunds)}</b><span>{tr("Expected Cash")}</span><b className="text-primary">{money(cs.expected)}</b></div></Box>}
    {view === "Cashier Performance" && <Box title={tr("Cashier Performance")}>{byCashier.size ? [...byCashier].map(([k, o]) => <Row key={k}><span className="pur-name">{k}</span><span className="pur-muted">{o.c} {tr("sales")}</span><span className="pur-amt">{money(o.v)}</span></Row>) : <Empty>{tr("No sales yet")}</Empty>}</Box>}
  </>;
}
