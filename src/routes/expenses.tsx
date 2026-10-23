import { ModuleCharts } from "@/components/shopbook/analytics-charts";
import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { MinusCircle, Plus, Printer, Share2 } from "lucide-react";
import { toast } from "sonner";
import { ShopButton } from "@/components/ui/shop-button";
import { useErp } from "@/components/shopbook/product-search";
import { moneyFor, run, useAccount } from "@/components/shopbook/selling";
import { Kpi, KpiRow } from "@/components/shopbook/kpi";
import { BigButton, Badge, Box, Dot, Empty, ErpShell, MoneyTrio, Row, Search, toneOf, type Tr } from "@/components/shopbook/erp-shell";
import { DocHead, DocLine, DocRule, PrintPreview, shareText, whatsapp } from "@/components/shopbook/print";
import { PayPicker, emptyPay, payInvalid, payRecord, type PayState } from "@/components/shopbook/pay-picker";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
import * as erp from "@/lib/erp";
import * as fin from "@/lib/finance";

export const Route = createFileRoute("/expenses")({
  head: () => ({ meta: [
    { title: "Expenses — SHOPBOOK ERP" },
    { name: "description", content: "Record shop expenses, part payments and expense reports." },
    { property: "og:title", content: "Expenses — SHOPBOOK ERP" },
    { property: "og:description", content: "Track rent, transport, bills and other shop costs, paid or part paid." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Expenses,
});

const MENUS = {
  Overview: [],
  Expenses: [],
  Categories: ["All Categories", "Add Category", "History"],
  Payments: ["All Payments", "Make Payment", "P.PAY", "History"],
  Reports: ["Expense Report", "By Category", "Payment Methods", "Monthly", "Top Expenses", "Outstanding", "Summary"],
} as const;
type Menu = keyof typeof MENUS;
type View = null | { k: "add" } | { k: "detail"; id: string };
type Ctx = { s: erp.ErpState; money: (n: number) => string; tr: Tr; go: (m: Menu, sub?: string) => void; open: (v: View) => void; shop: string };
type PayRow = { m: erp.Method; a: string };
const today0 = () => new Date(new Date().toDateString()).getTime();
const month0 = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).getTime(); };
const short = (n: number) => new Date(n).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
const isoDay = (n: number) => { const d = new Date(n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const expPays = (s: erp.ErpState) => s.payments.filter((p) => p.kind === "EXPENSE");

function Expenses() {
  const acct = useAccount("plus");
  const { tr } = useLanguage();
  const s = useErp();
  const [menu, setMenu] = useState<Menu>("Overview");
  const [sub, setSub] = useState("");
  const [view, setView] = useState<View>(null);
  if (!acct) return <main className="app-screen" />;
  const go = (m: Menu, sm?: string) => { setView(null); setMenu(m); setSub(sm ?? MENUS[m][0] ?? ""); };
  const ctx: Ctx = { s, money: moneyFor(acct.currency || "KSh"), tr, go, open: setView, shop: acct.shopName };
  return (
    <ErpShell title="Expenses" shop={acct.shopName} menus={MENUS} menu={menu} sub={sub} deps={s} onMenu={(m) => go(m as Menu)} onSub={(x) => { setView(null); setSub(x); }}>
      {view?.k === "add" ? <AddExpense {...ctx} />
        : view?.k === "detail" ? <Detail {...ctx} id={view.id} />
        : <>
          {menu === "Overview" && <Overview {...ctx} />}
          {menu === "Expenses" && <ExpenseList {...ctx} />}
          {menu === "Categories" && (sub === "Add Category" ? <AddCategory {...ctx} /> : sub === "History" ? <CategoryHistory {...ctx} /> : <Categories {...ctx} />)}
          {menu === "Payments" && (sub === "Make Payment" ? <MakePayment {...ctx} /> : sub === "P.PAY" ? <Outstanding {...ctx} /> : <PaymentList {...ctx} />)}
          {menu === "Reports" && <Reports {...ctx} view={sub} />}
        </>}
    </ErpShell>
  );
}

function ExpRow({ x, c, balance }: { x: erp.Expense; c: Ctx; balance?: boolean }) {
  const st = fin.expenseStatus(c.s, x);
  return <Row onClick={() => c.open({ k: "detail", id: x.id })}><Dot tone={toneOf(st)} /><b>{x.ref}</b><span className="pur-muted">{short(x.at)}</span><span className="pur-name">{c.tr(x.category)}</span><span className="pur-amt">{c.money(x.amount)}</span>{balance && <span className="pur-muted">{c.tr("Balance")}: {c.money(fin.expenseBalance(c.s, x))}</span>}<Badge s={st} /></Row>;
}

function Overview(c: Ctx) {
  const { s, money, tr, go } = c;
  const sum = (f: (x: erp.Expense) => boolean) => s.expenses.filter(f).reduce((a, x) => a + x.amount, 0);
  const paidBy = (m: erp.Method) => expPays(s).filter((p) => p.method === m).reduce((a, p) => a - p.amount, 0);
  const total = sum(() => true);
  const byCat = new Map<string, number>(); s.expenses.forEach((x) => byCat.set(x.category, (byCat.get(x.category) ?? 0) + x.amount));
  const open = s.expenses.filter((x) => fin.expenseBalance(s, x) > 0.001);
  return <>
    <KpiRow>
      <Kpi label={tr("Expenses")} value={money(total)} />
      <Kpi label={tr("Today")} value={money(sum((x) => x.at >= today0()))} />
      <Kpi label={tr("This Month")} value={money(sum((x) => x.at >= month0()))} />
      <Kpi label={tr("Cash")} value={money(paidBy("cash"))} />
      <Kpi label={tr("M-Pesa")} value={money(paidBy("mpesa"))} />
    </KpiRow>
    <ModuleCharts s={s} module="expenses" money={money} tr={tr} single />
    <Box title={tr("Recent Expenses")} action={() => go("Expenses")}>{s.expenses.length ? s.expenses.slice(0, 5).map((x) => <ExpRow key={x.id} x={x} c={c} />) : <Empty>{tr("No expenses yet")}</Empty>}</Box>
    <Box title={tr("Expenses by Category")} action={() => go("Reports", "By Category")}><CatBars s={s} money={money} tr={tr} byCat={byCat} total={total} limit={5} /></Box>
    <Box title={tr("Outstanding Expenses")} action={() => go("Payments", "P.PAY")}>{open.length ? open.slice(0, 5).map((x) => <ExpRow key={x.id} x={x} c={c} balance />) : <Empty>{tr("Nothing owed on expenses")}</Empty>}</Box>
    <Box title={tr("Payment Summary")}>{fin.ACCOUNTS.map((m) => <Row key={m}><span className="pur-name">{tr(erp.METHOD_LABEL[m])}</span><span className="pur-amt">{money(paidBy(m))}</span></Row>)}<Row><span className="pur-name">{tr("Unpaid balance")}</span><span className="pur-amt text-warning">{money(open.reduce((a, x) => a + fin.expenseBalance(s, x), 0))}</span></Row></Box>
  </>;
}

function CatBars({ money, tr, byCat, total, limit }: { s: erp.ErpState; money: (n: number) => string; tr: Tr; byCat: Map<string, number>; total: number; limit?: number }) {
  const rows = [...byCat].sort((a, b) => b[1] - a[1]).slice(0, limit ?? 99);
  if (!rows.length) return <Empty>{tr("No expenses yet")}</Empty>;
  return <>{rows.map(([k, v]) => { const pct = total ? Math.round((v / total) * 100) : 0; return <Row key={k}><span className="pur-name">{tr(k)}</span><span className="pur-amt">{money(v)}</span><span className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-muted"><span className="block h-full bg-primary" style={{ width: `${pct}%` }} /></span><span className="pur-muted w-8 text-end">{pct}%</span></Row>; })}</>;
}

function ExpenseList(c: Ctx) {
  const { s, tr } = c;
  const [q, setQ] = useState("");
  const list = s.expenses.filter((x) => `${x.ref} ${x.category} ${x.description ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  return <>
    <Search q={q} setQ={setQ} tr={tr} ph="Search expenses..." />
    <BigButton onClick={() => c.open({ k: "add" })}><Plus className="h-4 w-4" />{tr("Add Expense")}</BigButton>
    <div className="inventory-box mt-0">{list.length ? list.map((x) => <ExpRow key={x.id} x={x} c={c} />) : <Empty>{tr("No expenses yet")}</Empty>}</div>
  </>;
}

/** Cash, M-Pesa and Bank rows; anything not paid stays as the expense balance (P.PAY / Credit). */
function PayRows({ rows, setRows, tr }: { rows: PayRow[]; setRows: (r: PayRow[]) => void; tr: Tr }) {
  return <>
    {rows.map((r, i) => <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center gap-1.5">
      <select className="inventory-input" value={r.m} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, m: e.target.value as erp.Method } : x)))}>{fin.ACCOUNTS.map((m) => <option key={m} value={m} disabled={m !== r.m && rows.some((x) => x.m === m)}>{tr(erp.METHOD_LABEL[m])}</option>)}</select>
      <input className="inventory-input" inputMode="decimal" placeholder="0" value={r.a} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} />
      <button aria-label={tr("Remove")} disabled={rows.length === 1} onClick={() => setRows(rows.filter((_, j) => j !== i))}><MinusCircle className="h-4 w-4 text-destructive" /></button></div>)}
    {rows.length < fin.ACCOUNTS.length && <ShopButton className="inventory-save w-fit px-3" onClick={() => setRows([...rows, { m: fin.ACCOUNTS.find((m) => !rows.some((r) => r.m === m)) ?? "cash", a: "" }])}><Plus className="h-3.5 w-3.5" />{tr("Add Payment Method")}</ShopButton>}
  </>;
}
const sumRows = (rows: PayRow[]) => rows.reduce((a, r) => a + (+r.a || 0), 0);

function AddExpense(c: Ctx) {
  const { s, money, tr } = c;
  const [f, setF] = useState({ category: "", description: "", amount: "", date: isoDay(Date.now()), note: "" });
  const [pay, setPay] = useState<PayState>(emptyPay());
  const amount = +f.amount || 0;
  const rec = payRecord(pay, amount);
  const save = () => {
    if (!f.category) { toast.error(tr("Choose a category")); return; }
    if (!f.description.trim()) { toast.error(tr("Enter a description")); return; }
    if (payInvalid(pay, amount)) { toast.error(tr("Check the payment amounts")); return; }
    const at = new Date(f.date).getTime() + (Date.now() - today0());
    const x = run(() => fin.addExpense({ category: f.category, amount, method: pay.mode === "ppay" ? "cash" : pay.mode, description: f.description, note: f.note, at, pay: { cash: rec.cash, mpesa: rec.mpesa, bank: rec.bank } }), tr("Expense recorded"));
    if (x) c.open({ k: "detail", id: x.id });
  };
  return <div className="inventory-form">
    <p className="inventory-form-title">{tr("Add Expense")}</p>
    <L t="Category" req><select className="inventory-input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}><option value="">{tr("Select category")}</option>{fin.expenseCategories(s).map((k) => <option key={k} value={k}>{tr(k)}</option>)}</select></L>
    <L t="Description" req><input className="inventory-input" maxLength={120} placeholder={tr("e.g. Electricity bill - October")} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></L>
    <div className="grid grid-cols-2 gap-1.5">
      <L t="Amount" req><input className="inventory-input" inputMode="decimal" placeholder="0" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></L>
      <L t="Date" req><input type="date" className="inventory-input" max={isoDay(Date.now())} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></L>
    </div>
    <PayPicker value={pay} onChange={setPay} total={amount} money={money} tr={tr} />
    <L t="Notes (Optional)"><input className="inventory-input" maxLength={200} placeholder={tr("Enter notes...")} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></L>
    <ShopButton className="inventory-save" onClick={save}>{tr("Save Expense")}</ShopButton>
  </div>;
}

function L({ t, req, children }: { t: string; req?: boolean; children: ReactNode }) {
  const { tr } = useLanguage();
  return <label className="inventory-field"><span>{tr(t)}{req && <span className="text-destructive"> *</span>}</span>{children}</label>;
}

function ExpenseDoc({ x, s, money, tr, shop }: Pick<Ctx, "s" | "money" | "tr" | "shop"> & { x: erp.Expense }) {
  const pays = expPays(s).filter((p) => p.source === x.ref);
  return <>
    <DocHead shop={shop} title={tr("Expense Receipt")} />
    <DocLine k={tr("Expense No")} v={x.ref} /><DocLine k={tr("Date")} v={new Date(x.at).toLocaleString("en-GB")} /><DocLine k={tr("Category")} v={tr(x.category)} />
    {x.description && <DocLine k={tr("Description")} v={x.description} />}
    <DocRule />
    <DocLine k={tr("Amount")} v={money(x.amount)} bold />
    {pays.map((p) => <DocLine key={p.id} k={tr(erp.METHOD_LABEL[p.method])} v={money(-p.amount)} />)}
    <DocLine k={tr("Paid")} v={money(fin.expensePaid(s, x))} /><DocLine k={tr("Balance")} v={money(fin.expenseBalance(s, x))} bold />
    <DocLine k={tr("Status")} v={fin.expenseStatus(s, x)} />
    {x.note && <><DocRule /><p>{tr("Notes")}: {x.note}</p></>}
    <p className="mt-3 text-center font-bold">{tr("Thank you!")}</p>
  </>;
}
const docText = (x: erp.Expense, s: erp.ErpState, money: (n: number) => string, shop: string) => [shop, `${x.ref} • ${x.category}`, x.description ?? "", `Amount ${money(x.amount)}`, `Paid ${money(fin.expensePaid(s, x))}`, `Balance ${money(fin.expenseBalance(s, x))}`].filter(Boolean).join("\n");

function Detail(c: Ctx & { id: string }) {
  const { s, money, tr, shop } = c;
  const [adding, setAdding] = useState(false);
  const [print, setPrint] = useState(false);
  const [rows, setRows] = useState<PayRow[]>([{ m: "cash", a: "" }]);
  const x = s.expenses.find((v) => v.id === c.id);
  if (!x) return <Empty>{tr("Expense not found")}</Empty>;
  const bal = fin.expenseBalance(s, x);
  const pays = expPays(s).filter((p) => p.source === x.ref);
  const save = () => {
    const picked = rows.filter((r) => +r.a > 0);
    if (!picked.length) { toast.error(tr("Enter an amount")); return; }
    if (sumRows(picked) > bal + 0.001) { toast.error(tr("Amount is more than the outstanding balance")); return; }
    for (const r of picked) if (run(() => fin.payExpense(x.id, +r.a, r.m)) === undefined) return;
    toast.success(tr("Payment recorded")); setAdding(false); setRows([{ m: "cash", a: "" }]);
  };
  return <div className="grid gap-1.5">
    <div className="flex items-center justify-between"><p className="inventory-form-title m-0">{x.ref}</p><Badge s={fin.expenseStatus(s, x)} /></div>
    <MoneyTrio total={x.amount} paid={fin.expensePaid(s, x)} balance={bal} money={money} tr={tr} />
    <div className="inventory-box mt-0 pur-totals">
      <span>{tr("Category")}</span><b>{tr(x.category)}</b>
      <span>{tr("Description")}</span><b className="truncate">{x.description ?? "—"}</b>
      <span>{tr("Date")}</span><b>{new Date(x.at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</b>
      <span>{tr("Payment Method")}</span><b>{pays.length ? [...new Set(pays.map((p) => tr(erp.METHOD_LABEL[p.method])))].join(" + ") : tr("Credit")}</b>
      <span>{tr("Notes")}</span><b className="truncate">{x.note ?? "—"}</b>
    </div>
    {bal > 0.001 && (adding
      ? <div className="inventory-box grid gap-1.5"><p className="text-[11px]">{tr("Outstanding Balance")}: <b>{money(bal)}</b></p><PayRows rows={rows} setRows={setRows} tr={tr} /><ShopButton className="inventory-save" onClick={save}>{tr("Save Payment")}</ShopButton></div>
      : <BigButton onClick={() => setAdding(true)}><Plus className="h-4 w-4" />{tr("Add Payment")}</BigButton>)}
    <Box title={tr("Payments")}>{pays.length ? pays.map((p) => <Row key={p.id}><Dot tone="ok" /><b>{p.ref}</b><span className="pur-name">{tr(erp.METHOD_LABEL[p.method])}</span><span className="pur-muted">{short(p.at)}</span><span className="pur-amt">{money(-p.amount)}</span></Row>) : <Empty>{tr("No payments yet")}</Empty>}</Box>
    <div className="grid grid-cols-2 gap-1.5">
      <ShopButton variant="outline" className="inventory-save" onClick={() => setPrint(true)}><Printer className="h-4 w-4" />{tr("Print Expense")}</ShopButton>
      <ShopButton variant="outline" className="inventory-save" onClick={() => shareText(x.ref, docText(x, s, money, shop))}><Share2 className="h-4 w-4" />{tr("Share")}</ShopButton>
    </div>
    {print && <PrintPreview title="Expense Receipt" onClose={() => setPrint(false)} actions={<ShopButton variant="outline" className="h-9 text-sm" onClick={() => whatsapp(docText(x, s, money, shop))}>{tr("WhatsApp")}</ShopButton>}><ExpenseDoc x={x} s={s} money={money} tr={tr} shop={shop} /></PrintPreview>}
  </div>;
}

function Categories({ s, money, tr }: Ctx) {
  return <div className="inventory-box">{fin.expenseCategories(s).map((k) => { const l = s.expenses.filter((x) => x.category === k); return <Row key={k}><span className="pur-name">{tr(k)}</span><span className="pur-muted">{l.length} {tr("expenses")}</span><span className="pur-amt">{money(l.reduce((a, x) => a + x.amount, 0))}</span></Row>; })}</div>;
}
function AddCategory({ tr, go }: Ctx) {
  const [n, setN] = useState("");
  return <div className="inventory-form"><label className="inventory-field"><span>{tr("Category name")} <span className="text-destructive">*</span></span><input className="inventory-input" maxLength={60} placeholder={tr("New category")} value={n} onChange={(e) => setN(e.target.value)} /></label><ShopButton className="inventory-save" onClick={() => run(() => fin.addExpenseCategory(n), tr("Saved")) !== undefined && go("Categories", "All Categories")}>{tr("Add Category")}</ShopButton></div>;
}
function CategoryHistory({ s, tr }: Ctx) {
  const list = s.audit.filter((a) => a.action === "EXPENSE CATEGORY");
  return <div className="inventory-box">{list.length ? list.map((a) => <Row key={a.id}><span className="pur-muted">{short(a.at)}</span><span className="pur-name">{a.detail}</span><span className="pur-muted">{a.user}</span></Row>) : <Empty>{tr("No categories added yet")}</Empty>}</div>;
}

function PaymentList({ s, money, tr }: Ctx) {
  const [q, setQ] = useState("");
  const list = expPays(s).filter((p) => `${p.ref} ${p.source}`.toLowerCase().includes(q.toLowerCase()));
  return <><Search q={q} setQ={setQ} tr={tr} ph="Search expense payments..." /><div className="inventory-box">{list.length ? list.map((p) => { const x = s.expenses.find((e) => e.ref === p.source); return <Row key={p.id}><Dot tone="ok" /><b>{p.source}</b><span className="pur-name">{x ? tr(x.category) : ""}</span><span className="pur-muted">{tr(erp.METHOD_LABEL[p.method])}</span><span className="pur-amt">{money(-p.amount)}</span><span className="pur-muted">{short(p.at)}</span></Row>; }) : <Empty>{tr("No payments yet")}</Empty>}</div></>;
}
function Outstanding(c: Ctx) {
  const list = c.s.expenses.filter((x) => fin.expenseBalance(c.s, x) > 0.001);
  return <div className="inventory-box">{list.length ? list.map((x) => <ExpRow key={x.id} x={x} c={c} balance />) : <Empty>{c.tr("Nothing owed on expenses")}</Empty>}</div>;
}
function MakePayment(c: Ctx) {
  const { s, tr } = c;
  const open = s.expenses.filter((x) => fin.expenseBalance(s, x) > 0.001);
  const [id, setId] = useState(open[0]?.id ?? "");
  return <div className="inventory-form">
    <p className="inventory-form-title">{tr("Make Payment")}</p>
    <label className="inventory-field"><span>{tr("Expense")} <span className="text-destructive">*</span></span><select className="inventory-input" value={id} onChange={(e) => setId(e.target.value)}><option value="">{tr("Choose expense")}</option>{open.map((x) => <option key={x.id} value={x.id}>{x.ref} - {tr(x.category)}</option>)}</select></label>
    {id ? <ShopButton className="inventory-save" onClick={() => c.open({ k: "detail", id })}>{tr("Continue")}</ShopButton> : <Empty>{tr("Nothing owed on expenses")}</Empty>}
  </div>;
}

function Reports({ s, money, tr, view, open }: Ctx & { view: string }) {
  const [mo, setMo] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1).getTime(); });
  const end = new Date(new Date(mo).getFullYear(), new Date(mo).getMonth() + 1, 1).getTime();
  const list = s.expenses.filter((x) => x.at >= mo && x.at < end);
  const total = list.reduce((a, x) => a + x.amount, 0);
  const paid = list.reduce((a, x) => a + fin.expensePaid(s, x), 0);
  const byCat = new Map<string, number>(); list.forEach((x) => byCat.set(x.category, (byCat.get(x.category) ?? 0) + x.amount));
  const step = (n: number) => { const d = new Date(mo); setMo(new Date(d.getFullYear(), d.getMonth() + n, 1).getTime()); };
  const label = (t: number) => new Date(t).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  const months = [...Array(6)].map((_, i) => { const d = new Date(); const a = new Date(d.getFullYear(), d.getMonth() - i, 1).getTime(); const b = new Date(d.getFullYear(), d.getMonth() - i + 1, 1).getTime(); return [label(a), s.expenses.filter((x) => x.at >= a && x.at < b).reduce((t, x) => t + x.amount, 0)] as const; });
  const c = { s, money, tr } as Ctx;
  return <>
    <div className="mb-1.5 grid grid-cols-[auto_1fr_auto] items-center gap-2 text-[11px]"><button onClick={() => step(-1)}>‹ {label(new Date(mo).setMonth(new Date(mo).getMonth() - 1))}</button><b className="text-center">{label(mo)}</b><button onClick={() => step(1)} disabled={end > Date.now()}>{label(end)} ›</button></div>
    <KpiRow><Kpi label={tr("Total Expenses")} value={money(total)} /><Kpi label={tr("Paid")} value={money(paid)} /><Kpi label="P.PAY" value={money(list.filter((x) => fin.expenseStatus(s, x) === "P.PAY").reduce((a, x) => a + x.amount, 0))} /><Kpi label={tr("Balance")} value={money(total - paid)} tone={total - paid > 0 ? "warn" : undefined} /></KpiRow>
    {view === "Expense Report" && <Box title={tr("Expense Report")}>{list.length ? list.map((x) => <ExpRow key={x.id} x={x} c={{ ...c, open }} />) : <Empty>{tr("No expenses in this period")}</Empty>}</Box>}
    {(view === "By Category" || view === "Summary") && <Box title={tr("Expenses by Category")}><CatBars s={s} money={money} tr={tr} byCat={byCat} total={total} /></Box>}
    {(view === "Payment Methods" || view === "Summary") && <Box title={tr("Payment Methods")}>{fin.ACCOUNTS.map((m) => <Row key={m}><span className="pur-name">{tr(erp.METHOD_LABEL[m])}</span><span className="pur-amt">{money(expPays(s).filter((p) => p.method === m && p.at >= mo && p.at < end).reduce((a, p) => a - p.amount, 0))}</span></Row>)}</Box>}
    {view === "Monthly" && <Box title={tr("Monthly Expenses")}>{months.map(([k, v]) => <Row key={k}><span className="pur-name">{k}</span><span className="pur-amt">{money(v)}</span></Row>)}</Box>}
    {view === "Top Expenses" && <Box title={tr("Top Expenses")}>{list.length ? [...list].sort((a, b) => b.amount - a.amount).slice(0, 10).map((x) => <ExpRow key={x.id} x={x} c={{ ...c, open }} />) : <Empty>{tr("No expenses in this period")}</Empty>}</Box>}
    {view === "Outstanding" && <Box title={tr("Outstanding Expenses")}>{s.expenses.filter((x) => fin.expenseBalance(s, x) > 0.001).map((x) => <ExpRow key={x.id} x={x} c={{ ...c, open }} balance />)}</Box>}
  </>;
}
