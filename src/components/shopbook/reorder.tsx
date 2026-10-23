import { useEffect, useRef, useState } from "react";
import { Download, Plus, Trash2, PackageCheck } from "lucide-react";
import { ShopButton } from "@/components/ui/shop-button";
import { inputCls } from "@/components/shopbook/product-search";
import { useLanguage } from "@/hooks/use-language";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { reorderInput, type ReorderInput, type ReorderOutput } from "@/lib/reorder";
import type { ErpState } from "@/lib/erp";

type Line = ReorderInput["products"][number];
export function Reorder({ s, money }: { s: ErpState; money: (n: number) => string }) {
  const { tr, language } = useLanguage();
  const [rows, setRows] = useState<Line[]>([]); const [period, setPeriod] = useState(30); const [lead, setLead] = useState(7); const [cover, setCover] = useState(14); const [safety, setSafety] = useState(3);
  const [output, setOutput] = useState<ReorderOutput | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [signedIn, setSignedIn] = useState(false);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => { supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session)); const { data } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(!!session)); return () => { data.subscription.unsubscribe(); abort.current?.abort(); }; }, []);
  const fromShop = () => { const since = Date.now() - period * 864e5; setRows(s.products.slice(0, 100).map(p => ({ id: p.id, name: p.name, stock: p.qty, incoming: 0, cost: p.buy, sold: Math.max(0, s.sales.filter(x => x.at >= since).reduce((sum, sale) => sum + sale.items.filter(i => i.productId === p.id).reduce((n, i) => n + i.qty, 0), 0) - s.returns.filter(r => r.at >= since).reduce((sum, r) => sum + r.items.filter(i => i.productId === p.id).reduce((n, i) => n + i.qty, 0), 0)) }))); setOutput(null); };
  const update = (id: string, key: keyof Line, value: string | number) => { setRows(old => old.map(r => r.id === id ? { ...r, [key]: value } : r)); setOutput(null); };
  const submit = async () => {
    setError(""); setOutput(null);
    const parsed = reorderInput.safeParse({ language, period, lead, cover, safety, products: rows });
    if (!parsed.success) { setError(tr(rows.length ? "Enter valid non-negative quantities" : "Enter at least one product")); return; }
    const { data } = await supabase.auth.getSession(); if (!data.session) { setSignedIn(false); return; }
    const controller = new AbortController(); abort.current = controller; setBusy(true);
    try {
      const response = await fetch("/api/reorder", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}` }, body: JSON.stringify(parsed.data), signal: controller.signal });
      if (!response.ok) { const body = await response.json(); throw new Error(body.error || tr("AI request failed")); }
      const reader = response.body?.getReader(); if (!reader) throw new Error(tr("AI request failed"));
      const decoder = new TextDecoder(); let buffer = "";
      while (true) { const chunk = await reader.read(); buffer += decoder.decode(chunk.value, { stream: !chunk.done }); const lines = buffer.split("\n"); buffer = lines.pop() ?? ""; for (const line of lines) { if (!line) continue; const event = JSON.parse(line); if (event.error) throw new Error(event.error); if (event.output) setOutput(event.output); } if (chunk.done) break; }
    } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : tr("AI request failed")); }
    finally { setBusy(false); abort.current = null; }
  };
  const download = () => { if (!output) return; const esc = (v: unknown) => `"${String(v).replaceAll('"', '""')}"`; const csv = [[tr("Product"), tr("Suggested quantity"), tr("Reason")], ...output.recommendations.map(r => [rows.find(p => p.id === r.id)?.name, r.quantity, r.reason])].map(line => line.map(esc).join(",")).join("\n"); const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" })); const a = document.createElement("a"); a.href = url; a.download = "shopbook-reorder.csv"; a.click(); URL.revokeObjectURL(url); };
  return <div className="space-y-4">
    <h2 className="flex items-center gap-2 text-base font-bold"><PackageCheck className="h-5 w-5 text-primary" />{tr("AI Reorder")}</h2>
    <div className="grid grid-cols-2 gap-3">{[["Sales period (days)", period, setPeriod], ["Supplier lead time (days)", lead, setLead], ["Stock cover (days)", cover, setCover], ["Safety stock (days)", safety, setSafety]].map(([label, value, setter]) => <label key={String(label)} className="text-xs text-muted-foreground">{tr(String(label))}<input className={inputCls} type="number" min="0" max="3650" value={Number(value)} onChange={e => { (setter as (n: number) => void)(+e.target.value); setOutput(null); }} disabled={busy} /></label>)}</div>
    <ShopButton variant="outline" className="h-10 text-sm" onClick={fromShop} disabled={busy}>{tr("Use shop data")}</ShopButton>
    {rows.map(r => <div key={r.id} className="space-y-2 border-b border-border pb-3"><div className="flex gap-2"><input aria-label={tr("Product name")} placeholder={tr("Product name")} value={r.name} onChange={e => update(r.id, "name", e.target.value)} className={inputCls} disabled={busy} /><ShopButton variant="bare" className="h-11 w-10 shrink-0" aria-label={tr("Remove")} onClick={() => { setRows(old => old.filter(p => p.id !== r.id)); setOutput(null); }} disabled={busy}><Trash2 className="h-4 w-4" /></ShopButton></div><div className="grid grid-cols-2 gap-2">{([['stock','Stock on hand'],['sold','Units sold'],['incoming','Incoming stock'],['cost','Buying price']] as const).map(([key,label]) => <label key={key} className="text-[11px] text-muted-foreground">{tr(label)}<input type="number" min="0" value={r[key]} onChange={e => update(r.id,key,+e.target.value)} className={inputCls} disabled={busy} /></label>)}</div></div>)}
    <ShopButton variant="bare" className="h-9 text-sm" disabled={busy || rows.length >= 100} onClick={() => setRows(old => [...old, { id: crypto.randomUUID(), name: "", stock: 0, sold: 0, incoming: 0, cost: 0 }])}><Plus className="h-4 w-4" />{tr("Add row")}</ShopButton>
    <p className="text-xs text-muted-foreground">{tr("Sales and stock data will be sent to Lovable AI when you request recommendations.")}</p>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {signedIn ? <ShopButton disabled={busy} onClick={submit}>{tr(busy ? "Analyzing stock…" : "Recommend reorder")}</ShopButton> : <ShopButton onClick={async () => { const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.href }); if (result.error) setError(result.error.message); }}>{tr("Sign in with Google for AI")}</ShopButton>}
    {busy && <ShopButton variant="outline" onClick={() => abort.current?.abort()}>{tr("Stop")}</ShopButton>}
    {output && <div className="space-y-3"><p className="text-sm">{output.summary}</p>{output.recommendations.map(r => { const p = rows.find(p => p.id === r.id); return <article key={r.id} className="border-b border-border py-3"><div className="flex justify-between gap-3"><b className="text-sm">{p?.name}</b><span className="shrink-0 text-sm font-bold text-primary">{tr("Reorder")}: {r.quantity}</span></div><p className="mt-1 text-xs text-muted-foreground">{r.reason}</p><p className="mt-2 text-xs">{tr("Estimated cost")}: {money(r.quantity * (p?.cost ?? 0))}</p></article>; })}<ShopButton variant="outline" onClick={download}><Download className="h-4 w-4" />{tr("Download CSV")}</ShopButton></div>}
    <p className="text-xs text-muted-foreground">{tr("Review recommendations before ordering. No stock or purchases are changed.")}</p>
  </div>;
}