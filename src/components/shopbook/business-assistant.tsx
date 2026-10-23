import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { X } from "lucide-react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputBody, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { ShopButton } from "@/components/ui/shop-button";
import { useErp } from "@/components/shopbook/product-search";
import { useLanguage } from "@/hooks/use-language";
import { buildAssistantContext } from "@/lib/business-assistant";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export function BusinessAssistant({ open, onClose, shop, currency, icon }: { open: boolean; onClose: () => void; shop: string; currency: string; icon: string }) {
  if (!open) return null;
  return <BusinessAssistantSession onClose={onClose} shop={shop} currency={currency} icon={icon} />;
}
function BusinessAssistantSession({ onClose, shop, currency, icon }: { onClose: () => void; shop: string; currency: string; icon: string }) {
  const s = useErp(), { language, tr, dir } = useLanguage(), nav = useNavigate(), path = useRouterState({ select: (x) => x.location.pathname });
  const [signedIn, setSignedIn] = useState<boolean | null>(null), [input, setInput] = useState(""), [serverError, setServerError] = useState(""); const text = useRef<HTMLTextAreaElement>(null);
  const context = useMemo(() => buildAssistantContext(s, shop, currency), [s, shop, currency]);
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/business-assistant", fetch: async (url, init) => { const { data } = await supabase.auth.getSession(); const headers = new Headers(init?.headers); if (data.session?.access_token) headers.set("Authorization", `Bearer ${data.session.access_token}`); return fetch(url, { ...init, headers }); } }), []);
  const { messages, sendMessage, status, stop, error, clearError, regenerate } = useChat({ id: "shopbook-business-session", transport, onError: (e) => setServerError(e.message) });
  useEffect(() => { supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session))); const a = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(Boolean(session))); return () => a.data.subscription.unsubscribe(); }, []);
  useEffect(() => { if (status === "ready") text.current?.focus(); }, [status]);
  const submit = async () => { const value = input.trim(); if (!value || status === "submitted" || status === "streaming") return; setInput(""); setServerError(""); clearError(); await sendMessage({ text: value }, { body: { context, language, page: path } }); };
  const renderText = (content: string) => <MessageResponse components={{ a: ({ href, children }) => href?.startsWith("/") ? <a href={href} onClick={(e) => { e.preventDefault(); onClose(); nav({ to: href }); }}>{children}</a> : <a href={href} target="_blank" rel="noreferrer">{children}</a> }}>{content}</MessageResponse>;
  return <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" onClick={onClose}><div dir={dir} className="assistant-shell" onClick={(e) => e.stopPropagation()}>
    <header><img src={icon} alt="" /><div><b>ShopBot</b><small>{shop} • {tr("One private session")}</small></div><ShopButton variant="bare" className="inventory-icon-button" aria-label={tr("Close")} onClick={onClose}><X className="h-4 w-4" /></ShopButton></header>
    {signedIn === false ? <div className="m-auto max-w-xs space-y-3 p-5 text-center text-xs"><p className="text-muted-foreground">{tr("Sign in with Google to securely analyze this shop's current records. This conversation is not saved.")}</p><ShopButton className="inventory-save" onClick={async () => { const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.href }); if (r.error) setServerError(r.error.message); }}>{tr("Sign in with Google")}</ShopButton>{serverError && <p className="text-destructive">{serverError}</p>}</div> : <>
      <Conversation className="min-h-0"><ConversationContent className="gap-3 p-3">{messages.length === 0 && <ConversationEmptyState className="p-5" icon={<img src={icon} alt="" className="h-12 w-12 rounded-full" />} title={tr("Hello! 👋 I'm ShopBot. How can I help your business today?")} description={tr("Sales, profit, stock, expenses, balances, reports or where to go in SHOPBOOK.")} />}{messages.map((m) => <Message key={m.id} from={m.role}><MessageContent className="text-[11px]">{m.parts.map((part, i) => part.type === "text" ? <span key={i}>{renderText(part.text)}</span> : null)}</MessageContent></Message>)}{status === "submitted" && <Shimmer className="text-[10px]">{tr("AI is analyzing your shop data...")}</Shimmer>}{(error || serverError) && <div className="text-[10px] text-destructive">{serverError || error?.message} <button type="button" className="font-bold underline" onClick={() => { setServerError(""); clearError(); void regenerate({ body: { context, language, page: path } }); }}>{tr("Retry")}</button></div>}</ConversationContent><ConversationScrollButton /></Conversation>
      <div className="assistant-composer"><PromptInput onSubmit={() => void submit()}><PromptInputBody><PromptInputTextarea ref={text} value={input} onChange={(e) => setInput(e.target.value)} maxLength={4000} placeholder={tr("Ask anything about your business...")} /></PromptInputBody><PromptInputFooter><span className="text-[8px] text-muted-foreground">{navigator.onLine ? tr("Live shop data") : tr("Offline")}</span><PromptInputSubmit status={status} onStop={stop} disabled={!input.trim() && status === "ready"} /></PromptInputFooter></PromptInput></div>
    </>}
  </div></div>;
}