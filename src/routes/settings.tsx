import { clean } from "@/lib/format";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Download, Search, Store, Upload } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { AppShell, dt, useAccount } from "@/components/shopbook/selling";
import { BackupStatus } from "@/components/shopbook/backup-status";
import { BackupHub } from "@/components/shopbook/backup-hub";
import { UniversalImport } from "@/components/shopbook/universal-import";
import { BusinessProfile } from "@/components/shopbook/business-profile";
import { SampleData } from "@/components/shopbook/sample-data";
import { ExportData, ManageModules, NamedManager } from "@/components/shopbook/settings-data";
import { inputCls, useErp } from "@/components/shopbook/product-search";
import { ShopButton } from "@/components/ui/shop-button";
import { useLanguage } from "@/hooks/use-language";
import { LANGS, NATIVE } from "@/lib/i18n";
import { APPS, canOpen, PLANS, store } from "@/lib/shopbook";
import { backupJson, lastBackup, restoreJson } from "@/lib/backup";
import { translateCurrent } from "@/lib/interface-translations";
import { applyUiSize, setTax, setUiSize, UI_MAX, UI_MIN, UI_STEP, usePrefs } from "@/lib/prefs";
import { applySettings, useSettings, type SettingsConfig } from "@/lib/settings-config";
import { useBackupStatus } from "@/lib/cloud-backup";
import { listCloudBackups, getCloudBackup } from "@/lib/backup.functions";
import { lovable } from "@/integrations/lovable";
import { RESET_GROUPS, resetData } from "@/lib/reset-data";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/settings")({ head: () => ({ meta: [
  { title: "Settings — SHOPBOOK ERP" }, { name: "description", content: "Central SHOPBOOK business, general, AI, finance, operations, appearance, tax, security, integrations and subscription settings." },
  { property: "og:title", content: "Settings — SHOPBOOK ERP" }, { property: "og:description", content: "Configure SHOPBOOK and safely import business data." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
] }), component: Settings });

const CATS = ["General", "AI Setup", "Business", "People & Access", "Finance", "Products & Operations", "Appearance", "Tax & Compliance", "Notifications & Communication", "Security & Activity", "Integrations", "Subscription"] as const;
type Category = (typeof CATS)[number];
const SUB: Record<Category, string[]> = {
  Business: ["Business Profile"],
  General: ["Language & Currency", "Date & Time", "Number Format", "Interface Size", "Search & Printing", "System Preferences", "Autosave & Backup", "Import & Data", "Sample Data", "Reconciliation", "Manage Modules", "Export Data", "Export & Restore", "Delete & Reset"],
  "AI Setup": ["ShopBot", "Business Questions", "Business Summaries", "Trend Analysis", "Guided Instructions", "Recommendations", "AI Actions", "AI Gateway"],
  "People & Access": ["Users", "Roles", "Permissions", "Data Access", "Active Users", "Invitations", "Access History"],
  Finance: ["Accounts", "Payment Methods", "Costing", "Transfers", "Financial Periods", "Receivables", "Payables"],
  "Products & Operations": ["Product Settings", "Categories", "Brands", "Units", "Pricing", "Buying", "Selling", "Costing", "Barcodes", "Low Stock", "Stock Behavior", "Transfers", "Custom Fields"],
  Appearance: ["Interface Size", "Text Size", "Icon Size", "Spacing"],
  "Tax & Compliance": ["VAT", "Tax Settings", "eTIMS", "Receipts", "Documents", "Audit Trail"],
  "Notifications & Communication": ["Notifications", "WhatsApp", "SMS", "Email", "Customer Communication", "Supplier Communication", "Payment Reminders", "Low Stock Alerts", "Report Notifications"],
  "Security & Activity": ["Password", "Login Security", "Active Sessions", "Audit Log", "Device Activity", "Security Events", "Account Recovery"],
  Integrations: ["M-Pesa", "WhatsApp", "SMS", "Email", "eTIMS", "AI Gateway", "Printers", "Backup / Sync"],
  Subscription: ["Current Plan", "Trial", "Billing", "Usage", "Upgrade", "Payment History", "Plan Features"],
};

