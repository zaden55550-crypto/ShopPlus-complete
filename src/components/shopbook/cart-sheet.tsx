import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronRight, Delete, Plus, Save, ShoppingCart, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ShopButton } from "@/components/ui/shop-button";
import { LineEditor } from "@/components/shopbook/line-editor";
import * as erp from "@/lib/erp";

export function useCartDraft(channel: string) {
  const [cart, setCart] = useState<erp.CartLine[]>([]);
  const key = `shopbook.cart.${channel}`;
  useEffect(() => {
    try {
      const draft: unknown = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(draft)) setCart(draft.filter((l): l is erp.CartLine => !!l && typeof l.productId === "string" && Number.isFinite(l.qty) && l.qty > 0 && (l.price === undefined || (Number.isFinite(l.price) && l.price >= 0))));
    } catch { /* A malformed draft never changes ERP records. */ }
  }, [key]);
  const saveDraft = () => { localStorage.setItem(key, JSON.stringify(cart)); };
  const clearDraft = () => { localStorage.removeItem(key); };
  return { cart, setCart, saveDraft, clearDraft };
}

export function CartSheet({ s, cart, money, tr, setLine, remove, clear, close, next, saveDraft }: {
  s: erp.ErpState; cart: erp.CartLine[]; money: (n: number) => string; tr: (x: string) => string;
  setLine: (l: erp.CartLine) => void; remove: (id: string) => void; clear: () => void; close: () => void; next: () => void; saveDraft: () => void;
}) {
  const [edit, setEdit] = useState<erp.CartLine | null>(null);
  const [quantity, setQuantity] = useState<erp.CartLine | null>(null);
  const [modes, setModes] = useState<Record<string, "amount" | "price">>({});
  const [invalidAmounts, setInvalidAmounts] = useState<Record<string, boolean>>({});
  const invalid = cart.some((l) => invalidAmounts[l.productId]);
  const total = erp.lineTotal(s, cart);
  const change = (line: erp.CartLine, raw: number) => {
    const p = s.products.find((p) => p.id === line.productId);
    if (!p) return;
    const qty = erp.roundQty(raw);
    if (qty <= 0) return;
    if (qty > p.qty) { toast.error(`${tr("Insufficient stock")}: ${p.name} (${p.qty})`); return; }
    setLine({ ...line, qty });
  };
  const adjust = (line: erp.CartLine, direction: 1 | -1) => {
    const p = s.products.find((p) => p.id === line.productId);
    if (!p) return;
    // Whole-unit products step by 1; everything else steps by 0.25 (3-decimal precision kept).
    const step = erp.isWholeUnit(p.unit) ? 1 : 0.25;
    const qty = erp.roundQty(line.qty + direction * step);
    if (qty <= 0) { remove(line.productId); return; }
    if (qty > p.qty) { toast.error(`${tr("Insufficient stock")}: ${p.name} (${p.qty})`); return; }
    setLine({ ...line, qty });
  };
  return <div role="dialog" aria-modal="true" aria-label={tr("Cart")} className="cart-overlay" onClick={close} onKeyDown={(e) => { if (e.key === "Escape" && !quantity && !edit) close(); }}>
    <section className="inventory-screen cart-sheet" onClick={(e) => e.stopPropagation()}>
      <header className="cart-heading">
        <div className="flex min-w-0 items-center gap-2"><ShoppingCart className="h-5 w-5 shrink-0 text-primary" /><b>{tr("Cart")} ({cart.length} {tr("items")})</b></div>
        <div className="flex shrink-0 items-center gap-2"><ShopButton variant="bare" className="cart-clear" onClick={clear}><Trash2 className="h-3.5 w-3.5" />{tr("Clear Cart")}</ShopButton><ShopButton variant="bare" className="cart-icon" aria-label={tr("Close")} onClick={close}><X className="h-4 w-4" /></ShopButton></div>
      </header>
      <div className="cart-lines">{cart.map((l) => {
        const p = s.products.find((p) => p.id === l.productId);
        if (!p) return null;
        const unit = p.unit || "pcs";
        return <div className="cart-line" key={p.id}>
          <ShopButton variant="bare" className="cart-product" onClick={() => setEdit(l)} title={tr("Edit price and amount")}><b>{p.name}</b><small>{money(erp.linePrice(s, l))} / {unit}</small></ShopButton>
          <div className="cart-stepper">
            <ShopButton variant="bare" className="cart-step" aria-label={`${tr("Decrease quantity")} ${p.name}`} onClick={() => adjust(l, -1)}>−</ShopButton>
            <ShopButton variant="bare" className="cart-quantity" aria-label={`${tr("Edit quantity")} ${p.name}`} onClick={() => setQuantity(l)}>{l.qty}</ShopButton>
            <ShopButton variant="bare" className="cart-step" aria-label={`${tr("Increase quantity")} ${p.name}`} onClick={() => adjust(l, 1)}>+</ShopButton>
          </div>
          <select className="cart-unit" aria-label={`${tr("Selling unit")} ${p.name}`} value={unit} onChange={() => {}}><option value={unit}>{unit}</option></select>
          <ShopButton variant="bare" className="cart-unit" aria-label={`${tr("Switch entry mode")} ${p.name}`} title={tr(modes[p.id] === "price" ? "Typing the amount changes the price" : "Typing the amount calculates the quantity")} onClick={() => setModes((m) => ({ ...m, [p.id]: m[p.id] === "price" ? "amount" : "price" }))}>{modes[p.id] === "price" ? tr("Price") : tr("Amt")}</ShopButton>
          <LineAmount mode={modes[p.id] ?? "amount"} s={s} line={l} tr={tr} setLine={setLine} onInvalid={(bad) => setInvalidAmounts((current) => current[p.id] === bad ? current : { ...current, [p.id]: bad })} />
          <ShopButton variant="bare" className="cart-icon text-destructive" aria-label={`${tr("Remove")} ${p.name}`} onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></ShopButton>
        </div>;
      })}</div>
      <ShopButton variant="bare" className="cart-add-more" onClick={close}><Plus className="h-5 w-5 text-primary" /><span className="flex-1 text-start">{tr("Add More Items")}</span><ChevronRight className="h-4 w-4" /></ShopButton>
      <div className="cart-totals"><span>{tr("Subtotal")} ({cart.length} {tr("items")})</span><b>{money(total)}</b><span>{tr("Discount")}</span><b>{money(0)}</b><strong>{tr("Total")}</strong><strong className="text-primary">{money(total)}</strong></div>
      <footer className="cart-actions"><ShopButton variant="outline" disabled={invalid} onClick={() => { try { saveDraft(); toast.success(tr("Cart saved locally")); close(); } catch { toast.error(tr("Unable to save cart")); } }}><Save className="h-4 w-4" />{tr("Save Cart")}</ShopButton><ShopButton disabled={!cart.length || invalid} onClick={next}>{tr("Proceed to Checkout")}<ArrowRight className="h-4 w-4" /></ShopButton></footer>
      {edit && <LineEditor s={s} line={edit} money={money} tr={tr} onSave={setLine} onClose={() => setEdit(null)} />}
      {quantity && <QuantityPad key={quantity.productId} s={s} line={quantity} tr={tr} onClose={() => setQuantity(null)} onSave={(qty) => { change(quantity, qty); setQuantity(null); }} />}
    </section>
  </div>;
}

