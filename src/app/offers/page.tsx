"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Tag, Sparkles, Check, ArrowRight, Clock, ShieldCheck, RefreshCw } from "lucide-react";

interface DatabaseCoupon {
  id: string;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED" | string;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number | null;
  startDate: string;
  endDate: string;
}

export default function OffersPage() {
  const [coupons, setCoupons] = useState<DatabaseCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchLiveOffers = useCallback(async () => {
    try {
      const res = await fetch("/api/promotions", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.coupons)) {
        setCoupons(data.coupons);
      }
    } catch {
      // background polling silent fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveOffers();
    // Poll every 5s when page is active so created/deactivated coupons update live
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        fetchLiveOffers();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchLiveOffers]);

  const handleCopy = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
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

        {/* Live Offers Grid */}
        {loading ? (
          <div className="min-h-[30vh] flex flex-col items-center justify-center text-center p-8 space-y-3">
            <RefreshCw className="w-8 h-8 text-terracotta-600 animate-spin mx-auto" />
            <p className="text-xs text-charcoal-700">Loading active hearth offers from restaurant database...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="bg-ivory-100 rounded-3xl p-12 border border-ivory-300 text-center space-y-4 max-w-lg mx-auto shadow-sm">
            <Tag className="w-10 h-10 text-charcoal-400 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-charcoal-900">No Active Promotional Codes</h3>
            <p className="text-xs text-charcoal-700 leading-relaxed">
              There are no public coupon codes active at the moment. Please explore our seasonal wood-fired menu.
            </p>
            <Link
              href="/menu"
              className="inline-block bg-charcoal-900 hover:bg-terracotta-600 text-ivory-50 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow"
            >
              Explore Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coupons.map((coupon) => {
              const isPercentage = coupon.discountType === "PERCENTAGE";
              const discountSummary = isPercentage
                ? `${coupon.discountValue}% OFF${coupon.maxDiscountAmount ? ` up to ${formatCurrency(coupon.maxDiscountAmount)}` : ""}`
                : `Flat ${formatCurrency(coupon.discountValue)} OFF`;

              return (
                <div
                  key={coupon.id || coupon.code}
                  className="bg-ivory-100 rounded-3xl p-8 border border-ivory-300 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6 relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-terracotta-100 text-terracotta-800 text-[10px] font-bold tracking-widest uppercase">
                        {isPercentage ? "PERCENTAGE SAVINGS" : "FLAT DISCOUNT"}
                      </span>
                      <span className="text-[11px] text-charcoal-700 font-medium">
                        Min: {formatCurrency(coupon.minOrderValue)}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-2xl font-bold text-charcoal-900">
                        {coupon.code}
                      </h3>
                      <p className="text-xs text-charcoal-700 mt-2 leading-relaxed">
                        {coupon.description}
                      </p>
                    </div>

                    <div className="p-3 bg-ivory-50 rounded-2xl border border-ivory-200 text-xs flex items-center justify-between">
                      <span className="font-serif font-bold text-terracotta-700 text-sm">
                        {discountSummary}
                      </span>
                      <span className="text-[11px] text-charcoal-700">
                        {coupon.maxDiscountAmount ? `Max: ${formatCurrency(coupon.maxDiscountAmount)}` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-ivory-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold bg-charcoal-900 text-ivory-50 px-3.5 py-1.5 rounded-xl tracking-wider">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => handleCopy(coupon.code)}
                        className="p-2 rounded-xl text-xs font-semibold text-charcoal-700 hover:text-charcoal-950 hover:bg-ivory-200 transition-colors"
                        title="Copy code"
                      >
                        {copiedCode === coupon.code ? (
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
              );
            })}
          </div>
        )}

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
