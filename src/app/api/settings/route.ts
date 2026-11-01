import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const restaurant = await prisma.restaurant.findFirst({
      include: {
        settings: true,
      },
    });

    if (!restaurant || !restaurant.settings) {
      return NextResponse.json(
        { error: "Restaurant settings not found" },
        { status: 404 }
      );
    }

    const { settings } = restaurant;

    let openingHours: any = null;
    if (settings.openingHoursJson) {
      try {
        openingHours = JSON.parse(settings.openingHoursJson);
      } catch {
        openingHours = null;
      }
    }

    return NextResponse.json(
      {
        success: true,
        settings: {
          restaurantName: restaurant.name,
          phone: restaurant.phone,
          email: restaurant.email,
          address: restaurant.address,
          maxPartySize: settings.maxPartySize,
          advanceBookingDays: settings.advanceBookingDays,
          autoConfirmBookings: settings.autoConfirmBookings,
          dineInEnabled: settings.dineInEnabled,
          pickupEnabled: settings.pickupEnabled,
          deliveryEnabled: settings.deliveryEnabled,
          deliveryRadiusKm: settings.deliveryRadiusKm,
          baseDeliveryFee: settings.baseDeliveryFee,
          freeDeliveryThreshold: settings.freeDeliveryThreshold,
          taxPercentage: settings.taxPercentage,
          slotDurationMinutes: settings.slotDurationMinutes,
          openingHours,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve restaurant settings" },
      { status: 500 }
    );
  }
}
