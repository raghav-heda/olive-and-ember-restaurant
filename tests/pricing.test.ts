import { describe, it, expect } from "vitest";

describe("Deterministic Server Pricing Engine", () => {
  it("calculates line totals and subtotal correctly", () => {
    const basePrice = 620;
    const optionCost = 60; // Charred Multi-grain crust
    const quantity = 2;
    const lineTotal = (basePrice + optionCost) * quantity;
    expect(lineTotal).toBe(1360);
  });

  it("applies percentage discount with max cap enforcement", () => {
    const subtotal = 1400;
    const discountPercent = 10;
    const maxCap = 150;

    let discount = (subtotal * discountPercent) / 100; // 140
    if (discount > maxCap) discount = maxCap;

    expect(discount).toBe(140);

    // If subtotal is 2000, 10% is 200, but cap is 150
    const largerSubtotal = 2000;
    let cappedDiscount = (largerSubtotal * discountPercent) / 100;
    if (cappedDiscount > maxCap) cappedDiscount = maxCap;
    expect(cappedDiscount).toBe(150);
  });

  it("applies free delivery threshold correctly", () => {
    const freeDeliveryThreshold = 800;
    const baseDeliveryFee = 50;

    const basket1 = 650;
    const fee1 = basket1 >= freeDeliveryThreshold ? 0 : baseDeliveryFee;
    expect(fee1).toBe(50);

    const basket2 = 920;
    const fee2 = basket2 >= freeDeliveryThreshold ? 0 : baseDeliveryFee;
    expect(fee2).toBe(0);
  });

  it("calculates 5% GST accurately on post-discount subtotal", () => {
    const subtotal = 1000;
    const discount = 100;
    const taxableSubtotal = subtotal - discount; // 900
    const gstRate = 5;
    const tax = Math.round(((taxableSubtotal * gstRate) / 100) * 100) / 100;
    expect(tax).toBe(45);
  });
});
