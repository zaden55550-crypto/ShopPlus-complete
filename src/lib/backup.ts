// Whole-device backups exclude passwords, sessions and entitlement data.
import { commit, empty, load, type ErpState } from "@/lib/erp";
const KEY = "shopbook.erp";
const LAST = "shopbook.lastBackup";
export const BACKUP_KEYS = ["shopbook.purchaseDrafts", "shopbook.savedReports", "shopbook.uiSize", "shopbook.tax", "shopbook.theme", "shopbook.language", "shopbook.settings", "shopbook.importHistory", "shopbook.reconcile"] as const;
export function snapshot(shop: string) {
  const a = JSON.parse(localStorage.getItem("shopbook.account") || "null");
  return { app: "SHOPBOOK", version: 2, shop, at: Date.now(), data: load(), settings: Object.fromEntries(BACKUP_KEYS.map((k) => [k, localStorage.getItem(k)])), business: a ? { shopName: a.shopName, currency: a.currency, logo: a.logo } : null };
}
export function backupJson(shop: string) { return JSON.stringify(snapshot(shop)); }
export const lastBackup = () => Number(localStorage.getItem(LAST) || 0);
const object = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);
export function validateBackup(value: unknown): asserts value is ReturnType<typeof snapshot> {
  if (!object(value) || value["app"] !== "SHOPBOOK" || !object(value["data"])) throw new Error("This is not a SHOPBOOK backup file");
  const d = value["data"];
  for (const key of Object.keys(empty())) {
    const rows = d[key];
    if (key === "seq") { if (rows !== undefined && (!object(rows) || Object.values(rows).some((n) => typeof n !== "number" || !Number.isInteger(n) || n < 0))) throw new Error("Backup file is damaged"); continue; }
    if (rows === undefined && key !== "products") continue;
    if (!Array.isArray(rows) || rows.some((x) => !object(x) || typeof x["id"] !== "string")) throw new Error("Backup file is damaged");
    const ids = rows.map((x) => x["id"]); if (new Set(ids).size !== ids.length) throw new Error("Backup file has duplicate records");
  }
  const check = (x: unknown) => { if (typeof x === "number" && !Number.isFinite(x)) throw new Error("Backup file is damaged"); if (Array.isArray(x)) x.forEach(check); else if (object(x)) Object.values(x).forEach(check); };
  check(d);
  const required: Record<string, string[]> = { products: ["qty", "buy", "sell"], customers: ["balance"], suppliers: ["balance"], sales: ["total", "subtotal", "discount"], purchases: ["total"], expenses: ["amount"], payments: ["amount"], cash: ["amount"], payrolls: ["net", "paid", "salary", "commission", "deductions"], payrollPayments: ["amount"], commissions: ["amount"], movements: ["qty", "prev", "next"], employees: ["salary"] };
  for (const [key, fields] of Object.entries(required)) for (const x of (d[key] ?? []) as Record<string, unknown>[]) if (fields.some((f) => typeof x[f] !== "number")) throw new Error("Backup file is damaged");
  for (const key of ["sales", "purchases"]) for (const x of (d[key] ?? []) as Record<string, unknown>[]) {
    if (!Array.isArray(x["items"]) || !object(x["pay"]) || ["cash", "mpesa", "bank", "credit"].some((m) => typeof (x["pay"] as Record<string, unknown>)[m] !== "number")) throw new Error("Backup file is damaged");
    if (x["items"].some((i) => !object(i) || typeof i["productId"] !== "string" || typeof i["qty"] !== "number" || typeof i["returned"] !== "number")) throw new Error("Backup file is damaged");
  }
  for (const x of (d["employees"] ?? []) as Record<string, unknown>[]) if (!object(x["rule"]) || typeof x["rule"]["value"] !== "number") throw new Error("Backup file is damaged");
  if (value["settings"] !== undefined && (!object(value["settings"]) || Object.entries(value["settings"]).some(([k, v]) => !BACKUP_KEYS.some((x) => x === k) || (v !== null && typeof v !== "string")))) throw new Error("Backup settings are damaged");
  const business = value["business"];
  if (business !== undefined && business !== null && (!object(business) || typeof business["shopName"] !== "string" || typeof business["currency"] !== "string" || (business["logo"] !== undefined && typeof business["logo"] !== "string"))) throw new Error("Backup business details are damaged");
  if (object(value["settings"])) for (const [key, raw] of Object.entries(value["settings"])) {
    if (raw === null) continue;
    if (typeof raw !== "string") throw new Error("Backup settings are damaged");
    if (["shopbook.purchaseDrafts", "shopbook.savedReports", "shopbook.tax", "shopbook.settings", "shopbook.importHistory"].includes(key)) {
      let parsed: unknown; try { parsed = JSON.parse(raw); } catch { throw new Error("Backup settings are damaged"); }
      if (key === "shopbook.tax" ? !object(parsed) || typeof parsed["rate"] !== "number" || typeof parsed["on"] !== "boolean" : key === "shopbook.settings" ? !object(parsed) : !Array.isArray(parsed)) throw new Error("Backup settings are damaged");
    }
  }
}
export function restoreJson(text: string) {
  let f: unknown; try { f = JSON.parse(text); } catch { throw new Error("This is not a SHOPBOOK backup file"); }
  validateBackup(f);
  const keys: string[] = [KEY, "shopbook.account", ...BACKUP_KEYS];
  const previous = keys.map((k) => [k, localStorage.getItem(k)] as const);
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...empty(), ...f.data }));
    if (f.settings) for (const key of BACKUP_KEYS) { const v = f.settings[key]; if (v === null) localStorage.removeItem(key); else if (typeof v === "string") localStorage.setItem(key, v); }
    const account = JSON.parse(localStorage.getItem("shopbook.account") || "null");
    if (account && f.business) localStorage.setItem("shopbook.account", JSON.stringify({ ...account, shopName: f.business.shopName, currency: f.business.currency, logo: f.business.logo }));
    commit((_s, c) => c.audit("BACKUP RESTORED", new Date().toISOString()));
    window.dispatchEvent(new Event("shopbook-prefs")); window.dispatchEvent(new Event("shopbook-language"));
  } catch (e) { for (const [k, v] of previous) { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } throw e; }
}
