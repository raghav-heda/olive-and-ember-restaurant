"use client";

import { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@/lib/utils";
import { IndianRupee, UtensilsCrossed, Calendar, TrendingUp, RefreshCw } from "lucide-react";

export interface DashboardMetricsData {
  totalPaidRevenue: number;
  paidOrdersCount: number;
  ordersAwaitingAction: number;
  totalOrdersCount: number;
  pendingReservations: number;
  confirmedReservations: number;
  averageOrderValue: number;
  menuItemsCount: number;
}

export function DashboardLiveMetrics({ initialMetrics }: { initialMetrics: DashboardMetricsData }) {
  const [metrics, setMetrics] = useState<DashboardMetricsData>(initialMetrics);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLiveMetrics = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/metrics", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.metrics) {
        const m = data.metrics;
        setMetrics((prev) => ({
          ...prev,
          totalPaidRevenue: m.todayRevenue ? prev.totalPaidRevenue : prev.totalPaidRevenue,
          ordersAwaitingAction: m.activeOrdersCount ?? prev.ordersAwaitingAction,
          totalOrdersCount: m.totalOrdersCount ?? prev.totalOrdersCount,
          pendingReservations: m.pendingBookingsCount ?? prev.pendingReservations,
        }));
      }
    } catch {
      // background polling fallback
    } finally {
      if (!isSilent) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        fetchLiveMetrics(true);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchLiveMetrics]);

  return (
    <div className="space-y-4">
      {/* Live sync status pill */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-widest text-ivory-400">
          Executive Snapshot
        </span>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-800 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Sync 4s</span>
          </span>

          <button
            type="button"
            onClick={() => fetchLiveMetrics(false)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 border border-charcoal-700 text-[11px] text-ivory-200 transition-colors shadow-sm"
            title="Refresh metrics immediately"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-terracotta-400" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Paid Revenue */}
        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-ivory-400">
            <span className="text-xs font-bold uppercase tracking-wider">Settled Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-ivory-50">
            {formatCurrency(metrics.totalPaidRevenue)}
          </p>
          <p className="text-[11px] text-ivory-400">
            From {metrics.paidOrdersCount} completed / settled orders
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
            {metrics.ordersAwaitingAction}
          </p>
          <p className="text-[11px] text-ivory-400">
            {metrics.totalOrdersCount} total lifetime orders
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
            {metrics.pendingReservations}
          </p>
          <p className="text-[11px] text-ivory-400">
            {metrics.confirmedReservations} confirmed upcoming bookings
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
            {formatCurrency(metrics.averageOrderValue)}
          </p>
          <p className="text-[11px] text-ivory-400">
            Across {metrics.menuItemsCount} active menu catalog items
          </p>
        </div>
      </div>
    </div>
  );
}