function LineAmount({ s, line, tr, setLine, onInvalid, mode }: { mode: "amount" | "price"; s: erp.ErpState; line: erp.CartLine; tr: (x: string) => string; setLine: (l: erp.CartLine) => void; onInvalid: (bad: boolean) => void }) {
  const amount = erp.lineAmount(s, line);
  const [value, setValue] = useState(String(amount));
  const [invalid, setInvalid] = useState(false);
  useEffect(() => { setValue(String(amount)); setInvalid(false); onInvalid(false); }, [amount, line.qty]);
  const p = s.products.find((p) => p.id === line.productId);
  if (!p) return null;
  const price = erp.linePrice(s, line);
  // Amount mode: the typed money buys qty = amount ÷ unit price; the price itself never changes.
  if (mode === "amount") return <input className="cart-amount cart-amount-input" aria-label={`${tr("Amount to spend")} ${p.name}`} aria-invalid={invalid} title={invalid ? tr("This amount doesn't give a valid quantity") : tr("Amount to spend")} inputMode="decimal" value={value} onFocus={(e) => e.currentTarget.select()} onChange={(e) => {
    const raw = e.target.value; setValue(raw);
    const r = /^\d+(\.\d{0,2})?$/.test(raw) ? erp.qtyForAmount(Number(raw), price) : null;
    const bad = !r || !r.exact || r.qty <= 0 || r.qty > p.qty + 1e-9 || (erp.isWholeUnit(p.unit) && !Number.isInteger(r.qty));
    setInvalid(bad); onInvalid(bad);
    if (!bad && r) setLine({ ...line, qty: r.qty });
  }} />;
  return <input className="cart-amount cart-amount-input" aria-label={`${tr("Amount")} ${p.name}`} aria-invalid={invalid} title={tr("Edit price and amount")} inputMode="decimal" value={value} onFocus={(e) => e.currentTarget.select()} onChange={(e) => {
    const raw = e.target.value;
    setValue(raw);
    const bad = !/^\d+(\.\d{0,2})?$/.test(raw) || !Number.isFinite(Number(raw)) || line.qty <= 0 || !Number.isFinite(Number(raw) / line.qty);
    setInvalid(bad); onInvalid(bad);
    if (bad) return;
    const price = Number(raw) / line.qty;
    setLine({ ...line, price: price === p.sell ? undefined : price, priceReason: price === p.sell ? undefined : line.priceReason || tr("Manual amount") });
  }} />;
}