const BLURB: Record<Category, string> = {
  Business: "Your shop's name, contacts, logo and location.",
  General: "Set things once for the whole shop. They are copied to every app that uses them.",
  "AI Setup": "Choose what ShopBot can help with. ShopBot only reads your records.",
  "People & Access": "Who uses this shop and what they can see.",
  Finance: "Accounts, payment methods and money periods.",
  "Products & Operations": "Defaults for products, stock and pricing.",
  Appearance: "Sizes of the interface, text, icons and spacing.",
  "Tax & Compliance": "VAT, receipts and the audit trail.",
  "Notifications & Communication": "Alerts and messages to customers and suppliers.",
  "Security & Activity": "Password, sessions, activity and data reset.",
  Integrations: "Connected services such as M-Pesa, eTIMS and backup.",
  Subscription: "Your plan, trial and included apps.",
};

const GENERAL_DETAILS: Record<string, string> = {
  "Language & Currency": "Language • Currency",
  "Date & Time": "Timezone • Date format • Time format",
  "Number Format": "Number format",
  "Interface Size": "Text • Icons • Controls",
  "Search & Printing": "Barcodes • Paper size • Copies",
  "System Preferences": "Autosave • Offline mode • Automatic sync",
  "Autosave & Backup": "Local save • Cloud backup",
  "Import & Data": "Universal Import Center",
  "Sample Data": "Empty test shops only",
  "Export & Restore": "Export records • Whole-shop backup",
  "Manage Modules": "Show or hide apps • Records kept",
  "Export Data": "Full workbook • Selected data • Date range • CSV",
  "Delete & Reset": "Selected records • All data",
};

function Settings() {
  const acct = useAccount("basic"), s = useErp(), { tr } = useLanguage(), nav = useNavigate(), [query, setQuery] = useState(""), [cat, setCat] = useState<Category>("General");
  const [detail, setDetail] = useState(false);
  if (!acct) return <main className="app-screen" />;
  const q = query.trim().toLowerCase(), shown = CATS.filter((c) => !q || [c, ...SUB[c]].some((x) => tr(x).toLowerCase().includes(q)));
  const apply = () => { applyUiSize(); applySettings(); window.dispatchEvent(new Event("shopbook-settings")); window.dispatchEvent(new Event("shopbook-prefs")); toast.success(tr("Applied to all apps")); };
  return <AppShell title="Settings" tabs={[]} tab="" setTab={() => {}}>
    {detail && <ShopButton variant="bare" className="settings-detail-back" onClick={() => setDetail(false)}><ArrowLeft className="h-3.5 w-3.5" />{tr(cat)}</ShopButton>}
    <ShopButton variant="bare" className="settings-back" onClick={() => nav({ to: "/apps" })}><ArrowLeft className="h-3.5 w-3.5" />{tr("Home")}</ShopButton>
    <h1 className="settings-title">⚙️ {tr("Settings")}</h1><p className="settings-note -mt-1 mb-2">{tr("Business configuration")}</p>
    <div className="settings-search"><Search className="h-3.5 w-3.5" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tr("Search settings...")} /></div>
    <div className={`settings-split${detail ? " settings-detail" : ""}`}>
      <nav className="settings-nav">{shown.map((c) => <ShopButton key={c} variant="bare" className={`settings-nav-item${c === cat ? " is-active" : ""}`} onClick={() => { setCat(c); setDetail(true); }}><span>{tr(c)}</span><ChevronDown aria-hidden className="h-3.5 w-3.5 -rotate-90" /></ShopButton>)}</nav>
      <div className="settings-panel">
        <div className="settings-panel-head"><div><h2>{tr(cat)} {tr("Settings")}</h2><p>{tr(BLURB[cat])}</p></div><ShopButton variant="bare" className="settings-apply" onClick={apply}>{tr("Apply to All Apps")}</ShopButton></div>
        <SettingsCategory key={cat} category={cat} acct={acct} state={s} query={q} />
      </div>
    </div>
    <BackupStatus className="settings-status" />
  </AppShell>;
}

