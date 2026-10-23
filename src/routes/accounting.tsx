import { ModuleCharts } from "@/components/shopbook/analytics-charts";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { TrendingUp, Receipt, Wallet, Users, Landmark } from "lucide-react";
import { ShopButton } from "@/components/ui/shop-button";
import { useErp } from "@/components/shopbook/product-search";
import { dt, moneyFor, useAccount } from "@/components/shopbook/selling";
import { ErpShell, Tabs, Empty, Search } from "@/components/shopbook/erp-shell";
import { ActivityList, AmountRow, MoneyDetail } from "@/components/shopbook/money-ui";
import { Kpi, KpiRow } from "@/components/shopbook/kpi";
import { useLanguage } from "@/hooks/use-language";
import { ACCOUNT_INFO, balanceSheet, balances, journal, profitAndLoss, type AccountId } from "@/lib/accounting";
import { floatBalances, expenseBalance } from "@/lib/finance";
import { financialActivity, cashFlow, type MoneyActivity } from "@/lib/money-activity";
import { PERIODS, periodStart, type Period } from "@/lib/summary";
import { usePrefs } from "@/lib/prefs";

export const Route = createFileRoute("/accounting")({
  head: () => ({ meta: [
    { title: "Accounting — SHOPBOOK ERP" },
    { name: "description", content: "Compact account balances, transactions, receivables, payables and financial reports from SHOPBOOK records." },
    { property: "og:title", content: "Accounting — SHOPBOOK ERP" },
    { property: "og:description", content: "Review your business accounts, financial history and VAT in one place." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: Accounting,
});
const MENUS: Record<string, readonly string[]> = {
  Overview: [], Accounts: [], Transactions: ["All", "Sales", "Purchases", "Expenses", "Payments", "Returns", "Transfers"],
  "Receivables & Payables": ["Receivables", "Payables"],
  "Financial Reports": ["Profit & loss", "Balance summary", "Cash flow", "Receivables", "Payables", "Transactions", "VAT", "Trial balance", "Journal"],
  Settings: ["Chart of accounts", "Financial periods", "Numbering", "VAT settings", "Audit trail", "Integrations"],
};
function Accounting() {
  const acct = useAccount("plus"), s = useErp();
  const { tr } = useLanguage(); const prefs = usePrefs();
  const [menu, setMenu] = useState("Overview"), [sub, setSub] = useState("");
  const [period, setPeriod] = useState<Period>("Month"), [q, setQ] = useState("");
  const [detail, setDetail] = useState<MoneyActivity | null>(null), [party, setParty] = useState<string | null>(null);
  if (!acct) return <main className="app-screen" />;
  const money = moneyFor(acct.currency || "KSh"), from = periodStart(period);
  const pl = profitAndLoss(s, from), bs = balanceSheet(s), j = journal(s), tb = balances(j), fb = floatBalances(s), flow = cashFlow(s, from);
  const rec = s.customers.reduce((a, x) => a + Math.max(0, x.balance), 0), payable = s.suppliers.reduce((a, x) => a + Math.max(0, x.balance), 0);
  const records = financialActivity(s);
  const go = (m: string) => { setMenu(m); setSub(MENUS[m]?.[0] ?? ""); setQ(""); setParty(null); };
  const lines = (rows: [string, number][]) => rows.map(([label, v]) => <AmountRow key={label} label={tr(label)} value={money(v)} />);
  const section = (title: string) => <h2 className="money-heading">{tr(title)}</h2>;
  const parties = (supplier: boolean) => {
    const list = supplier ? s.suppliers : s.customers;
    const selected = list.find((x) => x.id === party);
    if (selected) {
      const refs = supplier ? s.purchases.filter((x) => x.supplierId === selected.id).map((x) => x.ref) : s.sales.filter((x) => x.customerId === selected.id).map((x) => x.ref);
      const rows = records.filter((x) => refs.includes(x.ref) || refs.includes(x.source) || x.source === selected.name || (supplier ? s.purchaseReturns.some((r) => r.ref === x.ref && refs.includes(r.purchaseRef)) : s.returns.some((r) => r.ref === x.ref && refs.includes(r.saleRef))));
      return <><ShopButton variant="bare" className="money-small-action" onClick={() => setParty(null)}>← {tr(supplier ? "Suppliers" : "Customers")}</ShopButton>{section(selected.name)}<AmountRow label={tr("Current balance")} value={money(selected.balance)} bold /><p className="text-[9px] text-muted-foreground">{selected.phone}</p><ActivityList rows={rows} money={money} tr={tr} onOpen={setDetail} /><Link className="money-link" to={supplier ? "/purchases" : "/sales"}>{tr(supplier ? "Supplier payments" : "Customer payments")} ›</Link></>;
    }
    return <>{section(supplier ? "Payables" : "Receivables")}{list.filter((x) => x.balance > 0).map((x) => <ShopButton key={x.id} variant="bare" className="money-record" onClick={() => setParty(x.id)}><span className="pur-name">{x.name}</span><span className="pur-muted">{x.phone}</span><span className="pur-amt text-warning">{money(x.balance)}</span><span>›</span></ShopButton>)}{!list.some((x) => x.balance > 0) && <Empty>{tr("No records yet")}</Empty>}</>;
  };
  const transactions = <><Search q={q} setQ={setQ} tr={tr} ph="Search transactions..." /><ActivityList rows={records.filter((x) => (menu !== "Transactions" || sub === "All" || x.group === sub) && `${x.ref} ${x.kind} ${x.source} ${x.method}`.toLowerCase().includes(q.toLowerCase())).slice(0, 150)} money={money} tr={tr} onOpen={setDetail} /></>;
  return <ErpShell title="Accounting" shop={acct.shopName} menus={MENUS} menu={menu} sub={sub} onMenu={go} onSub={(v) => { setSub(v); setParty(null); }} deps={s}>
    <div className="money-screen">
      <KpiRow><Kpi label={tr("Revenue")} value={money(pl.sales - pl.returns)} icon={<TrendingUp />} /><Kpi label={tr("Expenses")} value={money(pl.expenses + pl.salaries + pl.stockAdj)} icon={<Receipt />} /><Kpi label={tr("Profit")} value={money(pl.net)} tone={pl.net < 0 ? "bad" : undefined} icon={<Wallet />} /><Kpi label={tr("Receivables")} value={money(rec)} icon={<Users />} /><Kpi label={tr("Payables")} value={money(payable)} icon={<Landmark />} /></KpiRow>
      {(menu === "Overview" || menu === "Financial Reports") && <div className="money-period"><select aria-label={tr("Period")} className="inventory-input" value={period} onChange={(e) => setPeriod(e.target.value as Period)}>{PERIODS.map((p) => <option key={p} value={p}>{tr(p)}</option>)}</select></div>}
      {menu === "Overview" && <><ModuleCharts s={s} module="financial" from={from} money={money} tr={tr} single />{section("Recent Financial Transactions")}<ActivityList rows={records.filter((x) => x.at >= from).slice(0, 8)} money={money} tr={tr} onOpen={setDetail} />{section("Account Balances")}<div className="money-balance-strip">{([["Cash", fb.cash], ["M-Pesa", fb.mpesa], ["Bank", fb.bank], ["Receivables", rec], ["Payables", payable]] as [string, number][]).map(([k, v]) => <div key={k}><span>{tr(k)}</span><b>{money(v)}</b></div>)}</div></>}
      {menu === "Accounts" && <>{section("Accounts")}{(Object.keys(ACCOUNT_INFO) as AccountId[]).map((id) => <AmountRow key={id} label={`${tr(ACCOUNT_INFO[id].name)} · ${tr(ACCOUNT_INFO[id].type)}`} value={money(["Income", "Liability", "Equity"].includes(ACCOUNT_INFO[id].type) ? -tb[id].net : tb[id].net)} />)}</>}
      {menu === "Transactions" && transactions}
      {menu === "Receivables & Payables" && parties(sub === "Payables")}
      {menu === "Financial Reports" && <>
        {sub === "Profit & loss" && <>{section(sub)}{lines([["Revenue", pl.sales], ["Sales returns", -pl.returns], ["Cost of goods sold", -pl.cogs]])}<AmountRow label={tr("Gross profit")} value={money(pl.gross)} bold />{lines([["Expenses", -pl.expenses], ["Salaries & commission", -pl.salaries], ["Stock adjustments", -pl.stockAdj]])}<AmountRow label={tr("Net profit")} value={money(pl.net)} bold bad={pl.net < 0} /></>}
        {sub === "Balance summary" && <>{section("Assets")}{bs.assets.map((x) => <AmountRow key={x.id} label={tr(ACCOUNT_INFO[x.id].name)} value={money(x.value)} />)}{section("Liabilities")}{bs.liabilities.map((x) => <AmountRow key={x.id} label={tr(ACCOUNT_INFO[x.id].name)} value={money(x.value)} />)}{lines([["Owner equity", bs.equity], ["Retained profit", bs.profit], ["Total assets", bs.totalAssets], ["Liabilities & equity", bs.totalLiab + bs.equity + bs.profit]])}<p className={bs.balanced ? "text-primary" : "text-warning"}>{tr(bs.balanced ? "Books balance" : "Books do not balance")}</p></>}
        {sub === "Cash flow" && <>{section(sub)}{lines([["Money in", flow.incoming], ["Money out", flow.outgoing], ["Net cash flow", flow.net], ["Cash", flow.cash], ["M-Pesa", flow.mpesa], ["Bank", flow.bank]])}</>}
        {(sub === "Receivables" || sub === "Payables") && parties(sub === "Payables")}
        {sub === "Transactions" && transactions}
        {sub === "VAT" && <>{section("VAT")}{lines([["VAT collected", s.sales.filter((x) => x.at >= from).reduce((a, x) => a + (x.vat ?? 0), 0)], ["VAT payable", -balances(j, from).vatPayable.net]])}<AmountRow label={tr("Purchase VAT")} value="—" /><Link className="money-link" to="/settings">{tr("VAT settings")} ›</Link></>}
        {sub === "Trial balance" && <>{section(sub)}<div className="money-trial"><b>{tr("Account")}</b><b>{tr("Debit")}</b><b>{tr("Credit")}</b></div>{(Object.keys(ACCOUNT_INFO) as AccountId[]).filter((k) => tb[k].debit || tb[k].credit).map((k) => <div key={k} className="money-trial"><span>{tr(ACCOUNT_INFO[k].name)}</span><span>{tb[k].net > 0 ? money(tb[k].net) : "—"}</span><span>{tb[k].net < 0 ? money(-tb[k].net) : "—"}</span></div>)}</>}
        {sub === "Journal" && <>{section(sub)}{j.slice(0, 100).map((e, i) => <div key={`${e.ref}-${i}`}><div className="money-line text-primary"><b>{e.ref} · {tr(e.memo)}</b><span>{dt(e.at)}</span></div>{e.lines.map((l, k) => <AmountRow key={k} label={tr(ACCOUNT_INFO[l.account].name)} value={l.debit ? money(l.debit) : `(${money(l.credit)})`} />)}</div>)}</>}
      </>}
      {menu === "Settings" && <>{section(sub)}
        {sub === "Chart of accounts" && (Object.keys(ACCOUNT_INFO) as AccountId[]).map((k) => <AmountRow key={k} label={tr(ACCOUNT_INFO[k].name)} value={tr(ACCOUNT_INFO[k].type)} />)}
        {sub === "Financial periods" && <Tabs items={PERIODS} value={period} onChange={(p) => setPeriod(p as Period)} tr={tr} small />}
        {sub === "Numbering" && Object.entries(s.seq).map(([k, v]) => <AmountRow key={k} label={k} value={String(v).padStart(6, "0")} />)}
        {sub === "VAT settings" && <><AmountRow label={tr("VAT")} value={tr(prefs.tax.on ? "On" : "Off")} /><AmountRow label={tr("VAT rate")} value={`${prefs.tax.rate}%`} /><Link className="money-link" to="/settings">{tr("Tax & Compliance")} ›</Link></>}
        {sub === "Audit trail" && s.audit.slice(0, 100).map((x) => <div key={x.id} className="money-audit"><span>{dt(x.at)}</span><b>{tr(x.action)}</b><span>{x.user}</span><span>{x.detail}</span></div>)}
        {sub === "Integrations" && <Link className="money-link" to="/settings">{tr("Integrations")} ›</Link>}
        <AmountRow label={tr("Unpaid expenses")} value={money(s.expenses.reduce((a, x) => a + expenseBalance(s, x), 0))} />
      </>}
      {detail && <MoneyDetail row={detail} shop={acct.shopName} money={money} tr={tr} onClose={() => setDetail(null)} />}
    </div>
  </ErpShell>;
}
