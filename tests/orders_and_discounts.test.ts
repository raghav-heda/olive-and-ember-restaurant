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

  describe("WELCOME100 First-Time Customer Enforcement", () => {
    const testPhone = "+91 99887 76655";
    const testEmail = "welcome.test.guest@example.com";
    let testOrderId: string | undefined;

    afterAll(async () => {
      if (testOrderId) {
        await prisma.order.deleteMany({
          where: {
            OR: [
              { customerPhone: testPhone },
              { customerEmail: testEmail },
            ],
          },
        });
      }
    });

    it("allows a brand-new customer to apply WELCOME100 with flat ₹100 discount", async () => {
      // First clean up any existing orders with test identifiers
      await prisma.order.deleteMany({
        where: {
          OR: [
            { customerPhone: testPhone },
            { customerEmail: testEmail },
          ],
        },
      });

      const result = await calculateOrderPricing({
        restaurantId,
        items: [
          {
            menuItemId: availableItem.id,
            quantity: 3, // Meets WELCOME100 minOrderValue of 600
          },
        ],
        fulfilmentType: "PICKUP",
        couponCode: "WELCOME100",
        customerPhone: testPhone,
        customerEmail: testEmail,
      });

      expect(result.appliedCoupon).toBeDefined();
      expect(result.appliedCoupon?.code).toBe("WELCOME100");
      expect(result.discountTotal).toBe(100);
      expect(result.couponError).toBeUndefined();
    });

    it("rejects WELCOME100 when the same customer attempts to use it a second time", async () => {
      // Create a completed order using WELCOME100
      const order = await prisma.order.create({
        data: {
          publicCode: `TEST-ORD-${Date.now()}`,
          restaurantId,
          customerName: "Welcome Test Guest",
          customerPhone: testPhone,
          customerEmail: testEmail,
          fulfilmentType: "PICKUP",
          subtotal: 900,
          discountTotal: 100,
          taxTotal: 40,
          deliveryFee: 0,
          finalTotal: 840,
          couponCode: "WELCOME100",
          status: "COMPLETED",
          paymentStatus: "PAID",
          paymentMethod: "PAY_AT_COUNTER",
        },
      });
      testOrderId = order.id;

      // Same phone & same email: must reject
      const resultSameBoth = await calculateOrderPricing({
        restaurantId,
        items: [
          {
            menuItemId: availableItem.id,
            quantity: 3,
          },
        ],
        fulfilmentType: "PICKUP",
        couponCode: "WELCOME100",
        customerPhone: testPhone,
        customerEmail: testEmail,
      });

      expect(resultSameBoth.appliedCoupon).toBeUndefined();
      expect(resultSameBoth.discountTotal).toBe(0);
      expect(resultSameBoth.couponError).toBe(
        "WELCOME100 is available for first-time customers only. This offer has already been used with your account details."
      );

      // Normalized phone variation (without +91 and spaces): must also reject
      const resultNormalizedPhone = await calculateOrderPricing({
        restaurantId,
        items: [
          {
            menuItemId: availableItem.id,
            quantity: 3,
          },
        ],
        fulfilmentType: "PICKUP",
        couponCode: "WELCOME100",
        customerPhone: "9988776655", // unformatted 10 digits
        customerEmail: "completely.different.email@example.com",
      });

      expect(resultNormalizedPhone.appliedCoupon).toBeUndefined();
      expect(resultNormalizedPhone.discountTotal).toBe(0);
      expect(resultNormalizedPhone.couponError).toBe(
        "WELCOME100 is available for first-time customers only. This offer has already been used with your account details."
      );

      // Same email with different phone: must also reject
      const resultSameEmail = await calculateOrderPricing({
        restaurantId,
        items: [
          {
            menuItemId: availableItem.id,
            quantity: 3,
          },
        ],
        fulfilmentType: "PICKUP",
        couponCode: "WELCOME100",
        customerPhone: "+91 91234 98765",
        customerEmail: testEmail,
      });

      expect(resultSameEmail.appliedCoupon).toBeUndefined();
      expect(resultSameEmail.discountTotal).toBe(0);
      expect(resultSameEmail.couponError).toBe(
        "WELCOME100 is available for first-time customers only. This offer has already been used with your account details."
      );
    });

    it("preserves EMBER10 functionality for existing or returning customers", async () => {
      // Even after using WELCOME100, the customer can still use EMBER10 normally
      const result = await calculateOrderPricing({
        restaurantId,
        items: [
          {
            menuItemId: availableItem.id,
            quantity: 3,
          },
        ],
        fulfilmentType: "PICKUP",
        couponCode: "EMBER10",
        customerPhone: testPhone,
        customerEmail: testEmail,
      });

      expect(result.appliedCoupon).toBeDefined();
      expect(result.appliedCoupon?.code).toBe("EMBER10");
      expect(result.discountTotal).toBeGreaterThan(0);
      expect(result.couponError).toBeUndefined();
    });

    it("preserves FREEDELIVERY automatic threshold functionality", async () => {
      // Order crossing 800 free delivery threshold
      const eligibleDelivery = await calculateOrderPricing({
        restaurantId,
        items: [
          {
            menuItemId: availableItem.id,
            quantity: 4, // 4 * basePrice >= 800
          },
        ],
        fulfilmentType: "DELIVERY",
      });

      expect(eligibleDelivery.subtotal).toBeGreaterThanOrEqual(800);
      expect(eligibleDelivery.deliveryFee).toBe(0);

      // Order below 800 threshold gets charged standard delivery fee (50)
      const belowDelivery = await calculateOrderPricing({
        restaurantId,
        items: [
          {
            menuItemId: availableItem.id,
            quantity: 1, // < 800
          },
        ],
        fulfilmentType: "DELIVERY",
      });

      expect(belowDelivery.subtotal).toBeLessThan(800);
      expect(belowDelivery.deliveryFee).toBe(50);
    });
  });
});
