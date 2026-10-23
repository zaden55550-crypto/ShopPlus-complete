import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CartSheet } from "@/components/shopbook/cart-sheet";
import * as erp from "@/lib/erp";

afterEach(cleanup);
function setup() {
  const s = erp.empty();
  s.products.push({ id: "flour", name: "Ajab Flour", buy: 100, sell: 300, qty: 10, unit: "kg", createdAt: 1 });
  const setLine = vi.fn(), saveDraft = vi.fn(), close = vi.fn();
  render(<CartSheet s={s} cart={[{ productId: "flour", qty: 0.5, price: 200, priceReason: "wholesale" }]} money={(n) => `KSh ${n}`} tr={(x) => x} setLine={setLine} remove={vi.fn()} clear={vi.fn()} close={close} next={vi.fn()} saveDraft={saveDraft} />);
  return { setLine, saveDraft, close };
}
describe("shared reference cart", () => {
  it("allows a manual amount without changing quantity or the product price", () => {
    const { setLine } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Switch entry mode Ajab Flour" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Amount Ajab Flour" }), { target: { value: "85.50" } });
    expect(setLine).toHaveBeenCalledWith({ productId: "flour", qty: 0.5, price: 171, priceReason: "wholesale" });
  });
  it("blocks saving and checkout while a manual amount is invalid", () => {
    const { setLine } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Switch entry mode Ajab Flour" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Amount Ajab Flour" }), { target: { value: "-1" } });
    expect(setLine).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Proceed to Checkout" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Save Cart" })).toBeDisabled();
  });
  it("opens the quantity keypad and preserves the line price override", () => {
    const { setLine } = setup();
    expect(screen.getByText("Subtotal (1 items)")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Edit quantity Ajab Flour" }));
    for (const key of ["0", ".", "2", "5"]) fireEvent.click(screen.getByRole("button", { name: key }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(setLine).toHaveBeenCalledWith({ productId: "flour", qty: 0.25, price: 200, priceReason: "wholesale" });
  });
  it("blocks over-stock quantity and lets Cancel keep the original line", () => {
    const { setLine } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Edit quantity Ajab Flour" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Quantity" }), { target: { value: "11" } });
    expect(screen.getByRole("button", { name: "Done" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(setLine).not.toHaveBeenCalled();
  });
  it("saves only the draft and closes the cart", () => {
    const { saveDraft, close, setLine } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Save Cart" }));
    expect(saveDraft).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
    expect(setLine).not.toHaveBeenCalled();
  });
  it("steps quantity up and down with the − and + buttons", () => {
    const { setLine } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Increase quantity Ajab Flour" }));
    expect(setLine).toHaveBeenLastCalledWith({ productId: "flour", qty: 0.75, price: 200, priceReason: "wholesale" });
    fireEvent.click(screen.getByRole("button", { name: "Decrease quantity Ajab Flour" }));
    expect(setLine).toHaveBeenLastCalledWith({ productId: "flour", qty: 0.25, price: 200, priceReason: "wholesale" });
  });
  it("removes the line when decreased to zero and blocks stepping past stock", () => {
    const remove = vi.fn(), setLine = vi.fn();
    const s = erp.empty();
    s.products.push({ id: "flour", name: "Ajab Flour", buy: 100, sell: 300, qty: 10, unit: "kg", createdAt: 1 });
    render(<CartSheet s={s} cart={[{ productId: "flour", qty: 0.25 }]} money={(n) => `KSh ${n}`} tr={(x) => x} setLine={setLine} remove={remove} clear={vi.fn()} close={vi.fn()} next={vi.fn()} saveDraft={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Decrease quantity Ajab Flour" }));
    expect(remove).toHaveBeenCalledWith("flour");
  });
  it("stops stepping when the stock on hand is reached", () => {
    const setLine = vi.fn();
    const s = erp.empty();
    s.products.push({ id: "flour", name: "Ajab Flour", buy: 100, sell: 300, qty: 10, unit: "kg", createdAt: 1 });
    render(<CartSheet s={s} cart={[{ productId: "flour", qty: 10 }]} money={(n) => `KSh ${n}`} tr={(x) => x} setLine={setLine} remove={vi.fn()} clear={vi.fn()} close={vi.fn()} next={vi.fn()} saveDraft={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Increase quantity Ajab Flour" }));
    expect(setLine).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Decrease quantity Ajab Flour" }));
    expect(setLine).toHaveBeenCalledWith({ productId: "flour", qty: 9.75 });
  });
});
describe("amount mode", () => {
  it("turns the amount spent into a quantity at the unit price", () => {
    const { setLine } = setup();
    fireEvent.change(screen.getByRole("textbox", { name: "Amount to spend Ajab Flour" }), { target: { value: "0" } });
    expect(setLine).not.toHaveBeenCalled();
  });
});
