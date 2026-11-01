import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get("ref")?.trim();

    if (!ref) {
      return NextResponse.json(
        { error: "Booking reference is required." },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { bookingRef: ref },
      select: {
        bookingRef: true,
        customerName: true,
        guestCount: true,
        reservationDate: true,
        timeSlot: true,
        status: true,
        tableAssignment: true,
        specialRequests: true,
        createdAt: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "No reservation found matching this booking reference." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      reservation: {
        bookingRef: reservation.bookingRef,
        customerName: reservation.customerName,
        guestCount: reservation.guestCount,
        date: reservation.reservationDate,
        time: reservation.timeSlot,
        status: reservation.status,
        tableAssignment: reservation.tableAssignment,
        specialRequests: reservation.specialRequests,
        createdAt: reservation.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve reservation status." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const ref = body?.bookingRef?.trim();

    if (!ref) {
      return NextResponse.json(
        { error: "Booking reference is required." },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { bookingRef: ref },
      select: {
        bookingRef: true,
        customerName: true,
        guestCount: true,
        reservationDate: true,
        timeSlot: true,
        status: true,
        tableAssignment: true,
        specialRequests: true,
        createdAt: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "No reservation found matching this booking reference." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      reservation: {
        bookingRef: reservation.bookingRef,
        customerName: reservation.customerName,
        guestCount: reservation.guestCount,
        date: reservation.reservationDate,
        time: reservation.timeSlot,
        status: reservation.status,
        tableAssignment: reservation.tableAssignment,
        specialRequests: reservation.specialRequests,
        createdAt: reservation.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve reservation status." },
      { status: 500 }
    );
  }
}
