import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { calculateOrderPricing } from "@/lib/pricing";
import { generateOrderCode } from "@/lib/availability";
import { createRazorpayOrder } from "@/lib/razorpay";
import { sendOrderNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const createOrderSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters").max(80),
  customerPhone: z.string().min(8, "Valid phone number is required").max(20),
  customerEmail: z.string().email().optional().or(z.literal("")),
  fulfilmentType: z.enum(["PICKUP", "DELIVERY", "DINE_IN"]),
  tableNumber: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  paymentMethod: z.enum(["PAY_AT_COUNTER", "CASH_ON_DELIVERY", "RAZORPAY"]),
  couponCode: z.string().optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        quantity: z.number().int().min(1),
        selectedOptionValueIds: z.array(z.string()).optional(),
        specialInstructions: z.string().optional(),
      })
    )
    .min(1, "Order must contain at least one item"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = createOrderSchema.parse(body);

    const restaurant = await prisma.restaurant.findFirst({
      include: { settings: true },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 500 });
    }

    // Specific validation based on fulfilment type
    if (validated.fulfilmentType === "DELIVERY" && (!validated.deliveryAddress || validated.deliveryAddress.trim().length < 5)) {
      return NextResponse.json(
        { error: "A complete delivery address is required for delivery orders." },
        { status: 400 }
      );
    }

    if (validated.fulfilmentType === "DINE_IN" && (!validated.tableNumber || validated.tableNumber.trim().length === 0)) {
      return NextResponse.json(
        { error: "Please enter your table number for dine-in ordering." },
        { status: 400 }
      );
    }

    // 1. Recalculate deterministic pricing strictly on server
    const pricing = await calculateOrderPricing({
      restaurantId: restaurant.id,
      items: validated.items,
      fulfilmentType: validated.fulfilmentType,
      couponCode: validated.couponCode,
    });

    const publicCode = generateOrderCode();

    // 2. Prepare Razorpay order if Razorpay is chosen
    let razorpayOrderId: string | undefined = undefined;
    if (validated.paymentMethod === "RAZORPAY") {
      const razorpayOrder = await createRazorpayOrder({
        amountInPaisa: Math.round(pricing.finalTotal * 100),
        currency: restaurant.currency || "INR",
        receipt: publicCode,
        notes: {
          customerName: validated.customerName,
          orderCode: publicCode,
        },
      });
      razorpayOrderId = razorpayOrder.id;
    }

    // 3. Atomically persist Order & Immutable Item Snapshots
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          publicCode,
          restaurantId: restaurant.id,
          customerName: validated.customerName.trim(),
          customerPhone: validated.customerPhone.trim(),
          customerEmail: validated.customerEmail?.trim() || null,
          fulfilmentType: validated.fulfilmentType,
          tableNumber: validated.tableNumber?.trim() || null,
          deliveryAddress: validated.deliveryAddress?.trim() || null,
          deliveryInstructions: validated.deliveryInstructions?.trim() || null,
          subtotal: pricing.subtotal,
          discountTotal: pricing.discountTotal,
          taxTotal: pricing.taxTotal,
          deliveryFee: pricing.deliveryFee,
          finalTotal: pricing.finalTotal,
          couponCode: pricing.appliedCoupon?.code || null,
          status: "PENDING",
          paymentStatus: validated.paymentMethod === "RAZORPAY" ? "PENDING" : "UNPAID",
          paymentMethod: validated.paymentMethod,
          razorpayOrderId: razorpayOrderId || null,
        },
      });

      // Create snapshot items
      for (const item of pricing.items) {
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: order.id,
            menuItemId: item.menuItemId,
            itemNameSnapshot: item.name,
            unitPriceSnapshot: item.unitTotal,
            quantity: item.quantity,
            itemTotalSnapshot: item.lineTotal,
            specialInstructions: item.specialInstructions || null,
          },
        });

        for (const opt of item.options) {
          await tx.orderItemOption.create({
            data: {
              orderItemId: orderItem.id,
              optionNameSnapshot: opt.optionName,
              valueNameSnapshot: opt.valueName,
              priceModifierSnapshot: opt.priceModifier,
            },
          });
        }
      }

      // Increment coupon current uses if applied
      if (pricing.appliedCoupon) {
        await tx.coupon.updateMany({
          where: {
            restaurantId: restaurant.id,
            code: pricing.appliedCoupon.code,
          },
          data: {
            currentUses: { increment: 1 },
          },
        });
      }

      // Record Activity Log
      await tx.activityLog.create({
        data: {
          restaurantId: restaurant.id,
          action: "ORDER_CREATED",
          entityType: "ORDER",
          entityId: order.id,
          detailsJson: JSON.stringify({
            publicCode,
            customerName: validated.customerName,
            finalTotal: pricing.finalTotal,
            fulfilmentType: validated.fulfilmentType,
            itemCount: pricing.items.length,
          }),
        },
      });

      return order;
    });

    // 4. Dispatch Notification
    const itemsSummary = pricing.items.map((i) => `${i.quantity}x ${i.name}`).join(", ");
    await sendOrderNotification({
      orderCode: newOrder.publicCode,
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone,
      customerEmail: newOrder.customerEmail,
      fulfilmentType: newOrder.fulfilmentType,
      finalTotal: newOrder.finalTotal,
      status: newOrder.status,
      itemsSummary,
    });

    return NextResponse.json({
      success: true,
      publicCode: newOrder.publicCode,
      finalTotal: newOrder.finalTotal,
      razorpayOrderId,
      paymentMethod: newOrder.paymentMethod,
      trackingUrl: `/order-tracking/${newOrder.publicCode}`,
      order: {
        publicCode: newOrder.publicCode,
        status: newOrder.status,
        finalTotal: newOrder.finalTotal,
        paymentStatus: newOrder.paymentStatus,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid order inputs" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
