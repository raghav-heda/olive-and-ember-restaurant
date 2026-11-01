"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
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
  Menu,
  X,
  Mail,
} from "lucide-react";

interface AdminSidebarProps {
  restaurantName: string;
  userName: string;
  userEmail: string;
  isAdmin: boolean;
}

export function AdminSidebar({
  restaurantName,
  userName,
  userEmail,
  isAdmin,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/admin", label: "Overview & Metrics", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Live Orders", icon: UtensilsCrossed },
    { href: "/admin/reservations", label: "Table Bookings", icon: Calendar },
    { href: "/admin/inquiries", label: "Guest Inquiries", icon: Mail },
    { href: "/admin/menu", label: "Menu Viewing & Items", icon: BookOpen },
    { href: "/admin/qr-menu", label: "Table QR Menus", icon: QrCode },
    { href: "/admin/activity-logs", label: "Staff Activity Logs", icon: History },
  ];

  const adminLinks = [
    { href: "/admin/promotions", label: "Coupons & Offers", icon: Tag },
    { href: "/admin/analytics", label: "Analytics & Sales", icon: BarChart3 },
    { href: "/admin/settings", label: "Restaurant Settings", icon: Sliders },
  ];

  return (
    <>
      {/* MOBILE TOP BAR (visible on screens < md) */}
      <div className="md:hidden bg-charcoal-900 border-b border-charcoal-800 px-4 py-3 sticky top-0 z-40 flex items-center justify-between shadow-md">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shadow relative shrink-0">
            <Image
              src="/images/restaurant-logo.png"
              alt="Olive & Ember Logo"
              width={28}
              height={28}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="font-serif text-sm font-bold text-ivory-50 block leading-tight">
              {restaurantName}
            </span>
            <span className="text-[9px] text-terracotta-400 uppercase tracking-widest font-mono font-bold">
              PORTAL
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              isAdmin
                ? "bg-terracotta-950 text-terracotta-400 border border-terracotta-800"
                : "bg-blue-950 text-blue-400 border border-blue-800"
            }`}
          >
            {isAdmin ? "ADMIN" : "STAFF"}
          </span>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close admin navigation" : "Open admin navigation"}
            className="p-1.5 text-ivory-300 hover:text-ivory-50 hover:bg-charcoal-800 rounded-lg transition-colors focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE COLLAPSIBLE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-charcoal-900/98 backdrop-blur-md border-b border-charcoal-800 px-4 py-4 space-y-4 animate-in slide-in-from-top duration-200 z-30 shadow-2xl">
          {/* User Info */}
          <div className="p-3 bg-charcoal-950 rounded-xl border border-charcoal-800 text-xs flex items-center justify-between">
            <div className="truncate mr-2">
              <p className="font-bold text-ivory-100 truncate">{userName}</p>
              <p className="text-[10px] text-ivory-400 truncate">{userEmail}</p>
            </div>
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                isAdmin
                  ? "bg-terracotta-950 text-terracotta-400 border border-terracotta-800"
                  : "bg-blue-950 text-blue-400 border border-blue-800"
              }`}
            >
              {isAdmin ? "ADMIN" : "STAFF"}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                    isActive
                      ? "bg-charcoal-800 text-ivory-50 font-medium"
                      : "text-ivory-200 hover:bg-charcoal-800 hover:text-ivory-50"
                  }`}
                >
                  <Icon className="w-4 h-4 text-terracotta-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <>
                <div className="pt-2 pb-1 px-3 text-[10px] font-mono uppercase tracking-widest text-ivory-500 font-bold">
                  Administration
                </div>
                {adminLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                        isActive
                          ? "bg-charcoal-800 text-ivory-50 font-medium"
                          : "text-ivory-200 hover:bg-charcoal-800 hover:text-ivory-50"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-terracotta-400" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-charcoal-800 flex items-center justify-between gap-3 text-xs">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 text-ivory-400 hover:text-ivory-100"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer Website</span>
            </Link>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-2 text-red-400 hover:text-red-300 font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR (visible on screens >= md) */}
      <aside className="hidden md:flex w-64 bg-charcoal-900 border-r border-charcoal-800 flex-col justify-between shrink-0 min-h-screen sticky top-0">
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
                  {restaurantName}
                </span>
                <span className="text-[10px] text-terracotta-400 uppercase tracking-widest font-mono font-bold">
                  MANAGEMENT PORTAL
                </span>
              </div>
            </Link>

            {/* Authenticated User Badge */}
            <div className="pt-2 p-3 bg-charcoal-950/80 rounded-2xl border border-charcoal-800 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-bold text-ivory-100 truncate">{userName}</p>
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
              <p className="text-[10px] text-ivory-400 truncate">{userEmail}</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1 text-xs">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                    isActive
                      ? "bg-charcoal-800 text-ivory-50 font-medium"
                      : "text-ivory-200 hover:bg-charcoal-800 hover:text-ivory-50"
                  }`}
                >
                  <Icon className="w-4 h-4 text-terracotta-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <>
                <div className="pt-3 pb-1 px-3.5 text-[10px] font-mono uppercase tracking-widest text-ivory-500 font-bold">
                  Administration
                </div>

                {adminLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                        isActive
                          ? "bg-charcoal-800 text-ivory-50 font-medium"
                          : "text-ivory-200 hover:bg-charcoal-800 hover:text-ivory-50"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-terracotta-400" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
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
    </>
  );
}
