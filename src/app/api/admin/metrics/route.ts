import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await requireAuth(["OWNER", "ADMIN", "STAFF"], req);

    const [orders, reservations, unreadInquiriesCount, recentLogs] = await Promise.all([
      prisma.order.findMany({
        where: { restaurantId: session.restaurantId },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { items: true },
      }),
      prisma.reservation.findMany({
        where: { restaurantId: session.restaurantId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.contactInquiry.count({
        where: { isRead: false },
      }),
      prisma.activityLog.findMany({
        where: { restaurantId: session.restaurantId },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

    // Metric aggregations
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeOrders = orders.filter((o) => !["COMPLETED", "CANCELLED"].includes(o.status));
    const pendingBookings = reservations.filter((r) => r.status === "PENDING");
    const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today && o.status !== "CANCELLED");
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.finalTotal || 0), 0);

    return NextResponse.json(
      {
        success: true,
        metrics: {
          activeOrdersCount: activeOrders.length,
          pendingBookingsCount: pendingBookings.length,
          todayRevenue,
          unreadInquiriesCount,
          totalOrdersCount: orders.length,
          totalReservationsCount: reservations.length,
        },
        recentActivity: recentLogs.map((log) => ({
          id: log.id,
          action: log.action,
          entityType: log.entityType,
          userName: log.userName,
          createdAt: log.createdAt.toISOString(),
        })),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    const status = error.message?.includes("FORBIDDEN") ? 403 : error.message?.includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
