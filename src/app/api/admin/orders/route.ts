import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await requireAuth(["OWNER", "ADMIN", "STAFF"], req);

    const rawOrders = await prisma.order.findMany({
      where: { restaurantId: session.restaurantId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            options: true,
          },
        },
      },
    });

    const orders = rawOrders.map((o) => ({
      id: o.id,
      publicCode: o.publicCode,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      customerEmail: o.customerEmail,
      fulfilmentType: o.fulfilmentType,
      deliveryAddress: o.deliveryAddress,
      deliveryInstructions: o.deliveryInstructions,
      tableNumber: o.tableNumber,
      status: o.status,
      cancellationReason: o.cancellationReason,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      subtotal: o.subtotal,
      discountTotal: o.discountTotal,
      taxTotal: o.taxTotal,
      deliveryFee: o.deliveryFee,
      finalTotal: o.finalTotal,
      couponCode: o.couponCode,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((i) => ({
        id: i.id,
        itemNameSnapshot: i.itemNameSnapshot,
        unitPriceSnapshot: i.unitPriceSnapshot,
        quantity: i.quantity,
        itemTotalSnapshot: i.itemTotalSnapshot,
        specialInstructions: i.specialInstructions,
        options: i.options.map((opt) => ({
          optionNameSnapshot: opt.optionNameSnapshot,
          valueNameSnapshot: opt.valueNameSnapshot,
          priceModifierSnapshot: opt.priceModifierSnapshot,
        })),
      })),
    }));

    return NextResponse.json(
      {
        success: true,
        count: orders.length,
        orders,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    const status = error.message?.includes("FORBIDDEN") ? 403 : error.message?.includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
