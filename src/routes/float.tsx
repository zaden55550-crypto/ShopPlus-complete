import { ModuleCharts } from "@/components/shopbook/analytics-charts";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Banknote, Smartphone, Landmark, Wallet, ArrowRightLeft } from "lucide-react";
import { ShopButton } from "@/components/ui/shop-button";
import { useErp } from "@/components/shopbook/product-search";
import { dt, moneyFor, run, useAccount } from "@/components/shopbook/selling";
import { ErpShell, Empty } from "@/components/shopbook/erp-shell";
import { ActivityList, AmountRow, MoneyDetail } from "@/components/shopbook/money-ui";
import { Kpi, KpiRow } from "@/components/shopbook/kpi";
import { useLanguage } from "@/hooks/use-language";
import { PayPicker, emptyPay } from "@/components/shopbook/pay-picker";
import { moneyActivity, type MoneyActivity } from "@/lib/money-activity";
import * as erp from "@/lib/erp";
import * as fin from "@/lib/finance";

export const Route = createFileRoute("/float")({ head: () => ({ meta: [
  { title: "Float — SHOPBOOK ERP" }, { name: "description", content: "Compact Cash, M-Pesa and Bank activity, internal transfers, owner capital and daily cash-up." },
  { property: "og:title", content: "Float — SHOPBOOK ERP" }, { property: "og:description", content: "Track your real business money and reconcile the cash drawer." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
] }), component: Float });
const MENUS: Record<string, readonly string[]> = {
  Overview: [], Cash: ["Balance", "Cash in", "Cash out", "History"], "M-Pesa": ["Balance", "Money in", "Money out", "History"], Bank: ["Balance", "Money in", "Money out", "History"],
  Transfers: ["New transfer", "History"], "Business Money": ["Owner withdrawal", "Capital in", "History"],
  "Daily Cash-up": ["Opening cash", "Cash count", "Expected cash", "Actual cash", "Variance", "Cash removal", "History"],
};
function Float() {
  const acct = useAccount("plus"), s = useErp(); const { tr } = useLanguage();
  const [menu, setMenu] = useState("Overview"), [sub, setSub] = useState("");
  const [amount, setAmount] = useState(""), [note, setNote] = useState(""), [counted, setCounted] = useState("");
  const [pay, setPay] = useState(emptyPay()), [from, setFrom] = useState<erp.Method>("cash"), [to, setTo] = useState<erp.Method>("bank");
  const [detail, setDetail] = useState<MoneyActivity | null>(null);
  if (!acct) return <main className="app-screen" />;
  const money = moneyFor(acct.currency || "KSh"), b = fin.floatBalances(s), cs = erp.cashSession(s);
  const rows = moneyActivity(s), account = menu === "M-Pesa" ? "mpesa" : menu === "Bank" ? "bank" : "cash";
  const last = s.cash.find((x) => x.type === "CASH UP");
  const go = (m: string) => { setMenu(m); setSub(MENUS[m]?.[0] ?? ""); setAmount(""); setNote(""); };
  const heading = (t: string) => <h2 className="money-heading">{tr(t)}</h2>;
  const list = (rr: MoneyActivity[]) => <ActivityList rows={rr.slice(0, 150)} money={money} tr={tr} onOpen={setDetail} />;
  const amountField = <label className="inventory-field"><span>{tr("Amount")}</span><input aria-label={tr("Amount")} className="inventory-input" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" /></label>;
  const noteField = <label className="inventory-field"><span>{tr("Reason")}</span><input aria-label={tr("Reason")} className="inventory-input" value={note} maxLength={120} onChange={(e) => setNote(e.target.value)} /></label>;
  const save = (fn: () => void) => run(() => { fn(); setAmount(""); setNote(""); return true; }, tr("Saved"));
  const transfer = <div className="inventory-form">{heading("Transfer between accounts")}<div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2"><select aria-label={tr("From account")} className="inventory-input" value={from} onChange={(e) => setFrom(e.target.value as erp.Method)}>{fin.ACCOUNTS.map((m) => <option key={m} value={m}>{tr(erp.METHOD_LABEL[m])}</option>)}</select><ArrowRightLeft className="h-3 w-3 text-primary" /><select aria-label={tr("To account")} className="inventory-input" value={to} onChange={(e) => setTo(e.target.value as erp.Method)}>{fin.ACCOUNTS.map((m) => <option key={m} value={m}>{tr(erp.METHOD_LABEL[m])}</option>)}</select></div>{amountField}<ShopButton className="inventory-save" disabled={!amount || from === to} onClick={() => save(() => fin.floatTransfer(from, to, +amount))}>{tr("Transfer")}</ShopButton></div>;
  const movement = (method: erp.Method, withdrawal: boolean, choose: boolean) => <div className="inventory-form">{heading(sub)}{choose && <PayPicker value={pay} onChange={setPay} total={+amount || 0} money={money} tr={tr} allowCredit={false} />}{amountField}{noteField}<ShopButton className="inventory-save" disabled={!amount || !note.trim()} onClick={() => save(() => fin.floatDeposit(choose && pay.mode !== "ppay" ? pay.mode : method, +amount, withdrawal ? "WITHDRAWAL" : "DEPOSIT", note))}>{tr("Save")}</ShopButton></div>;
  return <ErpShell title="Float" shop={acct.shopName} menus={MENUS} menu={menu} sub={sub} onMenu={go} onSub={(v) => { setSub(v); setAmount(""); setNote(""); }} deps={s}><div className="money-screen">
    <KpiRow><Kpi label={tr("Cash")} value={money(b.cash)} tone={b.cash < 0 ? "bad" : undefined} icon={<Banknote />} /><Kpi label={tr("M-Pesa")} value={money(b.mpesa)} tone={b.mpesa < 0 ? "bad" : undefined} icon={<Smartphone />} /><Kpi label={tr("Bank")} value={money(b.bank)} tone={b.bank < 0 ? "bad" : undefined} icon={<Landmark />} /><Kpi label={tr("Total")} value={money(b.cash + b.mpesa + b.bank)} icon={<Wallet />} /></KpiRow>
    {menu === "Overview" && <><ModuleCharts s={s} module="float" money={money} tr={tr} />{heading("Money Position")}{fin.ACCOUNTS.map((m) => <ShopButton variant="bare" key={m} className="money-record" onClick={() => go(erp.METHOD_LABEL[m])}><span className="pur-name">{tr(erp.METHOD_LABEL[m])}</span><b>{money(b[m as "cash" | "mpesa" | "bank"])}</b><span>›</span></ShopButton>)}{heading("Recent Money Activity")}{list(rows.slice(0, 10))}</>}
    {["Cash", "M-Pesa", "Bank"].includes(menu) && <>
      {sub === "Balance" && <>{heading(`${menu} balance`)}<AmountRow label={tr("Current balance")} value={money(b[account])} bold />{heading("Recent Money Activity")}{list(rows.filter((x) => x.method === menu).slice(0, 8))}</>}
      {sub === "History" && list(rows.filter((x) => x.method === menu))}
      {["Cash in", "Money in", "Cash out", "Money out"].includes(sub) && movement(account, sub.endsWith("out"), false)}
    </>}
    {menu === "Transfers" && (sub === "History" ? list(rows.filter((x) => x.kind === "TRANSFER")) : transfer)}
    {menu === "Business Money" && (sub === "History" ? list(rows.filter((x) => x.kind === "DEPOSIT" || x.kind === "WITHDRAWAL")) : movement("cash", sub === "Owner withdrawal", true))}
    {menu === "Daily Cash-up" && <>
      {sub === "Opening cash" && <div className="inventory-form">{heading(sub)}<AmountRow label={tr("Opening cash")} value={money(cs.opening)} />{amountField}<ShopButton className="inventory-save" disabled={!amount || cs.opening > 0} onClick={() => save(() => erp.cashEvent("OPENING", +amount, "Opening cash"))}>{tr("Save")}</ShopButton></div>}
      {sub === "Expected cash" && <>{heading(sub)}{([["Opening cash", cs.opening], ["Money in", cs.sales + cs.cin], ["Money out", cs.cout + cs.refunds], ["Expected cash", cs.expected]] as [string, number][]).map(([k, v]) => <AmountRow key={k} label={tr(k)} value={money(v)} bold={k === "Expected cash"} />)}</>}
      {sub === "Cash count" && <div className="inventory-form">{heading(sub)}<AmountRow label={tr("Expected cash")} value={money(cs.expected)} /><label className="inventory-field"><span>{tr("Actual cash")}</span><input aria-label={tr("Actual cash")} className="inventory-input" inputMode="decimal" value={counted} onChange={(e) => setCounted(e.target.value)} placeholder="0" /></label>{counted !== "" && <AmountRow label={tr("Variance")} value={money(+counted - cs.expected)} bad={+counted !== cs.expected} />}{noteField}<ShopButton className="inventory-save" disabled={counted === "" || (+counted !== cs.expected && !note.trim())} onClick={() => run(() => { erp.cashUp(+counted, note); setCounted(""); setNote(""); setSub("Actual cash"); return true; }, tr("Saved"))}>{tr("Confirm cash-up")}</ShopButton></div>}
      {(sub === "Actual cash" || sub === "Variance") && <>{heading(sub)}{last ? <><AmountRow label={tr("Expected cash")} value={money(last.expected ?? 0)} /><AmountRow label={tr("Actual cash")} value={money(last.counted ?? 0)} /><AmountRow label={tr("Variance")} value={money(last.amount)} bad={last.amount !== 0} /><AmountRow label={tr("Date")} value={dt(last.at)} /><AmountRow label={tr("User")} value={last.user} /><p className="py-2">{last.note}</p></> : <Empty>{tr("No records yet")}</Empty>}</>}
      {sub === "Cash removal" && transfer}
      {sub === "History" && <>{heading("Cash-up history")}{s.cash.filter((x) => x.type === "CASH UP").map((x) => <div key={x.id} className="money-audit"><span>{dt(x.at)}</span><span>{tr("Expected cash")} {money(x.expected ?? 0)}</span><span>{tr("Actual cash")} {money(x.counted ?? 0)}</span><b className={x.amount ? "text-warning" : "text-primary"}>{money(x.amount)}</b><span>{x.user}</span><span>{x.note}</span></div>)}</>}
    </>}
    {detail && <MoneyDetail row={detail} shop={acct.shopName} money={money} tr={tr} onClose={() => setDetail(null)} />}
  </div></ErpShell>;
}
