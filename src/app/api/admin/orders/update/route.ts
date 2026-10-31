import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireAuth, isAdminRole } from "@/lib/auth";
import { sendOrderNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY_FOR_PICKUP",
    "OUT_FOR_DELIVERY",
    "COMPLETED",
    "CANCELLED",
  ]).optional(),
  paymentStatus: z.enum(["UNPAID", "PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  cancellationReason: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const validated = updateSchema.parse(body);

    if (validated.paymentStatus === "REFUNDED" && !isAdminRole(session.role)) {
      return NextResponse.json(
        { error: "FORBIDDEN: Only administrators can authorize financial refunds." },
        { status: 403 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id: validated.orderId,
        restaurantId: session.restaurantId,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found or unauthorized" }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: validated.status || order.status,
        paymentStatus: validated.paymentStatus || order.paymentStatus,
        cancellationReason: validated.cancellationReason || order.cancellationReason,
      },
    });

    // Record Activity Log
    await prisma.activityLog.create({
      data: {
        restaurantId: session.restaurantId,
        userId: session.userId,
        userName: session.name,
        action: "ORDER_STATUS_UPDATED",
        entityType: "ORDER",
        entityId: order.id,
        detailsJson: JSON.stringify({
          fromStatus: order.status,
          toStatus: updated.status,
          fromPayment: order.paymentStatus,
          toPayment: updated.paymentStatus,
          cancellationReason: validated.cancellationReason,
        }),
      },
    });

    // If status changed, dispatch customer notification
    if (validated.status && validated.status !== order.status) {
      const itemsSummary = order.items.map((i) => `${i.quantity}x ${i.itemNameSnapshot}`).join(", ");
      await sendOrderNotification({
        orderCode: updated.publicCode,
        customerName: updated.customerName,
        customerPhone: updated.customerPhone,
        customerEmail: updated.customerEmail,
        fulfilmentType: updated.fulfilmentType,
        finalTotal: updated.finalTotal,
        status: updated.status,
        itemsSummary,
      });
    }

    return NextResponse.json({
      success: true,
      order: updated,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    const status = error.message?.includes("FORBIDDEN") ? 403 : error.message?.includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status }
    );
  }
}
