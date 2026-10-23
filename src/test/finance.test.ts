import { describe, expect, it } from "vitest";
import { addProduct, addCustomer, confirmSale, load, receiveDebt } from "../lib/erp";
import { addExpense, addSupplier, confirmPurchase, floatBalances, floatDeposit, floatTransfer, paySupplier, purchaseTotals, returnPurchase } from "../lib/finance";
import { balanceSheet, balances, journal, profitAndLoss } from "../lib/accounting";

describe("Connected purchases, expenses, float and accounting", () => {
  it("one set of records drives stock, money, contacts and books", () => {
    localStorage.removeItem("shopbook.erp");
    const p = addProduct({ name: "Soap", buy: 50, sell: 100, qty: 0 });
    floatDeposit("mpesa", 1000, "DEPOSIT", "Capital");
    const sup = addSupplier("Bidco");
    const pur = confirmPurchase({ lines: [{ productId: p.id, qty: 20, cost: 60 }], pay: { cash: 0, mpesa: 700, bank: 0, credit: 500 }, supplierId: sup.id, updateCost: true });
    let s = load();
    expect(s.products[0]!.qty).toBe(20); expect(s.products[0]!.buy).toBe(60); expect(s.suppliers[0]!.balance).toBe(500);
    returnPurchase(pur.id, [{ productId: p.id, qty: 2 }], "credit");
    paySupplier(sup.id, 200, "mpesa");
    const cu = addCustomer("Amina");
    confirmSale({ cart: [{ productId: p.id, qty: 5 }], discount: 0, pay: { cash: 300, mpesa: 0, bank: 0, credit: 200 }, customerId: cu.id, channel: "POS" });
    receiveDebt(cu.id, 200, "mpesa");
    addExpense({ category: "Transport", amount: 100, method: "cash" });
    floatTransfer("mpesa", "bank", 100);
    expect(() => addExpense({ category: "Rent", amount: 99999, method: "bank" })).toThrow();
    s = load();
    expect(s.products[0]!.qty).toBe(13);
    expect(s.suppliers[0]!.balance).toBe(180);
    expect(floatBalances(s)).toEqual({ cash: 200, mpesa: 200, bank: 100 });
    const b = balances(journal(s));
    expect(b.cash.net).toBe(200); expect(b.mpesa.net).toBe(200); expect(b.bank.net).toBe(100);
    expect(purchaseTotals(s)).toMatchObject({ purchases: 1080, expenses: 100, payables: 180 });
    expect(profitAndLoss(s).net).toBe(500 - 300 - 100);
    expect(balanceSheet(s).balanced).toBe(true);
    localStorage.removeItem("shopbook.erp");
  });
});
