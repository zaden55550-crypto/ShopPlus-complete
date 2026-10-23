import { clean } from "@/lib/format";
import { ModuleCharts } from "@/components/shopbook/analytics-charts";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Menu as MenuIcon, MoreVertical, Package, Coins, TriangleAlert, ArchiveX, Layers, ShoppingCart, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ShopButton } from "@/components/ui/shop-button";
import { store, canOpen, type Account } from "@/lib/shopbook";
import { useLanguage } from "@/hooks/use-language";
import { Kpi, KpiRow } from "@/components/shopbook/kpi";
import { Reorder } from "@/components/shopbook/reorder";
import { translateCurrent } from "@/lib/interface-translations";
import { cn } from "@/lib/utils";
import * as erp from "@/lib/erp";
import { lastBackup } from "@/lib/backup";
import { BackupStatus } from "@/components/shopbook/backup-status";
import { useErp } from "@/components/shopbook/product-search";
import { CartSheet, useCartDraft } from "@/components/shopbook/cart-sheet";
import { Checkout, ReceiptSheet } from "@/components/shopbook/selling";

import { InventorySearch, InventoryField, BarcodeField, InventoryProductPicker, inventoryProducts, inventoryInput } from "@/components/shopbook/inventory-controls";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — SHOPBOOK ERP" },
      { name: "description", content: "Products, stock levels, stock in/out, adjustments, transfers and stock reports." },
      { property: "og:title", content: "Inventory — SHOPBOOK ERP" },
      { property: "og:description", content: "The single source of truth for products and stock in SHOPBOOK." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Inventory,
});

const MENUS = {
  overview: [],
  products: ["All Products", "Add Product", "Categories", "Brands", "More"],
  stock: ["Stock Levels", "Stock In", "Stock Out", "Returned Goods", "Adjustments", "History"],
  transfers: ["New Transfer", "Pending", "Received", "History"],
  reports: ["Stock Report", "Movement", "Valuation", "Performance"],
} as const;
type Menu = keyof typeof MENUS;

const run = (fn: () => unknown, ok: string) => {
  try { fn(); toast.success(ok); return true; } catch (e) { toast.error(translateCurrent(e instanceof Error ? e.message : "Failed")); return false; }
};
const dt = (n: number) => new Date(n).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

function Inventory() {
  const nav = useNavigate();
  const { tr, dir } = useLanguage();
  const [acct, setAcct] = useState<Account | null>(null);
  const [menu, setMenu] = useState<Menu>("overview");
  const [sub, setSub] = useState<string>("");
  const [prefillBarcode, setPrefill] = useState("");
  const s = useErp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [lb, setLb] = useState(0);
  useEffect(() => { setLb(lastBackup()); }, []);

  useEffect(() => {
    const a = store.get();
    if (!a || !store.signedIn()) { nav({ to: "/", replace: true }); return; }
    if (!canOpen(a, "basic")) { nav({ to: "/apps", replace: true }); return; }
    setAcct(a);
  }, [nav]);
  if (!acct) return <main className="app-screen" />;

  const cur = acct.currency || "KSh";
  const money = (n: number) => `${cur} ${clean(Math.round(clean(n))).toLocaleString("en-KE")}`;
  const go = (m: Menu, sm?: string) => { setMenu(m); setSub(sm ?? MENUS[m][0] ?? ""); };
  const ctx = { s, money, tr, go, cur, shop: acct.shopName, onUnknown: (code: string) => { setPrefill(code); go("products", "Add Product"); } };

  return (
    <main dir={dir} className="inventory-screen flex w-full flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="inventory-header">
          <div className="flex shrink-0 items-center gap-1"><ShopButton variant="bare" className="h-auto w-auto p-0" aria-label={tr("Back")} onClick={() => nav({ to: "/apps" })}><ChevronLeft className="h-4 w-4 rtl:rotate-180" /></ShopButton><h1>{tr("Inventory").toUpperCase()}</h1></div>
          <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold">{acct.shopName}</p>
          <div className="relative shrink-0">
            <ShopButton variant="bare" className="h-auto w-auto p-1" aria-label={tr("Menu")} onClick={() => setMenuOpen(!menuOpen)}><MenuIcon className="h-5 w-5" /></ShopButton>
            {menuOpen && <div className="absolute end-0 top-9 z-30 w-48 rounded-xl border border-border bg-popover p-1 shadow-lg">
              {(Object.keys(MENUS) as Menu[]).map((m) => <ShopButton variant="bare" key={m} onClick={() => { go(m); setMenuOpen(false); }} className={cn("block w-full rounded-lg px-3 py-2 text-start text-xs font-medium hover:bg-muted", menu === m && "text-primary")}>{tr(m.charAt(0).toUpperCase() + m.slice(1))}</ShopButton>)}
              <ShopButton variant="bare" onClick={() => nav({ to: "/apps" })} className="block w-full rounded-lg px-3 py-2 text-start text-xs font-medium text-muted-foreground hover:bg-muted">{tr("Apps")}</ShopButton>
            </div>}
          </div>
        </div>
        <BackupStatus />
        <Tabs items={Object.keys(MENUS)} value={menu} onChange={(m) => go(m as Menu)} label={(k) => tr(k.charAt(0).toUpperCase() + k.slice(1))} />
        {MENUS[menu].length > 0 && <Tabs small items={[...MENUS[menu]]} value={sub} onChange={setSub} label={(k) => tr(k)} />}
      </header>

      <section className="inventory-content flex-1">
        {menu === "overview" && <Overview {...ctx} />}
        {menu === "products" && sub === "All Products" && <ProductList {...ctx} onUnknown={(code) => { setPrefill(code); setSub("Add Product"); }} />}
        {menu === "products" && sub === "Add Product" && <AddProduct {...ctx} barcode={prefillBarcode} done={() => { setPrefill(""); setSub("All Products"); }} />}
        {menu === "products" && (sub === "Categories" || sub === "Brands") && <NamedList {...ctx} kind={sub === "Brands" ? "brands" : "categories"} />}
        {menu === "products" && sub === "More" && <ProductMore {...ctx} />}
        {menu === "stock" && sub === "Stock Levels" && <StockLevels {...ctx} />}
        {menu === "stock" && (sub === "Stock In" || sub === "Stock Out" || sub === "Adjustments") && <StockForm {...ctx} mode={sub} />}
        {menu === "stock" && sub === "Returned Goods" && <ReturnedGoods {...ctx} />}
        {menu === "stock" && sub === "History" && <History {...ctx} />}
        {menu === "transfers" && <Transfers {...ctx} view={sub} />}
        {menu === "reports" && <Reports {...ctx} view={sub} />}
      </section>
    </main>
  );
}

