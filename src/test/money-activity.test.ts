import { beforeEach, describe, expect, it } from "vitest";
import * as erp from "@/lib/erp";
import * as fin from "@/lib/finance";
import { cashFlow, financialActivity, moneyActivity } from "@/lib/money-activity";
import { profitAndLoss } from "@/lib/accounting";

describe("Accounting and Float shared activity", () => {
  beforeEach(() => localStorage.clear());
  it("shows a sale once and reflects every actual payment account", () => {
    const product = erp.addProduct({ name: "Phone", buy: 40, sell: 100, qty: 5 });
    const customer = erp.addCustomer("Brian");
    const sale = erp.confirmSale({ cart: [{ productId: product.id, qty: 1 }], discount: 0, pay: { cash: 20, mpesa: 30, bank: 10, credit: 40 }, customerId: customer.id, channel: "Sales" });
    erp.receiveDebt(customer.id, 10, "bank");
    const s = erp.load();
    expect(financialActivity(s).filter((x) => x.ref === sale.ref)).toHaveLength(1);
    expect(moneyActivity(s)).toHaveLength(4);
    expect(fin.floatBalances(s)).toEqual({ cash: 20, mpesa: 30, bank: 20 });
    expect(s.customers[0]?.balance).toBe(30);
    expect(financialActivity(s).some((x) => x.method.includes("P.PAY"))).toBe(false);
  });
  it("internal transfers preserve total money and profit", () => {
    fin.floatDeposit("bank", 100, "DEPOSIT", "Owner capital");
    fin.floatTransfer("bank", "mpesa", 30);
    const s = erp.load();
    expect(fin.floatBalances(s)).toEqual({ cash: 0, mpesa: 30, bank: 70 });
    expect(cashFlow(s, 0).net).toBe(100);
    expect(profitAndLoss(s).net).toBeCloseTo(0);
  });
  it("cash-up retains the reason and rejects invalid counts atomically", () => {
    erp.cashEvent("OPENING", 50);
    erp.cashUp(48, "Counted twice; short 2");
    expect(erp.load().cash[0]?.note).toBe("Counted twice; short 2");
    const before = JSON.stringify(erp.load());
    expect(() => erp.cashUp(Infinity)).toThrow();
    expect(JSON.stringify(erp.load())).toBe(before);
  });
});