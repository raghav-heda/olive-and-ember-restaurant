"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/store";
import { ShoppingBag, Calendar, Menu as MenuIcon, X, Flame } from "lucide-react";

export function Navbar({ onOpenCart }: { onOpenCart?: () => void }) {
  const pathname = usePathname();
  const { totalItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide public navbar on admin pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const navLinks = [
    { href: "/menu", label: "Menu" },
    { href: "/reservations", label: "Reservations" },
    { href: "/about", label: "Story & Craft" },
    { href: "/gallery", label: "Gallery" },
    { href: "/offers", label: "Special Offers" },
    { href: "/contact", label: "Contact & Hours" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-ivory-50/90 border-b border-ivory-300 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm relative">
              <Image
                src="/images/restaurant-logo.png"
                alt="Olive & Ember Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl tracking-wide font-medium text-charcoal-900 group-hover:text-terracotta-600 transition-colors">
                Olive &amp; Ember
              </span>
              <span className="text-[10px] uppercase tracking-widest text-charcoal-700 font-sans font-medium">
                Artisanal Hearth
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-wide transition-colors ${
                    isActive
                      ? "text-terracotta-600 font-medium border-b-2 border-terracotta-500 pb-0.5"
                      : "text-charcoal-800 hover:text-terracotta-600"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              aria-label="View shopping bag"
              className="relative p-2.5 rounded-full text-charcoal-800 hover:bg-ivory-200 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute top-1 right-1 bg-terracotta-500 text-ivory-50 text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* Book a Table Primary CTA */}
            <Link
              href="/reservations"
              className="hidden sm:inline-flex items-center gap-2 bg-charcoal-900 hover:bg-terracotta-600 text-ivory-50 px-4 py-2.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-300 shadow-sm hover:shadow"
            >
              <Calendar className="w-3.5 h-3.5 text-terracotta-400" />
              <span>Reserve Table</span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 text-charcoal-900 hover:bg-ivory-200 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-ivory-100 border-b border-ivory-300 px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-serif py-1 transition-colors ${
                    isActive ? "text-terracotta-600 font-semibold" : "text-charcoal-800"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 border-t border-ivory-300 flex flex-col gap-3">
            <Link
              href="/reservations"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-terracotta-600 text-ivory-50 py-3 rounded-xl text-sm font-medium uppercase tracking-wider shadow"
            >
              <Calendar className="w-4 h-4" />
              <span>Reserve a Table</span>
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center text-xs text-charcoal-700 hover:text-charcoal-900 py-1"
            >
              Staff Portal Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