type Ctx = { s: erp.ErpState; money: (n: number) => string; tr: (t: string) => string; go: (m: Menu, sm?: string) => void; cur: string; shop: string; onUnknown?: (code: string) => void };

function Tabs({ items, value, onChange, label, small }: { items: string[]; value: string; onChange: (v: string) => void; label: (k: string) => string; small?: boolean }) {
  return <div role="tablist" aria-label={small ? "Inventory submenu" : "Inventory navigation"} className={cn("inventory-tabs", small && "inventory-tabs-sub")}>{items.map(k => <ShopButton variant="bare" role="tab" aria-selected={value === k} key={k} onClick={() => onChange(k)} className="inventory-tab">{label(k)}</ShopButton>)}</div>;
}

function Status({ p }: { p: erp.Product }) {
  const st = erp.stockStatus(p);
  return <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", st === "OK" && "bg-primary/15 text-primary", st === "LOW" && "bg-warning/15 text-warning", st === "OUT" && "bg-destructive/15 text-destructive")}>{translateCurrent(st)}</span>;
}

function Box({ title, children, onView, tr }: { title: string; children: ReactNode; onView?: () => void; tr: Ctx["tr"] }) {
  return <div className="inventory-box"><div className="inventory-box-heading"><h2>{title}</h2>{onView && <ShopButton variant="bare" className="inventory-view-all" onClick={onView}>{tr("View All")} <ChevronRight className="h-3 w-3 rtl:rotate-180" /></ShopButton>}</div>{children}</div>;
}

function StockDot({ p }: { p?: erp.Product | undefined }) {
  const status = p ? erp.stockStatus(p) : "OK";
  return <span aria-label={status} className={cn("inventory-dot", status === "LOW" && "inventory-dot-low", status === "OUT" && "inventory-dot-out")} />;
}

