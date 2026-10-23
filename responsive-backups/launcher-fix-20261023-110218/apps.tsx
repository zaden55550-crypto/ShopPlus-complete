import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Check, ChevronDown, ChevronLeft, Mail, MessageCircle, Phone, Clock, Coins, Crown, Globe, HelpCircle, Lock, LogOut, Menu, Store, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle, useTheme } from "@/components/shopbook/ui";
import { ShopButton } from "@/components/ui/shop-button";
import { APPS, canOpen, chatIcons, store, trialDaysLeft, type Account } from "@/lib/shopbook";
import { cn } from "@/lib/utils";
import { HelpChat } from "@/components/shopbook/help-chat";
import { BusinessAssistant } from "@/components/shopbook/business-assistant";
import { ConnectionStatus } from "@/components/shopbook/connection-status";
import { AnnouncementBanner } from "@/components/shopbook/announcement-banner";
import { useLanguage } from "@/hooks/use-language";
import { getT, LANGS, NATIVE, SUPPORT, type TKey } from "@/lib/i18n";

export const Route = createFileRoute("/apps")({
  head: () => ({
    meta: [
      { title: "Apps — SHOPBOOK ERP" },
      { name: "description", content: "All your SHOPBOOK apps: POS, inventory, sales, accounting, payroll and more." },
      { property: "og:title", content: "Apps — SHOPBOOK ERP" },
      { property: "og:description", content: "All your SHOPBOOK business apps in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Apps,
});


const CURRENCIES = [["KSh", "Kenyan Shilling"], ["USh", "Ugandan Shilling"], ["TSh", "Tanzanian Shilling"], ["USD", "US Dollar"]] as const;
const ROUTES: Record<string, "/dashboard" | "/inventory" | "/purchases" | "/sales" | "/pos" | "/expenses" | "/contacts" | "/accounting" | "/float" | "/payroll" | "/reports" | "/summary" | "/settings" | "/reconciliation"> = { dashboard: "/dashboard", inventory: "/inventory", purchases: "/purchases", sales: "/sales", pos: "/pos", expenses: "/expenses", contacts: "/contacts", accounting: "/accounting", float: "/float", payroll: "/payroll", reports: "/reports", summary: "/summary", reconciliation: "/reconciliation", settings: "/settings" };

function Apps() {
  const nav = useNavigate();
  const { t, dir, tr, language, setLanguage } = useLanguage();
  const { dark } = useTheme();
  const [acct, setAcct] = useState<Account | null>(null);
  const shown = APPS;
  const ROWS = Array.from({ length: Math.ceil(shown.length / 4) }, (_, i) => shown.slice(i * 4, i * 4 + 4));
  const [locked, setLocked] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState<null | "profile" | "language" | "currency" | "help">(null);
  const [faq, setFaq] = useState<number | null>(null);
  const [chat, setChat] = useState(false);
  const [businessAi, setBusinessAi] = useState(false);
  const pick = (p: Partial<Account>) => { store.update(p); setAcct((a) => (a ? { ...a, ...p } : a)); toast.success(getT(p.language ?? acct?.language).t("saved")); };

  useEffect(() => {
    const a = store.get();
    if (!a || !store.signedIn()) { nav({ to: "/", replace: true }); return; }
    if (!a.plan) { nav({ to: "/plans", replace: true }); return; }
    setAcct(a);
  }, [nav]);

  if (!acct) return <main className="app-screen" />;

  const days = trialDaysLeft(acct);
  const planLabel = acct.plan === "trial" ? t("fullTrial") : t("planSuffix", (acct.plan ?? "").charAt(0).toUpperCase() + (acct.plan ?? "").slice(1));
  const appName = (id: string): string => t(id as TKey) ?? id;

  const openApp = (ok: boolean, name: string) => {
    if (ok) toast(t("comingNext", name));
    else setLocked(name);
  };

  const renderApp = (app: (typeof APPS)[number], placement?: string) => {
    const ok = canOpen(acct, app.tier);
    return (
      <ShopButton
        variant="bare"
        key={app.id}
        aria-label={appName(app.id)}
        onClick={() =>
          ok && ROUTES[app.id] ? nav({ to: ROUTES[app.id]! }) : openApp(ok, appName(app.id))
        }
        className="app-launcher-entry h-auto w-full min-w-0 flex-col items-center justify-start gap-2 rounded-none p-0"
        style={placement ? { gridColumn: placement } : undefined}
      >
        <span className="app-launcher-icon relative flex aspect-square w-full items-center justify-center">
          <span className="block h-full w-full">
            <img
              src={dark ? app.iconDark : app.icon}
              alt=""
              className={cn(
                "h-full w-full object-contain",
                app.id === "inventory" && "scale-[1.18]",
                !ok && "opacity-50 grayscale",
              )}
            />
          </span>
          {!ok && (
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-card shadow">
              <Lock className="h-3 w-3" />
            </span>
          )}
        </span>
        <span className="app-launcher-label w-full break-words text-center text-[11px] font-semibold leading-4 text-foreground">
          {appName(app.id)}
        </span>
      </ShopButton>
    );
  };

  return (
    <main dir={dir} className="app-screen relative px-4 pt-4 md:px-10">
      <header className="flex items-center justify-between gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/50 bg-card/60">
          {acct.logo
            ? <img src={acct.logo} alt={tr("Shop logo")} className="h-full w-full object-cover object-center" />
            : <Store className="h-4.5 w-4.5 text-primary" />}
        </span>
        <ConnectionStatus className="shrink-0" />
        <span className="min-w-0 flex-1 truncate text-center text-base font-bold">{acct.shopName}</span>
        <div className="flex shrink-0 items-center gap-2">
          <ShopButton variant="bare" aria-label={tr("Notifications")} className="relative h-auto w-auto p-0"><Bell className="h-5 w-5" /></ShopButton>
          <ThemeToggle />
          <ShopButton variant="bare" className="h-auto w-auto p-0" aria-label={tr("Menu")} onClick={() => { setPanel(null); setMenuOpen(true); }}><Menu className="h-5 w-5" /></ShopButton>
        </div>
      </header>
      <AnnouncementBanner />

      {acct.plan === "trial" && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-card/70 p-3">
          <Crown className="h-7 w-7 text-badge-gold" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">{t("trialRemaining")}</div>
            <div className="text-xs text-muted-foreground">{t("usingPlan", planLabel)}</div>
          </div>
          <span className="flex items-center gap-1 rounded-xl bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground glow">
            <Clock className="h-3.5 w-3.5" /> {t("daysLeft", days)}
          </span>
        </div>
      )}

      <div className="app-launcher mt-8">
        {ROWS.map((row, i) => (
          <div key={i} className="app-launcher-row">
            {row.map((app, index) => {
              const lastRow = i === ROWS.length - 1;
              const centeredPlacement =
                lastRow && row.length < 3
                  ? row.length === 1
                    ? "2 / span 2"
                    : `${index + 2} / span 1`
                  : undefined;
              return renderApp(app, centeredPlacement);
            })}
          </div>
        ))}
      </div>

      <ShopButton
        variant="bare"
        aria-label="ShopBot"
        onClick={() => setBusinessAi(true)}
        className="app-shopbot h-auto w-auto flex flex-col items-center"
      >
        <img src={dark ? chatIcons.dark : chatIcons.light} alt="" className="rounded-full" />
      </ShopButton>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm" onClick={() => setMenuOpen(false)}>
          <div dir={dir} className="ms-auto flex h-full w-64 flex-col border-l border-border bg-card p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-lg font-extrabold tracking-tight">SHOP<span className="text-primary">BOOK</span></span>
              <ShopButton variant="bare" className="h-auto w-auto p-0" aria-label={tr("Close menu")} onClick={() => setMenuOpen(false)}><X className="h-5 w-5" /></ShopButton>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-primary/50 bg-card/60">
                {acct.logo
                  ? <img src={acct.logo} alt="" className="h-full w-full object-cover object-center" />
                  : <Store className="h-5 w-5 text-primary" />}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">{acct.shopName}</div>
                <div className="text-xs text-muted-foreground">{planLabel}</div>
              </div>
            </div>
            {panel === null ? (
              <nav className="mt-6 flex flex-col gap-1">
                {([["profile", t("profileBusiness"), UserRound], ["language", t("language"), Globe], ["currency", t("currency"), Coins], ["help", t("help"), HelpCircle]] as const).map(([k, label, Icon]) => (
                  <ShopButton variant="bare" key={k} onClick={() => setPanel(k)} className="h-auto justify-start gap-3 rounded-xl px-3 py-3 text-start text-sm font-medium hover:bg-muted">
                    <Icon className="h-4.5 w-4.5 text-primary" /> {label}
                  </ShopButton>
                ))}
              </nav>
            ) : (
              <div className="mt-6 flex min-h-0 flex-1 flex-col">
                <ShopButton variant="bare" onClick={() => setPanel(null)} className="mb-3 h-auto justify-start gap-1 text-sm text-muted-foreground"><ChevronLeft className="h-4 w-4 rtl:rotate-180" /> {t("back")}</ShopButton>
                {panel === "profile" && (
                  <div className="space-y-3 text-sm">
                    <div className="font-bold">{t("profile")}</div>
                    <div className="rounded-xl border border-border p-3"><div className="text-xs text-muted-foreground">{t("email")}</div>{acct.email || "—"}<div className="mt-2 text-xs text-muted-foreground">{t("role")}</div>{t("admin")}</div>
                    <div className="font-bold">{t("business")}</div>
                    <div className="rounded-xl border border-border p-3"><div className="text-xs text-muted-foreground">{t("shopName")}</div>{acct.shopName}<div className="mt-2 text-xs text-muted-foreground">{t("currency")}</div>{acct.currency}<div className="mt-2 text-xs text-muted-foreground">{t("plan")}</div><span>{planLabel}</span></div>
                    <ShopButton variant="outline" onClick={() => { setMenuOpen(false); nav({ to: "/plans" }); }}>{t("manageSub")}</ShopButton>
                  </div>
                )}
                {panel === "language" && (
                  <div className="flex flex-col gap-1 overflow-y-auto">
                    {LANGS.map((l) => (
                      <ShopButton variant="bare" key={l} onClick={() => { setLanguage(l); setAcct(a => a ? { ...a, language: l } : a); toast.success(getT(l).t("saved")); }} className="h-auto justify-between rounded-xl px-3 py-2.5 text-sm hover:bg-muted">
                        {NATIVE[l]} {language === l && <Check className="h-4 w-4 text-primary" />}
                      </ShopButton>
                    ))}
                  </div>
                )}
                {panel === "currency" && (
                  <div className="flex flex-col gap-1">
                    {CURRENCIES.map(([c, label]) => (
                      <ShopButton variant="bare" key={c} onClick={() => pick({ currency: c })} className="h-auto justify-between rounded-xl px-3 py-2.5 text-start text-sm hover:bg-muted">
                        {c} – {tr(label)} {acct.currency === c && <Check className="h-4 w-4 text-primary" />}
                      </ShopButton>
                    ))}
                  </div>
                )}
                {panel === "help" && (
                  <div className="space-y-3 overflow-y-auto text-sm">
                    <p className="text-muted-foreground">{t("helpIntro")}</p>
                    <div className="font-bold">{t("faq")}</div>
                    <div className="space-y-1">
                      {([1, 2, 3, 4] as const).map((n) => (
                        <div key={n} className="rounded-xl border border-border">
                          <ShopButton variant="bare" onClick={() => setFaq(faq === n ? null : n)} className="h-auto justify-between gap-2 px-3 py-2.5 text-start text-sm font-medium">
                            {t(`q${n}` as TKey)} <ChevronDown className={cn("h-4 w-4 shrink-0 transition", faq === n && "rotate-180")} />
                          </ShopButton>
                          {faq === n && <p className="px-3 pb-3 text-muted-foreground">{t(`a${n}` as TKey)}</p>}
                        </div>
                      ))}
                    </div>
                    <div className="font-bold">{t("contact")}</div>
                    <ShopButton onClick={() => { setMenuOpen(false); setChat(true); }} className="gap-2"><MessageCircle className="h-4 w-4" />{tr("Chat with support")}</ShopButton>
                    <a href={`mailto:${SUPPORT.email}?subject=${encodeURIComponent(`SHOPBOOK support – ${acct.shopName}`)}`}
                      className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 hover:bg-muted">
                      <Mail className="h-4 w-4 text-primary" /><span className="min-w-0"><span className="block font-medium">{t("emailSupport")}</span><span className="block truncate text-xs text-muted-foreground">{SUPPORT.email}</span></span>
                    </a>
                    <a href={`https://wa.me/${SUPPORT.whatsapp}?text=${encodeURIComponent(`Hello SHOPBOOK, I need help with my shop: ${acct.shopName}`)}`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 hover:bg-muted">
                      <MessageCircle className="h-4 w-4 text-primary" /><span className="block font-medium">{t("whatsappSupport")}</span>
                    </a>
                    <a href={`tel:+${SUPPORT.whatsapp}`} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 hover:bg-muted"><Phone className="h-4 w-4 text-primary" /><span><span className="block font-medium">{tr("Call support")}</span><span className="block text-xs text-muted-foreground" dir="ltr">{SUPPORT.phone}</span></span></a>
                  </div>
                )}
              </div>
            )}
            <div className="mt-auto border-t border-border pt-3">
              <ShopButton variant="bare"
                onClick={() => { store.signOut(); nav({ to: "/", replace: true }); }}
                className="h-auto justify-start gap-2 rounded-xl px-3 py-3 text-sm font-medium text-destructive">
                <LogOut className="h-4 w-4" /> {t("signOut")}
              </ShopButton>
            </div>
          </div>
        </div>
      )}

      <HelpChat open={chat} onClose={() => setChat(false)} shopName={acct.shopName} email={acct.email} icon={dark ? chatIcons.dark : chatIcons.light} />
      <BusinessAssistant open={businessAi} onClose={() => setBusinessAi(false)} shop={acct.shopName} currency={acct.currency} icon={dark ? chatIcons.dark : chatIcons.light} />

      {locked && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 px-6 backdrop-blur-sm" onClick={() => setLocked(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 text-center" onClick={(e) => e.stopPropagation()}>
            <Lock className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-2 text-lg font-bold">{t("upgradeRequired")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("notIncluded", locked)}</p>
            <ShopButton className="mt-4" onClick={() => nav({ to: "/plans" })}>{t("upgradePlan")}</ShopButton>
          </div>
        </div>
      )}
    </main>
  );
}
