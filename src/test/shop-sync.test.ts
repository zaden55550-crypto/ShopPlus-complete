import { describe, expect, it } from "vitest";
import { empty } from "../lib/erp";
import { mergeErp } from "../lib/shop-sync";
describe("phone sync merge", () => {
  it("keeps sales/purchases/expenses from both phones without duplicates", () => {
    const a = empty(), b = empty();
    a.sales = [{ id: "s1", at: 1 } as never]; b.sales = [{ id: "s1", at: 1 } as never, { id: "s2", at: 2 } as never];
    a.expenses = [{ id: "e1", at: 3 } as never]; b.purchases = [{ id: "p1", at: 4 } as never]; a.seq = { SL: 2 }; b.seq = { SL: 5, EXP: 1 };
    const m = mergeErp(a, b);
    expect(m.sales.map((x) => x.id)).toEqual(["s2", "s1"]); expect(m.expenses).toHaveLength(1); expect(m.purchases).toHaveLength(1); expect(m.seq).toEqual({ SL: 5, EXP: 1 });
  });
});
