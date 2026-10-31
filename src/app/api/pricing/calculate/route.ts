import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { calculateOrderPricing } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, fulfilmentType, couponCode, customerPhone, customerEmail } = body;

    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 500 });
    }

    const result = await calculateOrderPricing({
      restaurantId: restaurant.id,
      items: items || [],
      fulfilmentType: fulfilmentType || "PICKUP",
      couponCode: couponCode || null,
      customerPhone: customerPhone || null,
      customerEmail: customerEmail || null,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to calculate pricing" },
      { status: 400 }
    );
  }
}
