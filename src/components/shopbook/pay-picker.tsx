// The one payment chooser for every money screen: Cash, M-Pesa, Bank, Credit, then P.PAY (part payment) last.
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/shopbook/erp-shell";
import { ShopButton } from "@/components/ui/shop-button";
import type { Method } from "@/lib/erp";

export type PayMode = Method | "ppay";
export const PAY_OPTIONS: { id: PayMode; label: string }[] = [
  { id: "cash", label: "Cash" }, { id: "mpesa", label: "M-Pesa" }, { id: "bank", label: "Bank" }, { id: "credit", label: "Credit" }, { id: "ppay", label: "P.PAY" },
];
export type PayState = { mode: PayMode; split: Record<"cash" | "mpesa" | "bank", string>; received: string };
export const emptyPay = (mode: PayMode = "cash"): PayState => ({ mode, split: { cash: "", mpesa: "", bank: "" }, received: "" });

/** Turns the picker state into the shared pay record; whatever is unpaid lands on credit. */
export function payRecord(p: PayState, total: number): Record<Method, number> {
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const pay: Record<Method, number> = { cash: 0, mpesa: 0, bank: 0, credit: 0 };
  if (p.mode === "ppay") (["cash", "mpesa", "bank"] as const).forEach((m) => { pay[m] = r2(Math.max(0, +p.split[m] || 0)); });
  else if (p.mode !== "credit") pay[p.mode] = r2(total);
  pay.credit = r2(Math.max(0, total - pay.cash - pay.mpesa - pay.bank));
  return pay;
}
export const paidOf = (pay: Record<Method, number>) => pay.cash + pay.mpesa + pay.bank;

export function PayPicker({ value, onChange, total, money, tr, allowCredit = true, allowPartial = allowCredit, creditNote }: {
  value: PayState; onChange: (p: PayState) => void; total: number; money: (n: number) => string; tr: (t: string) => string; allowCredit?: boolean; allowPartial?: boolean; creditNote?: string | undefined;
}) {
  const pay = payRecord(value, total);
  const paid = paidOf(pay);
  const over = value.mode === "ppay" && paid > total + 0.001;
  const change = value.mode === "cash" && value.received !== "" ? +value.received - total : null;
  const status = over ? null : pay.credit > 0.001 ? (paid > 0 ? "Partially Paid" : "Unpaid") : "Paid";
  return <div className="grid gap-1.5">
    <p className="inventory-field">{tr("Payment Method")} <span className="text-destructive">*</span></p>
    <div role="radiogroup" className="inventory-tabs inventory-tabs-sub px-0">
      {PAY_OPTIONS.filter((o) => o.id === "credit" ? allowCredit : o.id === "ppay" ? allowPartial : true).map((o) => <ShopButton variant="bare" key={o.id} role="radio" aria-checked={value.mode === o.id} onClick={() => onChange({ ...value, mode: o.id })} className={cn("inventory-tab", value.mode === o.id && "pay-on")}>{o.id === "ppay" ? "P.PAY" : tr(o.label)}</ShopButton>)}
    </div>
    {value.mode === "cash" && <div className="grid grid-cols-2 items-center gap-1.5"><span className="text-[11px]">{tr("Cash received (optional)")}</span><input className="inventory-input" inputMode="decimal" placeholder={String(total)} value={value.received} onChange={(e) => onChange({ ...value, received: e.target.value })} /></div>}
    {value.mode === "ppay" && <div className="inventory-box mt-0 grid gap-1.5">
      <p className="text-[11px] font-bold">{tr("Partial Payment")}</p>
      {(["cash", "mpesa", "bank"] as const).map((m) => <div key={m} className="grid grid-cols-2 items-center gap-1.5"><span className="inventory-input flex items-center">{tr(m === "cash" ? "Cash" : m === "mpesa" ? "M-Pesa" : "Bank")}</span><input className="inventory-input" inputMode="decimal" placeholder="0" value={value.split[m]} onChange={(e) => onChange({ ...value, split: { ...value.split, [m]: e.target.value } })} /></div>)}
      <div className="grid grid-cols-2 items-center gap-1.5"><span className="inventory-input flex items-center">{tr("Credit")}</span><span className="inventory-input flex items-center tabular-nums text-warning">{pay.credit.toLocaleString("en-KE")}</span></div>
    </div>}
    <div className="pur-totals">
      <span>{tr("Total bill")}</span><b>{money(total)}</b>
      {change !== null && <><span>{tr("Cash tendered")}</span><b>{money(+value.received || 0)}</b></>}
      <span>{tr("Total Paid")}</span><b>{money(paid)}</b>
      <span>{tr(pay.credit > 0.001 ? "Balance due (customer credit)" : "Balance due")}</span><b className={cn(pay.credit > 0 && "text-warning")}>{money(pay.credit)}</b>
      {change !== null && change > 0 && <><span>{tr("Change")}</span><b className="text-primary">{money(change)}</b></>}
      {status && <><span>{tr("Status")}</span><span className="justify-self-end"><Badge s={status === "Partially Paid" ? "P.PAY" : status === "Unpaid" ? "Credit" : "Paid"} /> <small className="ms-1 text-[10px] font-semibold">{tr(status.toUpperCase())}</small></span></>}
    </div>
    {over && <p className="text-[11px] text-destructive">{tr("Payments exceed the total")}</p>}
    {change !== null && change < -0.001 && <p className="text-[11px] text-destructive">{tr("Cash received is less than the total — use P.PAY")}</p>}
    {pay.credit > 0.001 && creditNote && <p className="text-[11px] text-warning">{tr(creditNote)}</p>}
  </div>;
}
/** True when the picker holds something that can't be saved. */
export const payInvalid = (p: PayState, total: number) => { const pay = payRecord(p, total); return paidOf(pay) > total + 0.001 || (p.mode === "cash" && p.received !== "" && +p.received < total - 0.001); };
