import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SampleData } from "@/components/shopbook/sample-data";
import { empty, load } from "@/lib/erp";
import { isDemo, loadDemoData } from "@/lib/demo";

afterEach(() => { cleanup(); localStorage.clear(); });
describe("Settings sample data", () => {
  it("requires test-shop confirmation before loading 25 sample products", () => {
    localStorage.clear();
    render(<SampleData tr={(s) => s} shopName="Test Shop" />);
    fireEvent.click(screen.getByRole("button", { name: /^Load sample data$/ }));
    const confirm = screen.getByRole("button", { name: "Confirm load sample data" });
    expect(confirm).toBeDisabled();
    expect(load().products).toHaveLength(0);
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(confirm);
    expect(load().products).toHaveLength(25);
    expect(isDemo()).toBe(true);
    expect(screen.getByRole("button", { name: /^Load sample data$/ })).toBeDisabled();
  });
  it("rejects a shop containing other contacts without overwriting any records", () => {
    const state = empty();
    state.otherContacts.push({ id: "real-contact", name: "Existing contact", createdAt: 1 });
    const before = JSON.stringify(state);
    localStorage.setItem("shopbook.erp", before);
    render(<SampleData tr={(s) => s} shopName="Real Shop" />);
    expect(screen.getByRole("button", { name: /^Load sample data$/ })).toBeDisabled();
    expect(() => loadDemoData()).toThrow("Demo data can only be loaded into an empty shop");
    expect(localStorage.getItem("shopbook.erp")).toBe(before);
    expect(isDemo()).toBe(false);
  });
  it("rechecks records when confirmation is submitted", () => {
    localStorage.clear();
    render(<SampleData tr={(s) => s} shopName="Test Shop" />);
    fireEvent.click(screen.getByRole("button", { name: /^Load sample data$/ }));
    fireEvent.click(screen.getByRole("checkbox"));
    const state = empty();
    state.categories.push({ id: "new-category", name: "Real category" });
    const before = JSON.stringify(state);
    localStorage.setItem("shopbook.erp", before);
    fireEvent.click(screen.getByRole("button", { name: "Confirm load sample data" }));
    expect(localStorage.getItem("shopbook.erp")).toBe(before);
    expect(isDemo()).toBe(false);
  });
});