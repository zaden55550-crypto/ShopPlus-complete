import { clean } from "@/lib/format";
import { ModuleCharts } from "@/components/shopbook/analytics-charts";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, Banknote, CheckCircle2, ChevronRight, CircleDollarSign, CreditCard, FileText, MessageCircle, MinusCircle, Plus, Printer, Receipt, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { ShopButton } from "@/components/ui/shop-button";
import { ProductSearch, useErp } from "@/components/shopbook/product-search";
import { run, useAccount } from "@/components/shopbook/selling";
import { Kpi, KpiRow } from "@/components/shopbook/kpi";
import { BigButton, Badge, Box, Dot, Empty, ErpShell, MoneyTrio, Row, Search, Tabs, toneOf, type Tr } from "@/components/shopbook/erp-shell";
import { PrintPreview } from "@/components/shopbook/print";
import { PayPicker, emptyPay, payInvalid, payRecord, type PayState } from "@/components/shopbook/pay-picker";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
import * as erp from "@/lib/erp";
import * as fin from "@/lib/finance";

export const Route = createFileRoute("/purchases")({
  head: () => ({ meta: [
    { title: "Purchases — SHOPBOOK ERP" },
    { name: "description", content: "Record supplier purchases, receive stock, pay suppliers and return goods." },
    { property: "og:title", content: "Purchases — SHOPBOOK ERP" },
    { property: "og:description", content: "Buy stock from suppliers with automatic stock and money updates." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Purchases,
});

const MENUS = {
  Overview: [],
  Purchases: ["All Purchases", "Drafts", "Completed", "Cancelled"],
  Suppliers: ["All Suppliers", "Add Supplier", "Balances", "History"],
  Payments: ["All Payments", "Make Payment", "P.PAY", "History"],
  Returns: ["All Returns", "New Return", "Pending", "Completed", "History"],
  Reports: ["Purchase Report", "Supplier Report", "Payment Report", "Return Report"],
} as const;
type Menu = keyof typeof MENUS;
type View = null | { k: "new"; draft?: Draft } | { k: "detail"; id: string } | { k: "done"; id: string };
type Ctx = { s: erp.ErpState; money: (n: number) => string; tr: Tr; go: (m: Menu, sub?: string) => void; open: (v: View) => void; shop: string };

// Drafts are unsaved work, not financial records, so they stay outside the ERP ledger.
type DraftLine = { productId: string; qty: string; cost: string; disc: string };
type Draft = { id: string; at: number; supplierId: string; lines: DraftLine[]; status: "draft" | "cancelled" };
const DKEY = "shopbook.purchaseDrafts";
const loadDrafts = (): Draft[] => { try { return JSON.parse(localStorage.getItem(DKEY) || "[]"); } catch { return []; } };
const saveDrafts = (d: Draft[]) => { localStorage.setItem(DKEY, JSON.stringify(d)); window.dispatchEvent(new Event("shopbook-drafts")); };
function useDrafts() {
  const [d, setD] = useState<Draft[]>([]);
  useEffect(() => { setD(loadDrafts()); const f = () => setD(loadDrafts()); window.addEventListener("shopbook-drafts", f); return () => window.removeEventListener("shopbook-drafts", f); }, []);
  return d;
}

const supName = (s: erp.ErpState, id?: string) => s.suppliers.find((x) => x.id === id)?.name ?? "—";
const supplierPayments = (s: erp.ErpState) => s.payments.filter((p) => p.kind === "SUPPLIER PAYMENT");
const paidOf = (s: erp.ErpState, p: erp.Purchase) => Math.max(0, p.total - fin.purchaseBalance(s, p));
function supplierStats(s: erp.ErpState, sup: erp.Supplier) {
  const pur = s.purchases.filter((p) => p.supplierId === sup.id);
  const purchases = pur.reduce((a, p) => a + p.total, 0);
  const paid = pur.reduce((a, p) => a + p.pay.cash + p.pay.mpesa + p.pay.bank, 0) + supplierPayments(s).filter((p) => p.source === sup.name).reduce((a, p) => a - p.amount, 0);
  const ids = new Set(pur.map((p) => p.id));
  const returns = s.purchaseReturns.filter((r) => ids.has(r.purchaseId)).reduce((a, r) => a + r.amount, 0);
  return { purchases, paid, returns, count: pur.length };
}

function Purchases() {
  const acct = useAccount("basic");
  const { tr } = useLanguage();
  const s = useErp();
  const [menu, setMenu] = useState<Menu>("Overview");
  const [sub, setSub] = useState("");
  const [view, setView] = useState<View>(null);
  if (!acct) return <main className="app-screen" />;
  const cur = acct.currency || "KSh";
  const money = (n: number) => `${cur} ${clean(Math.round(clean(n) * 100) / 100).toLocaleString("en-KE")}`;
  const go = (m: Menu, sm?: string) => { setView(null); setMenu(m); setSub(sm ?? MENUS[m][0] ?? ""); };
  const ctx: Ctx = { s, money, tr, go, open: setView, shop: acct.shopName };
  return (
    <ErpShell title="Purchases" shop={acct.shopName} menus={MENUS} menu={menu} sub={sub} deps={s} onMenu={(m) => go(m as Menu)} onSub={(x) => { setView(null); setSub(x); }}>
      {view?.k === "new" ? <NewPurchase {...ctx} draft={view.draft} />
        : view?.k === "detail" ? <PurchaseDetail {...ctx} id={view.id} />
        : view?.k === "done" ? <Done {...ctx} id={view.id} />
        : <>
          {menu === "Overview" && <Overview {...ctx} />}
          {menu === "Purchases" && (sub === "Drafts" || sub === "Cancelled" ? <Drafts {...ctx} cancelled={sub === "Cancelled"} /> : <PurchaseList {...ctx} completed={sub === "Completed"} />)}
          {menu === "Suppliers" && (sub === "Add Supplier" ? <AddSupplier {...ctx} /> : sub === "History" ? <SupplierHistory {...ctx} /> : <SupplierList {...ctx} balances={sub === "Balances"} />)}
          {menu === "Payments" && (sub === "Make Payment" ? <MakePayment {...ctx} /> : sub === "P.PAY" ? <OpenPurchases {...ctx} /> : <PaymentList {...ctx} />)}
          {menu === "Returns" && (sub === "New Return" ? <NewReturn {...ctx} /> : sub === "Pending" ? <Empty>{tr("No pending returns. Returns complete as soon as they are saved.")}</Empty> : <ReturnList {...ctx} />)}
          {menu === "Reports" && <Reports {...ctx} view={sub} />}
        </>}
    </ErpShell>
  );
}

function Kpis({ s, money, tr, from = 0, to = Date.now() }: Pick<Ctx, "s" | "money" | "tr"> & { from?: number; to?: number }) {
  const pur = s.purchases.filter((p) => p.at >= from && p.at <= to);
  const by = (st: erp.PayStatus) => pur.filter((p) => fin.purchaseStatus(s, p) === st).reduce((a, p) => a + p.total, 0);
  return <KpiRow>
    <Kpi icon={<ShoppingCart className="text-primary" />} label={tr("Purchases")} value={money(pur.reduce((a, p) => a + p.total, 0))} />
    <Kpi icon={<Banknote className="text-warning" />} label={tr("Paid")} value={money(by("Paid"))} />
    <Kpi icon={<CircleDollarSign className="text-warning" />} label="P.PAY" value={money(by("P.PAY"))} />
    <Kpi icon={<CreditCard className="text-destructive" />} label={tr("Credit")} value={money(by("Credit"))} />
  </KpiRow>;
}

function PurRow({ p, c, balance }: { p: erp.Purchase; c: Ctx; balance?: boolean }) {
  const st = fin.purchaseStatus(c.s, p);
  return <Row onClick={() => c.open({ k: "detail", id: p.id })}><Dot tone={toneOf(st)} /><b>{p.ref}</b><span className="pur-name">{supName(c.s, p.supplierId)}</span><span className="pur-amt">{c.money(p.total)}</span>{balance && <span className="pur-muted">{c.tr("Balance")}: {c.money(fin.purchaseBalance(c.s, p))}</span>}<Badge s={st} /></Row>;
}
function RetRow({ r, s, money, tr }: { r: erp.PurchaseReturn; s: erp.ErpState; money: (n: number) => string; tr: Tr }) {
  const pur = s.purchases.find((p) => p.id === r.purchaseId);
  const n = r.items.reduce((a, i) => a + i.qty, 0);
  return <Row><Dot tone="ok" /><b>{r.ref}</b><span className="pur-name">{supName(s, pur?.supplierId)}</span><span className="pur-muted">{n} {tr(n === 1 ? "item" : "items")}</span><span className="pur-amt">{money(r.amount)}</span><Badge s="Completed" /></Row>;
}

function Overview(c: Ctx) {
  const { s, money, tr, go } = c;
  const owed = s.purchases.filter((p) => fin.purchaseBalance(s, p) > 0.001);
  const top = s.suppliers.map((x) => ({ x, n: s.purchases.filter((p) => p.supplierId === x.id).length })).filter((t) => t.n > 0).sort((a, b) => b.n - a.n).slice(0, 5);
  return (<>
    <Kpis {...c} />
    <ModuleCharts s={s} module="purchases" money={money} tr={tr} />
    <Box title={tr("Recent Purchases")} action={() => go("Purchases")}>{s.purchases.length ? s.purchases.slice(0, 5).map((p) => <PurRow key={p.id} p={p} c={c} />) : <Empty>{tr("No purchases yet")}</Empty>}</Box>
    <Box title={tr("Top Suppliers")} action={() => go("Suppliers")}>{top.length ? top.map(({ x, n }) => <Row key={x.id}><Dot tone={x.balance > 0 ? "warn" : "ok"} /><span className="pur-name">{x.name}</span><span className="pur-amt">{n}</span></Row>) : <Empty>{tr("No suppliers yet")}</Empty>}</Box>
    <Box title={tr("Outstanding Supplier Payments")} action={() => go("Payments", "P.PAY")}>{owed.length ? owed.slice(0, 5).map((p) => <PurRow key={p.id} p={p} c={c} balance />) : <Empty>{tr("Nothing owed to suppliers")}</Empty>}</Box>
    <Box title={tr("Recent Returns")} action={() => go("Returns")}>{s.purchaseReturns.length ? s.purchaseReturns.slice(0, 5).map((r) => <RetRow key={r.id} r={r} s={s} money={money} tr={tr} />) : <Empty>{tr("No returns yet")}</Empty>}</Box>
  </>);
}

function PurchaseList(c: Ctx & { completed: boolean }) {
  const { s, tr, completed } = c;
  const [q, setQ] = useState("");
  const list = s.purchases.filter((p) => (!completed || fin.purchaseStatus(s, p) !== "Cancelled") && `${p.ref} ${supName(s, p.supplierId)}`.toLowerCase().includes(q.toLowerCase()));
  return <>
    <BigButton onClick={() => c.open({ k: "new" })}><Plus className="h-4 w-4" />{tr("New Purchase")}</BigButton>
    <Search q={q} setQ={setQ} tr={tr} ph="Search purchases..." />
    <div className="inventory-box">{list.length ? list.map((p) => <PurRow key={p.id} p={p} c={c} />) : <Empty>{tr("No purchases yet")}</Empty>}</div>
  </>;
}

/** Cash, M-Pesa and Bank rows added one at a time; whatever is unpaid becomes credit (P.PAY). */
function PayRows({ rows, setRows, tr }: { rows: { m: erp.Method; a: string }[]; setRows: (r: { m: erp.Method; a: string }[]) => void; tr: Tr }) {
  return <>
    {rows.map((r, i) => <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center gap-1.5">
      <select className="inventory-input" value={r.m} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, m: e.target.value as erp.Method } : x)))}>{fin.ACCOUNTS.map((m) => <option key={m} value={m} disabled={m !== r.m && rows.some((x) => x.m === m)}>{tr(erp.METHOD_LABEL[m])}</option>)}</select>
      <input className="inventory-input" inputMode="decimal" placeholder="0" value={r.a} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} />
      <button aria-label={tr("Remove")} disabled={rows.length === 1} onClick={() => setRows(rows.filter((_, j) => j !== i))}><MinusCircle className="h-4 w-4 text-destructive" /></button></div>)}
    {rows.length < fin.ACCOUNTS.length && <ShopButton className="inventory-save w-fit px-3" onClick={() => setRows([...rows, { m: fin.ACCOUNTS.find((m) => !rows.some((r) => r.m === m)) ?? "cash", a: "" }])}><Plus className="h-3.5 w-3.5" />{tr("Add Payment Method")}</ShopButton>}
  </>;
}
const sumRows = (rows: { a: string }[]) => rows.reduce((a, r) => a + (+r.a || 0), 0);