function SettingsCategory({ category, acct, state, query }: { category: Category; acct: NonNullable<ReturnType<typeof store.get>>; state: ReturnType<typeof useErp>; query: string }) {
  const { tr, language, setLanguage } = useLanguage(), nav = useNavigate(), prefs = usePrefs(), [cfg, saveCfg] = useSettings(), [, refresh] = useState(0);
  const saveAccount = (patch: Partial<typeof acct>) => { store.update(patch); toast.success(tr("Saved")); refresh((n) => n + 1); };
  if (category === "Business") return <BusinessProfile acct={store.get() ?? acct} tr={tr} onAccount={saveAccount} />;
  const names = SUB[category].filter((n) => !query || tr(n).toLowerCase().includes(query) || tr(category).toLowerCase().includes(query));
  return <div className="settings-sections">{names.map((name) => <SettingsAccordion key={name} title={tr(name)} description={category === "General" ? GENERAL_DETAILS[name]?.split(" • ").map(tr).join(" • ") : undefined} forceOpen={!!query.trim()}><Panel name={name} acct={acct} state={state} tr={tr} language={language} setLanguage={setLanguage} prefs={prefs} cfg={cfg} saveCfg={saveCfg} saveAccount={saveAccount} nav={nav} /></SettingsAccordion>)}</div>;
}

