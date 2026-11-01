import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import {
  checkReservationAvailability,
  generateReservationRef,
} from "@/lib/availability";
import { sendReservationNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const reservationSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters").max(80),
  customerPhone: z.string().min(8, "Valid phone number is required").max(20),
  customerEmail: z.string().email("Valid email address is required").optional().or(z.literal("")),
  guestCount: z.number().int().min(1, "Guest count must be at least 1").max(12),
  reservationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:mm format"),
  specialRequests: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = reservationSchema.parse(body);

    const restaurant = await prisma.restaurant.findFirst({
      include: { settings: true },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant record not found" }, { status: 500 });
    }

    // Server-side Capacity & Availability Guard
    const availability = await checkReservationAvailability(restaurant.id, {
      date: validated.reservationDate,
      timeSlot: validated.timeSlot,
      guestCount: validated.guestCount,
    });

    if (!availability.isAvailable) {
      return NextResponse.json(
        {
          error: availability.reason || "The selected time slot is no longer available.",
          availableSlots: availability.availableSlots,
          suggestedSlots: availability.suggestedSlots || [],
        },
        { status: 409 }
      );
    }

    // Check duplicate submission within short timeframe for same phone & slot
    const duplicate = await prisma.reservation.findFirst({
      where: {
        restaurantId: restaurant.id,
        customerPhone: validated.customerPhone,
        reservationDate: validated.reservationDate,
        timeSlot: validated.timeSlot,
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          error: "You already have an active table booking request for this date and time slot.",
          existingRef: duplicate.bookingRef,
        },
        { status: 400 }
      );
    }

    const bookingRef = generateReservationRef();
    const initialStatus = restaurant.settings?.autoConfirmBookings ? "CONFIRMED" : "PENDING";

    const reservation = await prisma.reservation.create({
      data: {
        bookingRef,
        restaurantId: restaurant.id,
        customerName: validated.customerName.trim(),
        customerPhone: validated.customerPhone.trim(),
        customerEmail: validated.customerEmail?.trim() || null,
        guestCount: validated.guestCount,
        reservationDate: validated.reservationDate,
        timeSlot: validated.timeSlot,
        specialRequests: validated.specialRequests?.trim() || null,
        status: initialStatus,
      },
    });

    // Dispatch notifications and record activity log asynchronously without blocking client response
    Promise.allSettled([
      sendReservationNotification({
        bookingRef: reservation.bookingRef,
        customerName: reservation.customerName,
        customerPhone: reservation.customerPhone,
        customerEmail: reservation.customerEmail,
        guestCount: reservation.guestCount,
        reservationDate: reservation.reservationDate,
        timeSlot: reservation.timeSlot,
        status: reservation.status,
      }),
      prisma.activityLog.create({
        data: {
          restaurantId: restaurant.id,
          action: "RESERVATION_REQUESTED",
          entityType: "RESERVATION",
          entityId: reservation.id,
          detailsJson: JSON.stringify({
            bookingRef: reservation.bookingRef,
            customerName: reservation.customerName,
            guestCount: reservation.guestCount,
            date: reservation.reservationDate,
            time: reservation.timeSlot,
            status: reservation.status,
          }),
        },
      }),
    ]).catch((err) => console.error("Background task error:", err));

    return NextResponse.json(
      {
        success: true,
        bookingRef: reservation.bookingRef,
        status: reservation.status,
        message:
          reservation.status === "CONFIRMED"
            ? "Your table reservation is confirmed."
            : "Your reservation request has been received and is pending staff confirmation.",
        reservation: {
          bookingRef: reservation.bookingRef,
          customerName: reservation.customerName,
          guestCount: reservation.guestCount,
          date: reservation.reservationDate,
          time: reservation.timeSlot,
          status: reservation.status,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid reservation inputs" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to process reservation" },
      { status: 500 }
    );
  }
}
