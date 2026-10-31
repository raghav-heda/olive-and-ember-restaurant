import { requirePageAuth, isAdminRole } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  SettingsManagerClient,
  RestaurantSettingsData,
} from "@/components/admin/SettingsManagerClient";
import { ForbiddenCard } from "@/components/admin/ForbiddenCard";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const session = await requirePageAuth();

  if (!isAdminRole(session.role)) {
    return <ForbiddenCard moduleName="Restaurant Settings & Configuration" />;
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.restaurantId },
    include: { settings: true },
  });

  if (!restaurant || !restaurant.settings) {
    return <p className="text-red-400">Settings record not found.</p>;
  }

  const initialData: RestaurantSettingsData = {
    restaurantName: restaurant.name,
    phone: restaurant.phone,
    email: restaurant.email,
    address: restaurant.address,
    taxPercentage: restaurant.settings.taxPercentage,
    baseDeliveryFee: restaurant.settings.baseDeliveryFee,
    freeDeliveryThreshold: restaurant.settings.freeDeliveryThreshold,
    deliveryRadiusKm: restaurant.settings.deliveryRadiusKm,
    maxPartySize: restaurant.settings.maxPartySize,
    advanceBookingDays: restaurant.settings.advanceBookingDays,
    autoConfirmBookings: restaurant.settings.autoConfirmBookings,
    dineInEnabled: restaurant.settings.dineInEnabled,
    pickupEnabled: restaurant.settings.pickupEnabled,
    deliveryEnabled: restaurant.settings.deliveryEnabled,
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest font-mono text-terracotta-400 font-bold">
          System Configuration
        </span>
        <h1 className="font-serif text-3xl font-bold text-ivory-50 mt-1">
          Operational &amp; Store Settings
        </h1>
        <p className="text-xs text-ivory-400 mt-1">
          Calibrate delivery zones, table capacity thresholds, tax rates, and contact profiles.
        </p>
      </div>

      <SettingsManagerClient initialData={initialData} />
    </div>
  );
}