function SettingsAccordion({ title, description, forceOpen, children }: { title: string; description?: string | undefined; forceOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();
  const shown = open || !!forceOpen;
  return <section className={`settings-section settings-acc${shown ? " is-open" : ""}`}><ShopButton variant="bare" type="button" className="settings-acc-head" aria-expanded={shown} aria-controls={id} onClick={() => setOpen(!open)}><span className="settings-acc-label"><span>{title}</span>{description && <small>{description}</small>}</span>{shown ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}</ShopButton><div id={id} className="settings-acc-wrap" role="region" aria-label={title} inert={!shown} aria-hidden={!shown}><div className="settings-acc-inner"><div className="settings-section-body">{children}</div></div></div></section>;
}

function InterfaceSize({ size, tr }: { size: number; tr: (x: string) => string }) {
  const pct = Math.round(size * 100);
  return <div className="settings-size-control"><div className="settings-slider" dir="ltr"><span>{tr("Smaller")} 50%</span><input aria-label={tr("Interface Size")} aria-valuetext={`${pct}%`} type="range" min={UI_MIN} max={UI_MAX} step={UI_STEP} value={size} onChange={(e) => setUiSize(Number(e.target.value))} /><span>{tr("Larger")} 200%</span></div><div className="settings-inline"><output aria-live="polite">{pct}%</output><ShopButton variant="outline" className="settings-mini" onClick={() => setUiSize(1)}>{tr("Reset to default")}</ShopButton></div></div>;
}
function Panel({ name, acct, state, tr, language, setLanguage, prefs, cfg, saveCfg, saveAccount, nav }: { name: string; acct: NonNullable<ReturnType<typeof store.get>>; state: ReturnType<typeof useErp>; tr: (x: string) => string; language: string; setLanguage: (x: never) => void; prefs: ReturnType<typeof usePrefs>; cfg: SettingsConfig; saveCfg: (p: Partial<SettingsConfig>) => void; saveAccount: (p: Partial<typeof acct>) => void; nav: ReturnType<typeof useNavigate> }) {
  const L = ({ label, children }: { label: string; children: ReactNode }) => <label className="inventory-field"><span>{tr(label)}</span>{children}</label>;
  const text = (key: keyof SettingsConfig, label: string) => <L label={label}><input className="inventory-input" value={String(cfg[key])} onChange={(e) => saveCfg({ [key]: e.target.value })} /></L>;
  const toggle = (key: keyof SettingsConfig, label: string) => <label className="settings-toggle"><span>{tr(label)}</span><input type="checkbox" checked={Boolean(cfg[key])} onChange={(e) => saveCfg({ [key]: e.target.checked })} /></label>;
  if (name === "Business Profile") return <BusinessProfile acct={acct} tr={tr} onAccount={saveAccount} />;
  if (name === "Sample Data") return <SampleData tr={tr} shopName={acct.shopName} />;
  if (name === "__oldProfile") return <><L label="Business Name"><input className="inventory-input" defaultValue={acct.shopName} onBlur={(e) => e.target.value.trim() && saveAccount({ shopName: e.target.value.trim() })} /></L>{text("owner", "Owner")}{text("phone", "Phone")}<L label="Email"><input className="inventory-input" type="email" defaultValue={acct.email} onBlur={(e) => saveAccount({ email: e.target.value.trim() })} /></L></>;
  if (name === "Business Type") return text("businessType", "Business Type"); if (name === "Location") return text("location", "Location"); if (name === "Contact Information") return <>{text("phone", "Phone")}<p className="settings-note">{acct.email || tr("Email optional")}</p></>; if (name === "Owner") return text("owner", "Owner"); if (name === "Business Hours") return text("hours", "Business Hours");
  if (name === "Logo") return <LogoSetting value={acct.logo} onSave={(logo) => saveAccount({ logo })} tr={tr} />;
  if (name === "Language & Currency" || name === "Search & Printing") { const fields = name === "Language & Currency" ? ["Language", "Currency"] : ["Search", "Printing"]; return <>{fields.map((field) => <Panel key={field} name={field} acct={acct} state={state} tr={tr} language={language} setLanguage={setLanguage} prefs={prefs} cfg={cfg} saveCfg={saveCfg} saveAccount={saveAccount} nav={nav} />)}</>; }
  if (name === "Interface Size") return <InterfaceSize size={prefs.size} tr={tr} />;
  if (name === "Language") return <L label="Language"><select className="inventory-input" value={language} onChange={(e) => { const l = LANGS.find((x) => x === e.target.value); if (l) setLanguage(l as never); }}>{LANGS.map((x) => <option key={x} value={x}>{NATIVE[x]}</option>)}</select></L>;
  if (name === "Currency") return <L label="Currency"><select className="inventory-input" value={acct.currency} onChange={(e) => saveAccount({ currency: e.target.value })}>{["KSh", "USh", "TSh", "USD"].map((x) => <option key={x}>{x}</option>)}</select></L>;
  if (name === "Date & Time") return <>{text("timezone", "Timezone")}{text("dateFormat", "Date format")}{text("timeFormat", "Time format")}</>; if (name === "Number Format") return <><p className="settings-note">KSh 100,000 • 0 {tr("decimal places")}</p>{text("numberFormat", "Number format")}</>;
  if (name === "Search") return toggle("searchBarcodes", "Search SKU and barcodes"); if (name === "Printing") return <>{text("paper", "Paper size")}<L label="Copies"><input className="inventory-input" type="number" min={1} value={cfg.copies} onChange={(e) => saveCfg({ copies: Math.max(1, +e.target.value) })} /></L>{toggle("autoPrint", "Auto-print")}</>;
  if (name === "System Preferences") return <>{toggle("autosave", "Autosave")}{toggle("offline", "Offline mode")}{toggle("autoSync", "Automatic sync")}{toggle("autoRetry", "Automatic retry")}</>;
  if (name === "Autosave & Backup") return <BackupHub tr={tr} shopName={acct.shopName} />; if (name === "Import & Data") return <UniversalImport tr={tr} />; if (name === "Reconciliation") return <Links nav={nav} links={[["Open Reconciliation", "/reconciliation"]]} tr={tr} />; if (name === "Export & Restore") return <ExportPanel tr={tr} acct={acct} />; if (name === "Delete & Reset") return <ResetPanel tr={tr} />;
  if (["ShopBot", "Business Questions", "Business Summaries", "Trend Analysis", "Guided Instructions", "Recommendations", "AI Actions"].includes(name)) { const keys: Record<string, keyof SettingsConfig> = { "ShopBot": "aiOn", "Business Questions": "aiBusiness", "Business Summaries": "aiSummaries", "Trend Analysis": "aiTrends", "Guided Instructions": "aiGuidance", Recommendations: "aiRecommendations", "AI Actions": "aiActions" }; return <>{toggle(keys[name] ?? "aiOn", name)}{name === "AI Actions" && <p className="settings-note">{tr("Read-only for safety. Data-changing AI actions are not enabled.")}</p>}</>; }
  if (name === "AI Gateway") return <Status label="Lovable AI Gateway" state={cfg.aiOn ? "Connected" : "Disabled"} />;
  if (name === "Users" || name === "Active Users") return <p className="settings-note">{acct.shopName} • <b>{tr("Admin")}</b></p>; if (["Roles", "Permissions", "Data Access", "Invitations"].includes(name)) return <p className="settings-note">{tr("Admin is active. Additional staff access is not available yet.")}</p>; if (name === "Access History") return <Audit rows={state.audit} tr={tr} />;
  if (name === "Payment Methods") return <p className="settings-note">Cash • M-Pesa • Bank • Credit<br />{tr("P.PAY combines methods and is not an account.")}</p>;
  if (name === "Accounts") return <Links nav={nav} links={[["Float", "/float"], ["Accounting", "/accounting"]]} tr={tr} />; if (["Transfers", "Receivables", "Payables", "Financial Periods", "Costing"].includes(name)) return <Links nav={nav} links={[[name === "Transfers" ? "Float" : name === "Costing" ? "Accounting" : "Reports", name === "Transfers" ? "/float" : name === "Costing" ? "/accounting" : "/reports"]]} tr={tr} />;
  if (name === "Manage Modules") return <ManageModules tr={tr} />; if (name === "Export Data") return <ExportData tr={tr} shopName={acct.shopName} />; if (name === "Categories" || name === "Brands") return <NamedManager kind={name === "Brands" ? "brands" : "categories"} tr={tr} />;
  if (["Units", "Pricing", "Buying", "Selling", "Barcodes", "Stock Behavior", "Custom Fields", "Product Settings"].includes(name)) return <Links nav={nav} links={[["Open Inventory", "/inventory"]]} tr={tr} />; if (name === "Low Stock") return <L label="Default low-stock level"><input className="inventory-input" type="number" min={0} value={cfg.lowStock} onChange={(e) => saveCfg({ lowStock: Math.max(0, +e.target.value) })} /></L>;
  if (["Interface Size", "Text Size", "Icon Size", "Spacing"].includes(name)) { const keys: Record<string, keyof SettingsConfig> = { "Interface Size": "interfaceScale", "Text Size": "textScale", "Icon Size": "iconScale", Spacing: "spacingScale" }; const k = keys[name] ?? "interfaceScale"; return <L label={name}><div className="settings-slider"><span>{tr(name === "Spacing" ? "Tighter" : "Smaller")}</span><input type="range" min={0} max={4} step={1} value={Number(cfg[k])} onChange={(e) => saveCfg({ [k]: +e.target.value })} /><span>{tr(name === "Spacing" ? "More space" : "Larger")}</span></div><p className="settings-note">{tr(name)}: {tr(["Smallest", "Small", "Compact", "Large", "Largest"][Number(cfg[k])] ?? "Compact")}</p></L>; }
  if (name === "VAT" || name === "Tax Settings") return <><label className="settings-toggle"><span>{tr("Charge VAT on sales")}</span><input type="checkbox" checked={prefs.tax.on} onChange={(e) => setTax({ ...prefs.tax, on: e.target.checked })} /></label><L label="VAT rate (%)"><input className="inventory-input" type="number" min={0} max={100} value={prefs.tax.rate} onChange={(e) => setTax({ ...prefs.tax, rate: Math.min(100, Math.max(0, +e.target.value)) })} /></L></>; if (name === "Audit Trail" || name === "Audit Log") return <Audit rows={state.audit} tr={tr} />;
  if (["eTIMS", "WhatsApp", "SMS", "Email", "M-Pesa", "Printers"].includes(name)) return <Status label={name} state="Not Connected" />; if (name === "Backup / Sync") return <Status label="Cloud backup" state="Configuration Required" />;
  if (name === "Notifications") return toggle("notifications", "Notifications"); if (name === "Low Stock Alerts") return toggle("lowStockAlerts", "Low Stock Alerts"); if (["Customer Communication", "Supplier Communication", "Payment Reminders", "Report Notifications"].includes(name)) return <Status label={name} state="Not Connected" />;
  if (name === "Password") return <p className="settings-note">{tr("Passwords are never shown. Use Forgot Password on the login page for reset guidance.")}</p>; if (["Login Security", "Active Sessions", "Device Activity", "Security Events", "Account Recovery"].includes(name)) return <p className="settings-note">{tr("This device uses the current local shop session. Multi-device staff sessions are not available yet.")}</p>;
  if (name === "Current Plan" || name === "Trial") return <p className="settings-note">{tr("Current plan")}: <b>{acct.plan ?? "—"}</b></p>; if (name === "Plan Features") return <div>{APPS.map((a) => <div className="settings-inline" key={a.id}><span>{tr(a.name)}</span><b>{tr(canOpen(acct, a.tier) ? "Included" : "Upgrade Required")}</b></div>)}</div>; if (["Billing", "Usage", "Upgrade", "Payment History"].includes(name)) return <ShopButton className="inventory-save" onClick={() => nav({ to: "/plans" })}>{tr("Manage Subscription")}</ShopButton>;
  if (["Receipts", "Documents"].includes(name)) return <p className="settings-note">{tr("Receipts and documents use the shared white print preview.")}</p>;
  return <p className="settings-note">{tr("This setting is not connected yet.")}</p>;
}
function Status({ label, state }: { label: string; state: string }) { return <div className="settings-inline"><span>{label}</span><b className={state === "Connected" ? "text-primary" : "text-muted-foreground"}>{state === "Connected" ? "●" : "○"} {state}</b></div>; }
function Audit({ rows, tr }: { rows: ReturnType<typeof useErp>["audit"]; tr: (x: string) => string }) { return <div>{rows.length ? rows.slice(0, 50).map((x) => <div className="settings-audit" key={x.id}><b>{tr(x.action)}</b><span>{x.detail}</span><small>{x.user} • {dt(x.at)}</small></div>) : <p className="settings-note">{tr("No activity yet")}</p>}</div>; }
function Links({ links, nav, tr }: { links: [string, string][]; nav: ReturnType<typeof useNavigate>; tr: (x: string) => string }) { return <div>{links.map(([label, to]) => <ShopButton key={to} variant="outline" className="inventory-save" onClick={() => nav({ to })}>{tr(label)}</ShopButton>)}</div>; }
function BackupPanel({ tr, acct }: { tr: (x: string) => string; acct: NonNullable<ReturnType<typeof store.get>> }) { const backup = useBackupStatus(), file = useRef<HTMLInputElement>(null), [signed, setSigned] = useState(false), [rows, setRows] = useState<{ device_id: string; shop_name: string; updated_at: string }[]>([]), [error, setError] = useState(""); useEffect(() => { const f = () => supabase.auth.getSession().then(({ data }) => setSigned(Boolean(data.session))); f(); const a = supabase.auth.onAuthStateChange(f); return () => a.data.subscription.unsubscribe(); }, []); useEffect(() => { if (signed) listCloudBackups().then(setRows).catch((e) => setError(e instanceof Error ? e.message : "Backup unavailable")); }, [signed, backup.at]); const download = () => { const u = URL.createObjectURL(new Blob([backupJson(acct.shopName)], { type: "application/json" })); const a = document.createElement("a"); a.href = u; a.download = `shopbook-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(u); };
  return <><BackupStatus className="px-0" />{!signed && <ShopButton className="inventory-save" onClick={async () => { const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin }); if (r.error) setError(r.error.message); }}>{tr("Sign in with Google for automatic backup")}</ShopButton>}{rows.map((r) => <div className="settings-inline" key={r.device_id}><span>{r.shop_name} • {dt(new Date(r.updated_at).getTime())}</span><ShopButton variant="outline" className="settings-mini" onClick={async () => { if (!window.confirm(tr("Replace all records on this device with this backup?"))) return; try { restoreJson(await getCloudBackup({ data: { deviceId: r.device_id } })); toast.success(tr("Backup restored")); } catch (e) { setError(e instanceof Error ? e.message : "Restore failed"); } }}>{tr("Restore")}</ShopButton></div>)}<p className="settings-note">{lastBackup() ? `${tr("Last backup file")}: ${dt(lastBackup())}` : tr("No backup file yet")}</p><ShopButton className="inventory-save" onClick={download}>{tr("Download backup")}</ShopButton><input ref={file} hidden type="file" accept=".json,application/json" onChange={async (e) => { const f = e.target.files?.[0]; if (!f || !window.confirm(tr("Replace all records on this device with this backup?"))) return; try { restoreJson(await f.text()); toast.success(tr("Backup restored")); } catch (x) { toast.error(translateCurrent(x instanceof Error ? x.message : "Failed")); } }} /><ShopButton variant="outline" className="inventory-save" onClick={() => file.current?.click()}>{tr("Restore backup")}</ShopButton>{error && <p className="text-destructive">{error}</p>}</>;
}
function LogoSetting({ value, onSave, tr }: { value?: string | undefined; onSave: (v: string) => void; tr: (x: string) => string }) { const [image, setImage] = useState(value ?? ""), file = useRef<HTMLInputElement>(null); return <><div className="settings-logo">{image ? <img src={image} alt="" /> : <Store className="h-8 w-8" />}</div><input ref={file} hidden type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setImage(String(r.result)); r.readAsDataURL(f); }} /><ShopButton className="inventory-save" onClick={() => file.current?.click()}>{tr("Choose logo")}</ShopButton>{image && <ShopButton variant="outline" className="inventory-save" onClick={() => onSave(image)}>{tr("Save")}</ShopButton>}</>; }
function ResetPanel({ tr }: { tr: (x: string) => string }) {
  const [pick, setPick] = useState<string[]>([]), [all, setAll] = useState(false), [ask, setAsk] = useState(false), [busy, setBusy] = useState(false);
  const go = () => { if (busy) return; setBusy(true); try { resetData(pick, all); toast.success(tr(all ? "Business data reset successfully. You can now start a new shop setup." : "Selected data deleted")); setPick([]); setAll(false); } catch (e) { toast.error(e instanceof Error ? tr(e.message) : tr("Delete failed")); } finally { setBusy(false); setAsk(false); } };
  return <div className="import-center"><p className="settings-note">{tr("Download a backup first. Deleted records cannot be recovered.")}</p>
    <div>{Object.keys(RESET_GROUPS).map((g) => <label key={g} className="settings-toggle"><span>{tr(g)}</span><input type="checkbox" disabled={all} checked={all || pick.includes(g)} onChange={(e) => setPick(e.target.checked ? [...pick, g] : pick.filter((x) => x !== g))} /></label>)}
    <label className="settings-toggle"><span><b>{tr("Delete everything (start as a new user)")}</b></span><input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} /></label></div>
    <ShopButton className="inventory-save bg-destructive text-destructive-foreground" disabled={(!all && !pick.length) || busy} onClick={() => setAsk(true)}>{tr(all ? "Delete all data" : "Delete selected data")}</ShopButton>
    <AlertDialog open={ask} onOpenChange={(o) => { if (!busy) setAsk(o); }}><AlertDialogContent>
      <AlertDialogHeader><AlertDialogTitle>{tr(all ? "Are you sure you want to delete everything?" : "Are you sure you want to delete the selected data?")}</AlertDialogTitle>
      <AlertDialogDescription>{tr(all ? "This will permanently remove the selected business data and reset your shop so you can start as a new user. This action cannot be undone from the application." : "This will permanently remove the selected business data. This action cannot be undone from the application.")}</AlertDialogDescription></AlertDialogHeader>
      <AlertDialogFooter><AlertDialogCancel disabled={busy}>{tr("No, keep my data")}</AlertDialogCancel><AlertDialogAction disabled={busy} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={(e) => { e.preventDefault(); go(); }}>{tr(all ? "Yes, delete everything" : "Yes, delete selected data")}</AlertDialogAction></AlertDialogFooter>
    </AlertDialogContent></AlertDialog></div>;
}
const csvCell = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
const csvDownload = (name: string, head: string[], rows: unknown[][]) => { const text = [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\n"); const u = URL.createObjectURL(new Blob([text], { type: "text/csv" })); const a = document.createElement("a"); a.href = u; a.download = name; a.click(); URL.revokeObjectURL(u); };
function ExportPanel({ tr, acct }: { tr: (x: string) => string; acct: NonNullable<ReturnType<typeof store.get>> }) {
  const s = useErp(), file = useRef<HTMLInputElement>(null), day = new Date().toISOString().slice(0, 10);
  const money = (n: number) => clean(n).toFixed(2);
  const catName = (id?: string) => s.categories.find((c) => c.id === id)?.name ?? "", brandName = (id?: string) => s.brands.find((b) => b.id === id)?.name ?? "";
  const custName = (id?: string) => s.customers.find((c) => c.id === id)?.name ?? "", suppName = (id?: string) => s.suppliers.find((x) => x.id === id)?.name ?? "";
  const exports: [string, () => void][] = [
    ["Products", () => csvDownload(`shopbook-products-${day}.csv`, ["ID", "Name", "SKU", "Barcode", "Category", "Brand", "Qty", "Buying price", "Selling price"], s.products.map((p) => [p.id, p.name, p.sku ?? "", p.barcode ?? "", catName(p.categoryId), brandName(p.brandId), p.qty, money(p.buy), money(p.sell)]))],
    ["Sales", () => csvDownload(`shopbook-sales-${day}.csv`, ["ID", "Date", "Customer", "Total", "Cash", "M-Pesa", "Bank", "Credit", "Settled"], s.sales.map((x) => [x.ref, new Date(x.at).toISOString(), custName(x.customerId), money(x.total), money(x.pay.cash), money(x.pay.mpesa), money(x.pay.bank), money(x.pay.credit), money(x.settled ?? 0)]))],
    ["Purchases", () => csvDownload(`shopbook-purchases-${day}.csv`, ["ID", "Date", "Supplier", "Total", "Cash", "M-Pesa", "Bank", "Credit", "Settled"], s.purchases.map((x) => [x.ref, new Date(x.at).toISOString(), suppName(x.supplierId), money(x.total), money(x.pay.cash), money(x.pay.mpesa), money(x.pay.bank), money(x.pay.credit), money(x.settled ?? 0)]))],
    ["Expenses", () => csvDownload(`shopbook-expenses-${day}.csv`, ["ID", "Date", "Category", "Note", "Amount"], s.expenses.map((x) => [x.ref, new Date(x.at).toISOString(), x.category, x.description ?? x.note ?? "", money(x.amount)]))],
    ["Customers", () => csvDownload(`shopbook-customers-${day}.csv`, ["ID", "Name", "Phone", "Balance"], s.customers.map((x) => [x.id, x.name, x.phone ?? "", money(x.balance)]))],
    ["Suppliers", () => csvDownload(`shopbook-suppliers-${day}.csv`, ["ID", "Name", "Phone", "Balance"], s.suppliers.map((x) => [x.id, x.name, x.phone ?? "", money(x.balance)]))],
  ];
  const downloadBackup = () => { const u = URL.createObjectURL(new Blob([backupJson(acct.shopName)], { type: "application/json" })); const a = document.createElement("a"); a.href = u; a.download = `shopbook-backup-${day}.json`; a.click(); URL.revokeObjectURL(u); };
  return <div className="import-center">
    <p className="settings-note">{tr("Download your records as CSV files, or save and restore a whole-shop backup file.")}</p>
    <p className="money-heading">{tr("Export records (CSV)")}</p>
    <div className="export-grid">{exports.map(([label, run]) => <ShopButton key={label} variant="outline" className="inventory-save" onClick={run}><Download className="h-4 w-4" />{tr(label)}</ShopButton>)}</div>
    <p className="money-heading">{tr("Whole-shop backup")}</p>
    <ShopButton className="inventory-save" onClick={downloadBackup}><Download className="h-4 w-4" />{tr("Download backup")}</ShopButton>
    <input ref={file} hidden type="file" accept=".json,application/json" onChange={async (e) => { const f = e.target.files?.[0]; if (!f || !window.confirm(tr("Replace all records on this device with this backup?"))) return; try { restoreJson(await f.text()); toast.success(tr("Backup restored")); } catch (x) { toast.error(translateCurrent(x instanceof Error ? x.message : "Failed")); } }} />
    <ShopButton variant="outline" className="inventory-save" onClick={() => file.current?.click()}><Upload className="h-4 w-4" />{tr("Restore backup")}</ShopButton>
  </div>;
}
