import { requirePageAuth } from "@/lib/auth";
import prisma from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import {
  UtensilsCrossed,
  Calendar,
  IndianRupee,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  QrCode,
  BookOpen,
  Sparkles,
  Mail,
} from "lucide-react";

export const revalidate = 0; // Dynamic server component

export default async function AdminDashboardPage() {
  const session = await requirePageAuth();

  let orders: any[] = [];
  let reservations: any[] = [];
  let menuItems: any[] = [];
  let recentLogs: any[] = [];
  let unreadInquiriesCount = 0;
  let queryError: string | null = null;

  try {
    const [fetchedOrders, fetchedReservations, fetchedMenuItems, fetchedLogs, fetchedInquiries] =
      await Promise.all([
        prisma.order.findMany({
          where: { restaurantId: session.restaurantId },
          orderBy: { createdAt: "desc" },
          include: { items: true },
        }),
        prisma.reservation.findMany({
          where: { restaurantId: session.restaurantId },
          orderBy: { createdAt: "desc" },
        }),
        prisma.menuItem.findMany({
          where: { restaurantId: session.restaurantId },
        }),
        prisma.activityLog.findMany({
          where: { restaurantId: session.restaurantId },
          orderBy: { createdAt: "desc" },
          take: 6,
        }),
        prisma.contactInquiry.count({
          where: { isRead: false },
        }),
      ]);

    orders = fetchedOrders;
    reservations = fetchedReservations;
    menuItems = fetchedMenuItems;
    recentLogs = fetchedLogs;
    unreadInquiriesCount = fetchedInquiries;
  } catch (err: any) {
    console.error("Error fetching dashboard statistics:", err);
    queryError = err?.message || "Failed to load complete records from database.";
  }

  // Calculate Metrics safely
  const totalOrdersCount = orders.length;
  const ordersAwaitingAction = orders.filter((o) =>
    ["PENDING", "PREPARING"].includes(o.status)
  ).length;

  const paidOrders = orders.filter((o) => o.paymentStatus === "PAID");
  const totalPaidRevenue = paidOrders.reduce((sum, o) => sum + (o.finalTotal || 0), 0);

  const averageOrderValue =
    paidOrders.length > 0 ? Math.round(totalPaidRevenue / paidOrders.length) : 0;

  const pendingReservations = reservations.filter((r) => r.status === "PENDING").length;
  const confirmedReservations = reservations.filter((r) => r.status === "CONFIRMED").length;

  return (
    <div className="space-y-8">
      {/* Header with DB Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-mono text-terracotta-400 font-bold">
              Operations Center
            </span>
            <span className="text-xs text-charcoal-700">&bull;</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live DB Synced
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-ivory-50 mt-1">
            Kitchen Overview &amp; Metrics
          </h1>
          <p className="text-xs text-ivory-400 mt-1">
            Real-time hearth operations, incoming guest tickets, table allocations, and kitchen volume.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/orders"
            className="bg-terracotta-600 hover:bg-terracotta-500 text-ivory-50 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow flex items-center gap-1.5"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Manage Orders</span>
          </Link>
          <Link
            href="/admin/inquiries"
            className="bg-charcoal-800 hover:bg-charcoal-700 text-ivory-200 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border border-charcoal-700 flex items-center gap-1.5"
          >
            <Mail className="w-4 h-4 text-terracotta-400" />
            <span>Guest Notes</span>
            {unreadInquiriesCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </Link>
          <Link
            href="/admin/qr-menu"
            className="bg-charcoal-800 hover:bg-charcoal-700 text-ivory-200 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border border-charcoal-700 flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4 text-terracotta-400" />
            <span>Table QR</span>
          </Link>
        </div>
      </div>

      {/* Query error notice if DB had partial connection issue */}
      {queryError && (
        <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-800/80 text-amber-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Database alert: {queryError}. Dashboard is displaying cached or fallback values.</span>
          </div>
          <Link
            href="/admin"
            className="text-amber-400 font-bold underline hover:text-amber-300 text-[11px] shrink-0"
          >
            Refresh
          </Link>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Paid Revenue */}
        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-ivory-400">
            <span className="text-xs font-bold uppercase tracking-wider">Paid Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-ivory-50">
            {formatCurrency(totalPaidRevenue)}
          </p>
          <p className="text-[11px] text-ivory-400">
            From {paidOrders.length} settled customer orders
          </p>
        </div>

        {/* Orders Awaiting Kitchen */}
        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-ivory-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Tickets</span>
            <div className="w-8 h-8 rounded-xl bg-terracotta-950/60 border border-terracotta-800 flex items-center justify-center text-terracotta-400">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-terracotta-400">
            {ordersAwaitingAction}
          </p>
          <p className="text-[11px] text-ivory-400">
            {totalOrdersCount} total lifetime orders
          </p>
        </div>

        {/* Pending Reservations */}
        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-ivory-400">
            <span className="text-xs font-bold uppercase tracking-wider">Table Requests</span>
            <div className="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-800 flex items-center justify-center text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-amber-400">
            {pendingReservations}
          </p>
          <p className="text-[11px] text-ivory-400">
            {confirmedReservations} confirmed upcoming bookings
          </p>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-ivory-400">
            <span className="text-xs font-bold uppercase tracking-wider">Average Ticket</span>
            <div className="w-8 h-8 rounded-xl bg-blue-950/60 border border-blue-800 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-ivory-50">
            {formatCurrency(averageOrderValue)}
          </p>
          <p className="text-[11px] text-ivory-400">
            Across {menuItems.length} active menu catalog items
          </p>
        </div>
      </div>

      {/* 2-Column Section: Recent Orders & Table Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders Queue */}
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-charcoal-800 pb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-ivory-50">Recent Order Stream</h2>
              <p className="text-[11px] text-ivory-400">Latest online &amp; table orders placed</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-terracotta-400 hover:text-terracotta-300 font-bold uppercase tracking-wider flex items-center gap-1"
            >
              <span>All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-3 bg-charcoal-950/60 rounded-2xl border border-charcoal-800/60">
                <div className="w-10 h-10 rounded-full bg-charcoal-900 text-terracotta-400 flex items-center justify-center mx-auto border border-charcoal-800">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-serif font-bold text-ivory-200 text-sm">No Orders Placed Yet</p>
                  <p className="text-xs text-ivory-500 max-w-xs mx-auto mt-0.5">
                    When guests order from the digital menu or scan a table QR code, live order tickets will stream here automatically.
                  </p>
                </div>
                <Link
                  href="/menu"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs text-terracotta-400 hover:underline font-semibold"
                >
                  <span>Open Customer Menu &rarr;</span>
                </Link>
              </div>
            ) : (
              orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800/80 flex items-center justify-between text-xs hover:border-charcoal-700 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-terracotta-400">
                        #{order.publicCode}
                      </span>
                      <span className="text-ivory-600">&bull;</span>
                      <span className="font-medium text-ivory-200">{order.customerName}</span>
                    </div>
                    <p className="text-[11px] text-ivory-400 mt-1">
                      {order.items?.length || 0} items &bull; {order.fulfilmentType} &bull; {formatDateTime(order.createdAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-ivory-50 text-sm block">
                      {formatCurrency(order.finalTotal)}
                    </span>
                    <span
                      className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded mt-0.5 ${
                        order.status === "COMPLETED"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : order.status === "PREPARING"
                          ? "bg-amber-950 text-amber-400 border border-amber-800"
                          : "bg-terracotta-950 text-terracotta-400 border border-terracotta-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Table Reservations */}
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-charcoal-800 pb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-ivory-50">Table Bookings</h2>
              <p className="text-[11px] text-ivory-400">Guest reservations and allocations</p>
            </div>
            <Link
              href="/admin/reservations"
              className="text-xs text-terracotta-400 hover:text-terracotta-300 font-bold uppercase tracking-wider flex items-center gap-1"
            >
              <span>All Bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {reservations.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-3 bg-charcoal-950/60 rounded-2xl border border-charcoal-800/60">
                <div className="w-10 h-10 rounded-full bg-charcoal-900 text-amber-400 flex items-center justify-center mx-auto border border-charcoal-800">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-serif font-bold text-ivory-200 text-sm">No Reservations Yet</p>
                  <p className="text-xs text-ivory-500 max-w-xs mx-auto mt-0.5">
                    Guest table booking requests will appear here with party sizes, dates, and seating times.
                  </p>
                </div>
                <Link
                  href="/reservations"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs text-terracotta-400 hover:underline font-semibold"
                >
                  <span>Open Reservations Page &rarr;</span>
                </Link>
              </div>
            ) : (
              reservations.slice(0, 5).map((res) => (
                <div
                  key={res.id}
                  className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800/80 flex items-center justify-between text-xs hover:border-charcoal-700 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-terracotta-400">
                        #{res.bookingRef}
                      </span>
                      <span className="text-ivory-600">&bull;</span>
                      <span className="font-medium text-ivory-200">{res.customerName}</span>
                    </div>
                    <p className="text-[11px] text-ivory-400 mt-1">
                      {res.reservationDate} at {res.timeSlot} &bull; {res.guestCount} Guests
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        res.status === "CONFIRMED"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-amber-950 text-amber-400 border border-amber-800"
                      }`}
                    >
                      {res.status}
                    </span>
                    {res.tableAssignment && (
                      <p className="text-[10px] text-ivory-400 mt-1">
                        Table: {res.tableAssignment}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Operational Audit Log */}
      <div className="p-6 sm:p-8 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-ivory-50">Recent System Activity</h3>
            <p className="text-[11px] text-ivory-400">Audited staff and customer actions</p>
          </div>
          <Link
            href="/admin/activity-logs"
            className="text-xs text-terracotta-400 hover:text-terracotta-300 font-bold uppercase tracking-wider flex items-center gap-1"
          >
            <span>Activity Logs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2 text-xs">
          {recentLogs.length === 0 ? (
            <div className="py-8 text-center text-ivory-500 text-xs">
              No recent activity recorded yet. New actions will be audited here in real time.
            </div>
          ) : (
            recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between py-2.5 border-b border-charcoal-800/80 last:border-0 text-ivory-300"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta-400 shrink-0" />
                  <span className="font-semibold text-ivory-100">{log.action}</span>
                  <span className="text-ivory-400 text-[11px]">&bull; by {log.userName || "System"}</span>
                </div>
                <span className="text-[11px] font-mono text-ivory-500">
                  {formatDateTime(log.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
