import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const now = new Date();
    const coupons = await prisma.coupon.findMany({
      where: {
        restaurantId: restaurant.id,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { minOrderValue: "asc" },
      select: {
        id: true,
        code: true,
        description: true,
        discountType: true,
        discountValue: true,
        minOrderValue: true,
        maxDiscountAmount: true,
        startDate: true,
        endDate: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        count: coupons.length,
        coupons: coupons.map((c) => ({
          ...c,
          startDate: c.startDate.toISOString(),
          endDate: c.endDate.toISOString(),
        })),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve active promotions" },
      { status: 500 }
    );
  }
}
