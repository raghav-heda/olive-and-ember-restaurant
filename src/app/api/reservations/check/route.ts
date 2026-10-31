import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkReservationAvailability } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const timeSlot = searchParams.get("timeSlot");
    const guestCount = parseInt(searchParams.get("guestCount") || "2", 10);

    if (!date || !timeSlot) {
      return NextResponse.json(
        { error: "Date and timeSlot query parameters are required" },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 500 });
    }

    const result = await checkReservationAvailability(restaurant.id, {
      date,
      timeSlot,
      guestCount,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
