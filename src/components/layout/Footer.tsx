"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Flame, MapPin, Phone, Mail, Clock, ShieldCheck, ArrowRight, Check } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Hide public footer on admin pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="bg-charcoal-950 text-ivory-100 border-t border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center relative shadow-sm">
                <Image
                  src="/images/restaurant-logo.png"
                  alt="Olive & Ember Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-serif text-2xl tracking-wide text-ivory-50">
                Olive &amp; Ember
              </span>
            </div>
            <p className="text-sm text-ivory-300 leading-relaxed font-sans">
              Slow-fermented sourdough, 450°C wood-fired hearths, and sun-kissed botanical flavors. An intimate culinary sanctum crafted with devotion.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-olive-500 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-olive-500 animate-pulse" />
              <span>Oven Stoked &amp; Dining Room Active</span>
            </div>
          </div>

          {/* Col 2: Service Hours & Location */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg text-ivory-50 tracking-wide">Hours &amp; Location</h4>
            <div className="space-y-2 text-sm text-ivory-300">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-terracotta-400 mt-1 shrink-0" />
                <div>
                  <p className="font-medium text-ivory-100">Lunch Service:</p>
                  <p className="text-xs text-ivory-400">Daily: 12:00 PM – 3:30 PM</p>
                  <p className="font-medium text-ivory-100 mt-1.5">Dinner Hearth:</p>
                  <p className="text-xs text-ivory-400">Mon–Thu: 6:30 PM – 11:00 PM</p>
                  <p className="text-xs text-ivory-400">Fri–Sat: 6:30 PM – 11:45 PM</p>
                  <p className="font-medium text-ivory-100 mt-1.5">Sunday Hearth:</p>
                  <p className="text-xs text-ivory-400">12:00 PM – 10:30 PM (All-Day)</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 pt-2">
                <MapPin className="w-4 h-4 text-terracotta-400 mt-0.5 shrink-0" />
                <p className="text-xs leading-relaxed text-ivory-400">
                  14/2 Hearthstone Ave, 100ft Road, Indiranagar, Bengaluru, KA 560038
                </p>
              </div>
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg text-ivory-50 tracking-wide">Explore</h4>
            <ul className="space-y-2 text-sm text-ivory-300">
              <li>
                <Link href="/menu" className="hover:text-terracotta-400 transition-colors">
                  Digital Menu &amp; Ordering
                </Link>
              </li>
              <li>
                <Link href="/reservations" className="hover:text-terracotta-400 transition-colors">
                  Table Reservations
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-terracotta-400 transition-colors">
                  Culinary Philosophy &amp; Sourcing
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-terracotta-400 transition-colors">
                  Interior &amp; Food Gallery
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-terracotta-400 transition-colors">
                  Seasonal Dining Offers
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-terracotta-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Commercial Demo Badge */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg text-ivory-50 tracking-wide">The Hearth Club</h4>
            <p className="text-xs text-ivory-400 leading-relaxed">
              Receive seasonal chef tasting invites, wine pairing notes, and secret menu releases.
            </p>

            {subscribed ? (
              <div className="p-3 rounded-lg bg-olive-900/60 border border-olive-700/50 flex items-center gap-2 text-xs text-olive-100">
                <Check className="w-4 h-4 text-olive-400 shrink-0" />
                <span>You are on the guest list! Thank you.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="bg-charcoal-900 border border-charcoal-700 rounded-lg px-3.5 py-2 text-xs text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-terracotta-500 w-full"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="bg-terracotta-600 hover:bg-terracotta-500 text-ivory-50 px-3 py-2 rounded-lg text-xs font-medium transition-colors shrink-0"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            <div className="pt-2 border-t border-charcoal-800 text-[11px] text-ivory-400 space-y-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-terracotta-400 shrink-0" />
                <span className="font-semibold text-ivory-300">Commercial Demonstration Prototype</span>
              </div>
              <p className="text-[10px] text-ivory-400">
                Created for restaurant owner evaluation. Realistic demo data; not a live restaurant establishment.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-charcoal-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ivory-400">
          <p>© {new Date().getFullYear()} Olive &amp; Ember Kitchen. All rights reserved.</p>
          <div className="flex items-center gap-6 text-[11px]">
            <Link href="/privacy" className="hover:text-ivory-200 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-ivory-200 transition-colors">
              Terms &amp; Cancellation
            </Link>
            <Link
              href="/admin/login"
              className="text-ivory-300 hover:text-terracotta-400 transition-colors font-medium"
            >
              Staff Portal
            </Link>
            <span>Currency: INR (₹)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
