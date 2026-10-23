// Shared cart-line editor for Sales and POS: fractional qty, sell-by-amount (Option B) and one-sale price override.
import { useState } from "react";
import { Calculator } from "lucide-react";
import { ShopButton } from "@/components/ui/shop-button";
import * as erp from "@/lib/erp";

export function LineEditor({ s, line, money, tr, onSave, onClose }: { s: erp.ErpState; line: erp.CartLine; money: (n: number) => string; tr: (x: string) => string; onSave: (l: erp.CartLine) => void; onClose: () => void }) {
  const p = s.products.find((x) => x.id === line.productId);
  const [qty, setQty] = useState(String(line.qty)), [amount, setAmount] = useState(""), [price, setPrice] = useState(String(line.price ?? p?.sell ?? 0)), [reason, setReason] = useState(line.priceReason ?? "");
  if (!p) return null;
  const unit = p.unit || tr("pcs"), pr = +price, q = erp.roundQty(+qty || 0), total = Math.round(q * pr * 100) / 100;
  const calc = () => { const r = erp.qtyForAmount(+amount, pr); if (!r) return; setQty(String(r.qty)); };
  const exact = amount ? erp.qtyForAmount(+amount, pr) : null;
  const err = !(q > 0) ? tr("Enter a quantity above zero") : q > p.qty ? `${tr("Insufficient stock")} (${p.qty} ${unit})` : !(pr >= 0) ? tr("Enter a valid price") : "";
  const save = () => { if (err) return; onSave({ productId: p.id, qty: q, price: pr !== p.sell ? pr : undefined, priceReason: pr !== p.sell ? reason || undefined : undefined }); onClose(); };
  return <div role="dialog" aria-modal="true" aria-label={p.name} className="fixed inset-0 z-50 flex items-end justify-center bg-background/70" onClick={onClose}>
    <div className="inventory-screen w-full max-w-md rounded-t-lg border-t border-border p-3 sm:rounded-lg sm:border" style={{ minHeight: 0 }} onClick={(e) => e.stopPropagation()}>
      <p className="text-sm font-bold">{p.name}</p><p className="text-[11px] text-muted-foreground">{money(p.sell)} / {unit} • {tr("Stock")} {p.qty} {unit}</p>
      <label className="inventory-field mt-2"><span>{tr("Customer pays (amount)")}</span><div className="flex gap-1.5"><input className="inventory-input flex-1" inputMode="decimal" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} /><ShopButton className="h-9 px-2 text-[11px]" disabled={!(+amount > 0) || !(pr > 0)} onClick={calc}><Calculator className="h-3.5 w-3.5" />{tr("Calculate Quantity from Amount")}</ShopButton></div></label>
      {exact && !exact.exact && <p className="text-[10px] text-warning">{tr("This amount can't be matched exactly at 3 decimals; the total will be")} {money(Math.round(exact.qty * pr * 100) / 100)}</p>}
      <div className="grid grid-cols-2 gap-1.5">
        <label className="inventory-field"><span>{tr("Quantity")} ({unit})</span><input className="inventory-input" inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} /></label>
        <label className="inventory-field"><span>{tr("Price this sale")}</span><input className="inventory-input" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} /></label>
      </div>
      <div className="mt-1 flex flex-wrap gap-1">{[0.25, 0.5, 0.75, 1].map((x) => <ShopButton key={x} variant="outline" className="h-7 px-2 text-[11px]" onClick={() => setQty(String(x))}>{x}</ShopButton>)}</div>
      {pr !== p.sell && <label className="inventory-field"><span>{tr("Reason for price change (e.g. wholesale)")}</span><input className="inventory-input" value={reason} onChange={(e) => setReason(e.target.value)} /></label>}
      <div className="pur-totals mt-2"><span>{tr("Quantity")}</span><b>{q} {unit}</b><span>{tr("Unit price")}</span><b>{money(pr || 0)}</b><span>{tr("Total")}</span><b className="text-primary">{money(total)}</b></div>
      {err && <p className="text-[11px] text-destructive">{err}</p>}
      <div className="mt-2 grid grid-cols-2 gap-1.5"><ShopButton variant="outline" className="inventory-save" onClick={onClose}>{tr("Cancel")}</ShopButton><ShopButton className="inventory-save" disabled={!!err} onClick={save}>{tr("Apply")}</ShopButton></div>
      <p className="mt-1 text-[9px] text-muted-foreground">{tr("The product's normal price is not changed.")}</p>
    </div>
  </div>;
}
