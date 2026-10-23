// Demo seed: builds the TechPoint Electronics test shop by calling the SAME ERP actions
// a real user triggers (addProduct, confirmSale, confirmPurchase, ...). Nothing is written
// directly, so stock movements, payments, commission, audit and accounting are all genuine.
// Real shops start with zero sample data; demo data only loads on an empty device on request.
import {
  addCustomer, addEmployee, addNamed, addProduct, adjustStock, cashUp, cashSession, commit, confirmPayroll,
  confirmSale, createTransfer, load, payPayroll, receiveDebt, returnSale, type Method,
} from "@/lib/erp";
import { addExpense, addExpenseCategory, addSupplier, confirmPurchase, floatDeposit, floatTransfer, paySupplier, expenseCategories } from "@/lib/finance";
import { backupJson } from "@/lib/backup";

const KEY = "shopbook.erp";
const FLAG = "shopbook.demo";
const BACKUP = "shopbook.demo.backup";

export const isDemo = () => typeof window !== "undefined" && localStorage.getItem(FLAG) === "1";
/** True when this device has no business records at all. */
export function isEmptyShop() {
  const s = load();
  return Object.entries(s).every(([key, value]) => key === "audit" || !Array.isArray(value) || value.length === 0);
}

const P = (cash = 0, mpesa = 0, bank = 0, credit = 0): Record<Method, number> => ({ cash, mpesa, bank, credit });

// SKU, name, category, brand, buy, sell, qty, reorder
const PRODUCTS: [string, string, string, string, number, number, number, number][] = [
  ["TEL-001", "Samsung Galaxy A16 128GB", "Smartphones", "Samsung", 18500, 22500, 12, 5],
  ["TEL-002", "Redmi Note 14 256GB", "Smartphones", "Xiaomi", 19500, 24000, 8, 4],
  ["TEL-003", "iPhone 13 128GB", "Smartphones", "Apple", 62000, 69500, 5, 2],
  ["TEL-004", "iPhone 15 128GB", "Smartphones", "Apple", 88000, 98000, 3, 2],
  ["TEL-005", "Tecno Spark 30", "Smartphones", "Tecno", 13500, 17000, 15, 5],
  ["LAP-001", "HP 250 G10 Core i5", "Laptops", "HP", 62000, 72000, 6, 2],
  ["LAP-002", "Lenovo IdeaPad 3", "Laptops", "Lenovo", 55000, 65000, 4, 2],
  ["LAP-003", "Dell Latitude 5440", "Laptops", "Dell", 72000, 84000, 2, 2],
  ["MON-001", "Samsung 24\" Monitor", "Monitors", "Samsung", 15000, 19500, 7, 3],
  ["MON-002", "LG 27\" Monitor", "Monitors", "LG", 24000, 30000, 2, 3],
  ["ACC-001", "Logitech Wireless Mouse", "Accessories", "Logitech", 1800, 2800, 25, 8],
  ["ACC-002", "Logitech K120 Keyboard", "Accessories", "Logitech", 1200, 1800, 30, 10],
  ["ACC-003", "USB-C 20W Charger", "Chargers", "Generic", 650, 1200, 40, 10],
  ["ACC-004", "25W Samsung Charger", "Chargers", "Samsung", 1500, 2500, 18, 6],
  ["ACC-005", "HDMI Cable 2m", "Cables", "Generic", 500, 1000, 35, 10],
  ["ACC-006", "USB-C Cable 1m", "Cables", "Generic", 300, 700, 50, 15],
  ["ACC-007", "10,000mAh Power Bank", "Power Banks", "Oraimo", 1800, 3000, 12, 5],
  ["ACC-008", "20,000mAh Power Bank", "Power Banks", "Oraimo", 2800, 4500, 3, 4],
  ["AUD-001", "JBL Go 4 Speaker", "Audio", "JBL", 5500, 7500, 9, 3],
  ["AUD-002", "JBL Tune 520BT", "Audio", "JBL", 5000, 7000, 2, 3],
  ["AUD-003", "Oraimo FreePods", "Audio", "Oraimo", 2200, 3500, 0, 4],
  ["NET-001", "TP-Link Wi-Fi Router", "Networking", "TP-Link", 3800, 5500, 10, 3],
  ["NET-002", "TP-Link 8-Port Switch", "Networking", "TP-Link", 2500, 4000, 6, 2],
  ["STO-001", "64GB Flash Disk", "Storage", "SanDisk", 900, 1500, 20, 5],
  ["STO-002", "128GB Flash Disk", "Storage", "SanDisk", 1600, 2500, 1, 4],
];
// Placeholder digits fill the "XXXX" part of the supplied barcodes so each one is scannable and unique.
const PREFIX = ["880609", "694181", "194253", "195949", "489518", "019749", "019680", "539718", "880609", "880608", "097855", "097855", "690123", "880609", "690123", "690123", "694090", "694090", "120013", "120013", "694090", "693536", "693536", "619659", "619659"];

