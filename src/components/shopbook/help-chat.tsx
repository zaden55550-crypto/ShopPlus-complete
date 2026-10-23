import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import { Headset, Send, UserRound, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { ShopButton } from "@/components/ui/shop-button";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";

type Msg = { id: string; sender: "user" | "ai" | "support"; body: string };

export function HelpChat({ open, onClose, shopName, email, icon }: { open: boolean; onClose: () => void; shopName: string; email?: string; icon: string }) {
  const nav = useNavigate();
  const { tr, dir, language } = useLanguage();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [thread, setThread] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [streaming, setStreaming] = useState("");
  const [error, setError] = useState("");
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => data.subscription.unsubscribe();
  }, []);

  const load = async (id: string) => {
    const { data } = await supabase.from("support_messages").select("id,sender,body").eq("thread_id", id).order("created_at");
    setMsgs((data ?? []) as Msg[]);
  };

  useEffect(() => {
    if (!open || !signedIn) return;
    let channel: ReturnType<typeof supabase.channel> | undefined;
    (async () => {
      const { data: u } = await supabase.auth.getUser(); if (!u.user) return;
      let { data: t } = await supabase.from("support_threads").select("id").eq("user_id", u.user.id).eq("status", "open").order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (!t) {
        const r = await supabase.from("support_threads").insert({ user_id: u.user.id, shop_name: shopName, contact_email: email ?? u.user.email ?? "" }).select("id").single();
        if (r.error) { setError(r.error.message); return; }
        t = r.data;
      }
      setThread(t.id); await load(t.id);
      channel = supabase.channel(`help-${t.id}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: `thread_id=eq.${t.id}` }, () => load(t!.id)).subscribe();
    })();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [open, signedIn, shopName, email]);

  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [msgs, streaming]);

  const send = async () => {
    const text = draft.trim(); if (!text || !thread || busy) return;
    setBusy(true); setError(""); setDraft("");
    const ins = await supabase.from("support_messages").insert({ thread_id: thread, sender: "user", body: text.slice(0, 4000) });
    if (ins.error) { setError(ins.error.message); setBusy(false); return; }
    await load(thread);
    try {
      const { data } = await supabase.auth.getSession();
      const r = await fetch("/api/help-chat", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token}` }, body: JSON.stringify({ threadId: thread, language }) });
      if (!r.ok || !r.body) { const b = await r.json().catch(() => ({})); setError(b.error ?? tr("AI request failed")); }
      else { const rd = r.body.getReader(); const dec = new TextDecoder(); let acc = ""; for (;;) { const { done, value } = await rd.read(); if (done) break; acc += dec.decode(value, { stream: true }); setStreaming(acc); } }
    } catch { setError(tr("AI request failed")); }
    setStreaming(""); await load(thread); setBusy(false);
  };

  const askPerson = async () => {
    if (!thread) return;
    await supabase.from("support_threads").update({ needs_human: true, updated_at: new Date().toISOString() }).eq("id", thread);
    await supabase.from("support_messages").insert({ thread_id: thread, sender: "user", body: tr("I would like to talk to a person from support.") });
    load(thread);
  };

  if (!open) return null;
  const bubble = (m: Pick<Msg, "sender" | "body">, k: string) => (
    <div key={k} className={cn("flex", m.sender === "user" ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[85%] text-sm", m.sender === "user" ? "rounded-2xl rounded-ee-sm bg-primary px-3 py-2 text-primary-foreground" : "")}>
        {m.sender === "support" && <div className="mb-0.5 flex items-center gap-1 text-xs font-bold text-primary"><Headset className="h-3 w-3" />{tr("SHOPBOOK support")}</div>}
        {m.sender === "user" ? m.body : (
          <div className="space-y-2 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:ps-4 [&_ol]:list-decimal [&_ol]:ps-4">
            <ReactMarkdown components={{ a: ({ href, children }) => href?.startsWith("/")
              ? <a href={href} onClick={(e) => { e.preventDefault(); onClose(); nav({ to: href }); }}>{children}</a>
              : <a href={href} target="_blank" rel="noreferrer">{children}</a> }}>{m.body}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" onClick={onClose}>
      <div dir={dir} className="mx-auto flex h-full max-w-[440px] md:max-w-[640px] flex-col border-x border-border bg-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-border p-4">
          <img src={icon} alt="" className="h-9 w-9 rounded-full" />
          <div className="min-w-0 flex-1"><div className="font-bold">{tr("SHOPBOOK assistant")}</div><div className="text-xs text-muted-foreground">{tr("Instant answers · support team reads every chat")}</div></div>
          <ShopButton variant="bare" className="h-auto w-auto p-0" aria-label={tr("Close")} onClick={onClose}><X className="h-5 w-5" /></ShopButton>
        </div>
        {signedIn === false ? (
          <div className="m-auto max-w-xs space-y-3 p-6 text-center text-sm">
            <p className="text-muted-foreground">{tr("Sign in with Google so your messages reach our support team and you can see their replies.")}</p>
            <ShopButton onClick={async () => { const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.href }); if (r.error) setError(r.error.message); }}>{tr("Sign in with Google")}</ShopButton>
            {error && <p className="text-destructive">{error}</p>}
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {bubble({ sender: "ai", body: tr("Hi! Ask me anything about SHOPBOOK — how to record a sale, where to find stock, how to back up. I'll point you to the right place.") }, "hello")}
              {msgs.map((m) => bubble(m, m.id))}
              {streaming && bubble({ sender: "ai", body: streaming }, "stream")}
              {busy && !streaming && <div className="text-xs text-muted-foreground">{tr("Thinking…")}</div>}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div ref={end} />
            </div>
            <div className="border-t border-border p-3">
              <ShopButton variant="bare" onClick={askPerson} disabled={!thread} className="mb-2 h-auto w-auto gap-1 px-0 text-xs font-medium text-primary"><UserRound className="h-3.5 w-3.5" />{tr("Talk to a person")}</ShopButton>
              <form className="flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
                <textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  rows={1} maxLength={4000} placeholder={tr("Type your question…")} aria-label={tr("Type your question…")}
                  className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
                <ShopButton type="submit" aria-label={tr("Send")} disabled={busy || !draft.trim() || !thread} className="h-11 w-11 shrink-0 p-0"><Send className="h-4 w-4" /></ShopButton>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
