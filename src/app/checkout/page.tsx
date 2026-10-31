"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { CalculationResult } from "@/lib/pricing";
import {
  ShoppingBag,
  Store,
  Bike,
  UtensilsCrossed,
  Tag,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertTriangle,
  CreditCard,
  Banknote,
  Clock,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    fulfilmentType,
    setFulfilmentType,
    tableNumber,
    setTableNumber,
    couponCode,
    setCouponCode,
    clearCart,
  } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "PAY_AT_COUNTER" | "CASH_ON_DELIVERY" | "RAZORPAY"
  >("CASH_ON_DELIVERY");

  // Pricing calculation state from server
  const [couponInput, setCouponInput] = useState(couponCode || "");
  const [pricing, setPricing] = useState<CalculationResult | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);

  // Customer identifiers debounced for real-time coupon validation
  const [debouncedPhone, setDebouncedPhone] = useState(customerPhone);
  const [debouncedEmail, setDebouncedEmail] = useState(customerEmail);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPhone(customerPhone);
    }, 350);
    return () => clearTimeout(timer);
  }, [customerPhone]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEmail(customerEmail);
    }, 350);
    return () => clearTimeout(timer);
  }, [customerEmail]);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch verified server pricing whenever cart or coupon or fulfilment changes
  useEffect(() => {
    if (items.length === 0) {
      setPricing(null);
      return;
    }

    let isMounted = true;
    setPricingLoading(true);
    setPricingError(null);

    const payloadItems = items.map((i) => ({
      menuItemId: i.menuItemId,
      quantity: i.quantity,
      selectedOptionValueIds: i.selectedOptions.map((o) => o.valueId),
      specialInstructions: i.specialInstructions,
    }));

    fetch("/api/pricing/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: payloadItems,
        fulfilmentType,
        couponCode: couponCode || null,
        customerPhone: debouncedPhone || undefined,
        customerEmail: debouncedEmail || undefined,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.error) {
          setPricingError(data.error);
        } else {
          setPricing(data);
        }
      })
      .catch((err) => {
        if (isMounted) setPricingError(err.message);
      })
      .finally(() => {
        if (isMounted) setPricingLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [items, fulfilmentType, couponCode, debouncedPhone, debouncedEmail]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponCode(couponInput.trim().toUpperCase());
  };

  const handleRemoveCoupon = () => {
    setCouponInput("");
    setCouponCode("");
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const payloadItems = items.map((i) => ({
        menuItemId: i.menuItemId,
        quantity: i.quantity,
        selectedOptionValueIds: i.selectedOptions.map((o) => o.valueId),
        specialInstructions: i.specialInstructions,
      }));

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail: customerEmail || undefined,
          fulfilmentType,
          tableNumber: fulfilmentType === "DINE_IN" ? tableNumber : undefined,
          deliveryAddress: fulfilmentType === "DELIVERY" ? deliveryAddress : undefined,
          deliveryInstructions: deliveryInstructions || undefined,
          paymentMethod,
          couponCode: couponCode || undefined,
          items: payloadItems,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to place order.");
      }

      // If Razorpay test checkout was chosen
      if (paymentMethod === "RAZORPAY" && data.razorpayOrderId) {
        // Auto-complete payment in sandbox/demo mode
        await fetch("/api/orders/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicCode: data.publicCode,
            razorpayOrderId: data.razorpayOrderId,
            razorpayPaymentId: `pay_mock_${Date.now()}`,
            razorpaySignature: "mock_signature_approved",
          }),
        });
      }

      clearCart();
      router.push(`/order-tracking/${data.publicCode}`);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to complete checkout.");
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-full bg-ivory-200 flex items-center justify-center text-charcoal-500 mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl text-charcoal-900 font-bold mb-2">
          Your order bag is empty
        </h2>
        <p className="text-sm text-charcoal-700 max-w-sm mb-6">
          Explore our naturally leavened sourdough pizzas and charred hearth specialties to start your order.
        </p>
        <Link
          href="/menu"
          className="bg-charcoal-900 hover:bg-terracotta-600 text-ivory-50 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow"
        >
          Explore Our Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-ivory-50 min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:text-left">
          <span className="text-xs uppercase tracking-widest font-bold text-terracotta-600">
            Secure Ordering
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-900 tracking-tight mt-1">
            Checkout &amp; Confirmation
          </h1>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Customer Info, Fulfilment & Payment */}
          <div className="lg:col-span-7 space-y-8">
            {submitError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                <div>
                  <p className="font-bold">Checkout Error</p>
                  <p className="mt-0.5">{submitError}</p>
                </div>
              </div>
            )}

            {/* 1. Fulfilment Preference */}
            <div className="bg-ivory-100 border border-ivory-300 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-charcoal-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-charcoal-900 text-ivory-50 text-xs flex items-center justify-center font-sans font-bold">
                  1
                </span>
                <span>Fulfilment Method</span>
              </h2>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFulfilmentType("PICKUP")}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    fulfilmentType === "PICKUP"
                      ? "bg-charcoal-900 text-ivory-50 border-charcoal-900 shadow-md"
                      : "bg-ivory-50 text-charcoal-800 border-ivory-300 hover:border-charcoal-400"
                  }`}
                >
                  <Store className="w-5 h-5 mx-auto mb-1 text-terracotta-400" />
                  <span className="block text-xs font-bold">Pickup</span>
                  <span className="text-[10px] text-charcoal-700 block">~20 mins</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfilmentType("DELIVERY")}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    fulfilmentType === "DELIVERY"
                      ? "bg-charcoal-900 text-ivory-50 border-charcoal-900 shadow-md"
                      : "bg-ivory-50 text-charcoal-800 border-ivory-300 hover:border-charcoal-400"
                  }`}
                >
                  <Bike className="w-5 h-5 mx-auto mb-1 text-terracotta-400" />
                  <span className="block text-xs font-bold">Delivery</span>
                  <span className="text-[10px] text-charcoal-700 block">~40 mins</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfilmentType("DINE_IN")}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    fulfilmentType === "DINE_IN"
                      ? "bg-charcoal-900 text-ivory-50 border-charcoal-900 shadow-md"
                      : "bg-ivory-50 text-charcoal-800 border-ivory-300 hover:border-charcoal-400"
                  }`}
                >
                  <UtensilsCrossed className="w-5 h-5 mx-auto mb-1 text-terracotta-400" />
                  <span className="block text-xs font-bold">Dine-In</span>
                  <span className="text-[10px] text-charcoal-700 block">Table direct</span>
                </button>
              </div>

              {fulfilmentType === "DELIVERY" && (
                <div className="space-y-3 pt-2 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                      Delivery Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Building name, apartment number, street, landmark, area (Indiranagar / nearby)..."
                      className="w-full bg-ivory-50 border border-ivory-300 rounded-xl p-3 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                      Delivery Instructions
                    </label>
                    <input
                      type="text"
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      placeholder="e.g. Ring bell, leave with security guard..."
                      className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3.5 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500"
                    />
                  </div>
                </div>
              )}

              {fulfilmentType === "DINE_IN" && (
                <div className="pt-2 animate-in fade-in duration-200">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                    Table Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Enter the number located on your table (e.g. 5)"
                    className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500"
                  />
                </div>
              )}
            </div>

            {/* 2. Customer Contact Details */}
            <div className="bg-ivory-100 border border-ivory-300 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-charcoal-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-charcoal-900 text-ivory-50 text-xs flex items-center justify-center font-sans font-bold">
                  2
                </span>
                <span>Contact Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Aarav Sharma"
                    className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                  Email Address (for Order Receipt)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500"
                />
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-ivory-100 border border-ivory-300 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-charcoal-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-charcoal-900 text-ivory-50 text-xs flex items-center justify-center font-sans font-bold">
                  3
                </span>
                <span>Payment Preference</span>
              </h2>

              <div className="space-y-2.5">
                <label
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === "CASH_ON_DELIVERY"
                      ? "bg-ivory-50 border-terracotta-500 shadow-sm"
                      : "bg-ivory-100 border-ivory-300 hover:border-charcoal-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "CASH_ON_DELIVERY"}
                      onChange={() => setPaymentMethod("CASH_ON_DELIVERY")}
                      className="accent-terracotta-600"
                    />
                    <div>
                      <span className="font-serif font-bold text-sm text-charcoal-900 block">
                        Cash on Delivery / UPI on Arrival
                      </span>
                      <span className="text-[11px] text-charcoal-700">
                        Pay cash or scan QR code when your food arrives.
                      </span>
                    </div>
                  </div>
                  <Banknote className="w-5 h-5 text-terracotta-600 shrink-0" />
                </label>

                <label
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === "PAY_AT_COUNTER"
                      ? "bg-ivory-50 border-terracotta-500 shadow-sm"
                      : "bg-ivory-100 border-ivory-300 hover:border-charcoal-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "PAY_AT_COUNTER"}
                      onChange={() => setPaymentMethod("PAY_AT_COUNTER")}
                      className="accent-terracotta-600"
                    />
                    <div>
                      <span className="font-serif font-bold text-sm text-charcoal-900 block">
                        Pay at Counter / Table
                      </span>
                      <span className="text-[11px] text-charcoal-700">
                        Settle your bill directly with waitstaff or at the host station.
                      </span>
                    </div>
                  </div>
                  <Store className="w-5 h-5 text-terracotta-600 shrink-0" />
                </label>

                <label
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === "RAZORPAY"
                      ? "bg-ivory-50 border-terracotta-500 shadow-sm"
                      : "bg-ivory-100 border-ivory-300 hover:border-charcoal-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "RAZORPAY"}
                      onChange={() => setPaymentMethod("RAZORPAY")}
                      className="accent-terracotta-600"
                    />
                    <div>
                      <span className="font-serif font-bold text-sm text-charcoal-900 block">
                        Online Payment via Razorpay
                      </span>
                      <span className="text-[11px] text-charcoal-700">
                        UPI, Net Banking, Credit / Debit Cards (Sandbox Test Mode).
                      </span>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-terracotta-600 shrink-0" />
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary, Coupon & Price Totals */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-ivory-100 border border-ivory-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-charcoal-900">Order Summary</h2>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start gap-3 border-b border-ivory-200 pb-2 text-xs"
                  >
                    <div>
                      <p className="font-bold text-charcoal-900">
                        {item.quantity}x {item.name}
                      </p>
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <p className="text-[11px] text-charcoal-700">
                          {item.selectedOptions.map((o) => o.valueName).join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="font-bold text-charcoal-900 shrink-0">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Code Input */}
              <div className="pt-2 border-t border-ivory-200">
                <span className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                  Promotional Coupon
                </span>
                {pricing?.appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="font-mono font-bold uppercase">
                          {pricing.appliedCoupon.code} Applied
                        </p>
                        <p className="text-[10px] text-emerald-700">
                          {pricing.appliedCoupon.description}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs text-red-600 hover:text-red-800 font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Try 'EMBER10' or 'WELCOME100'"
                        className="w-full uppercase bg-ivory-50 border border-ivory-300 rounded-xl px-3 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="bg-charcoal-900 hover:bg-terracotta-600 text-ivory-50 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
                      >
                        Apply
                      </button>
                    </div>

                    {pricing?.couponError && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-amber-900 text-xs animate-in fade-in">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-[11px] leading-relaxed">
                            {pricing.couponError}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-[10px] text-amber-800 hover:text-amber-950 underline font-semibold shrink-0"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Financial Breakdown (Server Calculated) */}
              <div className="pt-2 border-t border-ivory-200 space-y-2 text-xs">
                {pricingLoading ? (
                  <p className="text-center text-charcoal-700 py-2">Calculating server prices...</p>
                ) : pricing ? (
                  <>
                    <div className="flex justify-between text-charcoal-700">
                      <span>Subtotal (Food):</span>
                      <span className="font-semibold text-charcoal-900">
                        {formatCurrency(pricing.subtotal)}
                      </span>
                    </div>

                    {pricing.discountTotal > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Promotional Discount:</span>
                        <span>-{formatCurrency(pricing.discountTotal)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-charcoal-700">
                      <span>Estimated GST ({pricing.taxRatePercent}%):</span>
                      <span className="font-semibold text-charcoal-900">
                        {formatCurrency(pricing.taxTotal)}
                      </span>
                    </div>

                    {fulfilmentType === "DELIVERY" && (
                      <div className="flex justify-between text-charcoal-700">
                        <span>Delivery Fee:</span>
                        <span className="font-semibold text-charcoal-900">
                          {pricing.deliveryFee === 0 ? "FREE" : formatCurrency(pricing.deliveryFee)}
                        </span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-ivory-300 flex justify-between items-baseline text-charcoal-900">
                      <span className="font-serif font-bold text-base">Final Amount:</span>
                      <span className="font-serif font-bold text-2xl text-terracotta-600">
                        {formatCurrency(pricing.finalTotal)}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-red-600 text-xs">{pricingError || "Unable to compute totals"}</p>
                )}
              </div>

              {/* Place Order CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting || !pricing || pricingLoading}
                className="w-full bg-terracotta-600 hover:bg-terracotta-700 text-ivory-50 py-4 px-6 rounded-2xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Creating Order &amp; Dispatching...</span>
                ) : (
                  <>
                    <span>Confirm &amp; Place Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-[11px] text-charcoal-700 text-center space-y-1">
                <p>By placing this order, you agree to our Terms &amp; Cancellation Policy.</p>
                <div className="flex items-center justify-center gap-1 text-[10px] text-charcoal-700 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-terracotta-600" />
                  <span>256-bit Secure Transaction &bull; Live Status Tracking</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
