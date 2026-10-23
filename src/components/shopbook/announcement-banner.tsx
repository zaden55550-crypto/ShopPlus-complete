import { useEffect, useState } from "react";
import { AlertTriangle, Info, Wrench, X } from "lucide-react";
import { ShopButton } from "@/components/ui/shop-button";
import { useLanguage } from "@/hooks/use-language";
import { cachedAnnouncements, dismiss, dismissedIds, refreshAnnouncements, visibleAnnouncements, type Announcement } from "@/lib/announcements";
import { cn } from "@/lib/utils";

export function AnnouncementBanner() {
  const { tr } = useLanguage();
  const [list, setList] = useState<Announcement[]>([]);
  const [stale, setStale] = useState(false);
  const [gone, setGone] = useState<string[]>([]);
  useEffect(() => {
    setList(cachedAnnouncements().list); setGone(dismissedIds());
    let alive = true;
    const go = () => void refreshAnnouncements().then((r) => { if (alive) { setList(r.list); setStale(!r.fresh); } });
    go(); const t = setInterval(go, 120000);
    return () => { alive = false; clearInterval(t); };
  }, []);
  const shown = visibleAnnouncements(list, Date.now(), gone);
  if (!shown.length) return null;
  return <div className="mt-3 space-y-2">{shown.map((a) => {
    const Icon = a.kind === "maintenance" ? Wrench : a.kind === "info" ? Info : AlertTriangle;
    return <div key={a.id} role="status" className={cn("flex items-start gap-2 rounded-xl border p-2.5 text-xs", a.kind === "outage" ? "border-destructive/50 bg-destructive/10" : a.kind === "info" ? "border-primary/40 bg-primary/10" : "border-warning/50 bg-warning/10")}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1"><p>{a.message}</p>{stale && <p className="mt-1 text-[10px] text-muted-foreground">{tr("Saved message — may be out of date while offline")}</p>}</div>
      {a.dismissible && <ShopButton variant="bare" aria-label={tr("Dismiss")} className="h-auto w-auto p-0" onClick={() => { dismiss(a.id); setGone(dismissedIds()); }}><X className="h-4 w-4" /></ShopButton>}
    </div>;
  })}</div>;
}

/** Support-team form to publish or end announcements. Server policies enforce who may write. */
export function AnnouncementAdmin() {
  const [msg, setMsg] = useState(""); const [kind, setKind] = useState<Announcement["kind"]>("info");
  const [ends, setEnds] = useState(""); const [dismissible, setDismissible] = useState(true);
  const [list, setList] = useState<Announcement[]>([]); const [note, setNote] = useState("");
  const load = () => void refreshAnnouncements().then((r) => setList(r.list));
  useEffect(load, []);
  const publish = async () => {
    if (!msg.trim()) return;
    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await supabase.from("system_announcements").insert({ message: msg.trim().slice(0, 1000), kind, dismissible, ends_at: ends ? new Date(ends).toISOString() : null });
    setNote(error ? "Could not publish — check your access." : "Published."); if (!error) { setMsg(""); load(); }
  };
  const end = async (id: string) => { const { supabase } = await import("@/integrations/supabase/client"); await supabase.from("system_announcements").update({ active: false, updated_at: new Date().toISOString() }).eq("id", id); load(); };
  return <section className="mb-4 rounded-xl border border-border p-3 text-xs">
    <h2 className="mb-2 text-sm font-bold">System status message</h2>
    <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} className="w-full rounded-lg border border-border bg-background p-2" placeholder="SHOPBOOK is experiencing a temporary synchronization issue…" />
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <select value={kind} onChange={(e) => setKind(e.target.value as Announcement["kind"])} className="rounded-lg border border-border bg-background p-1.5"><option value="info">Information</option><option value="degraded">Degraded service</option><option value="outage">Outage</option><option value="maintenance">Maintenance</option></select>
      <label className="flex items-center gap-1">Ends <input type="datetime-local" value={ends} onChange={(e) => setEnds(e.target.value)} className="rounded-lg border border-border bg-background p-1" /></label>
      <label className="flex items-center gap-1"><input type="checkbox" checked={dismissible} onChange={(e) => setDismissible(e.target.checked)} /> Dismissible</label>
      <ShopButton className="h-8 text-xs" onClick={publish}>Publish</ShopButton>{note && <span className="text-muted-foreground">{note}</span>}
    </div>
    {list.map((a) => <div key={a.id} className="mt-2 flex items-center gap-2 border-t border-border pt-2"><span className="flex-1 truncate">[{a.kind}] {a.message}</span><ShopButton variant="outline" className="h-7 text-xs" onClick={() => end(a.id)}>End</ShopButton></div>)}
  </section>;
}
