import { useRef, useState, type ReactNode } from "react";
import { Plus, Store, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { ShopButton } from "@/components/ui/shop-button";
import { store, type Account } from "@/lib/shopbook";
import { useSettings, type Branch } from "@/lib/settings-config";

type Tr = (x: string) => string;
const TYPES = ["Retail", "Wholesale", "Supermarket", "Pharmacy", "Hardware", "Restaurant", "Electronics", "Boutique", "Services", "Other"];

function F({ label, children, wide, tr }: { label: string; children: ReactNode; wide?: boolean | undefined; tr: Tr }) { return <label className={`inventory-field${wide ? " bp-wide" : ""}`}><span>{tr(label)}</span>{children}</label>; }

/** Business Profile: logo, basic info, location, extra details, branches, currency. Saves to account + device settings only. */
export function BusinessProfile({ acct, tr, onAccount }: { acct: Account; tr: Tr; onAccount: (p: Partial<Account>) => void }) {
  const [cfg, save] = useSettings();
  const [logo, setLogo] = useState(acct.logo ?? ""), file = useRef<HTMLInputElement>(null);
  const [br, setBr] = useState<Branch>({ name: "", location: "" });
  const txt = (k: "owner" | "phone" | "taxPin" | "country" | "city" | "location" | "website" | "hours", label: string, wide?: boolean) => <F tr={tr} label={label} wide={wide}><input className="inventory-input" value={cfg[k]} onChange={(e) => save({ [k]: e.target.value })} /></F>;
  const pickLogo = (f?: File) => { if (!f) return; if (f.size > 1_500_000) { toast.error(tr("Logo must be under 1.5 MB")); return; } const r = new FileReader(); r.onload = () => { const v = String(r.result); setLogo(v); onAccount({ logo: v }); }; r.readAsDataURL(f); };
  const addBranch = () => { if (!br.name.trim()) { toast.error(tr("Enter a branch name")); return; } save({ branches: [...cfg.branches, { name: br.name.trim(), location: br.location.trim() }] }); setBr({ name: "", location: "" }); toast.success(tr("Added")); };

  return <div className="bp-grid">
    <div className="bp-card bp-logo-card">
      <p className="money-heading">{tr("Business Logo")}</p>
      <div className="bp-logo-row">
        <div className="settings-logo">{logo ? <img src={logo} alt={tr("Business Logo")} /> : <Store className="h-8 w-8" />}</div>
        <div className="bp-logo-actions">
          <input ref={file} hidden type="file" accept="image/*" onChange={(e) => pickLogo(e.target.files?.[0])} />
          <ShopButton className="inventory-save" onClick={() => file.current?.click()}><Upload className="h-4 w-4" />{tr(logo ? "Change logo" : "Upload logo")}</ShopButton>
          {logo && <ShopButton variant="outline" className="inventory-save" onClick={() => { setLogo(""); onAccount({ logo: undefined }); }}>{tr("Remove")}</ShopButton>}
          <p className="settings-note">PNG / JPG • {tr("max")} 1.5 MB</p>
        </div>
      </div>
    </div>

    <div className="bp-card">
      <p className="money-heading">{tr("Basic Information")}</p>
      <div className="bp-fields">
        <F tr={tr} label="Business Name" wide><input className="inventory-input" defaultValue={acct.shopName} onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== store.get()?.shopName) onAccount({ shopName: v }); }} /></F>
        <F tr={tr} label="Business Type"><select className="inventory-input" value={TYPES.includes(cfg.businessType) ? cfg.businessType : "Other"} onChange={(e) => save({ businessType: e.target.value })}>{TYPES.map((t) => <option key={t} value={t}>{tr(t)}</option>)}</select></F>
        {txt("owner", "Owner")}
        {txt("phone", "Phone")}
        <F tr={tr} label="Email"><input className="inventory-input" type="email" defaultValue={acct.email} onBlur={(e) => { const v = e.target.value.trim(); if (v && !/^\S+@\S+\.\S+$/.test(v)) { toast.error(tr("Enter a valid email")); return; } if (v !== acct.email) onAccount({ email: v }); }} /></F>
        {txt("taxPin", "KRA PIN / Tax ID")}
      </div>
    </div>

    <div className="bp-card">
      <p className="money-heading">{tr("Location")}</p>
      <div className="bp-fields">{txt("country", "Country")}{txt("city", "City / Town")}{txt("location", "Street address", true)}</div>
    </div>

    <details className="bp-card">
      <summary className="money-heading cursor-pointer">{tr("Additional Details")}</summary>
      <div className="bp-fields">
        {txt("website", "Website")}
        <F tr={tr} label="Description" wide><textarea className="inventory-input bp-text" rows={2} value={cfg.description} onChange={(e) => save({ description: e.target.value })} /></F>
      </div>
    </details>

    <details className="bp-card">
      <summary className="money-heading cursor-pointer">{tr("Branches")}</summary>
      {!cfg.branches.length && <p className="settings-note">{tr("No branches yet")}</p>}
      {cfg.branches.map((b, i) => <div key={i} className="flex items-center gap-2 border-b border-border py-1.5"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{b.name}</p>{b.location && <p className="truncate text-[10px] text-muted-foreground">{b.location}</p>}</div><ShopButton variant="bare" className="inventory-icon-button text-destructive" aria-label={`${tr("Delete")} ${b.name}`} onClick={() => save({ branches: cfg.branches.filter((_, j) => j !== i) })}><Trash2 className="h-3.5 w-3.5" /></ShopButton></div>)}
      <div className="bp-branch-add"><input className="inventory-input" placeholder={tr("Branch name")} aria-label={tr("Branch name")} value={br.name} onChange={(e) => setBr({ ...br, name: e.target.value })} /><input className="inventory-input" placeholder={tr("Location")} aria-label={tr("Branch location")} value={br.location} onChange={(e) => setBr({ ...br, location: e.target.value })} /><ShopButton className="inventory-add-named" aria-label={tr("Add branch")} onClick={addBranch}><Plus className="h-4 w-4" /></ShopButton></div>
    </details>

    <div className="bp-card">
      <p className="money-heading">{tr("Currency & Number Format")}</p>
      <div className="bp-fields">
        <F tr={tr} label="Currency"><select className="inventory-input" value={acct.currency} onChange={(e) => onAccount({ currency: e.target.value })}>{["KSh", "USh", "TSh", "USD"].map((x) => <option key={x}>{x}</option>)}</select></F>
        <F tr={tr} label="Number format"><select className="inventory-input" value={cfg.numberFormat} onChange={(e) => save({ numberFormat: e.target.value })}>{["1,000,000", "1.000.000", "1 000 000"].map((x) => <option key={x}>{x}</option>)}</select></F>
      </div>
      <p className="settings-note">{tr("Example")}: {acct.currency} {cfg.numberFormat.replace("000,000", "250,500").replace("000.000", "250.500").replace("000 000", "250 500")}</p>
    </div>
  </div>;
}
