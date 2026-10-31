import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { sendReservationNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const updateReservationSchema = z.object({
  reservationId: z.string().min(1),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "SEATED",
    "COMPLETED",
    "CANCELLED",
    "REJECTED",
  ]).optional(),
  tableAssignment: z.string().optional(),
  staffNotes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const validated = updateReservationSchema.parse(body);

    const reservation = await prisma.reservation.findFirst({
      where: {
        id: validated.reservationId,
        restaurantId: session.restaurantId,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found or unauthorized" },
        { status: 404 }
      );
    }

    const updated = await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        status: validated.status || reservation.status,
        tableAssignment:
          validated.tableAssignment !== undefined
            ? validated.tableAssignment
            : reservation.tableAssignment,
        staffNotes:
          validated.staffNotes !== undefined
            ? validated.staffNotes
            : reservation.staffNotes,
      },
    });

    // Record Activity Log
    await prisma.activityLog.create({
      data: {
        restaurantId: session.restaurantId,
        userId: session.userId,
        userName: session.name,
        action: "RESERVATION_UPDATED",
        entityType: "RESERVATION",
        entityId: reservation.id,
        detailsJson: JSON.stringify({
          bookingRef: reservation.bookingRef,
          customerName: reservation.customerName,
          statusChange: `${reservation.status} -> ${updated.status}`,
          tableAssignment: updated.tableAssignment,
        }),
      },
    });

    // If status changed to CONFIRMED or CANCELLED, send customer notification
    if (validated.status && validated.status !== reservation.status) {
      await sendReservationNotification({
        bookingRef: updated.bookingRef,
        customerName: updated.customerName,
        customerPhone: updated.customerPhone,
        customerEmail: updated.customerEmail,
        guestCount: updated.guestCount,
        reservationDate: updated.reservationDate,
        timeSlot: updated.timeSlot,
        status: updated.status,
      });
    }

    return NextResponse.json({
      success: true,
      reservation: updated,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    const status = error.message?.includes("FORBIDDEN") ? 403 : error.message?.includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json(
      { error: error.message || "Failed to update reservation" },
      { status }
    );
  }
}