function seed() {
  // Money accounts (opening balances)
  floatDeposit("cash", 80000, "DEPOSIT", "Opening balance");
  floatDeposit("mpesa", 120000, "DEPOSIT", "Opening balance");
  floatDeposit("bank", 350000, "DEPOSIT", "Opening balance");

  // Products
  const cats = [...new Set(PRODUCTS.map((p) => p[2]))], brands = [...new Set(PRODUCTS.map((p) => p[3]))];
  cats.forEach((n) => addNamed("categories", n)); brands.forEach((n) => addNamed("brands", n));
  const st = load();
  const id: Record<string, string> = {};
  PRODUCTS.forEach(([sku, name, cat, brand, buy, sell, qty, min], i) => {
    const p = addProduct({ sku, name, buy, sell, qty, minStock: min, unit: "pcs", barcode: `${PREFIX[i]}0000${String(i + 1).padStart(3, "0")}`,
      categoryId: st.categories.find((c) => c.name === cat)?.id, brandId: st.brands.find((b) => b.name === brand)?.id });
    id[sku] = p.id;
  });
  const c = (sku: string, qty = 1) => ({ productId: id[sku]!, qty });

  // Customers & suppliers
  const brian = addCustomer("Brian Otieno", "0711 234 567"), aisha = addCustomer("Aisha Hassan", "0722 345 678");
  const kevin = addCustomer("Kevin Kamau", "0733 456 789"), mary = addCustomer("Mary Wanjiku", "0744 567 890");
  addCustomer("David Kiptoo", "0755 678 901");
  const nmd = addSupplier("Nairobi Mobile Distributors", "0700 111 222"), eac = addSupplier("East Africa Computers Ltd", "0700 222 333");
  const dak = addSupplier("Digital Accessories Kenya", "0700 333 444"); addSupplier("TP-Link Kenya Distributors", "0700 444 555");

  // Employees
  addEmployee({ name: "James Mwangi", role: "Admin", comp: "salary", salary: 80000, rule: { kind: "none", value: 0, paidOnly: false } });
  const peter = addEmployee({ name: "Peter Kamau", role: "Seller", comp: "salary+commission", salary: 30000, rule: { kind: "percent", value: 2, paidOnly: false } });
  const grace = addEmployee({ name: "Grace Wanjiku", role: "Seller", comp: "commission", salary: 0, rule: { kind: "percent", value: 3, paidOnly: false } });
  addEmployee({ name: "John Otieno", role: "Supervisor", comp: "salary", salary: 50000, rule: { kind: "none", value: 0, paidOnly: false } });

  // Sales S-000001 … S-000007
  const s1 = confirmSale({ cart: [c("TEL-001")], discount: 0, pay: P(22500), customerId: brian.id, channel: "Sales" });
  confirmSale({ cart: [c("TEL-003")], discount: 0, pay: P(0, 50000, 0, 19500), customerId: aisha.id, channel: "Sales" });
  confirmSale({ cart: [c("AUD-001")], discount: 0, pay: P(0, 7500), channel: "POS" });
  confirmSale({ cart: [c("TEL-002")], discount: 0, pay: P(10000, 0, 0, 14000), customerId: mary.id, channel: "Sales" });
  confirmSale({ cart: [c("ACC-001")], discount: 0, pay: P(2800), customerId: kevin.id, channel: "POS" });
  confirmSale({ cart: [c("ACC-006")], discount: 0, pay: P(300, 400), channel: "POS" });
  const s7 = confirmSale({ cart: [c("ACC-006", 2)], discount: 0, pay: P(1400), channel: "POS" });
  confirmSale({ cart: [c("ACC-004")], discount: 0, pay: P(2500), channel: "POS" }); // 3rd anonymous sale

  // Purchases
  confirmPurchase({ lines: [{ productId: id["TEL-001"]!, qty: 10, cost: 18500 }], pay: P(0, 100000, 0, 85000), supplierId: nmd.id, updateCost: false });
  confirmPurchase({ lines: [{ productId: id["LAP-001"]!, qty: 5, cost: 62000 }], pay: P(0, 0, 190000, 120000), supplierId: eac.id, updateCost: false });
  confirmPurchase({ lines: [{ productId: id["ACC-006"]!, qty: 30, cost: 300 }, { productId: id["ACC-005"]!, qty: 20, cost: 500 }], pay: P(19000), supplierId: dak.id, updateCost: false });

  // Expenses
  const have = expenseCategories(load());
  ["Utilities", "Maintenance", "Marketing", "Security"].forEach((n) => { if (!have.includes(n)) addExpenseCategory(n); });
  ([["Rent", 45000, "bank", "Shop Rent"], ["Utilities", 8500, "mpesa", "Electricity"], ["Internet", 5000, "mpesa", "Internet"], ["Transport", 4500, "cash", "Transport"],
    ["Maintenance", 2000, "cash", "Shop Cleaning"], ["Marketing", 12000, "mpesa", "Advertising"], ["Security", 7500, "cash", "Security"]] as [string, number, Method, string][])
    .forEach(([category, amount, method, note]) => addExpense({ category, amount, method, note }));

  // Float: transfer, capital, owner withdrawal
  floatTransfer("cash", "bank", 10000);
  floatDeposit("bank", 200000, "DEPOSIT", "Capital in: owner additional capital");
  floatDeposit("bank", 20000, "WITHDRAWAL", "Owner personal withdrawal");

  // Returns: full refund on S-000001, genuine partial return on S-000007
  returnSale(s1.id, [c("TEL-001")], "mpesa");
  returnSale(s7.id, [c("ACC-006")], "cash");

  // Credit test (HP laptop, then KSh 10,000 payment) and mixed payment test
  confirmSale({ cart: [c("LAP-001")], discount: 0, pay: P(40000, 0, 0, 32000), customerId: brian.id, channel: "Sales" });
  receiveDebt(brian.id, 10000, "cash");
  confirmSale({ cart: [c("ACC-008", 2), c("ACC-005")], discount: 0, pay: P(3000, 4000, 0, 3000), customerId: brian.id, channel: "POS" });

  // Supplier credit test
  paySupplier(eac.id, 50000, "bank");

  // Commission tests: KSh 50,000 by Peter (2%), KSh 30,000 by Grace (3%)
  confirmSale({ cart: [c("LAP-002")], discount: 15000, pay: P(0, 50000), channel: "POS", sellerId: peter.id });
  confirmSale({ cart: [c("TEL-005", 2)], discount: 4000, pay: P(0, 30000), channel: "POS", sellerId: grace.id });

  // Stock adjustment & transfer (transfer stays pending until sent and received)
  adjustStock(id["AUD-001"]!, load().products.find((p) => p.id === id["AUD-001"])!.qty - 1, "Damaged item");
  createTransfer(id["ACC-006"]!, 10, "Store Room", "Main Shop");

  // Payroll October 2026, paid by M-Pesa (topped up from Bank first)
  floatTransfer("bank", "mpesa", 150000);
  const from = new Date(2026, 9, 1).getTime(), to = new Date(2026, 9, 31, 23, 59).getTime();
  load().employees.forEach((e) => { const run = confirmPayroll(e.id, from, to, 0); if (run.net > 0) payPayroll(run.id, "mpesa", run.net); });

  // Daily cash-up with a KSh 1,000 shortage
  cashUp(cashSession(load()).expected - 1000);
}

