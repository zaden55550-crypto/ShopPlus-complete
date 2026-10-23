import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyUiSize, getUiSize, setUiSize } from "@/lib/prefs";

describe("whole-interface size", () => {
  beforeEach(() => localStorage.clear());

  it("scales from 50% to 200% and clamps outside that range", () => {
    const write = vi.spyOn(document.documentElement.style, "setProperty");
    for (const v of [0.5, 0.75, 1, 1.5, 2]) { setUiSize(v); expect(getUiSize()).toBe(v); expect(write).toHaveBeenLastCalledWith("zoom", String(v)); applyUiSize(); expect(write).toHaveBeenLastCalledWith("zoom", String(v)); }
    setUiSize(3); expect(getUiSize()).toBe(2);
    setUiSize(0.1); expect(getUiSize()).toBe(0.5);
    write.mockRestore();
  });

  it("does not change account or business records", () => {
    const records = JSON.stringify({ sales: [{ id: "sale-1", total: 3500 }] });
    localStorage.setItem("shopbook.erp", records);
    setUiSize(2); setUiSize(0.5); setUiSize(1);
    expect(localStorage.getItem("shopbook.erp")).toBe(records);
  });

  it("reads old named sizes and falls back safely", () => {
    localStorage.setItem("shopbook.uiSize", "Larger"); expect(getUiSize()).toBe(1.1);
    localStorage.setItem("shopbook.uiSize", "invalid"); expect(getUiSize()).toBe(1);
  });
});
