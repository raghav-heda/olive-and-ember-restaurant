import prisma from "@/lib/db";

export interface CartInputItem {
  menuItemId: string;
  quantity: number;
  selectedOptionValueIds?: string[];
  specialInstructions?: string;
}

export interface CalculatedOrderItem {
  menuItemId: string;
  name: string;
  basePrice: number;
  quantity: number;
  options: {
    optionName: string;
    valueName: string;
    priceModifier: number;
  }[];
  unitTotal: number;
  lineTotal: number;
  specialInstructions?: string;
}

export interface CalculationResult {
  items: CalculatedOrderItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  taxRatePercent: number;
  deliveryFee: number;
  finalTotal: number;
  appliedCoupon?: {
    code: string;
    description: string;
    discountType: string;
    discountValue: number;
  };
  couponError?: string;
}

export function normalizePhoneNumber(phone?: string | null): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export function normalizeEmail(email?: string | null): string | null {
  if (!email || !email.trim()) return null;
  return email.trim().toLowerCase();
}

export async function hasUsedWelcomeCoupon(params: {
  restaurantId: string;
  phone?: string | null;
  email?: string | null;
  prismaClient?: any;
}): Promise<boolean> {
  const db = params.prismaClient || prisma;
  const rawPhone = params.phone?.trim();
  const cleanEmail = normalizeEmail(params.email);
  const normalizedPhone = rawPhone ? normalizePhoneNumber(rawPhone) : null;

  if (!normalizedPhone && !cleanEmail) {
    return false;
  }

  // Find non-cancelled orders with WELCOME100 for this restaurant
  const candidateOrders = await db.order.findMany({
    where: {
      restaurantId: params.restaurantId,
      couponCode: "WELCOME100",
      status: { not: "CANCELLED" },
    },
    select: {
      id: true,
      customerPhone: true,
      customerEmail: true,
    },
  });

  for (const order of candidateOrders) {
    if (cleanEmail && order.customerEmail && normalizeEmail(order.customerEmail) === cleanEmail) {
      return true;
    }
    if (normalizedPhone && order.customerPhone && normalizePhoneNumber(order.customerPhone) === normalizedPhone) {
      return true;
    }
  }

  return false;
}

export async function calculateOrderPricing(params: {
  restaurantId: string;
  items: CartInputItem[];
  fulfilmentType: "PICKUP" | "DELIVERY" | "DINE_IN";
  couponCode?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  prismaClient?: any;
}): Promise<CalculationResult> {
  const { restaurantId, items, fulfilmentType, couponCode, customerPhone, customerEmail } = params;
  const db = params.prismaClient || prisma;

  if (!items || items.length === 0) {
    throw new Error("Cannot calculate pricing for an empty cart");
  }

  const settings = await prisma.restaurantSettings.findUnique({
    where: { restaurantId },
  });

  const taxPercentage = settings?.taxPercentage ?? 5.0;
  const baseDeliveryFee = settings?.baseDeliveryFee ?? 50.0;
  const freeDeliveryThreshold = settings?.freeDeliveryThreshold ?? 800.0;

  const menuItemIds = items.map((i) => i.menuItemId);
  const dbMenuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: menuItemIds },
      restaurantId,
    },
    include: {
      options: {
        include: {
          values: true,
        },
      },
    },
  });

  const menuItemMap = new Map(dbMenuItems.map((m) => [m.id, m]));
  const calculatedItems: CalculatedOrderItem[] = [];
  let subtotal = 0;

  for (const item of items) {
    if (item.quantity <= 0) continue;

    const dbItem = menuItemMap.get(item.menuItemId);
    if (!dbItem) {
      throw new Error(`Menu item not found or unavailable in this restaurant: ${item.menuItemId}`);
    }

    if (!dbItem.isAvailable) {
      throw new Error(`"${dbItem.name}" is currently unavailable and cannot be ordered.`);
    }

    const selectedOptionValues: {
      optionName: string;
      valueName: string;
      priceModifier: number;
    }[] = [];

    let optionsCost = 0;

    if (item.selectedOptionValueIds && item.selectedOptionValueIds.length > 0) {
      for (const option of dbItem.options) {
        for (const val of option.values) {
          if (item.selectedOptionValueIds.includes(val.id)) {
            selectedOptionValues.push({
              optionName: option.name,
              valueName: val.name,
              priceModifier: val.priceModifier,
            });
            optionsCost += val.priceModifier;
          }
        }
      }
    }

    const unitTotal = Math.max(0, dbItem.basePrice + optionsCost);
    const lineTotal = unitTotal * item.quantity;
    subtotal += lineTotal;

    calculatedItems.push({
      menuItemId: dbItem.id,
      name: dbItem.name,
      basePrice: dbItem.basePrice,
      quantity: item.quantity,
      options: selectedOptionValues,
      unitTotal,
      lineTotal,
      specialInstructions: item.specialInstructions?.trim() || undefined,
    });
  }

  let discountTotal = 0;
  let appliedCoupon: CalculationResult["appliedCoupon"] = undefined;
  let couponError: string | undefined = undefined;

  if (couponCode && couponCode.trim()) {
    const cleanCode = couponCode.trim().toUpperCase();
    const now = new Date();

    const coupon = await db.coupon.findFirst({
      where: {
        restaurantId,
        code: cleanCode,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    if (coupon) {
      let isEligible = true;

      // Server-side check for first-time welcome coupon eligibility
      if (cleanCode === "WELCOME100") {
        if (customerPhone || customerEmail) {
          const alreadyUsed = await hasUsedWelcomeCoupon({
            restaurantId,
            phone: customerPhone,
            email: customerEmail,
            prismaClient: db,
          });

          if (alreadyUsed) {
            isEligible = false;
            couponError =
              "WELCOME100 is available for first-time customers only. This offer has already been used with your account details.";
          }
        }
      }

      if (isEligible) {
        if (coupon.currentUses < coupon.maxUses && subtotal >= coupon.minOrderValue) {
          if (coupon.discountType === "PERCENTAGE") {
            let discount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
              discount = coupon.maxDiscountAmount;
            }
            discountTotal = discount;
          } else {
            discountTotal = Math.min(coupon.discountValue, subtotal);
          }

          appliedCoupon = {
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
          };
        } else if (subtotal < coupon.minOrderValue) {
          couponError = `Add items worth ₹${Math.ceil(coupon.minOrderValue - subtotal)} more to apply ${coupon.code}`;
        }
      }
    } else {
      couponError = "Invalid or expired promotional coupon code.";
    }
  }

  discountTotal = Math.min(discountTotal, subtotal);
  const discountedSubtotal = Math.max(0, subtotal - discountTotal);

  let deliveryFee = 0;
  if (fulfilmentType === "DELIVERY") {
    if (discountedSubtotal >= freeDeliveryThreshold) {
      deliveryFee = 0;
    } else {
      deliveryFee = baseDeliveryFee;
    }
  }

  const taxTotal = Math.round(((discountedSubtotal * taxPercentage) / 100) * 100) / 100;
  const finalTotal = Math.round((discountedSubtotal + deliveryFee + taxTotal) * 100) / 100;

  return {
    items: calculatedItems,
    subtotal: Math.round(subtotal * 100) / 100,
    discountTotal: Math.round(discountTotal * 100) / 100,
    taxTotal,
    taxRatePercent: taxPercentage,
    deliveryFee,
    finalTotal,
    appliedCoupon,
    couponError,
  };
}
