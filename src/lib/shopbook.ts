import { clean } from "@/lib/format";
// Local-only store for the screens-first phase (no backend yet).

export type PlanId = "basic" | "plus" | "business";
export type Tier = PlanId;

// Per the supplied assets: the dark ShopBot art is for light mode, the light art for dark mode.
// ShopBot: light mode shows the black logo (Shopbot_Dark), dark mode the white logo (Shopbot_Light).
export const chatIcons = { dark: "/icons/shop-plus/shopbot-light.png", light: "/icons/shop-plus/shopbot-dark.png" };

export const APPS: { id: string; name: string; icon: string; iconDark: string; tier: Tier }[] = [
  { id: "dashboard", name: "Dashboard", icon: "/icons/shop-plus/Dashboard.png", iconDark: "/icons/shop-plus/Dashboard.png", tier: "basic" },
  { id: "inventory", name: "Inventory", icon: "/icons/shop-plus/Inventory.png", iconDark: "/icons/shop-plus/Inventory.png", tier: "basic" },
  { id: "purchases", name: "Purchases", icon: "/icons/shop-plus/Purchases.png", iconDark: "/icons/shop-plus/Purchases.png", tier: "basic" },
  { id: "sales", name: "Sales", icon: "/icons/shop-plus/Sales.png", iconDark: "/icons/shop-plus/Sales.png", tier: "basic" },
  { id: "pos", name: "POS", icon: "/icons/shop-plus/POS.png", iconDark: "/icons/shop-plus/POS.png", tier: "basic" },
  { id: "expenses", name: "Expenses", icon: "/icons/shop-plus/Expenses.png", iconDark: "/icons/shop-plus/Expenses.png", tier: "plus" },
  { id: "contacts", name: "Contacts", icon: "/icons/shop-plus/Contacts.png", iconDark: "/icons/shop-plus/Contacts.png", tier: "plus" },
  { id: "float", name: "Float", icon: "/icons/shop-plus/Float.png", iconDark: "/icons/shop-plus/Float.png", tier: "plus" },
  { id: "accounting", name: "Accounting", icon: "/icons/shop-plus/Accounting.png", iconDark: "/icons/shop-plus/Accounting.png", tier: "plus" },
  { id: "payroll", name: "Payroll", icon: "/icons/shop-plus/Payroll.png", iconDark: "/icons/shop-plus/Payroll.png", tier: "business" },
  { id: "reports", name: "Reports", icon: "/icons/shop-plus/Reports.png", iconDark: "/icons/shop-plus/Reports.png", tier: "plus" },
  { id: "summary", name: "Summary", icon: "/icons/shop-plus/Summary.png", iconDark: "/icons/shop-plus/Summary.png", tier: "business" },
  { id: "settings", name: "Settings", icon: "/icons/shop-plus/Settings.png", iconDark: "/icons/shop-plus/Settings.png", tier: "basic" },
];

export const RING_ICONS = APPS.map((a) => a.iconDark);

export const PLANS: {
  id: PlanId;
  name: string;
  monthly: number;
  yearly: number;
  tagline: string;
  intro?: string;
  features: string[];
  best?: boolean;
}[] = [
  {
    id: "basic", name: "Basic", monthly: 1050, yearly: 1000, tagline: "Start selling.",
    features: ["Dashboard basic", "Inventory", "Purchases", "Sales", "POS", "Basic products", "Basic history", "Basic settings"],
  },
  {
    id: "plus", name: "Plus", monthly: 2100, yearly: 2000, tagline: "Manage your growing shop.", intro: "Everything in Basic, plus:",
    features: ["Inventory", "Contacts", "Accounting", "Float", "Returns", "Credit & partial", "Cash-up (end of day)", "Reports", "Settings (advanced)"],
  },
  {
    id: "business", name: "Business", monthly: 4200, yearly: 4000, tagline: "Run the whole business.", intro: "Everything in Plus, plus:", best: true,
    features: ["Payroll", "Summary", "Advanced analytics", "Advanced AI", "Advanced permissions", "Multi-shop", "Advanced integrations", "Custom reports", "Priority support", "Full settings access"],
  },
];

const RANK: Record<Tier, number> = { basic: 1, plus: 2, business: 3 };

export type Account = {
  shopName: string;
  email: string;
  phone?: string;
  language?: string;
  currency: string;
  logo?: string | undefined;
  password: string; // screens-only phase; replaced by real auth later
  plan?: PlanId | "trial";
  trialStart?: number;
};

const KEY = "shopbook.account";
const SESSION = "shopbook.session";

export const store = {
  get(): Account | null {
    if (typeof window === "undefined") return null;
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
  },
  save(a: Account) { localStorage.setItem(KEY, JSON.stringify(a)); },
  update(p: Partial<Account>) { const a = store.get(); if (a) store.save({ ...a, ...p }); },
  signIn() { localStorage.setItem(SESSION, "1"); },
  signOut() { localStorage.removeItem(SESSION); },
  signedIn() { return typeof window !== "undefined" && localStorage.getItem(SESSION) === "1"; },
};

export function trialDaysLeft(a: Account | null) {
  if (!a?.trialStart) return 0;
  return Math.max(0, 30 - Math.floor((Date.now() - a.trialStart) / 86400000));
}

export function canOpen(a: Account | null, tier: Tier) {
  if (!a?.plan) return false;
  if (a.plan === "trial") return trialDaysLeft(a) > 0;
  return RANK[a.plan] >= RANK[tier];
}

export const fmtKsh = (n: number) => `KSh ${clean(n).toLocaleString("en-KE")}`;



