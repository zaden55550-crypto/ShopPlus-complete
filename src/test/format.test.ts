import { describe, expect, it } from "vitest";
import { clean } from "@/lib/format";
import { fmtKsh } from "@/lib/shopbook";
import { moneyFor } from "@/components/shopbook/selling";
describe("negative zero", () => {
  it("clean turns -0 and tiny values into 0", () => { expect(Object.is(clean(-0), 0)).toBe(true); expect(clean(-0.004)).toBe(0); expect(clean(-5)).toBe(-5); });
  it("money never shows -0", () => { expect(fmtKsh(-0)).toBe("KSh 0"); expect(moneyFor("KES")(-0.001)).toBe("KES 0"); expect(moneyFor("KES")(-0.004)).toBe("KES 0"); });
});
