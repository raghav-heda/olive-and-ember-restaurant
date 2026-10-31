"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Tag, Sparkles, Check, ArrowRight, Clock, ShieldCheck } from "lucide-react";

interface OfferCard {
  code: string;
  title: string;
  description: string;
  discountSummary: string;
  minOrder: number;
  maxDiscount?: number;
  expiry: string;
  badge: string;
}

const ACTIVE_OFFERS: OfferCard[] = [
  {
    code: "EMBER10",
    title: "10% Welcome Hearth Discount",
    description: "Enjoy 10% savings on all wood-fired pizzas, handmade pastas, and desserts.",
    discountSummary: "10% OFF up to ₹150",
    minOrder: 500,
    maxDiscount: 150,
    expiry: "Valid across all 2026 reservations & orders",
    badge: "POPULAR",
  },
  {
    code: "WELCOME100",
    title: "Flat ₹100 Off First Dine-In or Pickup",
    description: "Special flat reduction for new guests experiencing our Indiranagar kitchen.",
    discountSummary: "Flat ₹100 Instant Discount",
    minOrder: 600,
    maxDiscount: 100,
    expiry: "No expiry for demo evaluation",
    badge: "NEW GUESTS",
  },
  {
    code: "FREEDELIVERY",
    title: "Free Artisanal Delivery Above ₹800",
    description: "Automatic delivery charge waiver on orders crossing the ₹800 cart threshold.",
    discountSummary: "100% Delivery Fee Waived",
    minOrder: 800,
    expiry: "Automatically calculated at checkout",
    badge: "AUTO-APPLIED",
  },
];

export default function OffersPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="bg-ivory-50 min-h-screen py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest font-bold text-terracotta-600">
            Exclusive Dining Privileges
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-charcoal-900 tracking-tight">
            Promotions &amp; Seasonal Offers
          </h1>
          <p className="text-sm text-charcoal-700 leading-relaxed">
            Apply these promotional codes during checkout or table ordering to receive verified culinary savings.
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ACTIVE_OFFERS.map((offer) => (
            <div
              key={offer.code}
              className="bg-ivory-100 rounded-3xl p-8 border border-ivory-300 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6 relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-terracotta-100 text-terracotta-800 text-[10px] font-bold tracking-widest uppercase">
                    {offer.badge}
                  </span>
                  <span className="text-[11px] text-charcoal-700 font-medium">
                    Min: {formatCurrency(offer.minOrder)}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-2xl font-bold text-charcoal-900">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-charcoal-700 mt-2 leading-relaxed">
                    {offer.description}
                  </p>
                </div>

                <div className="p-3 bg-ivory-50 rounded-2xl border border-ivory-200 text-xs flex items-center justify-between">
                  <span className="font-serif font-bold text-terracotta-700 text-sm">
                    {offer.discountSummary}
                  </span>
                  <span className="text-[11px] text-charcoal-700">
                    {offer.maxDiscount ? `Max: ${formatCurrency(offer.maxDiscount)}` : ""}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-ivory-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold bg-charcoal-900 text-ivory-50 px-3.5 py-1.5 rounded-xl tracking-wider">
                    {offer.code}
                  </span>
                  <button
                    onClick={() => handleCopy(offer.code)}
                    className="p-2 rounded-xl text-xs font-semibold text-charcoal-700 hover:text-charcoal-950 hover:bg-ivory-200 transition-colors"
                    title="Copy code"
                  >
                    {copiedCode === offer.code ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Copied
                      </span>
                    ) : (
                      "Copy"
                    )}
                  </button>
                </div>

                <Link
                  href="/menu"
                  className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-terracotta-600 hover:text-terracotta-700"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Promo Rules Section */}
        <div className="p-8 bg-ivory-100 rounded-3xl border border-ivory-200 space-y-4 text-xs text-charcoal-700">
          <h4 className="font-serif text-base font-bold text-charcoal-900">
            Promotion Terms &amp; Conditions
          </h4>
          <ul className="space-y-2 leading-relaxed">
            <li>• Only one promotional coupon code can be redeemed per order.</li>
            <li>• Discounts are validated on the server against minimum cart requirements prior to tax application.</li>
            <li>• Codes are valid for takeaway pickup, direct delivery, and digital table ordering.</li>
            <li>• Olive &amp; Ember Kitchen reserves the right to modify or conclude promotional offers at its operational discretion.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
