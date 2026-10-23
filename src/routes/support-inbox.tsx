import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ChevronLeft, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { ShopButton } from "@/components/ui/shop-button";
import { cn } from "@/lib/utils";
import { AnnouncementAdmin } from "@/components/shopbook/announcement-banner";

export const Route = createFileRoute("/support-inbox")({
  head: () => ({
    meta: [
      { title: "Support inbox — SHOPBOOK ERP" },
      { name: "description", content: "SHOPBOOK support team inbox for shop owner messages." },
      { property: "og:title", content: "Support inbox — SHOPBOOK ERP" },
      { property: "og:description", content: "Read and reply to SHOPBOOK shop owner messages." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Inbox,
});

type Thread = { id: string; shop_name: string; contact_email: string; status: string; needs_human: boolean; updated_at: string };
type Msg = { id: string; sender: string; body: string; created_at: string };

function Inbox() {
  const [state, setState] = useState<"loading" | "signedOut" | "denied" | "ok">("loading");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [sel, setSel] = useState<Thread | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [reply, setReply] = useState("");
  const [email, setEmail] = useState("");

  const loadThreads = async () => {
    const { data } = await supabase.from("support_threads").select("id,shop_name,contact_email,status,needs_human,updated_at").order("needs_human", { ascending: false }).order("updated_at", { ascending: false }).limit(200);
    setThreads((data ?? []) as Thread[]);
  };
  const loadMsgs = async (id: string) => {
    const { data } = await supabase.from("support_messages").select("id,sender,body,created_at").eq("thread_id", id).order("created_at");
    setMsgs((data ?? []) as Msg[]);
  };

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { setState("signedOut"); return; }
      setEmail(u.user.email ?? "");
      const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "support").maybeSingle();
      if (!role) { setState("denied"); return; }
      setState("ok"); loadThreads();
    })();
    const ch = supabase.channel("support-inbox").on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages" }, () => loadThreads()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  useEffect(() => { if (!sel) return; loadMsgs(sel.id); const ch = supabase.channel(`inbox-${sel.id}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: `thread_id=eq.${sel.id}` }, () => loadMsgs(sel.id)).subscribe(); return () => { supabase.removeChannel(ch); }; }, [sel]);

  const send = async () => {
    if (!sel || !reply.trim()) return;
    await supabase.from("support_messages").insert({ thread_id: sel.id, sender: "support", body: reply.trim().slice(0, 4000) });
    await supabase.from("support_threads").update({ needs_human: false, updated_at: new Date().toISOString() }).eq("id", sel.id);
    setReply(""); loadMsgs(sel.id); loadThreads();
  };
  const toggle = async () => {
    if (!sel) return; const status = sel.status === "open" ? "closed" : "open";
    await supabase.from("support_threads").update({ status }).eq("id", sel.id); setSel({ ...sel, status }); loadThreads();
  };

  if (state !== "ok") return (
    <main className="app-screen grid place-items-center p-6 text-center text-sm">
      {state === "loading" ? <p className="text-muted-foreground">Loading…</p> : state === "signedOut" ? (
        <div className="space-y-3"><h1 className="text-lg font-bold">Support inbox</h1><p className="text-muted-foreground">Sign in with your support team Google account.</p>
          <ShopButton onClick={() => lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.href })}>Sign in with Google</ShopButton></div>
      ) : <div className="space-y-2"><h1 className="text-lg font-bold">No access</h1><p className="text-muted-foreground">{email} isn't on the support team.</p><Link to="/apps" className="text-primary underline">Back to apps</Link></div>}
    </main>
  );

  return (
    <main className="app-screen flex min-h-dvh flex-col p-4">
      {!sel && <AnnouncementAdmin />}
      {!sel ? (
        <>
          <div className="flex items-center gap-2"><Link to="/apps" aria-label="Back"><ChevronLeft className="h-5 w-5" /></Link><h1 className="text-lg font-bold">Support inbox</h1></div>
          <div className="mt-4 space-y-2">
            {threads.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
            {threads.map((t) => (
              <button key={t.id} onClick={() => setSel(t)} className="w-full rounded-xl border border-border bg-card p-3 text-start">
                <div className="flex items-center justify-between gap-2"><span className="truncate font-bold">{t.shop_name || "Shop"}</span>
                  {t.needs_human && t.status === "open" ? <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">Needs reply</span> : <span className="text-xs text-muted-foreground">{t.status}</span>}</div>
                <div className="truncate text-xs text-muted-foreground">{t.contact_email} · {new Date(t.updated_at).toLocaleString()}</div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2"><button onClick={() => setSel(null)} aria-label="Back"><ChevronLeft className="h-5 w-5" /></button>
            <div className="min-w-0 flex-1"><div className="truncate font-bold">{sel.shop_name}</div><div className="truncate text-xs text-muted-foreground">{sel.contact_email}</div></div>
            <ShopButton variant="bare" className="h-auto w-auto px-2 text-xs text-primary" onClick={toggle}>{sel.status === "open" ? "Close chat" : "Reopen"}</ShopButton></div>
          <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
            {msgs.map((m) => (
              <div key={m.id} className={cn("flex", m.sender === "user" ? "justify-start" : "justify-end")}>
                <div className={cn("max-w-[85%] rounded-2xl px-3 py-2 text-sm", m.sender === "user" ? "bg-muted" : m.sender === "support" ? "bg-primary text-primary-foreground" : "border border-border")}>
                  <div className="mb-0.5 text-[10px] font-bold uppercase opacity-70">{m.sender === "user" ? "Shop owner" : m.sender === "ai" ? "AI assistant" : "Support"}</div>
                  <div className="[&_a]:underline"><ReactMarkdown>{m.body}</ReactMarkdown></div>
                </div>
              </div>
            ))}
          </div>
          <form className="mt-3 flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
            <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={2} maxLength={4000} placeholder="Reply as SHOPBOOK support…" className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <ShopButton type="submit" aria-label="Send" className="h-11 w-11 shrink-0 p-0" disabled={!reply.trim()}><Send className="h-4 w-4" /></ShopButton>
          </form>
        </>
      )}
    </main>
  );
}
