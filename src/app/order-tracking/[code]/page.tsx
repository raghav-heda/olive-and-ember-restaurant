"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Flame,
  Bike,
  Store,
  UtensilsCrossed,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface OrderTrackingData {
  publicCode: string;
  customerName: string;
  fulfilmentType: string;
  deliveryAddress?: string;
  tableNumber?: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  deliveryFee: number;
  finalTotal: number;
  couponCode?: string;
  createdAt: string;
  items: {
    name: string;
    unitPrice: number;
    quantity: number;
    itemTotal: number;
    specialInstructions?: string;
    options: {
      optionName: string;
      valueName: string;
      priceModifier: number;
    }[];
  }[];
}

const STATUS_STEPS = [
  { key: "PENDING", label: "Order Received", desc: "Sent to the hearth kitchen" },
  { key: "CONFIRMED", label: "Confirmed", desc: "Kitchen accepted ticket" },
  { key: "PREPARING", label: "In the Hearth Oven", desc: "Baking over olive wood embers" },
  { key: "READY", label: "Ready / En Route", desc: "Packaged for pickup or delivery" },
  { key: "COMPLETED", label: "Delivered & Enjoyed", desc: "Order complete" },
];

export default function OrderTrackingPage({ params }: { params: { code: string } }) {
  const { code } = params;
  const [order, setOrder] = useState<OrderTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatus = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(`/api/orders/status?code=${encodeURIComponent(code)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Order not found");
      }
      setOrder(data.order);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const orderStatus = order?.status;

  useEffect(() => {
    let isMounted = true;
    const loadStatus = async () => {
      try {
        const res = await fetch(`/api/orders/status?code=${encodeURIComponent(code)}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!isMounted) return;
        if (!res.ok) {
          throw new Error(data.error || "Order not found");
        }
        setOrder(data.order);
        setError(null);
      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    loadStatus();
    // Live update every 3 seconds while order is active, or every 15s if completed
    const intervalTime = orderStatus && ["COMPLETED", "CANCELLED"].includes(orderStatus) ? 15000 : 3000;
    const interval = setInterval(loadStatus, intervalTime);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [code, orderStatus]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
        <div className="w-10 h-10 border-4 border-terracotta-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-serif text-lg text-charcoal-900">Retrieving Order #{code}...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4 max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="font-serif text-2xl text-charcoal-900 font-bold mb-2">Order Not Found</h2>
        <p className="text-xs text-charcoal-700 mb-6">
          {error || "We could not find an order matching reference code #" + code}
        </p>
        <Link
          href="/menu"
          className="bg-charcoal-900 text-ivory-50 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider"
        >
          Return to Menu
        </Link>
      </div>
    );
  }

  // Determine current active step index
  const getStepIndex = (status: string) => {
    switch (status) {
      case "PENDING":
        return 0;
      case "CONFIRMED":
        return 1;
      case "PREPARING":
        return 2;
      case "READY_FOR_PICKUP":
      case "OUT_FOR_DELIVERY":
        return 3;
      case "COMPLETED":
        return 4;
      case "CANCELLED":
        return -1;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="bg-ivory-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ivory-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-terracotta-600">
                Order Tracking
              </span>
              <span className="text-xs text-charcoal-700">&bull;</span>
              <span className="text-xs font-mono font-bold text-charcoal-900">
                #{order.publicCode}
              </span>
            </div>
            <h1 className="font-serif text-3xl text-charcoal-900 font-bold mt-1">
              {isCancelled ? "Order Cancelled" : "Live Kitchen Status"}
            </h1>
            <p className="text-xs text-charcoal-700 mt-0.5">
              Placed {formatDateTime(order.createdAt)} for {order.customerName}
            </p>
          </div>

          <button
            onClick={fetchStatus}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ivory-100 hover:bg-ivory-200 border border-ivory-300 text-xs font-bold text-charcoal-800 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Updating..." : "Refresh Status"}</span>
          </button>
        </div>

        {/* Status Tracker Bar */}
        {isCancelled ? (
          <div className="p-6 rounded-3xl bg-red-50 border border-red-200 text-red-900 text-sm">
            <h3 className="font-bold text-base mb-1">This order was cancelled</h3>
            <p className="text-xs text-red-800">
              If you have any questions or require a refund update, please contact the restaurant desk.
            </p>
          </div>
        ) : (
          <div className="bg-ivory-100 border border-ivory-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = currentStep > idx;
                const isCurrent = currentStep === idx;
                return (
                  <div key={step.key} className="flex md:flex-col items-center md:items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isPassed
                          ? "bg-emerald-600 text-ivory-50"
                          : isCurrent
                          ? "bg-terracotta-600 text-ivory-50 shadow-md ring-4 ring-terracotta-200 animate-pulse"
                          : "bg-ivory-300 text-charcoal-500"
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <div>
                      <h4
                        className={`font-serif text-xs font-bold ${
                          isCurrent
                            ? "text-terracotta-700"
                            : isPassed
                            ? "text-charcoal-900"
                            : "text-charcoal-700"
                        }`}
                      >
                        {step.label}
                      </h4>
                      <p className="text-[10px] text-charcoal-700">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-ivory-200 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-terracotta-500" />
                <span className="font-medium text-charcoal-800">
                  Fulfilment Method: <strong className="capitalize">{order.fulfilmentType.toLowerCase()}</strong>
                  {order.tableNumber && ` (Table #${order.tableNumber})`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-charcoal-700">Payment:</span>
                <span className="font-bold text-charcoal-900 uppercase">
                  {order.paymentStatus} ({order.paymentMethod.replace(/_/g, " ")})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Itemized Order Summary */}
        <div className="bg-ivory-100 border border-ivory-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-charcoal-900">Receipt Details</h2>

          <div className="space-y-3 divide-y divide-ivory-200 text-xs">
            {order.items.map((item, idx) => (
              <div key={idx} className="pt-3 first:pt-0 flex justify-between items-start gap-4">
                <div>
                  <p className="font-bold text-charcoal-900 text-sm">
                    {item.quantity}x {item.name}
                  </p>
                  {item.options.length > 0 && (
                    <p className="text-[11px] text-charcoal-700">
                      {item.options.map((o) => o.valueName).join(", ")}
                    </p>
                  )}
                  {item.specialInstructions && (
                    <p className="text-[10px] text-charcoal-700 italic">
                      Note: &quot;{item.specialInstructions}&quot;
                    </p>
                  )}
                </div>
                <span className="font-bold text-charcoal-900 text-sm shrink-0">
                  {formatCurrency(item.itemTotal)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-4 border-t border-ivory-200 space-y-2 text-xs">
            <div className="flex justify-between text-charcoal-700">
              <span>Subtotal:</span>
              <span className="font-semibold text-charcoal-900">
                {formatCurrency(order.subtotal)}
              </span>
            </div>

            {order.discountTotal > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Promotional Discount ({order.couponCode}):</span>
                <span>-{formatCurrency(order.discountTotal)}</span>
              </div>
            )}

            <div className="flex justify-between text-charcoal-700">
              <span>Taxes (5% GST):</span>
              <span className="font-semibold text-charcoal-900">
                {formatCurrency(order.taxTotal)}
              </span>
            </div>

            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-charcoal-700">
                <span>Delivery Charge:</span>
                <span className="font-semibold text-charcoal-900">
                  {formatCurrency(order.deliveryFee)}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-ivory-300 flex justify-between items-baseline text-charcoal-900">
              <span className="font-serif font-bold text-base">Total Amount:</span>
              <span className="font-serif font-bold text-2xl text-terracotta-600">
                {formatCurrency(order.finalTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation CTAs */}
        <div className="flex items-center justify-between text-xs pt-4">
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-charcoal-700 hover:text-charcoal-900 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Order More Dishes</span>
          </Link>
          <Link
            href="/contact"
            className="text-terracotta-600 hover:text-terracotta-700 font-semibold"
          >
            Need Help With This Order?
          </Link>
        </div>
      </div>
    </div>
  );
}
