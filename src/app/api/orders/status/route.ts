import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Order code is required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { publicCode: code },
      include: {
        items: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      order: {
        publicCode: order.publicCode,
        customerName: order.customerName,
        fulfilmentType: order.fulfilmentType,
        deliveryAddress: order.deliveryAddress,
        tableNumber: order.tableNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal,
        discountTotal: order.discountTotal,
        taxTotal: order.taxTotal,
        deliveryFee: order.deliveryFee,
        finalTotal: order.finalTotal,
        couponCode: order.couponCode,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          name: item.itemNameSnapshot,
          unitPrice: item.unitPriceSnapshot,
          quantity: item.quantity,
          itemTotal: item.itemTotalSnapshot,
          specialInstructions: item.specialInstructions,
          options: item.options.map((opt) => ({
            optionName: opt.optionNameSnapshot,
            valueName: opt.valueNameSnapshot,
            priceModifier: opt.priceModifierSnapshot,
          })),
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Payment confirmation / signature verification
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { publicCode, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    const order = await prisma.order.findUnique({
      where: { publicCode },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isValid = verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED" },
      });
      return NextResponse.json(
        { error: "Payment verification failed: Invalid signature" },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        status: order.status === "PENDING" ? "CONFIRMED" : order.status,
        razorpayPaymentId,
      },
    });

    return NextResponse.json({
      success: true,
      paymentStatus: updated.paymentStatus,
      status: updated.status,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
