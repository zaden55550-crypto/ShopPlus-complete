import { useState } from "react";
import { ShopButton } from "@/components/ui/shop-button";
import { inputCls } from "@/components/shopbook/product-search";
import { Empty, Title, run, type Tr } from "@/components/shopbook/selling";
import * as erp from "@/lib/erp";
import * as fin from "@/lib/finance";

type P = { s: erp.ErpState; money: (n: number) => string; tr: Tr };
export function SupplierList({ s, money, tr }: P) {
  const [f, setF] = useState({ name: "", phone: "" });
  const [payFor, setPayFor] = useState<string | null>(null);
  const [m, setM] = useState<erp.Method>("cash");
  const [amt, setAmt] = useState("");
  return (<>
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2">
      <input className={inputCls} placeholder={tr("Supplier name")} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <input className={inputCls} placeholder={tr("Phone")} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
      <ShopButton className="h-11 px-3 text-sm" onClick={() => run(() => fin.addSupplier(f.name, f.phone), tr("Supplier added")) && setF({ name: "", phone: "" })}>{tr("Add")}</ShopButton>
    </div>
    <Title>{tr("Suppliers")}</Title>
    {s.suppliers.length === 0 ? <Empty>{tr("No suppliers yet")}</Empty> : s.suppliers.map((x) => (
      <div key={x.id} className="border-b border-border py-2.5 text-sm">
        <div className="flex justify-between"><span><b>{x.name}</b>{x.phone && <span className="block text-[11px] text-muted-foreground">{x.phone}</span>}</span><span className={x.balance > 0 ? "text-warning" : ""}>{money(x.balance)}</span></div>
        {x.balance > 0.001 && (payFor === x.id ? <div className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2">
          <select className={inputCls} value={m} onChange={(e) => setM(e.target.value as erp.Method)}>{fin.ACCOUNTS.map((k) => <option key={k} value={k}>{tr(erp.METHOD_LABEL[k])}</option>)}</select>
          <input className={inputCls} inputMode="decimal" placeholder={tr("Amount")} value={amt} onChange={(e) => setAmt(e.target.value)} />
          <ShopButton className="h-11 px-3 text-sm" onClick={() => { if (run(() => fin.paySupplier(x.id, +amt, m), tr("Payment recorded")) !== undefined) { setPayFor(null); setAmt(""); } }}>{tr("Pay")}</ShopButton>
        </div> : <ShopButton variant="outline" className="mt-2 h-9 text-sm" onClick={() => setPayFor(x.id)}>{tr("Pay supplier")}</ShopButton>)}
      </div>
    ))}
  </>);
}
