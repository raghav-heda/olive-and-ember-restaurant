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
} from "lucide-react";

export const revalidate = 0; // Dynamic server component

export default async function AdminDashboardPage() {
  const session = await requirePageAuth();

  // Query real data from database
  const orders = await prisma.order.findMany({
    where: { restaurantId: session.restaurantId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const reservations = await prisma.reservation.findMany({
    where: { restaurantId: session.restaurantId },
    orderBy: { createdAt: "desc" },
  });

  const menuItems = await prisma.menuItem.findMany({
    where: { restaurantId: session.restaurantId },
  });

  const recentLogs = await prisma.activityLog.findMany({
    where: { restaurantId: session.restaurantId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Calculate Metrics
  const totalOrdersCount = orders.length;
  const ordersAwaitingAction = orders.filter((o) =>
    ["PENDING", "PREPARING"].includes(o.status)
  ).length;

  const paidOrders = orders.filter((o) => o.paymentStatus === "PAID");
  const totalPaidRevenue = paidOrders.reduce((sum, o) => sum + o.finalTotal, 0);

  const averageOrderValue =
    paidOrders.length > 0 ? Math.round(totalPaidRevenue / paidOrders.length) : 0;

  const pendingReservations = reservations.filter((r) => r.status === "PENDING").length;
  const confirmedReservations = reservations.filter((r) => r.status === "CONFIRMED").length;

  return (
    <div className="space-y-8">
      {/* Header with Demo Data Tag */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-mono text-terracotta-400 font-bold">
              Operations Center
            </span>
            <span className="text-xs text-charcoal-700">&bull;</span>
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live DB Synced
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-ivory-50 mt-1">
            Kitchen Overview &amp; Metrics
          </h1>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/orders"
            className="bg-terracotta-600 hover:bg-terracotta-500 text-ivory-50 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow"
          >
            Manage Active Tickets
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Paid Revenue */}
        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-3">
          <div className="flex items-center justify-between text-ivory-400">
            <span className="text-xs font-bold uppercase tracking-wider">Paid Revenue</span>
            <IndianRupee className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="font-serif text-3xl font-bold text-ivory-50">
            {formatCurrency(totalPaidRevenue)}
          </p>
          <p className="text-[11px] text-ivory-400">
            From {paidOrders.length} verified settled orders
          </p>
        </div>

        {/* Orders Awaiting Kitchen */}
        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-3">
          <div className="flex items-center justify-between text-ivory-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Tickets</span>
            <UtensilsCrossed className="w-5 h-5 text-terracotta-400" />
          </div>
          <p className="font-serif text-3xl font-bold text-terracotta-400">
            {ordersAwaitingAction}
          </p>
          <p className="text-[11px] text-ivory-400">
            {totalOrdersCount} total lifetime orders placed
          </p>
        </div>

        {/* Pending Reservations */}
        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-3">
          <div className="flex items-center justify-between text-ivory-400">
            <span className="text-xs font-bold uppercase tracking-wider">Table Requests</span>
            <Calendar className="w-5 h-5 text-amber-400" />
          </div>
          <p className="font-serif text-3xl font-bold text-amber-400">
            {pendingReservations}
          </p>
          <p className="text-[11px] text-ivory-400">
            {confirmedReservations} confirmed upcoming bookings
          </p>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-3">
          <div className="flex items-center justify-between text-ivory-400">
            <span className="text-xs font-bold uppercase tracking-wider">Average Ticket</span>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <p className="font-serif text-3xl font-bold text-ivory-50">
            {formatCurrency(averageOrderValue)}
          </p>
          <p className="text-[11px] text-ivory-400">Computed on settled carts</p>
        </div>
      </div>

      {/* 2-Column Section: Recent Orders & Table Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders Queue */}
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-ivory-50">Recent Order Stream</h2>
            <Link
              href="/admin/orders"
              className="text-xs text-terracotta-400 hover:text-terracotta-300 font-bold uppercase tracking-wider"
            >
              All Orders &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-terracotta-400">
                      #{order.publicCode}
                    </span>
                    <span className="text-ivory-400">&bull;</span>
                    <span className="font-medium text-ivory-200">{order.customerName}</span>
                  </div>
                  <p className="text-[11px] text-ivory-400 mt-1">
                    {order.items.length} items &bull; {order.fulfilmentType} &bull; {formatDateTime(order.createdAt)}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-bold text-ivory-50 text-sm block">
                    {formatCurrency(order.finalTotal)}
                  </span>
                  <span
                    className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded mt-0.5 ${
                      order.status === "COMPLETED"
                        ? "bg-emerald-950 text-emerald-400"
                        : order.status === "PREPARING"
                        ? "bg-amber-950 text-amber-400"
                        : "bg-terracotta-950 text-terracotta-400"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Table Reservations */}
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-ivory-50">Upcoming Table Bookings</h2>
            <Link
              href="/admin/reservations"
              className="text-xs text-terracotta-400 hover:text-terracotta-300 font-bold uppercase tracking-wider"
            >
              All Bookings &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {reservations.slice(0, 5).map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-terracotta-400">
                      #{res.bookingRef}
                    </span>
                    <span className="text-ivory-400">&bull;</span>
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
                        ? "bg-emerald-950 text-emerald-400"
                        : "bg-amber-950 text-amber-400"
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
            ))}
          </div>
        </div>
      </div>

      {/* Operational Audit Log */}
      <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-4">
        <h3 className="font-serif text-lg font-bold text-ivory-50">Recent System Activity</h3>
        <div className="space-y-2 text-xs">
          {recentLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between py-2 border-b border-charcoal-800 last:border-0 text-ivory-300"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta-400" />
                <span className="font-semibold text-ivory-100">{log.action}</span>
                <span className="text-ivory-400">&bull; by {log.userName}</span>
              </div>
              <span className="text-[11px] text-ivory-400">
                {formatDateTime(log.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
