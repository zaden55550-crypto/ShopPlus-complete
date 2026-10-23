import { ModuleCharts } from "@/components/shopbook/analytics-charts";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Banknote, CircleDollarSign, CreditCard, MinusCircle, Plus, Receipt, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { ShopButton } from "@/components/ui/shop-button";
import { useErp } from "@/components/shopbook/product-search";
import { Customers, ReceiptSheet, ReturnForm, ReturnsList, SalesReport, Sell, moneyFor, run, salesStats, useAccount, type SCtx } from "@/components/shopbook/selling";
import { Kpi, KpiRow } from "@/components/shopbook/kpi";
import { BigButton, Badge, Box, Dot, Empty, ErpShell, MoneyTrio, Row, Search, Tabs, toneOf } from "@/components/shopbook/erp-shell";
import { useLanguage } from "@/hooks/use-language";
import * as erp from "@/lib/erp";

export const Route = createFileRoute("/sales")({
  head: () => ({
    meta: [
      { title: "Sales — SHOPBOOK ERP" },
      { name: "description", content: "New sales, sales history, customers, part payments, returns and sales reports." },
      { property: "og:title", content: "Sales — SHOPBOOK ERP" },
      { property: "og:description", content: "Every sale, customer balance, payment and return in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Sales,
});

const MENUS = {
  Overview: [],
  Sales: ["All Sales", "Completed", "Pending", "Cancelled"],
  Customers: [],
  Payments: ["All Payments", "Add Payment", "P.PAY"],
  Returns: ["All Returns", "New Return"],
  Reports: [],
} as const;
type Menu = keyof typeof MENUS;
type View = null | { k: "new" } | { k: "detail"; id: string };
type Ctx = SCtx & { go: (m: Menu, sub?: string) => void; open: (v: View) => void };
const ACC: erp.Method[] = ["cash", "mpesa", "bank"];
const custName = (s: erp.ErpState, id?: string) => s.customers.find((c) => c.id === id)?.name;

function Sales() {
  const acct = useAccount("basic");
  const { tr } = useLanguage();
  const s = useErp();
  const [menu, setMenu] = useState<Menu>("Overview");
  const [sub, setSub] = useState("");
  const [view, setView] = useState<View>(null);
  if (!acct) return <main className="app-screen" />;
  const go = (m: Menu, sm?: string) => { setView(null); setMenu(m); setSub(sm ?? MENUS[m][0] ?? ""); };
  const ctx: Ctx = { s, money: moneyFor(acct.currency || "KSh"), tr, shop: acct.shopName, channel: "Sales", go, open: setView };
  return (
    <ErpShell title="Sales" shop={acct.shopName} menus={MENUS} menu={menu} sub={sub} deps={s} onMenu={(m) => go(m as Menu)} onSub={(x) => { setView(null); setSub(x); }}>
      {view?.k === "new" ? <><p className="inventory-form-title">{tr("New Sale")}</p><Sell {...ctx} /></>
        : view?.k === "detail" ? <SaleDetail {...ctx} id={view.id} />
        : <>
          {menu === "Overview" && <Overview {...ctx} />}
          {menu === "Sales" && <SaleList {...ctx} filter={sub} />}
          {menu === "Customers" && <Customers {...ctx} />}
          {menu === "Payments" && (sub === "Add Payment" ? <AddPayment {...ctx} /> : sub === "P.PAY" ? <OpenSales {...ctx} /> : <PaymentList {...ctx} />)}
          {menu === "Returns" && (sub === "New Return" ? <NewReturn {...ctx} /> : <ReturnsList {...ctx} />)}
          {menu === "Reports" && <SalesReport {...ctx} />}
        </>}
    </ErpShell>
  );
}

function Kpis({ s, money, tr }: Ctx) {
  const by = (st: erp.PayStatus) => s.sales.filter((x) => erp.saleStatus(s, x) === st).reduce((a, x) => a + x.total, 0);
  return <KpiRow>
    <Kpi icon={<ShoppingCart className="text-primary" />} label={tr("Sales")} value={money(s.sales.reduce((a, x) => a + x.total, 0))} />
    <Kpi icon={<Banknote className="text-warning" />} label={tr("Paid")} value={money(by("Paid"))} />
    <Kpi icon={<CircleDollarSign className="text-warning" />} label="P.PAY" value={money(by("P.PAY"))} />
    <Kpi icon={<CreditCard className="text-destructive" />} label={tr("Credit")} value={money(by("Credit"))} />
  </KpiRow>;
}

/** Walk-in sales show no customer name — none is invented. */
function SaleRow({ x, c, balance }: { x: erp.Sale; c: Ctx; balance?: boolean }) {
  const st = erp.saleStatus(c.s, x);
  const name = custName(c.s, x.customerId);
  return <Row onClick={() => c.open({ k: "detail", id: x.id })}><Dot tone={toneOf(st)} /><b>{x.ref}</b><span className="pur-name">{name ?? ""}</span><span className="pur-amt">{c.money(x.total)}</span>{balance && <span className="pur-muted">{c.tr("Balance")}: {c.money(erp.saleBalance(c.s, x))}</span>}<Badge s={st} /></Row>;
}

function Overview(c: Ctx) {
  const { s, money, tr, go } = c;
  const st = salesStats(s);
  const owed = s.customers.filter((x) => x.balance > 0.001);
  return <>
    <Kpis {...c} />
    <ModuleCharts s={s} module="sales" money={money} tr={tr} />
    <Box title={tr("Recent Sales")} action={() => go("Sales")}>{s.sales.length ? s.sales.slice(0, 5).map((x) => <SaleRow key={x.id} x={x} c={c} />) : <Empty>{tr("No sales yet")}</Empty>}</Box>
    <Box title={tr("Top Products")} action={() => go("Reports")}>{st.top.length ? st.top.map(([n, q]) => <Row key={n}><Dot tone="ok" /><span className="pur-name">{n}</span><span className="pur-amt">{q}</span></Row>) : <Empty>{tr("No sales yet")}</Empty>}</Box>
    <Box title={tr("Outstanding Balances")} action={() => go("Payments", "P.PAY")}>{owed.length ? owed.slice(0, 5).map((x) => <Row key={x.id}><Dot tone="warn" /><span className="pur-name">{x.name}</span><span className="pur-amt">{money(x.balance)}</span><Badge s="Due" /></Row>) : <Empty>{tr("No customer balances")}</Empty>}</Box>
    <Box title={tr("Recent Returns")} action={() => go("Returns")}>{s.returns.length ? s.returns.slice(0, 5).map((r) => <Row key={r.id}><Dot tone="ok" /><b>{r.ref}</b><span className="pur-name">{r.saleRef}</span><span className="pur-amt">{money(r.amount)}</span><Badge s="Completed" /></Row>) : <Empty>{tr("No returns yet")}</Empty>}</Box>
  </>;
}

function SaleList(c: Ctx & { filter: string }) {
  const { s, tr, filter } = c;
  const [q, setQ] = useState("");
  const ok = (x: erp.Sale) => { const st = erp.saleStatus(s, x); return filter === "Completed" ? st === "Paid" : filter === "Pending" ? st === "P.PAY" || st === "Credit" : filter === "Cancelled" ? st === "Cancelled" : true; };
  const list = s.sales.filter((x) => ok(x) && `${x.ref} ${custName(s, x.customerId) ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  return <>
    <BigButton onClick={() => c.open({ k: "new" })}><Plus className="h-4 w-4" />{tr("New Sale")}</BigButton>
    <Search q={q} setQ={setQ} tr={tr} ph="Search sales..." />
    <div className="inventory-box">{list.length ? list.map((x) => <SaleRow key={x.id} x={x} c={c} />) : <Empty>{tr("No sales yet")}</Empty>}</div>
  </>;
}

/** Payment rows for paying off a P.PAY / Credit sale; each row is recorded against that sale. */
function PayForm({ c, sale, done }: { c: Ctx; sale: erp.Sale; done?: () => void }) {
  const { s, money, tr } = c;
  const [rows, setRows] = useState<{ m: erp.Method; a: string }[]>([{ m: "cash", a: "" }]);
  const bal = erp.saleBalance(s, sale);
  const total = rows.reduce((a, r) => a + (+r.a || 0), 0);
  const save = () => {
    const picked = rows.filter((r) => +r.a > 0);
    if (!picked.length) { toast.error(tr("Enter an amount")); return; }
    if (total > bal + 0.001) { toast.error(tr("Amount is more than the outstanding balance")); return; }
    for (const r of picked) if (run(() => erp.paySale(sale.id, +r.a, r.m)) === undefined) return;
    toast.success(tr("Payment recorded")); setRows([{ m: "cash", a: "" }]); done?.();
  };
  return <div className="inventory-box grid gap-1.5">
    <div className="pur-totals"><span>{tr("Outstanding Balance")}</span><b>{money(bal)}</b></div>
    {rows.map((r, i) => <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center gap-1.5">
      <select className="inventory-input" value={r.m} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, m: e.target.value as erp.Method } : x)))}>{ACC.map((m) => <option key={m} value={m} disabled={m !== r.m && rows.some((x) => x.m === m)}>{tr(erp.METHOD_LABEL[m])}</option>)}</select>
      <input className="inventory-input" inputMode="decimal" placeholder="0" value={r.a} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} />
      <button aria-label={tr("Remove")} disabled={rows.length === 1} onClick={() => setRows(rows.filter((_, j) => j !== i))}><MinusCircle className="h-4 w-4 text-destructive" /></button></div>)}
    {rows.length < ACC.length && <ShopButton className="inventory-save w-fit px-3" onClick={() => setRows([...rows, { m: ACC.find((m) => !rows.some((r) => r.m === m)) ?? "cash", a: "" }])}><Plus className="h-3.5 w-3.5" />{tr("Add Payment Method")}</ShopButton>}
    <div className="pur-totals"><span>{tr("Total Payment")}</span><b>{money(total)}</b><span>{tr("Remaining Balance")}</span><b>{money(Math.max(0, bal - total))}</b></div>
    <ShopButton className="inventory-save" onClick={save}>{tr("Save Payment")}</ShopButton>
  </div>;
}

function SaleDetail(c: Ctx & { id: string }) {
  const { s, money, tr, shop } = c;
  const [tab, setTab] = useState("Items");
  const [adding, setAdding] = useState(false);
  const [receipt, setReceipt] = useState(false);
  const [ret, setRet] = useState(false);
  const x = s.sales.find((v) => v.id === c.id);
  if (!x) return <Empty>{tr("Sale not found")}</Empty>;
  const cust = s.customers.find((v) => v.id === x.customerId);
  const bal = erp.saleBalance(s, x);
  const pays = s.payments.filter((p) => p.source === x.ref);
  const rets = s.returns.filter((r) => r.saleId === x.id);
  const seller = s.employees.find((e) => e.id === x.sellerId);
  return <div className="grid gap-1.5">
    <div className="flex items-center justify-between"><p className="inventory-form-title m-0">{tr("Sale")} {x.ref}</p><Badge s={erp.saleStatus(s, x)} /></div>
    {cust && <Box title={cust.name}>{cust.phone && <p className="text-[11px] text-muted-foreground">{cust.phone}</p>}</Box>}
    <div className="inventory-box mt-0 pur-totals"><span>{tr("Date")}</span><b>{new Date(x.at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</b>{seller && <><span>{tr("Sales Person")}</span><b>{seller.name}</b></>}</div>
    <MoneyTrio total={x.total} paid={Math.max(0, x.total - bal)} balance={bal} money={money} tr={tr} />
    {bal > 0.001 && (adding ? <PayForm c={c} sale={x} done={() => setAdding(false)} /> : <BigButton onClick={() => setAdding(true)}><Plus className="h-4 w-4" />{tr("Add Payment")}</BigButton>)}
    <Tabs small items={["Items", "Payments", "Returns", "History"]} value={tab} onChange={setTab} tr={tr} />
    <div className="inventory-box mt-0">
      {tab === "Items" && x.items.map((i) => <Row key={i.productId}><span className="pur-name">{i.name}</span><span className="pur-muted">× {i.qty}</span><span className="pur-muted">{i.price.toLocaleString("en-KE")}</span><span className="pur-amt">{money(i.qty * i.price)}</span></Row>)}
      {tab === "Payments" && (pays.length ? pays.map((p) => <Row key={p.id}><Dot tone="ok" /><span className="pur-name">{tr(erp.METHOD_LABEL[p.method])}</span><span className="pur-amt">{money(Math.abs(p.amount))}</span><span className="pur-muted">{new Date(p.at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span></Row>) : <Empty>{tr("No payments yet")}</Empty>)}
      {tab === "Returns" && (rets.length ? rets.map((r) => <Row key={r.id}><b>{r.ref}</b><span className="pur-name">{r.items.map((i) => `${i.name} × ${i.qty}`).join(", ")}</span><span className="pur-amt">{money(r.amount)}</span></Row>) : <Empty>{tr("No returns yet")}</Empty>)}
      {tab === "History" && s.audit.filter((a) => a.detail.includes(x.ref)).map((a) => <Row key={a.id}><span className="pur-muted">{new Date(a.at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span><span className="pur-name">{tr(a.action)}</span></Row>)}
    </div>
    <div className="grid grid-cols-2 gap-1.5">
      <ShopButton variant="outline" className="inventory-save" onClick={() => setReceipt(true)}><Receipt className="h-4 w-4" />{tr("Receipt")}</ShopButton>
      {x.items.some((i) => i.returned < i.qty) && <ShopButton variant="outline" className="inventory-save" onClick={() => setRet(!ret)}>{tr("Return items")}</ShopButton>}
    </div>
    {ret && <ReturnForm sale={x} s={s} money={money} tr={tr} onDone={() => setRet(false)} />}
    {receipt && <ReceiptSheet sale={x} s={s} money={money} tr={tr} shop={shop} onClose={() => setReceipt(false)} />}
  </div>;
}

function PaymentList({ s, money, tr }: Ctx) {
  const [q, setQ] = useState("");
  const list = s.payments.filter((p) => (p.kind === "SALE" || p.kind === "DEBT" || p.kind === "REFUND") && `${p.ref} ${p.source}`.toLowerCase().includes(q.toLowerCase()));
  return <><Search q={q} setQ={setQ} tr={tr} ph="Search payments..." /><div className="inventory-box">{list.length ? list.map((p) => <Row key={p.id}><Dot tone={p.amount < 0 ? "bad" : "ok"} /><b>{p.ref}</b><span className="pur-name">{p.source}</span><span className="pur-amt">{money(p.amount)}</span><span className="pur-muted">{tr(erp.METHOD_LABEL[p.method])}</span><Badge s={p.kind === "REFUND" ? "Refund" : "Paid"} /></Row>) : <Empty>{tr("No payments yet")}</Empty>}</div></>;
}

function OpenSales(c: Ctx) {
  const list = c.s.sales.filter((x) => erp.saleBalance(c.s, x) > 0.001);
  return <div className="inventory-box">{list.length ? list.map((x) => <SaleRow key={x.id} x={x} c={c} balance />) : <Empty>{c.tr("No customer balances")}</Empty>}</div>;
}

function AddPayment(c: Ctx) {
  const { s, tr } = c;
  const open = s.sales.filter((x) => erp.saleBalance(s, x) > 0.001);
  const [id, setId] = useState(open[0]?.id ?? "");
  const sale = s.sales.find((x) => x.id === id);
  return <div className="inventory-form">
    <p className="inventory-form-title">{tr("Add Payment")}</p>
    <label className="inventory-field"><span>{tr("Sale")} <span className="text-destructive">*</span></span><select className="inventory-input" value={id} onChange={(e) => setId(e.target.value)}><option value="">{tr("Choose sale")}</option>{open.map((x) => <option key={x.id} value={x.id}>{x.ref}{custName(s, x.customerId) ? ` - ${custName(s, x.customerId)}` : ""}</option>)}</select></label>
    {sale ? <PayForm key={sale.id} c={c} sale={sale} done={() => c.go("Payments", "All Payments")} /> : <Empty>{tr("No customer balances")}</Empty>}
  </div>;
}

function NewReturn(c: Ctx) {
  const { s, money, tr } = c;
  const [id, setId] = useState("");
  const sale = s.sales.find((x) => x.id === id);
  return <div className="inventory-form">
    <p className="inventory-form-title">{tr("New Return")}</p>
    <label className="inventory-field"><span>{tr("Original Sale")} <span className="text-destructive">*</span></span><select className="inventory-input" value={id} onChange={(e) => setId(e.target.value)}><option value="">{tr("Choose sale")}</option>{s.sales.filter((x) => x.items.some((i) => i.returned < i.qty)).map((x) => <option key={x.id} value={x.id}>{x.ref} • {money(x.total)}</option>)}</select></label>
    {sale && <ReturnForm key={sale.id} sale={sale} s={s} money={money} tr={tr} onDone={() => c.go("Returns", "All Returns")} />}
  </div>;
}
