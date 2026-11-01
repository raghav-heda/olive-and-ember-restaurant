import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await requireAuth(["ADMIN", "OWNER", "STAFF"], req);

    const rawRes = await prisma.reservation.findMany({
      where: { restaurantId: session.restaurantId },
      orderBy: { createdAt: "desc" },
    });

    const reservations = rawRes.map((r) => ({
      id: r.id,
      bookingRef: r.bookingRef,
      customerName: r.customerName,
      customerPhone: r.customerPhone,
      customerEmail: r.customerEmail,
      guestCount: r.guestCount,
      reservationDate: r.reservationDate,
      timeSlot: r.timeSlot,
      tableAssignment: r.tableAssignment,
      specialRequests: r.specialRequests,
      status: r.status,
      staffNotes: r.staffNotes,
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json(
      {
        success: true,
        count: reservations.length,
        reservations,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve reservations" },
      { status: 401 }
    );
  }
}
