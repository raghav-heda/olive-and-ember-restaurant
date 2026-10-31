import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";

const settingsSchema = z.object({
  restaurantName: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email(),
  address: z.string().min(5),
  taxPercentage: z.number().min(0).max(30),
  baseDeliveryFee: z.number().min(0),
  freeDeliveryThreshold: z.number().min(0),
  deliveryRadiusKm: z.number().min(1),
  maxPartySize: z.number().int().min(1).max(50),
  advanceBookingDays: z.number().int().min(1).max(90),
  autoConfirmBookings: z.boolean(),
  dineInEnabled: z.boolean(),
  pickupEnabled: z.boolean(),
  deliveryEnabled: z.boolean(),
});

export async function POST(req: Request) {
  try {
    const session = await requireAuth(["OWNER", "ADMIN"]);
    const body = await req.json();
    const validated = settingsSchema.parse(body);

    await prisma.restaurant.update({
      where: { id: session.restaurantId },
      data: {
        name: validated.restaurantName.trim(),
        phone: validated.phone.trim(),
        email: validated.email.trim(),
        address: validated.address.trim(),
      },
    });

    const updatedSettings = await prisma.restaurantSettings.update({
      where: { restaurantId: session.restaurantId },
      data: {
        taxPercentage: validated.taxPercentage,
        baseDeliveryFee: validated.baseDeliveryFee,
        freeDeliveryThreshold: validated.freeDeliveryThreshold,
        deliveryRadiusKm: validated.deliveryRadiusKm,
        maxPartySize: validated.maxPartySize,
        advanceBookingDays: validated.advanceBookingDays,
        autoConfirmBookings: validated.autoConfirmBookings,
        dineInEnabled: validated.dineInEnabled,
        pickupEnabled: validated.pickupEnabled,
        deliveryEnabled: validated.deliveryEnabled,
      },
    });

    await prisma.activityLog.create({
      data: {
        restaurantId: session.restaurantId,
        userId: session.userId,
        userName: session.name,
        action: "SETTINGS_UPDATED",
        entityType: "SETTINGS",
        entityId: updatedSettings.id,
        detailsJson: JSON.stringify({ updatedBy: session.name }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    const status = err.message?.includes("FORBIDDEN") ? 403 : err.message?.includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
