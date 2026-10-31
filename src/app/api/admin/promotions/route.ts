import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";

const couponSchema = z.object({
  code: z.string().min(3).max(20),
  description: z.string().min(5).max(120),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().min(1),
  minOrderValue: z.number().min(0).default(0),
  maxDiscountAmount: z.number().optional(),
  maxUses: z.number().int().min(1).default(100),
  startDate: z.string().default("2026-01-01"),
  endDate: z.string().default("2027-12-31"),
  isActive: z.boolean().default(true),
});

export async function POST(req: Request) {
  try {
    const session = await requireAuth(["OWNER", "ADMIN"]);
    const body = await req.json();
    const validated = couponSchema.parse(body);

    const coupon = await prisma.coupon.create({
      data: {
        restaurantId: session.restaurantId,
        code: validated.code.trim().toUpperCase(),
        description: validated.description.trim(),
        discountType: validated.discountType,
        discountValue: validated.discountValue,
        minOrderValue: validated.minOrderValue,
        maxDiscountAmount: validated.maxDiscountAmount || null,
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
        maxUses: validated.maxUses,
        isActive: validated.isActive,
      },
    });

    await prisma.activityLog.create({
      data: {
        restaurantId: session.restaurantId,
        userId: session.userId,
        userName: session.name,
        action: "COUPON_CREATED",
        entityType: "COUPON",
        entityId: coupon.id,
        detailsJson: JSON.stringify({ code: coupon.code, value: coupon.discountValue }),
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    const status = error.message?.includes("FORBIDDEN") ? 403 : error.message?.includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireAuth(["OWNER", "ADMIN"]);
    const body = await req.json();
    const { id, isActive } = body;

    const updated = await prisma.coupon.update({
      where: { id },
      data: { isActive },
    });

    await prisma.activityLog.create({
      data: {
        restaurantId: session.restaurantId,
        userId: session.userId,
        userName: session.name,
        action: "COUPON_STATUS_CHANGED",
        entityType: "COUPON",
        entityId: updated.id,
        detailsJson: JSON.stringify({ code: updated.code, isActive: updated.isActive }),
      },
    });

    return NextResponse.json({ success: true, coupon: updated });
  } catch (error: any) {
    const status = error.message?.includes("FORBIDDEN") ? 403 : error.message?.includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireAuth(["OWNER", "ADMIN"]);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Coupon ID required" }, { status: 400 });

    const coupon = await prisma.coupon.findUnique({ where: { id } });

    await prisma.coupon.delete({ where: { id } });

    if (coupon) {
      await prisma.activityLog.create({
        data: {
          restaurantId: session.restaurantId,
          userId: session.userId,
          userName: session.name,
          action: "COUPON_DELETED",
          entityType: "COUPON",
          entityId: id,
          detailsJson: JSON.stringify({ code: coupon.code }),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message?.includes("FORBIDDEN") ? 403 : error.message?.includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