function NewPurchase(c: Ctx & { draft?: Draft | undefined }) {
  const { s, money, tr, go, draft } = c;
  const [q, setQ] = useState("");
  const [lines, setLines] = useState<DraftLine[]>(draft?.lines ?? []);
  const [sup, setSup] = useState(draft?.supplierId ?? "");
  const [pay, setPay] = useState<PayState>(emptyPay());
  const [note, setNote] = useState("");
  const addLine = (p: erp.Product) => setLines((l) => (l.some((x) => x.productId === p.id) ? l : [...l, { productId: p.id, qty: "1", cost: String(p.buy), disc: "0" }]));
  const results = q.trim() ? erp.searchProducts(s, q).slice(0, 6) : [];
  const lt = (l: DraftLine) => Math.max(0, (+l.qty || 0) * (+l.cost || 0) - (+l.disc || 0));
  const subtotal = lines.reduce((a, l) => a + (+l.qty || 0) * (+l.cost || 0), 0);
  const discount = lines.reduce((a, l) => a + Math.min(+l.disc || 0, (+l.qty || 0) * (+l.cost || 0)), 0);
  const total = Math.round((subtotal - discount) * 100) / 100;
  const rec = payRecord(pay, total);
  const set = (i: number, k: keyof DraftLine, v: string) => setLines(lines.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const confirm = () => {
    if (!sup) { toast.error(tr("Choose a supplier")); return; }
    if (payInvalid(pay, total)) { toast.error(tr("Check the payment amounts")); return; }
    const r = run(() => fin.confirmPurchase({
      // Line discounts are folded into the unit buying price so stock value and profit use the real cost.
      lines: lines.map((l) => ({ productId: l.productId, qty: +l.qty, cost: +l.qty > 0 ? Math.round((lt(l) / +l.qty) * 100) / 100 : 0 })),
      pay: rec, supplierId: sup, updateCost: true,
    }));
    if (r) { if (draft) saveDrafts(loadDrafts().filter((d) => d.id !== draft.id)); c.open({ k: "done", id: r.id }); }
  };
  const saveDraft = () => {
    if (!lines.length) { toast.error(tr("Add products to the purchase")); return; }
    const d: Draft = { id: draft?.id ?? crypto.randomUUID(), at: Date.now(), supplierId: sup, lines, status: "draft" };
    saveDrafts([d, ...loadDrafts().filter((x) => x.id !== d.id)]); toast.success(tr("Draft saved")); go("Purchases", "Drafts");
  };
  return (<div className="inventory-form">
    <p className="inventory-form-title">{tr("New Purchase")}</p>
    <label className="inventory-field"><span>{tr("Supplier")} <span className="text-destructive">*</span></span>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-1.5">
        <select className="inventory-input" value={sup} onChange={(e) => setSup(e.target.value)}><option value="">{tr("Select supplier")}</option>{s.suppliers.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
        <ShopButton className="inventory-save px-3" onClick={() => go("Suppliers", "Add Supplier")}><Plus className="h-3.5 w-3.5" />{tr("Add")}</ShopButton>
      </div></label>
    <div><ProductSearch q={q} setQ={setQ} tr={tr} onScan={(code) => { const p = erp.findByCode(s, code); if (p) addLine(p); else toast.error(tr("Product not found. Add it in Inventory first.")); }} />
      {results.map((p) => <button key={p.id} onClick={() => { addLine(p); setQ(""); }} className="pur-row w-full text-start"><Plus className="h-3.5 w-3.5 shrink-0 text-primary" /><span className="pur-name">{p.name}</span><span className="pur-muted">{tr("Stock")} {p.qty}</span></button>)}</div>
    {lines.length > 0 && <div className="pur-scroll"><div className="pur-line pur-line-head"><span>{tr("Product")}</span><span>{tr("Qty")}</span><span>{tr("Cost")}</span><span>{tr("Disc")}</span><span>{tr("Total")}</span><span /></div>
      {lines.map((l, i) => <div key={l.productId} className="pur-line"><span className="truncate">{s.products.find((x) => x.id === l.productId)?.name}</span>
        <input className="inventory-input" inputMode="decimal" aria-label={tr("Quantity")} value={l.qty} onChange={(e) => set(i, "qty", e.target.value)} />
        <input className="inventory-input" inputMode="decimal" aria-label={tr("Cost")} value={l.cost} onChange={(e) => set(i, "cost", e.target.value)} />
        <input className="inventory-input" inputMode="decimal" aria-label={tr("Discount")} value={l.disc} onChange={(e) => set(i, "disc", e.target.value)} />
        <span className="text-end tabular-nums">{lt(l).toLocaleString("en-KE")}</span>
        <button aria-label={tr("Remove")} onClick={() => setLines(lines.filter((_, j) => j !== i))}><MinusCircle className="h-4 w-4 text-destructive" /></button></div>)}</div>}
    {lines.length > 0 && <>
      <div className="pur-totals"><span>{tr("Items")}</span><b>{lines.length}</b><span>{tr("Subtotal")}</span><b>{money(subtotal)}</b><span>{tr("Discount")}</span><b>{money(discount)}</b><span>{tr("Total")}</span><b className="text-primary">{money(total)}</b></div>
      <PayPicker value={pay} onChange={setPay} total={total} money={money} tr={tr} creditNote="The unpaid balance is added to what you owe this supplier" />
      <label className="inventory-field"><span>{tr("Notes (Optional)")}</span><input className="inventory-input" placeholder={tr("Enter notes...")} value={note} onChange={(e) => setNote(e.target.value)} /></label>
      <div className="grid grid-cols-[1fr_2fr] gap-1.5"><ShopButton variant="outline" className="inventory-save" onClick={saveDraft}>{tr("Save draft")}</ShopButton><ShopButton className="inventory-save" onClick={confirm}>{tr("Complete Purchase")}</ShopButton></div>
    </>}
  </div>);
}

function PurchaseDoc({ p, s, money, tr, shop }: Pick<Ctx, "s" | "money" | "tr" | "shop"> & { p: erp.Purchase }) {
  return <div>
    <p className="text-center text-sm font-extrabold uppercase">{shop}</p>
    <p className="mt-2">{tr("Purchase No")}: {p.ref}</p><p>{tr("Date")}: {new Date(p.at).toLocaleString("en-GB")}</p><p>{tr("Supplier")}: {supName(s, p.supplierId)}</p>
    <div className="my-2 border-t border-dashed" />
    {p.items.map((i) => <div key={i.productId} className="grid grid-cols-[1fr_auto_auto_auto] gap-2"><span>{i.name}</span><span>{i.qty}</span><span>{i.cost.toLocaleString("en-KE")}</span><span>{(i.qty * i.cost).toLocaleString("en-KE")}</span></div>)}
    <div className="my-2 border-t border-dashed" />
    <div className="flex justify-between font-bold"><span>{tr("Total")}</span><span>{money(p.total)}</span></div>
    {fin.ACCOUNTS.filter((m) => p.pay[m] > 0).map((m) => <div key={m} className="flex justify-between"><span>{tr(erp.METHOD_LABEL[m])}</span><span>{money(p.pay[m])}</span></div>)}
    <div className="flex justify-between"><span>{tr("Total Paid")}</span><span>{money(paidOf(s, p))}</span></div>
    <div className="flex justify-between font-bold"><span>{tr("Balance")}</span><span>{money(fin.purchaseBalance(s, p))}</span></div>
  </div>;
}
const docText = (p: erp.Purchase, s: erp.ErpState, money: (n: number) => string, shop: string) => [shop, `${p.ref} • ${supName(s, p.supplierId)}`, ...p.items.map((i) => `${i.name} ${i.qty} × ${i.cost}`), `Total ${money(p.total)}`, `Paid ${money(paidOf(s, p))}`, `Balance ${money(fin.purchaseBalance(s, p))}`].join("\n");

function Done(c: Ctx & { id: string }) {
  const { s, tr, money, shop } = c;
  const p = s.purchases.find((x) => x.id === c.id);
  const [print, setPrint] = useState(false);
  if (!p) return <Empty>{tr("Purchase not found")}</Empty>;
  const A = ({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) => <button className="pur-action" onClick={onClick}>{icon}<span className="flex-1 text-start">{label}</span><ChevronRight className="h-4 w-4" /></button>;
  return <div className="grid gap-2">
    <div className="pur-done"><CheckCircle2 className="h-16 w-16 text-primary" /><p className="text-lg font-bold">{tr("Purchase Completed")}</p><p className="text-[11px] text-muted-foreground">{tr("Purchase")} {p.ref} {tr("has been completed successfully.")}</p></div>
    <A icon={<FileText className="h-4 w-4" />} label={tr("View Purchase")} onClick={() => c.open({ k: "detail", id: p.id })} />
    <A icon={<Printer className="h-4 w-4" />} label={tr("Print Purchase")} onClick={() => setPrint(true)} />
    <A icon={<MessageCircle className="h-4 w-4 text-primary" />} label={tr("Send Purchase (WhatsApp)")} onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(docText(p, s, money, shop))}`, "_blank")} />
    <BigButton onClick={() => c.open({ k: "new" })}><Plus className="h-4 w-4" />{tr("New Purchase")}</BigButton>
    <button className="pur-action" onClick={() => c.go("Purchases")}><ArrowLeft className="h-4 w-4" />{tr("Back to Purchases")}</button>
    {print && <PrintPreview title="Print Purchase" onClose={() => setPrint(false)}><PurchaseDoc p={p} s={s} money={money} tr={tr} shop={shop} /></PrintPreview>}
  </div>;
}

function PurchaseDetail(c: Ctx & { id: string }) {
  const { s, money, tr } = c;
  const [tab, setTab] = useState("Items");
  const [adding, setAdding] = useState(false);
  const [rows, setRows] = useState<{ m: erp.Method; a: string }[]>([{ m: "cash", a: "" }]);
  const p = s.purchases.find((x) => x.id === c.id);
  if (!p) return <Empty>{tr("Purchase not found")}</Empty>;
  const sup = s.suppliers.find((x) => x.id === p.supplierId);
  const bal = fin.purchaseBalance(s, p);
  const st = fin.purchaseStatus(s, p);
  const rets = s.purchaseReturns.filter((r) => r.purchaseId === p.id);
  const pays = s.payments.filter((x) => x.source === p.ref || (x.kind === "SUPPLIER PAYMENT" && x.source === sup?.name && x.at >= p.at));
  const save = () => {
    const picked = rows.filter((r) => +r.a > 0);
    if (!picked.length) { toast.error(tr("Enter an amount")); return; }
    if (sumRows(picked) > bal + 0.001) { toast.error(tr("Amount is more than the outstanding balance")); return; }
    for (const r of picked) if (run(() => fin.payPurchase(p.id, +r.a, r.m)) === undefined) return;
    toast.success(tr("Payment recorded")); setAdding(false); setRows([{ m: "cash", a: "" }]);
  };
  return <div className="grid gap-1.5">
    <div className="flex items-center justify-between"><p className="inventory-form-title m-0">{tr("Purchase")} {p.ref}</p><Badge s={st} /></div>
    <Box title={sup?.name ?? tr("No supplier")}>{sup?.phone && <p className="text-[11px] text-muted-foreground">{sup.phone}</p>}<p className="text-[11px] text-muted-foreground">{new Date(p.at).toLocaleString("en-GB")}</p></Box>
    <MoneyTrio total={p.total} paid={paidOf(s, p)} balance={bal} money={money} tr={tr} />
    {bal > 0.001 && !adding && <BigButton onClick={() => setAdding(true)}><Plus className="h-4 w-4" />{tr("Add Payment")}</BigButton>}
    {adding && <div className="inventory-box grid gap-1.5"><p className="text-[11px]">{tr("Outstanding Balance")}: <b>{money(bal)}</b></p><PayRows rows={rows} setRows={setRows} tr={tr} /><ShopButton className="inventory-save" onClick={save}>{tr("Save Payment")}</ShopButton></div>}
    <Tabs small items={["Items", "Payments", "Returns", "History"]} value={tab} onChange={setTab} tr={tr} />
    <div className="inventory-box mt-0">
      {tab === "Items" && p.items.map((i) => <Row key={i.productId}><span className="pur-name">{i.name}</span><span className="pur-muted">× {i.qty}</span><span className="pur-muted">{i.cost.toLocaleString("en-KE")}</span><span className="pur-amt">{money(i.qty * i.cost)}</span></Row>)}
      {tab === "Payments" && (pays.length ? pays.map((x) => <Row key={x.id}><Dot tone="ok" /><b>{x.ref}</b><span className="pur-name">{tr(erp.METHOD_LABEL[x.method])}</span><span className="pur-amt">{money(Math.abs(x.amount))}</span></Row>) : <Empty>{tr("No payments yet")}</Empty>)}
      {tab === "Returns" && (rets.length ? rets.map((r) => <RetRow key={r.id} r={r} s={s} money={money} tr={tr} />) : <Empty>{tr("No returns yet")}</Empty>)}
      {tab === "History" && s.audit.filter((a) => a.detail?.includes(p.ref)).map((a) => <Row key={a.id}><span className="pur-muted">{new Date(a.at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span><span className="pur-name">{tr(a.action)}</span></Row>)}
    </div>
    <ShopButton variant="outline" className="inventory-save" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(docText(p, s, money, c.shop))}`, "_blank")}><Receipt className="h-4 w-4" />{tr("Send Purchase (WhatsApp)")}</ShopButton>
  </div>;
}