function wipe() {
  localStorage.removeItem(KEY);
}

/** Loads the sample shop. Refuses if the device already has real records. */
export function loadDemoData() {
  if (!isEmptyShop()) throw new Error("Demo data can only be loaded into an empty shop");
  const previous = localStorage.getItem(KEY), previousFlag = localStorage.getItem(FLAG);
  try {
    localStorage.setItem(FLAG, "1");
    seed();
    commit((_s, c) => c.audit("DEMO DATA LOADED", "TechPoint Electronics sample dataset"));
  } catch (e) {
    if (previous === null) wipe(); else localStorage.setItem(KEY, previous);
    if (previousFlag === null) localStorage.removeItem(FLAG); else localStorage.setItem(FLAG, previousFlag);
    window.dispatchEvent(new Event("shopbook-erp"));
    throw e;
  }
}

/** Admin-only. Works only on a demo device: backs up, clears the demo records, reseeds, logs it. */
export function resetDemoData(shop: string) {
  if (!isDemo()) throw new Error("Reset is only available for demo data");
  const previous = localStorage.getItem(KEY);
  localStorage.setItem(BACKUP, backupJson(shop));
  try {
    wipe(); seed();
    commit((_s, c) => c.audit("DEMO DATA RESET", "Sample dataset recreated"));
  } catch (e) { if (previous) localStorage.setItem(KEY, previous); throw e; }
}

/** Removes demo records so the shop can start for real. */
export function clearDemoData(shop: string) {
  if (!isDemo()) throw new Error("Reset is only available for demo data");
  localStorage.setItem(BACKUP, backupJson(shop));
  wipe(); localStorage.removeItem(FLAG);
  commit((_s, c) => c.audit("DEMO DATA REMOVED", "Shop is ready for real records"));
}
