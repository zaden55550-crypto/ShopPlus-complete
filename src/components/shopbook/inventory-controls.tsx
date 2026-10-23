import { useState, type ReactNode } from "react";
import { Search, ScanLine } from "lucide-react";
import { ShopButton } from "@/components/ui/shop-button";
import { Scanner } from "@/components/shopbook/product-search";
import * as erp from "@/lib/erp";

type Tr = (text: string) => string;
export const inventoryInput = "inventory-input";

export function InventoryField({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return <label className="inventory-field"><span>{label}{required && <span className="text-destructive"> *</span>}</span>{children}</label>;
}

export function InventorySearch({ q, setQ, onScan, tr, placeholder = "Search products..." }: { q: string; setQ: (q: string) => void; onScan?: (code: string) => void; tr: Tr; placeholder?: string }) {
  const [scan, setScan] = useState(false);
  return <><div className="inventory-search"><Search className="h-4 w-4 shrink-0 text-muted-foreground" /><input aria-label={tr(placeholder)} placeholder={tr(placeholder)} value={q} onChange={e => setQ(e.target.value)} />{onScan && <ShopButton variant="primary" type="button" aria-label={tr("Scan barcode")} title={tr("Scan barcode")} className="inventory-scan" onClick={() => setScan(true)}><ScanLine className="h-5 w-5" /></ShopButton>}</div>{scan && <Scanner tr={tr} onClose={() => setScan(false)} onCode={code => { setScan(false); onScan?.(code); }} />}</>;
}

export function BarcodeField({ value, onChange, tr }: { value: string; onChange: (value: string) => void; tr: Tr }) {
  const [scan, setScan] = useState(false);
  return <div className="grid grid-cols-[minmax(0,1fr)_32px] items-center gap-2"><input aria-label={tr("Barcode")} value={value} onChange={e => onChange(e.target.value)} placeholder={tr("Scan or enter barcode")} className={inventoryInput} /><ShopButton type="button" aria-label={tr("Scan barcode")} title={tr("Scan barcode")} className="inventory-scan" onClick={() => setScan(true)}><ScanLine className="h-5 w-5" /></ShopButton>{scan && <Scanner tr={tr} onClose={() => setScan(false)} onCode={code => { setScan(false); onChange(code); }} />}</div>;
}

export function inventoryProducts(s: erp.ErpState, q: string) {
  const term = q.trim().toLowerCase();
  return s.products.filter(p => !term || [p.name, p.sku, p.barcode, s.categories.find(c => c.id === p.categoryId)?.name, s.brands.find(b => b.id === p.brandId)?.name].some(value => value?.toLowerCase().includes(term)));
}

export function InventoryProductPicker({ s, value, onChange, tr }: { s: erp.ErpState; value: string; onChange: (id: string) => void; tr: Tr }) {
  const [q, setQ] = useState("");
  const selected = s.products.find(p => p.id === value);
  const rows = inventoryProducts(s, q);
  return <div><InventorySearch q={selected && !q ? selected.name : q} setQ={v => { setQ(v); onChange(""); }} onScan={code => { const p = erp.findByCode(s, code); if (p) { onChange(p.id); setQ(""); } else { setQ(code); onChange(""); } }} tr={tr} placeholder="Search or scan product..." />{!selected && <select aria-label={tr("Select product")} className="inventory-input mt-1" value={value} required onChange={e => { onChange(e.target.value); setQ(""); }}><option value="">{tr("Select product")}</option>{rows.map(p => <option key={p.id} value={p.id}>{p.name} ({p.qty})</option>)}</select>}</div>;
}