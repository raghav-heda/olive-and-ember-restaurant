import { requireAuth, isAdminRole } from "@/lib/auth";
import prisma from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Users,
  UtensilsCrossed,
  Info,
  Calendar,
} from "lucide-react";
import { ForbiddenCard } from "@/components/admin/ForbiddenCard";

export const revalidate = 0;

export default async function AdminAnalyticsPage() {
  const session = await requireAuth();

  if (!isAdminRole(session.role)) {
    return <ForbiddenCard moduleName="Financial Analytics & Revenue Reports" />;
  }

  const orders = await prisma.order.findMany({
    where: { restaurantId: session.restaurantId },
    include: { items: true },
  });

  const reservations = await prisma.reservation.findMany({
    where: { restaurantId: session.restaurantId },
  });

  const coupons = await prisma.coupon.findMany({
    where: { restaurantId: session.restaurantId },
  });

  // 1. Financial Metrics
  const paidOrders = orders.filter((o) => o.paymentStatus === "PAID");
  const grossRevenue = paidOrders.reduce((sum, o) => sum + o.finalTotal, 0);
  const totalFoodSubtotal = paidOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalTaxCollected = paidOrders.reduce((sum, o) => sum + o.taxTotal, 0);
  const totalDeliveryCollected = paidOrders.reduce((sum, o) => sum + o.deliveryFee, 0);
  const totalDiscountsGiven = paidOrders.reduce((sum, o) => sum + o.discountTotal, 0);
  const aov = paidOrders.length > 0 ? Math.round(grossRevenue / paidOrders.length) : 0;

  // 2. Fulfilment Channels
  const deliveryOrders = orders.filter((o) => o.fulfilmentType === "DELIVERY").length;
  const pickupOrders = orders.filter((o) => o.fulfilmentType === "PICKUP").length;
  const dineInOrders = orders.filter((o) => o.fulfilmentType === "DINE_IN").length;

  // 3. Dish Popularity Ranking
  const dishCountMap = new Map<string, { count: number; revenue: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const existing = dishCountMap.get(item.itemNameSnapshot) || { count: 0, revenue: 0 };
      dishCountMap.set(item.itemNameSnapshot, {
        count: existing.count + item.quantity,
        revenue: existing.revenue + item.itemTotalSnapshot,
      });
    }
  }

  const popularDishes = Array.from(dishCountMap.entries())
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs uppercase tracking-widest font-mono text-terracotta-400 font-bold">
          Business Intelligence
        </span>
        <h1 className="font-serif text-3xl font-bold text-ivory-50 mt-1">
          Operational Analytics &amp; Reports
        </h1>
        <p className="text-xs text-ivory-400 mt-1">
          Real database metrics calculating settled net revenue, culinary volume, channel splits, and coupon velocity.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ivory-400">
            Settled Net Sales
          </span>
          <p className="font-serif text-3xl font-bold text-ivory-50">
            {formatCurrency(grossRevenue)}
          </p>
          <p className="text-[11px] text-emerald-400">
            From {paidOrders.length} paid transactions
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ivory-400">
            Average Ticket (AOV)
          </span>
          <p className="font-serif text-3xl font-bold text-ivory-50">
            {formatCurrency(aov)}
          </p>
          <p className="text-[11px] text-ivory-400">Computed on paid baskets</p>
        </div>

        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ivory-400">
            Total Covers Booked
          </span>
          <p className="font-serif text-3xl font-bold text-ivory-50">
            {reservations.reduce((sum, r) => sum + r.guestCount, 0)}
          </p>
          <p className="text-[11px] text-ivory-400">
            Across {reservations.length} reservations
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ivory-400">
            Discounts Absorbed
          </span>
          <p className="font-serif text-3xl font-bold text-terracotta-400">
            {formatCurrency(totalDiscountsGiven)}
          </p>
          <p className="text-[11px] text-ivory-400">Promotional campaigns</p>
        </div>
      </div>

      {/* 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Dishes Ranking */}
        <div className="p-6 sm:p-8 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-4">
          <h2 className="font-serif text-xl font-bold text-ivory-50">
            Top Performing Dishes
          </h2>
          <div className="space-y-3">
            {popularDishes.map((dish, i) => (
              <div
                key={dish.name}
                className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-charcoal-800 text-terracotta-400 flex items-center justify-center font-mono font-bold text-[11px]">
                    0{i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-ivory-100">{dish.name}</p>
                    <p className="text-[11px] text-ivory-400">{dish.count} servings ordered</p>
                  </div>
                </div>
                <span className="font-bold text-ivory-50">
                  {formatCurrency(dish.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Channel Breakdown */}
        <div className="p-6 sm:p-8 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-6">
          <h2 className="font-serif text-xl font-bold text-ivory-50">
            Order Channel Distribution
          </h2>

          <div className="space-y-4 text-xs">
            {/* Delivery Bar */}
            <div>
              <div className="flex justify-between text-ivory-300 mb-1">
                <span>Delivery Consignments</span>
                <span className="font-bold">{deliveryOrders} orders</span>
              </div>
              <div className="h-3 bg-charcoal-950 rounded-full overflow-hidden border border-charcoal-800">
                <div
                  className="h-full bg-terracotta-500 rounded-full"
                  style={{
                    width: `${orders.length > 0 ? (deliveryOrders / orders.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Pickup Bar */}
            <div>
              <div className="flex justify-between text-ivory-300 mb-1">
                <span>Takeaway Pickup</span>
                <span className="font-bold">{pickupOrders} orders</span>
              </div>
              <div className="h-3 bg-charcoal-950 rounded-full overflow-hidden border border-charcoal-800">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${orders.length > 0 ? (pickupOrders / orders.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Dine-In Bar */}
            <div>
              <div className="flex justify-between text-ivory-300 mb-1">
                <span>Dine-In Table Orders</span>
                <span className="font-bold">{dineInOrders} orders</span>
              </div>
              <div className="h-3 bg-charcoal-950 rounded-full overflow-hidden border border-charcoal-800">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${orders.length > 0 ? (dineInOrders / orders.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Coupon Performance */}
          <div className="pt-4 border-t border-charcoal-800 space-y-2">
            <h4 className="font-serif text-sm font-bold text-ivory-100">
              Active Coupon Redemptions
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800"
                >
                  <span className="font-mono text-terracotta-400 font-bold block">
                    {c.code}
                  </span>
                  <span className="text-ivory-300 text-[11px]">
                    {c.currentUses} redemptions ({c.maxUses} max)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Accounting Breakdown Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-4 text-xs">
        <h3 className="font-serif text-base font-bold text-ivory-50 flex items-center gap-2">
          <Info className="w-4 h-4 text-terracotta-400" />
          <span>Accounting Definitions &amp; Tax Ledger</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-ivory-300 pt-2 border-t border-charcoal-800">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-ivory-400 block">
              Food Subtotal
            </span>
            <span className="font-bold text-ivory-100 text-sm">
              {formatCurrency(totalFoodSubtotal)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-ivory-400 block">
              GST Collected (5%)
            </span>
            <span className="font-bold text-ivory-100 text-sm">
              {formatCurrency(totalTaxCollected)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-ivory-400 block">
              Delivery Fees
            </span>
            <span className="font-bold text-ivory-100 text-sm">
              {formatCurrency(totalDeliveryCollected)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-ivory-400 block">
              Net Settled Inflows
            </span>
            <span className="font-bold text-emerald-400 text-sm">
              {formatCurrency(grossRevenue)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
