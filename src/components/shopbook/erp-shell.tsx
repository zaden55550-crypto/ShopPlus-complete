// Shared compact navy shell for Purchases and Sales: header, one-row menus, boxes, slim badges, one-line rows.
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, Menu as MenuIcon, Search as SearchIcon } from "lucide-react";
import { ShopButton } from "@/components/ui/shop-button";
import { useLanguage } from "@/hooks/use-language";
import { lastBackup } from "@/lib/backup";
import { BackupStatus } from "@/components/shopbook/backup-status";
import { cn } from "@/lib/utils";

export type Tr = (t: string) => string;

export function ErpShell({ title, shop, menus, menu, sub, onMenu, onSub, children, deps }: {
  title: string; shop: string; menus: Record<string, readonly string[]>; menu: string; sub: string;
  onMenu: (m: string) => void; onSub: (s: string) => void; children: ReactNode; deps?: unknown;
}) {
  const nav = useNavigate();
  const { tr, dir } = useLanguage();
  const [open, setOpen] = useState(false);
  const [lb, setLb] = useState(0);
  const [online, setOnline] = useState(true);
  useEffect(() => { setLb(lastBackup()); }, [deps]);
  useEffect(() => { const f = () => setOnline(navigator.onLine); f(); window.addEventListener("online", f); window.addEventListener("offline", f); return () => { window.removeEventListener("online", f); window.removeEventListener("offline", f); }; }, []);
  const subs = menus[menu] ?? [];
  return (
    <main dir={dir} className="inventory-screen flex w-full flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="inventory-header">
          <div className="flex shrink-0 items-center gap-1"><ShopButton variant="bare" className="h-auto w-auto p-0" aria-label={tr("Back")} onClick={() => nav({ to: "/apps" })}><ChevronLeft className="h-4 w-4 rtl:rotate-180" /></ShopButton><h1>{tr(title).toUpperCase()}</h1></div>
          <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold">{shop}</p>
          <div className="relative shrink-0">
            <ShopButton variant="bare" className="h-auto w-auto p-1" aria-label={tr("Menu")} onClick={() => setOpen(!open)}><MenuIcon className="h-5 w-5" /></ShopButton>
            {open && <div className="absolute end-0 top-9 z-30 w-48 rounded-xl border border-border bg-popover p-1 shadow-lg">
              {Object.keys(menus).map((m) => <ShopButton variant="bare" key={m} onClick={() => { onMenu(m); setOpen(false); }} className={cn("block w-full rounded-lg px-3 py-2 text-start text-xs font-medium hover:bg-muted", menu === m && "text-primary")}>{tr(m)}</ShopButton>)}
              <ShopButton variant="bare" onClick={() => nav({ to: "/apps" })} className="block w-full rounded-lg px-3 py-2 text-start text-xs font-medium text-muted-foreground hover:bg-muted">{tr("Apps")}</ShopButton>
            </div>}
          </div>
        </div>
        <BackupStatus />
        <Tabs items={Object.keys(menus)} value={menu} onChange={onMenu} tr={tr} />
        {subs.length > 0 && <Tabs small items={[...subs]} value={sub} onChange={onSub} tr={tr} />}
      </header>
      <section className="inventory-content flex-1">{children}</section>
    </main>
  );
}

export function Tabs({ items, value, onChange, tr, small }: { items: string[]; value: string; onChange: (v: string) => void; tr: Tr; small?: boolean }) {
  return <div role="tablist" className={cn("inventory-tabs", small && "inventory-tabs-sub")}>{items.map((k) => <ShopButton variant="bare" role="tab" aria-selected={value === k} key={k} onClick={() => onChange(k)} className="inventory-tab">{tr(k)}</ShopButton>)}</div>;
}
export const Empty = ({ children }: { children: ReactNode }) => <p className="py-6 text-center text-[11px] text-muted-foreground">{children}</p>;
export function Box({ title, action, children }: { title: ReactNode; action?: (() => void) | undefined; children: ReactNode }) {
  const { tr } = useLanguage();
  return <div className="inventory-box"><div className="inventory-box-heading"><h2>{title}</h2>{action && <ShopButton variant="bare" className="inventory-view-all" onClick={action}>{tr("View All")} ›</ShopButton>}</div>{children}</div>;
}
export type Tone = "ok" | "warn" | "bad" | "info";
export const toneOf = (s: string): Tone => (s === "Paid" || s === "Completed" ? "ok" : s === "P.PAY" || s === "Pending" || s === "Draft" || s === "Due" ? "warn" : s === "Credit" ? "info" : "bad");
export function Badge({ s }: { s: string }) {
  const { tr } = useLanguage();
  return <span className={cn("pur-badge", `pur-badge-${toneOf(s)}`)}>{s === "P.PAY" ? "P.PAY" : tr(s)}</span>;
}
export const Dot = ({ tone }: { tone: Tone }) => <span className={cn("inventory-dot", tone === "warn" && "inventory-dot-low", tone === "bad" && "inventory-dot-out", tone === "info" && "inventory-dot-info")} />;
/** One record = one line; extra columns scroll sideways instead of wrapping. */
export const Row = ({ children, onClick }: { children: ReactNode; onClick?: (() => void) | undefined }) => <div className={cn("pur-row", onClick && "cursor-pointer")} onClick={onClick}>{children}</div>;
export function Search({ q, setQ, tr, ph }: { q: string; setQ: (v: string) => void; tr: Tr; ph: string }) {
  return <div className="inventory-search mb-1.5"><SearchIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr(ph)} aria-label={tr(ph)} /></div>;
}
export const BigButton = ({ children, onClick }: { children: ReactNode; onClick: () => void }) => <ShopButton className="inventory-save mb-2 w-full text-[13px] font-bold" onClick={onClick}>{children}</ShopButton>;
/** Total / Paid / Balance trio used on purchase and sale details. */
export function MoneyTrio({ total, paid, balance, money, tr }: { total: number; paid: number; balance: number; money: (n: number) => string; tr: Tr }) {
  return <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">{([["Total", total, ""], ["Paid", paid, ""], ["Balance", balance, balance > 0 ? "text-destructive" : ""]] as const).map(([k, v, c]) => <div key={k} className="inventory-box mt-0"><p className={cn("text-[10px] text-primary", c)}>{tr(k)}</p><p className={cn("text-[13px] font-bold tabular-nums", balance > 0 && k === "Balance" && "text-warning")}>{money(v)}</p></div>)}</div>;
}
