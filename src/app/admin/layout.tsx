import { getCurrentSession, isAdminRole } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import {
  Flame,
  LayoutDashboard,
  UtensilsCrossed,
  Calendar,
  BookOpen,
  QrCode,
  Tag,
  BarChart3,
  Sliders,
  History,
  LogOut,
  ExternalLink,
  Shield,
  User,
} from "lucide-react";
import prisma from "@/lib/db";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  // If not authenticated, render children without sidebar (e.g. login page)
  if (!session) {
    return <>{children}</>;
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.restaurantId },
    select: { name: true, city: true },
  });

  const isAdmin = isAdminRole(session.role);

  return (
    <div className="min-h-screen bg-charcoal-950 text-ivory-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-charcoal-900 border-r border-charcoal-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand & Staff Header */}
          <div className="p-6 border-b border-charcoal-800 space-y-3">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shadow relative">
                <Image
                  src="/images/restaurant-logo.png"
                  alt="Olive & Ember Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-serif text-lg font-bold text-ivory-50 block leading-tight">
                  {restaurant?.name || "Olive & Ember"}
                </span>
                <span className="text-[10px] text-terracotta-400 uppercase tracking-widest font-mono font-bold">
                  MANAGEMENT PORTAL
                </span>
              </div>
            </Link>

            {/* Authenticated User Badge */}
            <div className="pt-2 p-3 bg-charcoal-950/80 rounded-2xl border border-charcoal-800 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-bold text-ivory-100 truncate">{session.name}</p>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isAdmin
                      ? "bg-terracotta-950 text-terracotta-400 border border-terracotta-800"
                      : "bg-blue-950 text-blue-400 border border-blue-800"
                  }`}
                >
                  {isAdmin ? "ADMIN" : "STAFF"}
                </span>
              </div>
              <p className="text-[10px] text-ivory-400 truncate">{session.email}</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1 text-xs">
            {/* Shared Operational Modules */}
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-charcoal-800 text-ivory-200 hover:text-ivory-50 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-terracotta-400" />
              <span>Overview &amp; Metrics</span>
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-charcoal-800 text-ivory-200 hover:text-ivory-50 transition-colors"
            >
              <UtensilsCrossed className="w-4 h-4 text-terracotta-400" />
              <span>Live Orders</span>
            </Link>

            <Link
              href="/admin/reservations"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-charcoal-800 text-ivory-200 hover:text-ivory-50 transition-colors"
            >
              <Calendar className="w-4 h-4 text-terracotta-400" />
              <span>Table Bookings</span>
            </Link>

            <Link
              href="/admin/menu"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-charcoal-800 text-ivory-200 hover:text-ivory-50 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-terracotta-400" />
              <span>Menu Viewing &amp; Items</span>
            </Link>

            <Link
              href="/admin/qr-menu"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-charcoal-800 text-ivory-200 hover:text-ivory-50 transition-colors"
            >
              <QrCode className="w-4 h-4 text-terracotta-400" />
              <span>Table QR Menus</span>
            </Link>

            <Link
              href="/admin/activity-logs"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-charcoal-800 text-ivory-200 hover:text-ivory-50 transition-colors"
            >
              <History className="w-4 h-4 text-terracotta-400" />
              <span>Staff Activity Logs</span>
            </Link>

            {/* Administrator Only Modules */}
            {isAdmin && (
              <>
                <div className="pt-3 pb-1 px-3.5 text-[10px] font-mono uppercase tracking-widest text-ivory-500 font-bold">
                  Administration
                </div>

                <Link
                  href="/admin/promotions"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-charcoal-800 text-ivory-200 hover:text-ivory-50 transition-colors"
                >
                  <Tag className="w-4 h-4 text-terracotta-400" />
                  <span>Coupons &amp; Offers</span>
                </Link>

                <Link
                  href="/admin/analytics"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-charcoal-800 text-ivory-200 hover:text-ivory-50 transition-colors"
                >
                  <BarChart3 className="w-4 h-4 text-terracotta-400" />
                  <span>Analytics &amp; Sales</span>
                </Link>

                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-charcoal-800 text-ivory-200 hover:text-ivory-50 transition-colors"
                >
                  <Sliders className="w-4 h-4 text-terracotta-400" />
                  <span>Restaurant Settings</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-charcoal-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-ivory-400 hover:text-ivory-100 hover:bg-charcoal-800 transition-colors"
          >
            <span>Customer Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