function Drafts(c: Ctx & { cancelled: boolean }) {
  const { s, money, tr, cancelled } = c;
  const drafts = useDrafts().filter((d) => d.status === (cancelled ? "cancelled" : "draft"));
  const done = cancelled ? s.purchases.filter((p) => fin.purchaseStatus(s, p) === "Cancelled") : [];
  const amt = (d: Draft) => d.lines.reduce((a, l) => a + Math.max(0, (+l.qty || 0) * (+l.cost || 0) - (+l.disc || 0)), 0);
  return <div className="inventory-box">
    {done.map((p) => <PurRow key={p.id} p={p} c={c} />)}
    {drafts.map((d) => <Row key={d.id} onClick={cancelled ? undefined : () => c.open({ k: "new", draft: d })}><Dot tone={cancelled ? "bad" : "warn"} /><span className="pur-name">{supName(s, d.supplierId)}</span><span className="pur-muted">{d.lines.length} {tr("items")}</span><span className="pur-amt">{money(amt(d))}</span><Badge s={cancelled ? "Cancelled" : "Draft"} />
      {!cancelled && <button className="pur-muted" onClick={(e) => { e.stopPropagation(); saveDrafts(loadDrafts().map((x) => (x.id === d.id ? { ...x, status: "cancelled" as const } : x))); }}>{tr("Cancel")}</button>}</Row>)}
    {!drafts.length && !done.length && <Empty>{tr(cancelled ? "No cancelled purchases" : "No drafts")}</Empty>}
  </div>;
}