function ReturnedGoods({ s, tr }: Ctx) {
  const [q, setQ] = useState("");
  const rows = s.returns.filter(r => !q || `${r.ref} ${r.saleRef} ${r.items.map(i => i.name).join(" ")}`.toLowerCase().includes(q.toLowerCase()));
  return <div><InventorySearch q={q} setQ={setQ} onScan={setQ} tr={tr} placeholder="Search returns..." /><div className="inventory-list-panel">{rows.length === 0 ? <Empty>{tr("No returns yet.")}</Empty> : rows.map(r => <div key={r.id} className="border-b border-border py-2"><div className="flex items-center justify-between gap-2 text-[10px]"><b>{r.ref}</b><span className="text-muted-foreground">{dt(r.at)}</span></div>{r.items.map((i,k) => <div key={k} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2"><div className="min-w-0"><p className="truncate">{i.name}</p><p className="text-[10px] text-muted-foreground">{tr("Quantity")}: {i.qty} • {tr("Sale")}: {r.saleRef}</p><p className="text-[10px] text-muted-foreground">{tr("Reason")}: {tr("Return")} • {tr("Refund")}: {tr(erp.METHOD_LABEL[r.refund])}</p></div><span className="rounded border border-primary px-1.5 text-[10px] text-primary">+{i.qty} {tr("Stock")}</span></div>)}</div>)}</div></div>;
}

function Title({ children }: { children: ReactNode }) { return <h2 className="mb-2 mt-5 text-xs font-bold uppercase tracking-wider text-muted-foreground first:mt-0">{children}</h2>; }
function Empty({ children }: { children: ReactNode }) { return <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>; }

function MoveRow({ m, s, tr }: { m: erp.Movement; s: erp.ErpState; tr: Ctx["tr"] }) {
  const [open, setOpen] = useState(false);
  const p = s.products.find((x) => x.id === m.productId);
  return (
    <ShopButton variant="bare" onClick={() => setOpen(!open)} className="block h-auto w-full border-b border-border py-1.5 text-start">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-muted-foreground">{dt(m.at)} • {tr(m.type)}</p>
          <p className="text-xs font-medium">{p?.name ?? tr("Deleted product")}</p>
        </div>
        <span className={cn("text-xs font-bold", m.qty > 0 ? "text-primary" : "text-destructive")}>{m.qty > 0 ? "+" : ""}{m.qty}</span>
      </div>
      {open && (
        <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg bg-muted/50 p-2 text-[11px]">
          <span className="text-muted-foreground">{tr("Source")}</span><span>{m.source ?? "—"}</span>
          <span className="text-muted-foreground">{tr("Previous")}</span><span>{m.prev}</span>
          <span className="text-muted-foreground">{tr("New")}</span><span>{m.next}</span>
          <span className="text-muted-foreground">{tr("Reason")}</span><span>{m.reason ? tr(m.reason) : "—"}</span>
          <span className="text-muted-foreground">{tr("Performed by")}</span><span>{tr(m.user)}</span>
        </div>
      )}
    </ShopButton>
  );
}

function Overview({ s, money, tr, go }: Ctx) {
  const low = s.products.filter(p => erp.stockStatus(p) === "LOW");
  const out = s.products.filter(p => erp.stockStatus(p) === "OUT");
  const value = s.products.reduce((a,p) => a + p.qty * p.buy, 0);
  const ins = s.movements.filter(m => m.qty > 0).slice(0,5);
  const outs = s.movements.filter(m => m.qty < 0).slice(0,5);
  const shortDate = (at: number) => {
    const date = new Date(at); const today = new Date();
    if (date.toDateString() === today.toDateString()) return tr("Today");
    today.setDate(today.getDate()-1);
    if (date.toDateString() === today.toDateString()) return tr("Yesterday");
    return date.toLocaleDateString("en-GB", {day:"2-digit",month:"short"});
  };
  const movement = (m: erp.Movement) => { const p = s.products.find(p => p.id === m.productId); return <div className="inventory-move-row" key={m.id}><StockDot p={p} /><span className="truncate">{p?.name ?? tr("Deleted product")}</span><b className={cn("text-end", m.qty > 0 ? "text-primary" : "text-destructive")}>{m.qty > 0 ? "+" : ""}{m.qty}</b><span className="text-end text-[10px] text-muted-foreground">{shortDate(m.at)}</span></div>; };
  return <div><KpiRow><Kpi label={tr("Products")} value={s.products.length} icon={<Package className="text-primary" />} /><Kpi label={tr("Stock value")} value={money(value)} icon={<Coins className="text-warning" />} /><Kpi label={tr("Low stock")} value={low.length} icon={<TriangleAlert className="text-warning" />} /><Kpi label={tr("Out of stock")} value={out.length} icon={<ArchiveX className="text-destructive" />} /></KpiRow>
    <ModuleCharts s={s} module="inventory" money={money} tr={tr} />
    <Box title={tr("Recent Stock In")} tr={tr} onView={() => go("stock","History")}>{ins.length ? ins.map(movement) : <Empty>{tr("No movements yet")}</Empty>}</Box>
    <Box title={tr("Recent Stock Out")} tr={tr} onView={() => go("stock","History")}>{outs.length ? outs.map(movement) : <Empty>{tr("No movements yet")}</Empty>}</Box>
    <Box title={tr("Low / Out of Stock")} tr={tr} onView={() => go("stock","Stock Levels")}>{[...out,...low].length ? [...out,...low].slice(0,5).map(p => <div className="flex items-start gap-2 border-b border-border py-1.5 last:border-0" key={p.id}><span className="mt-1"><StockDot p={p} /></span><div className="min-w-0"><p className="truncate">{p.name}</p><p className="text-[10px] text-muted-foreground">{tr("Stock")}: {p.qty} • {tr("Reorder")}: {p.minStock ?? 5}</p></div></div>) : <Empty>{s.products.length ? tr("Nothing here yet") : tr("No products yet")}</Empty>}</Box>
  </div>;
}

function ProductList({ s, money, tr, shop, onUnknown }: Ctx & { onUnknown: (code: string) => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const { cart, setCart, saveDraft, clearDraft } = useCartDraft("Sales");
  const [step, setStep] = useState<null | "cart" | "pay">(null);
  const [receipt, setReceipt] = useState<erp.Sale | null>(null);
  const add = (p: erp.Product) => {
    const existing = cart.find((l) => l.productId === p.id);
    const qty = erp.roundQty((existing?.qty ?? 0) + 1);
    if (qty > p.qty) { toast.error(`${tr("Insufficient stock")}: ${p.name} (${p.qty})`); return; }
    setCart((current) => existing ? current.map((l) => l.productId === p.id ? { ...l, qty } : l) : [...current, { productId: p.id, qty }]);
  };
  const list = useMemo(() => inventoryProducts(s,q), [s,q]);
  const onScan = (code: string) => { const p = erp.findByCode(s,code); if (p) { setQ(p.name); setOpen(p.id); } else onUnknown(code); };
  const openP = s.products.find(p => p.id === open);
  return <div><InventorySearch q={q} setQ={setQ} onScan={onScan} tr={tr} /><div className="inventory-list-panel">{list.length === 0 && <Empty>{q ? tr("No matching products") : tr("No products yet")}</Empty>}{list.map(p => <div className="inventory-product-row" key={p.id}><ShopButton variant="bare" className="inventory-product-open" aria-label={`${tr("Add")} ${p.name}`} disabled={p.qty <= 0} onClick={() => add(p)}><p>{p.name}</p><p>{tr("Buy")} {Math.round(p.buy).toLocaleString("en-KE")} • {tr("Sell")} {Math.round(p.sell).toLocaleString("en-KE")}</p></ShopButton><div className="text-center"><p className="text-[9px] text-muted-foreground">{tr("Stock")}</p><b className={cn("text-[11px]", erp.stockStatus(p) === "OK" ? "text-primary" : erp.stockStatus(p) === "LOW" ? "text-warning" : "text-destructive")}>{p.qty}</b></div><ShopButton variant="bare" className="inventory-icon-button" aria-label={`${tr("Product")} ${p.name}`} title={tr("More details")} onClick={() => setOpen(p.id)}><MoreVertical className="h-4 w-4" /></ShopButton></div>)}</div>{openP && <ProductSheet p={openP} s={s} money={money} tr={tr} onClose={() => setOpen(null)} />}
    {cart.length > 0 && <ShopButton variant="bare" className="pos-fab" aria-label={`${tr("Cart")} (${cart.length})`} onClick={() => setStep("cart")}><ShoppingCart className="h-6 w-6" /><span className="pos-fab-count">{cart.length}</span></ShopButton>}
    {step === "cart" && <CartSheet s={s} cart={cart} money={money} tr={tr} setLine={(line) => setCart((current) => current.map((l) => l.productId === line.productId ? line : l))} remove={(id) => setCart((current) => current.filter((l) => l.productId !== id))} clear={() => { setCart([]); clearDraft(); setStep(null); }} close={() => setStep(null)} next={() => setStep("pay")} saveDraft={saveDraft} />}
    {step === "pay" && <Checkout s={s} cart={cart} money={money} tr={tr} channel="Sales" onClose={() => setStep("cart")} onDone={(sale) => { setCart([]); clearDraft(); setStep(null); setReceipt(sale); }} />}
    {receipt && <ReceiptSheet sale={receipt} s={s} money={money} tr={tr} shop={shop} onClose={() => setReceipt(null)} />}
  </div>;
}

function ProductSheet({ p, s, money, tr, onClose }: { p: erp.Product; s: erp.ErpState; money: Ctx["money"]; tr: Ctx["tr"]; onClose: () => void }) {
  const [sell, setSell] = useState(String(p.sell));
  const [buy, setBuy] = useState(String(p.buy));
  const [min, setMin] = useState(String(p.minStock ?? 5));
  const moves = s.movements.filter((m) => m.productId === p.id).slice(0, 8);
  const cat = s.categories.find((c) => c.id === p.categoryId)?.name;
  const brand = s.brands.find((c) => c.id === p.brandId)?.name;
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-background/70 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-auto max-h-[85vh] w-full max-w-md overflow-y-auto inventory-sheet border border-border bg-card p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          
          <div className="flex-1"><p className="text-xs font-bold">{p.name}</p><p className="text-xs text-muted-foreground">{[p.sku, p.barcode, cat, brand].filter(Boolean).join(" • ")}</p></div>
          <ShopButton variant="bare" onClick={onClose} aria-label={tr("Close")}><X className="h-5 w-5" /></ShopButton>
        </div>
        <KpiRow className="mt-3">
          <Kpi label={tr("Stock")} value={`${p.qty}`} />
          <Kpi label={tr("Cost value")} value={money(p.qty * p.buy)} />
          <Kpi label={tr("Sell value")} value={money(p.qty * p.sell)} />
        </KpiRow>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <label>{tr("Buying price")}<input type="number" value={buy} onChange={(e) => setBuy(e.target.value)} className={inventoryInput} /></label>
          <label>{tr("Selling price")}<input type="number" value={sell} onChange={(e) => setSell(e.target.value)} className={inventoryInput} /></label>
          <label>{tr("Min stock")}<input type="number" value={min} onChange={(e) => setMin(e.target.value)} className={inventoryInput} /></label>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">{tr("Quantity changes only through Stock In, Stock Out, Adjustments, sales and purchases.")}</p>
        <div className="mt-3 flex gap-2">
          <ShopButton onClick={() => run(() => erp.updateProduct(p.id, { buy: +buy || 0, sell: +sell || 0, minStock: +min || 0 }), tr("Saved"))}>{tr("Save")}</ShopButton>
          <ShopButton variant="outline" className="w-14" aria-label={tr("Delete")} onClick={() => { if (confirm(tr("Delete this product?")) && run(() => erp.deleteProduct(p.id), tr("Deleted"))) onClose(); }}><Trash2 className="h-4 w-4" /></ShopButton>
        </div>
        <Title>{tr("History")}</Title>
        {moves.length ? moves.map((m) => <MoveRow key={m.id} m={m} s={s} tr={tr} />) : <Empty>{tr("No movements yet")}</Empty>}
      </div>
    </div>
  );
}

function AddProduct({ s, tr, barcode, done }: Ctx & { barcode: string; done: () => void }) {
  const [f,setF] = useState({name:"",buy:"0",sell:"0",qty:"0",categoryId:"",brandId:"",sku:"",barcode,unit:"Piece",minStock:"5"});
  const [adv,setAdv] = useState(false);
  useEffect(() => { setF(x => ({...x,barcode})); },[barcode]);
  const set = (key: keyof typeof f) => (e: {target:{value:string}}) => setF(x => ({...x,[key]:e.target.value}));
  const save = () => run(() => erp.addProduct({name:f.name,buy:Number(f.buy),sell:Number(f.sell),qty:Number(f.qty),categoryId:f.categoryId || undefined,brandId:f.brandId || undefined,sku:f.sku.trim() || undefined,barcode:f.barcode.trim() || undefined,unit:f.unit,minStock:Number(f.minStock)}),tr("Product added")) && done();
  return <><h2 className="inventory-form-title">{tr("Add Product")}</h2><form className="inventory-form" onSubmit={e => { e.preventDefault(); save(); }}>
    <InventoryField label={tr("Product name")} required><input aria-label={tr("Product name")} placeholder={tr("Enter product name")} value={f.name} onChange={set("name")} className={inventoryInput} required /></InventoryField>
    <div className="grid grid-cols-2 gap-2"><InventoryField label={tr("Buying price")} required><input aria-label={tr("Buying price")} type="number" min="0" step="any" value={f.buy} onChange={set("buy")} className={inventoryInput} required /></InventoryField><InventoryField label={tr("Selling price")} required><input aria-label={tr("Selling price")} type="number" min="0" step="any" value={f.sell} onChange={set("sell")} className={inventoryInput} required /></InventoryField></div>
    <InventoryField label={tr("Quantity")} required><input aria-label={tr("Quantity")} type="number" min="0" step="any" value={f.qty} onChange={set("qty")} className={inventoryInput} required /></InventoryField>
    <InventoryField label={tr("Category")}><select aria-label={tr("Category")} value={f.categoryId} onChange={set("categoryId")} className={inventoryInput}><option value="">{tr("Select category")}</option>{s.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></InventoryField>
    <InventoryField label={tr("Brand")}><select aria-label={tr("Brand")} value={f.brandId} onChange={set("brandId")} className={inventoryInput}><option value="">{tr("Select brand")}</option>{s.brands.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></InventoryField>
    <InventoryField label={tr("Barcode")}><BarcodeField value={f.barcode} onChange={v => setF(x => ({...x,barcode:v}))} tr={tr} /></InventoryField>
    <InventoryField label={tr("Unit")}><select aria-label={tr("Unit")} className={inventoryInput} value={f.unit} onChange={set("unit")}>{["Piece","Box","Pack","Kg","Litre","Metre"].map(u => <option key={u} value={u}>{tr(u)}</option>)}</select></InventoryField>
    <ShopButton variant="bare" type="button" className="h-auto w-auto justify-start p-0 text-[10px] text-primary" onClick={() => setAdv(!adv)}>{tr("More details")}<ChevronDown className="h-3 w-3" /></ShopButton>
    {adv && <div className="grid grid-cols-2 gap-2"><InventoryField label={tr("SKU")}><input className={inventoryInput} value={f.sku} onChange={set("sku")} placeholder={tr("Auto")} /></InventoryField><InventoryField label={tr("Reorder")}><input type="number" min="0" className={inventoryInput} value={f.minStock} onChange={set("minStock")} /></InventoryField></div>}
    <ShopButton type="submit" className="inventory-save">{tr("Save Product")}</ShopButton>
  </form></>;
}

function NamedList({ s, tr, kind, go }: Ctx & { kind: "categories" | "brands" }) {
  const [q,setQ] = useState(""); const [adding,setAdding] = useState(false); const [name,setName] = useState(""); const [edit,setEdit] = useState<{id:string;name:string} | null>(null);
  const list = s[kind].filter(c => c.name.toLowerCase().includes(q.toLowerCase()));
  return <div><div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2"><InventorySearch q={q} setQ={setQ} tr={tr} placeholder={kind === "brands" ? "Search brands..." : "Search categories..."} /><ShopButton className="inventory-add-named" onClick={() => setAdding(!adding)}><Plus className="h-3 w-3" />{tr(kind === "brands" ? "Add Brand" : "Add Category")}</ShopButton></div>
    {adding && <form className="mt-2 flex gap-2" onSubmit={e => { e.preventDefault(); if(run(() => erp.addNamed(kind,name),tr("Added"))) { setName(""); setAdding(false); } }}><input aria-label={tr("Name")} required autoFocus value={name} onChange={e => setName(e.target.value)} className={inventoryInput} /><ShopButton type="submit" className="inventory-add-named">{tr("Save")}</ShopButton></form>}
    <div className="inventory-list-panel">{!list.length && <Empty>{tr("Nothing here yet")}</Empty>}{list.map(c => { const n = s.products.filter(p => (kind === "brands" ? p.brandId : p.categoryId) === c.id).length; return <div key={c.id} className="inventory-named-row">{edit?.id === c.id ? <form className="flex gap-2" onSubmit={e => { e.preventDefault(); if(run(() => erp.renameNamed(kind,c.id,edit.name),tr("Saved"))) setEdit(null); }}><input className={inventoryInput} value={edit.name} onChange={e => setEdit({...edit,name:e.target.value})} /><ShopButton className="inventory-add-named">{tr("Save")}</ShopButton></form> : <ShopButton variant="bare" className="inventory-named-open" onClick={() => { go("products","All Products"); }}><div className="flex min-w-0 items-center gap-2">{kind === "categories" && <span className="inventory-category-icon"><Layers className="h-4 w-4" /></span>}<div className="min-w-0"><p className="truncate">{c.name}</p><p className="text-[10px] font-normal text-muted-foreground">({n} {tr("products")})</p></div></div><ChevronRight className="h-4 w-4" /></ShopButton>}<div className="relative"><ShopButton variant="bare" className="inventory-icon-button" aria-label={`${tr("Edit")} ${c.name}`} title={tr("Edit")} onClick={() => setEdit(edit?.id === c.id ? null : {id:c.id,name:c.name})}><MoreVertical className="h-4 w-4" /></ShopButton>{edit?.id === c.id && <ShopButton variant="bare" className="inventory-icon-button text-destructive" aria-label={`${tr("Delete")} ${c.name}`} onClick={() => { if(confirm(tr("Delete") + " " + c.name + "?")) run(() => erp.removeNamed(kind,c.id),tr("Deleted")); setEdit(null); }}><Trash2 className="h-3 w-3" /></ShopButton>}</div></div>; })}</div>
  </div>;
}

function ProductMore({ s, money, tr }: Ctx) {
  const [ai,setAi] = useState(false);
  const exportProducts = () => {
    const quote = (v: string | number) => `"${String(v).replaceAll('"','""')}"`;
    const rows = [["Product","Buying price","Selling price","Stock","Reorder","SKU","Barcode","Unit"],...s.products.map(p => [p.name,p.buy,p.sell,p.qty,p.minStock ?? 5,p.sku ?? "",p.barcode ?? "",p.unit ?? ""])];
    const url = URL.createObjectURL(new Blob([rows.map(row => row.map(quote).join(",")).join("\n")],{type:"text/csv;charset=utf-8"})); const a = document.createElement("a"); a.href=url; a.download="SHOPBOOK-products.csv"; a.click(); URL.revokeObjectURL(url);
  };
  return <div className="space-y-2"><ShopButton className="inventory-save" onClick={exportProducts}>{tr("Export")}</ShopButton><ShopButton variant="outline" className="inventory-save" onClick={() => setAi(!ai)}>{tr("AI Reorder")}</ShopButton>{ai && <Reorder s={s} money={money} />}</div>;
}

function StockLevels({ s, tr, onUnknown }: Ctx) {
  const [q,setQ] = useState(""); const list = inventoryProducts(s,q);
  return <div><InventorySearch q={q} setQ={setQ} onScan={code => { const p = erp.findByCode(s,code); if(p) setQ(p.name); else onUnknown?.(code); }} tr={tr} /><div className="inventory-list-panel"><div className="inventory-stock-row text-[9px] font-semibold uppercase text-muted-foreground"><span>{tr("Product")}</span><span>{tr("Stock")}</span><span>{tr("Reorder")}</span></div>{!list.length && <Empty>{tr("No products yet")}</Empty>}{list.map(p => <div key={p.id} className="inventory-stock-row"><span className="flex min-w-0 items-center gap-2"><StockDot p={p} /><span className="truncate">{p.name}</span></span><b className={cn(erp.stockStatus(p) === "OK" ? "text-primary" : erp.stockStatus(p) === "LOW" ? "text-warning" : "text-destructive")}>{p.qty}</b><span>{p.minStock ?? 5}</span></div>)}</div></div>;
}

const REASONS = { "Stock In": ["Purchase", "Manual entry", "Received Transfer"], "Stock Out": ["Adjustment", "Damaged", "Own use", "Other"], Adjustments: ["Physical stock count", "Damaged", "Lost", "Other"] };


function StockForm({ s, tr, mode }: Ctx & { mode: "Stock In" | "Stock Out" | "Adjustments" }) {
  const [pid,setPid] = useState(""); const [qty,setQty] = useState(""); const [reason,setReason] = useState<string>(REASONS[mode][0] ?? "");
  const [reference,setReference] = useState(""); const [notes,setNotes] = useState("");
  useEffect(() => { setReason(REASONS[mode][0] ?? ""); setQty(""); setReference(""); setNotes(""); },[mode]);
  const p = s.products.find(p => p.id === pid); const adj = mode === "Adjustments";
  const submit = () => { if(!pid) { toast.error(tr("Select a product")); return; } const detail = [reason,reference,notes].filter(Boolean).join(" • "); if(run(() => mode === "Stock In" ? erp.stockIn(pid,Number(qty),detail) : mode === "Stock Out" ? erp.stockOut(pid,Number(qty),detail) : erp.adjustStock(pid,Number(qty),detail),tr("Recorded"))) { setQty(""); setReference(""); setNotes(""); } };
  return <><h2 className="inventory-form-title">{tr(adj ? "Stock Adjustment" : mode === "Stock In" ? "New Stock In" : "New Stock Out")}</h2><form className="inventory-form" onSubmit={e => {e.preventDefault();submit();}}>
    {!adj && <InventoryField label={tr("Source")} required><select aria-label={tr("Source")} className={inventoryInput} value={reason} onChange={e => setReason(e.target.value)}>{REASONS[mode].map(r => <option key={r}>{tr(r)}</option>)}</select></InventoryField>}
    <InventoryField label={tr("Product")} required><InventoryProductPicker s={s} value={pid} onChange={setPid} tr={tr} /></InventoryField>
    {adj ? <><div className="grid grid-cols-2 gap-2"><InventoryField label={tr("Current stock")}><input readOnly className={inventoryInput} value={p?.qty ?? ""} /></InventoryField><InventoryField label={tr("Physical count")} required><input aria-label={tr("Physical count")} required type="number" min="0" step="any" className={inventoryInput} value={qty} onChange={e => setQty(e.target.value)} /></InventoryField></div><InventoryField label={tr("Adjustment")}><input className={cn(inventoryInput,p && Number(qty)<p.qty ? "text-destructive" : "text-primary")} readOnly value={p && qty !== "" ? `${Number(qty)-p.qty>0 ? "+" : ""}${Number(qty)-p.qty}` : ""} /></InventoryField><InventoryField label={tr("Reason")} required><select aria-label={tr("Reason")} className={inventoryInput} value={reason} onChange={e => setReason(e.target.value)}>{REASONS.Adjustments.map(r => <option key={r} value={r}>{tr(r)}</option>)}</select></InventoryField></> : <><InventoryField label={tr("Quantity")} required><input aria-label={tr("Quantity")} type="number" min="0.001" step="any" required className={inventoryInput} value={qty} onChange={e => setQty(e.target.value)} placeholder="0" /></InventoryField><InventoryField label={tr("Reference (Optional)")}><input aria-label={tr("Reference (Optional)")} className={inventoryInput} value={reference} onChange={e => setReference(e.target.value)} /></InventoryField></>}
    <InventoryField label={tr("Notes (Optional)")}><input aria-label={tr("Notes (Optional)")} className={inventoryInput} value={notes} onChange={e => setNotes(e.target.value)} placeholder={tr("Enter notes...")} /></InventoryField>
    <ShopButton type="submit" className="inventory-save">{tr(adj ? "Save Adjustment" : mode === "Stock In" ? "Save Stock In" : "Save Stock Out")}</ShopButton>
  </form></>;
}

function History({ s, tr }: Ctx) {
  return <div>{s.movements.length ? s.movements.slice(0, 200).map((m) => <MoveRow key={m.id} m={m} s={s} tr={tr} />) : <Empty>{tr("No movements yet")}</Empty>}</div>;
}

function Transfers({ s, tr, view, shop }: Ctx & { view: string }) {
  const [pid, setPid] = useState(""); const [qty, setQty] = useState(""); const [to, setTo] = useState("");
  const name = (id: string) => s.products.find((p) => p.id === id)?.name ?? "—";
  if (view === "New Transfer") return <><h2 className="inventory-form-title">{tr("New Transfer")}</h2><form className="inventory-form" onSubmit={e => { e.preventDefault(); if(!pid) {toast.error(tr("Select a product"));return;} if(run(() => erp.createTransfer(pid,Number(qty),to,shop),tr("Transfer created"))) {setQty("");setTo("");} }}>
    <div className="grid grid-cols-2 gap-2"><InventoryField label={tr("From Location")} required><select className={inventoryInput} value={shop}><option>{shop}</option></select></InventoryField><InventoryField label={tr("To Location")} required><input aria-label={tr("To Location")} className={inventoryInput} required value={to} onChange={e => setTo(e.target.value)} placeholder={tr("To shop / branch")} /></InventoryField></div>
    <InventoryField label={tr("Product")} required><InventoryProductPicker s={s} value={pid} onChange={setPid} tr={tr} /></InventoryField><InventoryField label={tr("Quantity")} required><input aria-label={tr("Quantity")} className={inventoryInput} type="number" min="1" required value={qty} onChange={e => setQty(e.target.value)} placeholder="0" /></InventoryField><ShopButton className="inventory-save" type="submit">{tr("Create Transfer")}</ShopButton>
  </form></>;
  const list = s.transfers.filter((t) => view === "Pending" ? t.status === "PENDING" || t.status === "SENT" : view === "Received" ? t.status === "RECEIVED" : true);
  return (
    <div>
      {list.length === 0 && <Empty>{tr("No transfers")}</Empty>}
      {list.map((t) => (
        <div key={t.id} className="border-b border-border py-2.5">
          <div className="flex items-center justify-between text-sm"><span className="font-semibold">{t.ref} • {name(t.productId)}</span><span className="text-[10px] font-bold text-muted-foreground">{tr(t.status)}</span></div>
          <p className="text-[11px] text-muted-foreground">{dt(t.at)} • {t.qty} • {t.from} → {t.to}</p>
          {(t.status === "PENDING" || t.status === "SENT") && (
            <div className="mt-2 flex gap-2">
              {t.status === "PENDING" && <ShopButton className="h-9 text-sm" onClick={() => run(() => erp.sendTransfer(t.id), tr("Sent"))}>{tr("Send")}</ShopButton>}
              {t.status === "SENT" && <ShopButton className="h-9 text-sm" onClick={() => run(() => erp.receiveTransfer(t.id), tr("Received"))}>{tr("Mark received")}</ShopButton>}
              <ShopButton variant="outline" className="h-9 text-sm" onClick={() => run(() => erp.cancelTransfer(t.id), tr("Cancelled"))}>{tr("Cancel")}</ShopButton>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Reports({ s, money, tr, view }: Ctx & { view: string }) {
  if (view === "AI Reorder") return <Reorder s={s} money={money} />;
  if (view === "Valuation") {
    const cost = s.products.reduce((a, p) => a + p.qty * p.buy, 0);
    const sell = s.products.reduce((a, p) => a + p.qty * p.sell, 0);
    return (
      <div>
        <KpiRow><Kpi label={tr("Cost value")} value={money(cost)} /><Kpi label={tr("Selling value")} value={money(sell)} /></KpiRow>
        <p className="mt-2 text-xs text-muted-foreground">{tr("Potential profit")}: <b className="text-foreground">{money(sell - cost)}</b></p>
        {s.products.map((p) => <div key={p.id} className="flex justify-between border-b border-border py-1.5 text-xs"><span className="truncate">{p.name} <span className="text-xs text-muted-foreground">× {p.qty}</span></span><span>{money(p.qty * p.buy)}</span></div>)}
      </div>
    );
  }
  if (view === "Movement") {
    const by = new Map<string, { in: number; out: number }>();
    s.movements.forEach((m) => { const x = by.get(m.type) ?? { in: 0, out: 0 }; if (m.qty > 0) x.in += m.qty; else x.out -= m.qty; by.set(m.type, x); });
    return <div>{by.size === 0 && <Empty>{tr("No movements yet")}</Empty>}{[...by].map(([k, v]) => <div key={k} className="flex justify-between border-b border-border py-1.5 text-xs"><span>{tr(k)}</span><span><span className="text-primary">+{v.in}</span> / <span className="text-destructive">-{v.out}</span></span></div>)}</div>;
  }
  if (view === "Performance") {
    const out = new Map<string, number>();
    s.movements.filter((m) => m.type === "SALE" || m.type === "STOCK OUT").forEach((m) => out.set(m.productId, (out.get(m.productId) ?? 0) - m.qty));
    const ranked = s.products.map((p) => ({ p, n: out.get(p.id) ?? 0 })).sort((a, b) => b.n - a.n);
    return <div>{ranked.length === 0 && <Empty>{tr("No products yet")}</Empty>}{ranked.map(({ p, n }) => <div key={p.id} className="flex justify-between border-b border-border py-1.5 text-xs"><span className="truncate">{p.name}</span><span className="font-semibold">{n} {tr("out")}</span></div>)}</div>;
  }
  return <StockLevels s={s} money={money} tr={tr} go={() => {}} cur="" shop="" />;
}
