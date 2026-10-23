import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Phone, Store } from "lucide-react";
import { toast } from "sonner";
import { BrandRing, Field, LogoCropPicker, TopBar } from "@/components/shopbook/ui";
import { ShopButton } from "@/components/ui/shop-button";
import { useLanguage } from "@/hooks/use-language";
import { store } from "@/lib/shopbook";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — SHOPBOOK ERP" },
      { name: "description", content: "Create your SHOPBOOK shop account in under a minute. No verification needed." },
      { property: "og:title", content: "Create Account — SHOPBOOK ERP" },
      { property: "og:description", content: "Create your SHOPBOOK shop account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Signup,
});

function Signup() {
  const nav = useNavigate();
  const { tr, t, dir, language } = useLanguage();
  const [f, setF] = useState({ shopName: "", phone: "", password: "", confirm: "", currency: "KSh", logo: "" });
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState<{ password?: string; confirm?: string; agree?: string }>({});
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof err = {};
    if (f.password.length < 6) next.password = tr("Password must be at least 6 characters");
    else if (f.password !== f.confirm) next.confirm = tr("Passwords do not match");
    if (!agree) next.agree = tr("Please accept the Terms & Privacy Policy");
    setErr(next);
    const first = next.password || next.confirm || next.agree;
    if (first) { toast.error(first); return; }
    store.save({ language, shopName: f.shopName.trim(), phone: f.phone.trim(), email: "", password: f.password, currency: f.currency, logo: f.logo || undefined });
    store.signIn();
    nav({ to: "/plans" });
  };

  return (
    <main dir={dir} className="app-screen pb-8">
      <TopBar />
      <div className="mx-auto mt-2 flex justify-center">
        <img src="/shopbook/shopplus-logo.png" alt="SHOPBOOK" className="h-14 max-w-[200px] object-contain" />
      </div>
      <div className="mt-2"><BrandRing size={180} /></div>
      <div className="mt-3"><LogoCropPicker value={f.logo} onChange={(logo) => setF({ ...f, logo })} /></div>
      <h1 className="mt-2 text-center text-2xl font-bold">{tr("Create Your Account")}</h1>
      <form onSubmit={submit} className="mt-4 space-y-2.5 px-5">
        <Field icon={<Store className="h-5 w-5" />} label={tr("Shop Name")} placeholder={tr("Enter your shop name")} value={f.shopName} onChange={set("shopName")} required />
        <Field icon={<Phone className="h-5 w-5" />} inputMode="tel" label={tr("Phone Number")} placeholder={tr("Enter your phone number")} type="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} required />
        <Field icon={<Lock className="h-5 w-5" />} password label={tr("Password")} placeholder={tr("Create a password")} autoComplete="new-password" error={err.password} value={f.password} onChange={set("password")} required />
        <Field icon={<Lock className="h-5 w-5" />} password label={tr("Confirm Password")} placeholder={tr("Re-enter your password")} autoComplete="new-password" error={err.confirm} value={f.confirm} onChange={set("confirm")} required />
        <div className="space-y-1">
        <label htmlFor="signup-currency" className="block text-[13px] font-semibold text-foreground">{tr("Currency")}</label>
        <select id="signup-currency" value={f.currency} onChange={set("currency")}
          className="h-12 w-full rounded-xl border border-input bg-card px-3.5 font-medium outline-none focus:border-primary">
          <option value="KSh">KSh – {tr("Kenyan Shilling")}</option>
          <option value="USh">USh – {tr("Ugandan Shilling")}</option>
          <option value="TSh">TSh – {tr("Tanzanian Shilling")}</option>
          <option value="USD">USD – {tr("US Dollar")}</option>
        </select>
        </div>
        <label className="flex items-start gap-2 pt-1 text-sm">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
          {tr("I agree to the Terms & Conditions and Privacy Policy")}
        </label>
        {err.agree && <p role="alert" className="text-xs font-medium text-destructive">{err.agree}</p>}
        <ShopButton type="submit">{tr("Create Account")} →</ShopButton>
        <p className="pt-1 text-center text-sm">{tr("Already have an account?")} <Link to="/" className="font-semibold text-primary">{tr("Log In")}</Link></p>
      </form>
    </main>
  );
}

