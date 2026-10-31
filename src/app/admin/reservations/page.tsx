import { requirePageAuth } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  ReservationsManagerClient,
  AdminReservation,
} from "@/components/admin/ReservationsManagerClient";

export const revalidate = 0;

export default async function AdminReservationsPage() {
  const session = await requirePageAuth();

  const rawRes = await prisma.reservation.findMany({
    where: { restaurantId: session.restaurantId },
    orderBy: { createdAt: "desc" },
  });

  const reservations: AdminReservation[] = rawRes.map((r) => ({
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

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest font-mono text-terracotta-400 font-bold">
          Front of House Floor Management
        </span>
        <h1 className="font-serif text-3xl font-bold text-ivory-50 mt-1">
          Table Reservations
        </h1>
        <p className="text-xs text-ivory-400 mt-1">
          Accept requests, assign dining booths, log guest preferences, and track table turnover.
        </p>
      </div>

      <ReservationsManagerClient initialReservations={reservations} />
    </div>
  );
}