function QuantityPad({ s, line, tr, onSave, onClose }: { s: erp.ErpState; line: erp.CartLine; tr: (x: string) => string; onSave: (q: number) => void; onClose: () => void }) {
  const [value, setValue] = useState(String(line.qty));
  const [replace, setReplace] = useState(true);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { input.current?.focus(); input.current?.select(); }, []);
  const p = s.products.find((p) => p.id === line.productId);
  if (!p) return null;
  const qty = Number(value);
  const error = !Number.isFinite(qty) || qty <= 0 ? tr("Enter a quantity above zero") : qty > p.qty ? `${tr("Insufficient stock")} (${p.qty} ${p.unit || "pcs"})` : erp.roundQty(qty) !== qty ? tr("Use up to 3 decimal places") : erp.isWholeUnit(p.unit) && !Number.isInteger(qty) ? `${tr("Whole numbers only for")} ${p.unit || "pcs"}` : "";
  const enter = (key: string) => {
    if (key === "back") { setValue(replace ? "" : value.slice(0, -1)); setReplace(false); return; }
    const next = replace ? (key === "." ? "0." : key) : value + key;
    if (/^\d*(\.\d{0,3})?$/.test(next)) { setValue(next); setReplace(false); }
  };
  const done = () => { if (!error) onSave(qty); };
  return <div className="quantity-overlay" role="dialog" aria-modal="true" aria-label={tr("Enter Quantity")} onClick={(e) => { e.stopPropagation(); onClose(); }}>
    <div className="quantity-pad" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } if (e.key === "Enter") done(); }}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2"><div className="min-w-0"><h2>{tr("Enter Quantity")}</h2><p>{p.name} ({p.unit || "pcs"})</p></div><ShopButton variant="bare" className="cart-icon" aria-label={tr("Cancel")} onClick={onClose}><X className="h-4 w-4" /></ShopButton></div>
      <div className="quantity-input"><input ref={input} aria-label={tr("Quantity")} inputMode="none" value={value} onChange={(e) => { if (/^\d*(\.\d{0,3})?$/.test(e.target.value)) { setValue(e.target.value); setReplace(false); } }} /><ShopButton variant="bare" className="cart-icon" aria-label={tr("Clear quantity")} onClick={() => { setValue(""); setReplace(false); }}><X className="h-4 w-4" /></ShopButton></div>
      <div className="quantity-keys">{["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"].map((key) => <ShopButton key={key} variant="bare" aria-label={key === "back" ? tr("Backspace") : key} onClick={() => enter(key)}>{key === "back" ? <Delete className="h-5 w-5" /> : key}</ShopButton>)}</div>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      <ShopButton className="quantity-done" disabled={!!error} onClick={done}>{tr("Done")}</ShopButton>
    </div>
  </div>;
}