function SupplierList({ s, money, tr, go, balances }: Ctx & { balances: boolean }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const list = s.suppliers.filter((x) => (!balances || x.balance > 0.001) && `${x.name} ${x.phone ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  const sel = s.suppliers.find((x) => x.id === open);
  if (sel) return <SupplierDetail sup={sel} s={s} money={money} tr={tr} back={() => setOpen(null)} />;
  return (<>
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-1.5"><Search q={q} setQ={setQ} tr={tr} ph="Search suppliers..." /><ShopButton className="inventory-save px-3" onClick={() => go("Suppliers", "Add Supplier")}><Plus className="h-3.5 w-3.5" />{tr("Add Supplier")}</ShopButton></div>
    <div className="inventory-box">{list.length ? list.map((x) => { const st = supplierStats(s, x); return <Row key={x.id} onClick={() => setOpen(x.id)}><Dot tone={x.balance > 0.001 ? "warn" : "ok"} /><span className="pur-name">{x.name}</span><span className="pur-muted">{x.phone ?? "—"}</span><span className="pur-muted">{tr("Purchases")}: {money(st.purchases)}</span><span className={cn("pur-amt", x.balance > 0.001 && "text-warning")}>{tr("Balance")}: {money(x.balance)}</span><ChevronRight className="h-3.5 w-3.5 shrink-0" /></Row>; }) : <Empty>{tr("No suppliers yet")}</Empty>}</div>
  </>);
}

function SupplierDetail({ sup, s, money, tr, back }: Pick<Ctx, "s" | "money" | "tr"> & { sup: erp.Supplier; back: () => void }) {
  const st = supplierStats(s, sup);
  const pur = s.purchases.filter((p) => p.supplierId === sup.id);
  const ids = new Set(pur.map((p) => p.id));
  return (<>
    <ShopButton variant="bare" className="inventory-view-all mb-1" onClick={back}>‹ {tr("Back")}</ShopButton>
    <Box title={sup.name}>{[["Phone", sup.phone], ["Email", sup.email], ["Address", sup.address], ["Business Information", sup.info], ["Notes", sup.notes]].filter(([, v]) => v).map(([k, v]) => <Row key={k}><span className="pur-muted">{tr(k!)}</span><span className="pur-name text-end">{v}</span></Row>)}</Box>
    <MoneyTrio total={st.purchases} paid={st.paid} balance={sup.balance} money={money} tr={tr} />
    <Box title={tr("Purchase history")}>{pur.length ? pur.map((p) => { const ps = fin.purchaseStatus(s, p); return <Row key={p.id}><Dot tone={toneOf(ps)} /><b>{p.ref}</b><span className="pur-amt">{money(p.total)}</span><Badge s={ps} /></Row>; }) : <Empty>{tr("No purchases yet")}</Empty>}</Box>
    <Box title={tr("Payment history")}>{supplierPayments(s).filter((p) => p.source === sup.name).map((p) => <Row key={p.id}><Dot tone="ok" /><b>{p.ref}</b><span className="pur-muted">{tr(erp.METHOD_LABEL[p.method])}</span><span className="pur-amt">{money(-p.amount)}</span><Badge s="Paid" /></Row>)}</Box>
    <Box title={tr("Return history")}>{s.purchaseReturns.filter((r) => ids.has(r.purchaseId)).map((r) => <RetRow key={r.id} r={r} s={s} money={money} tr={tr} />)}</Box>
  </>);
}

function AddSupplier({ tr, go }: Ctx) {
  const [f, setF] = useState({ name: "", phone: "", email: "", address: "", info: "", notes: "" });
  const field = (k: keyof typeof f, label: string, ph: string, req = false) => <label className="inventory-field"><span>{tr(label)}{req && <span className="text-destructive"> *</span>}</span><input className="inventory-input" placeholder={tr(ph)} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></label>;
  return <div className="inventory-form">
    {field("name", "Supplier Name", "Enter supplier name", true)}{field("phone", "Phone", "Enter phone number")}{field("email", "Email", "Enter email address")}{field("address", "Address", "Enter address")}{field("info", "Business Information", "Enter business information")}{field("notes", "Notes (Optional)", "Enter notes...")}
    <ShopButton className="inventory-save" onClick={() => { if (run(() => fin.addSupplier(f.name, f.phone, { email: f.email, address: f.address, info: f.info, notes: f.notes }), tr("Supplier added"))) go("Suppliers", "All Suppliers"); }}>{tr("Save Supplier")}</ShopButton>
  </div>;
}

function SupplierHistory({ s, money, tr }: Ctx) {
  const rows = [
    ...s.purchases.map((p) => ({ id: p.id, at: p.at, ref: p.ref, who: supName(s, p.supplierId), amt: p.total, st: "Purchase" })),
    ...supplierPayments(s).map((p) => ({ id: p.id, at: p.at, ref: p.ref, who: p.source ?? "—", amt: -p.amount, st: "Payment" })),
    ...s.purchaseReturns.map((r) => ({ id: r.id, at: r.at, ref: r.ref, who: supName(s, s.purchases.find((p) => p.id === r.purchaseId)?.supplierId), amt: r.amount, st: "Return" })),
  ].sort((a, b) => b.at - a.at);
  return <div className="inventory-box">{rows.length ? rows.map((r) => <Row key={r.id}><Dot tone={r.st === "Return" ? "bad" : "ok"} /><b>{r.ref}</b><span className="pur-name">{r.who}</span><span className="pur-muted">{tr(r.st)}</span><span className="pur-amt">{money(r.amt)}</span></Row>) : <Empty>{tr("No history yet")}</Empty>}</div>;
}

function PaymentList({ s, money, tr }: Ctx) {
  const [q, setQ] = useState("");
  const list = s.payments.filter((p) => (p.kind === "SUPPLIER PAYMENT" || p.kind === "PURCHASE") && `${p.ref} ${p.source}`.toLowerCase().includes(q.toLowerCase()));
  const label = (p: erp.Payment) => (p.kind === "PURCHASE" ? `${p.source} • ${supName(s, s.purchases.find((x) => x.ref === p.source)?.supplierId)}` : p.source);
  return <><Search q={q} setQ={setQ} tr={tr} ph="Search payments..." /><div className="inventory-box">{list.length ? list.map((p) => <Row key={p.id}><Dot tone="ok" /><b>{p.ref}</b><span className="pur-name">{label(p)}</span><span className="pur-amt">{money(-p.amount)}</span><span className="pur-muted">{tr(erp.METHOD_LABEL[p.method])}</span><Badge s="Paid" /></Row>) : <Empty>{tr("No supplier payments yet")}</Empty>}</div></>;
}

function OpenPurchases(c: Ctx) {
  const [q, setQ] = useState("");
  const list = c.s.purchases.filter((p) => fin.purchaseBalance(c.s, p) > 0.001 && `${p.ref} ${supName(c.s, p.supplierId)}`.toLowerCase().includes(q.toLowerCase()));
  return <><Search q={q} setQ={setQ} tr={c.tr} ph="Search partial payments..." /><div className="inventory-box">{list.length ? list.map((p) => <PurRow key={p.id} p={p} c={c} balance />) : <Empty>{c.tr("Nothing owed to suppliers")}</Empty>}</div></>;
}

function MakePayment({ s, money, tr, go }: Ctx) {
  const open = s.purchases.filter((p) => fin.purchaseBalance(s, p) > 0.001);
  const [pid, setPid] = useState(open[0]?.id ?? "");
  const [rows, setRows] = useState<{ m: erp.Method; a: string }[]>([{ m: "cash", a: "" }]);
  const [note, setNote] = useState("");
  const p = s.purchases.find((x) => x.id === pid);
  const bal = p ? fin.purchaseBalance(s, p) : 0;
  const total = sumRows(rows);
  const save = () => {
    if (!p) { toast.error(tr("Choose purchase")); return; }
    const picked = rows.filter((r) => +r.a > 0);
    if (!picked.length) { toast.error(tr("Enter an amount")); return; }
    if (total > bal + 0.001) { toast.error(tr("Amount is more than the outstanding balance")); return; }
    for (const r of picked) if (run(() => fin.payPurchase(p.id, +r.a, r.m)) === undefined) return;
    toast.success(tr("Payment recorded")); setRows([{ m: "cash", a: "" }]); setNote(""); go("Payments", "All Payments");
  };
  return <div className="inventory-form">
    <p className="inventory-form-title">{tr("Make Payment")}</p>
    <label className="inventory-field"><span>{tr("Purchase")} <span className="text-destructive">*</span></span><select className="inventory-input" value={pid} onChange={(e) => setPid(e.target.value)}><option value="">{tr("Choose purchase")}</option>{open.map((x) => <option key={x.id} value={x.id}>{x.ref} - {supName(s, x.supplierId)}</option>)}</select></label>
    <div className="pur-totals"><span>{tr("Outstanding Balance")}</span><b>{money(bal)}</b></div>
    <p className="inventory-field">{tr("Payment Method")} <span className="text-destructive">*</span></p>
    <PayRows rows={rows} setRows={setRows} tr={tr} />
    <div className="pur-totals"><span>{tr("Total Payment")}</span><b>{money(total)}</b><span>{tr("Remaining Balance")}</span><b>{money(Math.max(0, bal - total))}</b></div>
    <label className="inventory-field"><span>{tr("Notes (Optional)")}</span><input className="inventory-input" placeholder={tr("Enter notes...")} value={note} onChange={(e) => setNote(e.target.value)} /></label>
    <ShopButton className="inventory-save" onClick={save}>{tr("Save Payment")}</ShopButton>
  </div>;
}

function ReturnList({ s, money, tr }: Ctx) {
  const [q, setQ] = useState("");
  const list = s.purchaseReturns.filter((r) => `${r.ref} ${r.purchaseRef} ${supName(s, s.purchases.find((p) => p.id === r.purchaseId)?.supplierId)}`.toLowerCase().includes(q.toLowerCase()));
  return <><Search q={q} setQ={setQ} tr={tr} ph="Search returns..." /><div className="inventory-box">{list.length ? list.map((r) => <RetRow key={r.id} r={r} s={s} money={money} tr={tr} />) : <Empty>{tr("No returns yet")}</Empty>}</div></>;
}

const REASONS = ["Damaged", "Wrong item", "Faulty", "Excess stock", "Other"];
function NewReturn({ s, money, tr, go }: Ctx) {
  const [pid, setPid] = useState("");
  const [qty, setQty] = useState<Record<string, string>>({});
  const [refund, setRefund] = useState<erp.Method>("credit");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const pur = s.purchases.find((x) => x.id === pid);
  const amount = pur ? pur.items.reduce((a, i) => a + (+(qty[i.productId] ?? 0) || 0) * i.cost, 0) : 0;
  const save = () => {
    if (!pur) { toast.error(tr("Choose purchase")); return; }
    if (!reason) { toast.error(tr("Select reason")); return; }
    if (run(() => fin.returnPurchase(pur.id, Object.entries(qty).map(([productId, v]) => ({ productId, qty: +v || 0 })), refund, note ? `${reason} — ${note}` : reason), tr("Return recorded")) !== undefined) { setQty({}); go("Returns", "All Returns"); }
  };
  return <div className="inventory-form">
    <label className="inventory-field"><span>{tr("Original Purchase")} <span className="text-destructive">*</span></span><select className="inventory-input" value={pid} onChange={(e) => { setPid(e.target.value); setQty({}); }}><option value="">{tr("Choose purchase")}</option>{s.purchases.filter((p) => fin.purchaseStatus(s, p) !== "Cancelled").map((p) => <option key={p.id} value={p.id}>{p.ref} - {supName(s, p.supplierId)}</option>)}</select></label>
    {pur && <><label className="inventory-field"><span>{tr("Supplier")}</span><span className="inventory-input flex items-center text-primary">{supName(s, pur.supplierId)}</span></label>
      <div className="inventory-box">{pur.items.map((i) => <div key={i.productId} className="pur-line pur-line-ret"><span className="truncate">{i.name}</span><span className="pur-muted">{i.qty - i.returned} {tr("left")}</span><input className="inventory-input" inputMode="decimal" placeholder="0" aria-label={tr("Quantity")} value={qty[i.productId] ?? ""} onChange={(e) => setQty({ ...qty, [i.productId]: e.target.value })} /><span className="text-end tabular-nums">{((+(qty[i.productId] ?? 0) || 0) * i.cost).toLocaleString("en-KE")}</span></div>)}</div>
      <label className="inventory-field"><span>{tr("Reason")} <span className="text-destructive">*</span></span><select className="inventory-input" value={reason} onChange={(e) => setReason(e.target.value)}><option value="">{tr("Select reason")}</option>{REASONS.map((r) => <option key={r} value={r}>{tr(r)}</option>)}</select></label>
      <label className="inventory-field"><span>{tr("Refund")}</span><select className="inventory-input" value={refund} onChange={(e) => setRefund(e.target.value as erp.Method)}><option value="credit">{tr("Reduce amount owed")}</option>{fin.ACCOUNTS.map((m) => <option key={m} value={m}>{tr("Refund")} • {tr(erp.METHOD_LABEL[m])}</option>)}</select></label>
      <label className="inventory-field"><span>{tr("Notes (Optional)")}</span><input className="inventory-input" placeholder={tr("Enter notes...")} value={note} onChange={(e) => setNote(e.target.value)} /></label>
      <div className="pur-totals"><span>{tr("Return amount")}</span><b className="text-primary">{money(amount)}</b></div>
      <ShopButton className="inventory-save" onClick={save}>{tr("Save Return")}</ShopButton></>}
  </div>;
}

const dayKey = (n: number) => new Date(n).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
function Reports({ s, money, tr, view }: Ctx & { view: string }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const f = from ? new Date(from).getTime() : 0;
  const t = to ? new Date(to).getTime() + 86399999 : Date.now();
  const inR = (at: number) => at >= f && at <= t;
  const pur = s.purchases.filter((p) => inR(p.at));
  const rets = s.purchaseReturns.filter((r) => inR(r.at));
  const byDate = useMemo(() => { const m = new Map<string, number>(); pur.forEach((p) => m.set(dayKey(p.at), (m.get(dayKey(p.at)) ?? 0) + p.total)); return [...m]; }, [pur]);
  const pays = s.payments.filter((p) => inR(p.at) && (p.kind === "SUPPLIER PAYMENT" || p.kind === "PURCHASE"));
  return (<>
    <div className="grid grid-cols-2 gap-1.5"><label className="inventory-field"><span>{tr("From Date")}</span><input type="date" className="inventory-input" value={from} onChange={(e) => setFrom(e.target.value)} /></label><label className="inventory-field"><span>{tr("To Date")}</span><input type="date" className="inventory-input" value={to} onChange={(e) => setTo(e.target.value)} /></label></div>
    <div className="mt-2"><Kpis s={s} money={money} tr={tr} from={f} to={t} /></div>
    {view === "Purchase Report" && <Box title={tr("Purchases by Date")}>{byDate.length ? byDate.map(([d, v]) => <Row key={d}><span className="pur-name">{d}</span><span className="pur-amt">{money(v)}</span></Row>) : <Empty>{tr("No purchases in this period")}</Empty>}</Box>}
    {view === "Supplier Report" && <Box title={tr("Supplier Report")}>{s.suppliers.length ? s.suppliers.map((x) => { const st = supplierStats(s, x); return <Row key={x.id}><span className="pur-name">{x.name}</span><span className="pur-muted">{tr("Purchases")}: {money(st.purchases)}</span><span className="pur-muted">{tr("Paid")}: {money(st.paid)}</span><span className={cn("pur-amt", x.balance > 0 && "text-warning")}>{tr("Outstanding")}: {money(x.balance)}</span><span className="pur-muted">{tr("Returns")}: {money(st.returns)}</span></Row>; }) : <Empty>{tr("No suppliers yet")}</Empty>}</Box>}
    {view === "Payment Report" && <Box title={tr("Payment Report")}>
      {fin.ACCOUNTS.map((m) => <Row key={m}><span className="pur-name">{tr(erp.METHOD_LABEL[m])}</span><span className="pur-amt">{money(pays.filter((p) => p.method === m).reduce((a, p) => a - p.amount, 0))}</span></Row>)}
      <Row><span className="pur-name">{tr("Credit")}</span><span className="pur-amt">{money(pur.reduce((a, p) => a + fin.purchaseBalance(s, p), 0))}</span></Row>
      <Row><span className="pur-name">P.PAY</span><span className="pur-amt">{pur.filter((p) => fin.purchaseStatus(s, p) === "P.PAY").length} {tr("purchases")}</span></Row>
    </Box>}
    {view === "Return Report" && <Box title={tr("Return Report")}>{rets.length ? rets.flatMap((r) => r.items.map((i) => <Row key={r.id + i.productId}><Receipt className="h-3.5 w-3.5 shrink-0 text-primary" /><span className="pur-name">{i.name}</span><span className="pur-muted">× {i.qty}</span><span className="pur-muted">{supName(s, s.purchases.find((p) => p.id === r.purchaseId)?.supplierId)}</span><span className="pur-amt">{money(i.amount)}</span><span className="pur-muted">{r.reason ?? "—"}</span></Row>)) : <Empty>{tr("No returns in this period")}</Empty>}</Box>}
  </>);
}
