import { describe, it, expect, beforeAll, afterAll } from "vitest";
import prisma from "@/lib/db";
import { calculateOrderPricing } from "@/lib/pricing";

describe("Server-Side Order Pricing & Coupon Enforcement", () => {
  let restaurantId: string;
  let availableItem: any;

  beforeAll(async () => {
    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) throw new Error("Seed database before running tests");
    restaurantId = restaurant.id;

    availableItem = await prisma.menuItem.findFirst({
      where: { restaurantId, isAvailable: true },
      include: { options: { include: { values: true } } },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("calculates exact subtotal, 5% GST, and delivery fees on server", async () => {
    const result = await calculateOrderPricing({
      restaurantId,
      items: [
        {
          menuItemId: availableItem.id,
          quantity: 2,
        },
      ],
      fulfilmentType: "PICKUP",
    });

    const expectedSubtotal = availableItem.basePrice * 2;
    expect(result.subtotal).toBe(expectedSubtotal);
    expect(result.deliveryFee).toBe(0); // Pickup has no delivery fee

    const expectedTax = Math.round(((expectedSubtotal * 5) / 100) * 100) / 100;
    expect(result.taxTotal).toBe(expectedTax);
    expect(result.finalTotal).toBe(expectedSubtotal + expectedTax);
  });

  it("applies valid active coupon code EMBER10 with 10% discount", async () => {
    const result = await calculateOrderPricing({
      restaurantId,
      items: [
        {
          menuItemId: availableItem.id,
          quantity: 3, // Ensures total exceeds minOrderValue of 500
        },
      ],
      fulfilmentType: "PICKUP",
      couponCode: "EMBER10",
    });

    expect(result.appliedCoupon).toBeDefined();
    expect(result.appliedCoupon?.code).toBe("EMBER10");
    expect(result.discountTotal).toBeGreaterThan(0);
    expect(result.finalTotal).toBeLessThan(result.subtotal + result.taxTotal);
  });

  it("gracefully rejects non-existent or invalid coupon codes without crashing", async () => {
    const result = await calculateOrderPricing({
      restaurantId,
      items: [
        {
          menuItemId: availableItem.id,
          quantity: 2,
        },
      ],
      fulfilmentType: "PICKUP",
      couponCode: "FAKE_INVALID_PROMO_999",
    });

    expect(result.appliedCoupon).toBeUndefined();
    expect(result.discountTotal).toBe(0);
  });

  it("rejects ordering when cart contains an unavailable/sold-out item", async () => {
    // Create temporary sold-out item
    const soldOutItem = await prisma.menuItem.create({
      data: {
        restaurantId,
        categoryId: availableItem.categoryId,
        name: "Test Sold Out Dish",
        slug: `sold-out-${Date.now()}`,
        description: "Test dish",
        basePrice: 500,
        isAvailable: false,
      },
    });

    await expect(
      calculateOrderPricing({
        restaurantId,
        items: [
          {
            menuItemId: soldOutItem.id,
            quantity: 1,
          },
        ],
        fulfilmentType: "PICKUP",
      })
    ).rejects.toThrow(/unavailable and cannot be ordered/i);

    // Clean up
    await prisma.menuItem.delete({ where: { id: soldOutItem.id } });
  });
});
