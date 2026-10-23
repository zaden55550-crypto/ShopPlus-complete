import { ChevronRight, X, Printer } from "lucide-react";
import { useState } from "react";
import { ShopButton } from "@/components/ui/shop-button";
import { Empty } from "@/components/shopbook/erp-shell";
import { DocHead, DocLine, DocRule, PrintPreview } from "@/components/shopbook/print";
import { dt } from "@/components/shopbook/selling";
import type { MoneyActivity } from "@/lib/money-activity";
import { cn } from "@/lib/utils";

export function AmountRow({ label, value, bold = false, bad = false }: { label: string; value: string; bold?: boolean; bad?: boolean }) {
  return <div className={cn("money-line", bold && "font-bold")}><span>{label}</span><span className={cn("tabular-nums", bad && "text-destructive")}>{value}</span></div>;
}
export function ActivityList({ rows, money, tr, onOpen }: { rows: MoneyActivity[]; money: (n: number) => string; tr: (s: string) => string; onOpen: (x: MoneyActivity) => void }) {
  if (!rows.length) return <Empty>{tr("No records yet")}</Empty>;
  return <div>{rows.map((x) => <ShopButton variant="bare" key={x.id} className="money-record" onClick={() => onOpen(x)}><span className="text-primary">{x.ref}</span><span>{tr(x.kind)}</span><span className="pur-amt">{money(x.amount)}</span><span className="pur-muted">{tr(x.method)}</span><ChevronRight className="h-3 w-3 shrink-0" /></ShopButton>)}</div>;
}
export function MoneyDetail({ row, shop, money, tr, onClose }: { row: MoneyActivity; shop: string; money: (n: number) => string; tr: (s: string) => string; onClose: () => void }) {
  const [print, setPrint] = useState(false);
  const body = <><DocHead shop={shop} title={row.ref} /><DocLine k={tr("Type")} v={tr(row.kind)} /><DocLine k={tr("Date")} v={dt(row.at)} /><DocLine k={tr("Seller/Admin")} v={row.user} /><DocRule /><p>{row.source}</p><DocRule /><DocLine k={tr("Amount")} v={money(row.amount)} bold /><DocLine k={tr("Payment Method")} v={tr(row.method)} /></>;
  if (print) return <PrintPreview title="Transaction document" onClose={() => setPrint(false)}>{body}</PrintPreview>;
  return <div className="money-dialog" role="dialog" aria-modal="true" aria-label={tr("Transaction details")}><div className="money-dialog-body"><div className="money-line font-bold"><span>{row.ref}</span><ShopButton variant="bare" aria-label={tr("Exit")} className="h-7 w-7 p-0" onClick={onClose}><X className="h-4 w-4" /></ShopButton></div><AmountRow label={tr("Type")} value={tr(row.kind)} /><AmountRow label={tr("Date")} value={dt(row.at)} /><AmountRow label={tr("User")} value={row.user} /><p className="py-2 text-[10px]">{row.source}</p><AmountRow label={tr("Amount")} value={money(row.amount)} bold /><AmountRow label={tr("Payment Method")} value={tr(row.method)} /><ShopButton className="inventory-save mt-2 w-full" onClick={() => setPrint(true)}><Printer className="h-3 w-3" />{tr("Print")}</ShopButton></div></div>;
}