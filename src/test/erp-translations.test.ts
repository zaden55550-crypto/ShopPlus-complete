import { describe, expect, it } from "vitest";
import { LANGS } from "../lib/i18n";
import { translateText } from "../lib/interface-translations";

describe("ERP translations", () => {
  it("translates every principal working screen label into all selector languages", () => {
    for (const lang of LANGS.filter(l => l !== "English")) {
      for (const text of ["Products", "Stock value", "Today's sales", "Confirm Sale", "Customers", "Expected Cash", "AI Reorder", "Recommend reorder", "Confirm Stock In"]) {
        expect(translateText(lang, text), `${lang}: ${text}`).not.toBe(text);
      }
    }
  });
  it("preserves business names and quantities in localized stock errors", () => {
    const value = translateText("French", "Not enough stock for USB-C Cable (available 10)");
    expect(value).toContain("USB-C Cable"); expect(value).toContain("10"); expect(value).not.toContain("Not enough stock");
  });
  it("handles canonical upper-case movement codes", () => {
    expect(translateText("Spanish", "STOCK OUT")).not.toBe("STOCK OUT");
  });
});