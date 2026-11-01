"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/store";
import { ShoppingBag, Calendar, Menu as MenuIcon, X } from "lucide-react";

export function Navbar({ onOpenCart }: { onOpenCart?: () => void }) {
  const pathname = usePathname();
  const { totalItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock background body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [mobileMenuOpen]);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-ivory-50/95 border-b border-ivory-300 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm relative shrink-0">
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
              <span className="font-serif text-lg sm:text-xl tracking-wide font-medium text-charcoal-900 group-hover:text-terracotta-600 transition-colors leading-tight">
                Olive &amp; Ember
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-charcoal-700 font-sans font-medium">
                Artisanal Hearth
              </span>
            </div>
          </Link>

          {/* Desktop Navigation (md and up) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs lg:text-sm tracking-wide transition-colors ${
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
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              aria-label="View shopping bag"
              className="relative p-2 sm:p-2.5 rounded-full text-charcoal-800 hover:bg-ivory-200 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute top-1 right-1 bg-terracotta-500 text-ivory-50 text-[10px] sm:text-[11px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* Book a Table Primary CTA (hidden on small mobile, visible on sm and up) */}
            <Link
              href="/reservations"
              className="hidden sm:inline-flex items-center gap-2 bg-charcoal-900 hover:bg-terracotta-600 text-ivory-50 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-300 shadow-sm hover:shadow shrink-0"
            >
              <Calendar className="w-3.5 h-3.5 text-terracotta-400" />
              <span>Reserve Table</span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 text-charcoal-900 hover:bg-ivory-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta-500"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[72px] bottom-0 z-50 flex flex-col">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-charcoal-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          />

          {/* Drawer Content */}
          <div className="relative bg-ivory-50 border-b border-ivory-300 px-6 py-6 space-y-6 shadow-2xl max-h-[calc(100vh-72px)] overflow-y-auto animate-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-base font-serif py-2 border-b border-ivory-200/60 transition-colors ${
                      isActive ? "text-terracotta-600 font-semibold" : "text-charcoal-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2">
              <Link
                href="/reservations"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-terracotta-600 hover:bg-terracotta-500 text-ivory-50 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow"
              >
                <Calendar className="w-4 h-4" />
                <span>Reserve a Table</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
