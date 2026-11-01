"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, UtensilsCrossed, Bike, Store } from "lucide-react";
import { FoodImage } from "@/components/ui/FoodImage";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const {
    items,
    updateQuantity,
    removeItem,
    rawSubtotal,
    fulfilmentType,
    setFulfilmentType,
    tableNumber,
    setTableNumber,
  } = useCart();

  // Lock background body scroll when cart drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Close drawer on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-charcoal-950/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-8 md:pl-10">
        <div className="w-screen max-w-md bg-ivory-50 border-l border-ivory-300 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-6 border-b border-ivory-200 flex items-center justify-between bg-ivory-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-terracotta-600" />
              <h2 className="font-serif text-xl text-charcoal-900 tracking-wide">Your Order</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-charcoal-700 hover:text-charcoal-950 hover:bg-ivory-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Fulfilment Toggle */}
          <div className="px-6 py-3 bg-ivory-200/60 border-b border-ivory-200">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-700 mb-2">
              Fulfilment Preference
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFulfilmentType("PICKUP")}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                  fulfilmentType === "PICKUP"
                    ? "bg-charcoal-900 text-ivory-50 border-charcoal-900 shadow-sm"
                    : "bg-ivory-50 text-charcoal-800 border-ivory-300 hover:border-charcoal-600"
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Pickup</span>
              </button>
              <button
                type="button"
                onClick={() => setFulfilmentType("DELIVERY")}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                  fulfilmentType === "DELIVERY"
                    ? "bg-charcoal-900 text-ivory-50 border-charcoal-900 shadow-sm"
                    : "bg-ivory-50 text-charcoal-800 border-ivory-300 hover:border-charcoal-600"
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Delivery</span>
              </button>
              <button
                type="button"
                onClick={() => setFulfilmentType("DINE_IN")}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                  fulfilmentType === "DINE_IN"
                    ? "bg-charcoal-900 text-ivory-50 border-charcoal-900 shadow-sm"
                    : "bg-ivory-50 text-charcoal-800 border-ivory-300 hover:border-charcoal-600"
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Dine-In</span>
              </button>
            </div>

            {fulfilmentType === "DINE_IN" && (
              <div className="mt-2.5">
                <input
                  type="text"
                  placeholder="Table number (e.g. 4)"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full text-xs bg-ivory-50 border border-ivory-300 rounded-lg px-3 py-1.5 text-charcoal-900 focus:outline-none focus:border-terracotta-500"
                />
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-charcoal-700">
                <div className="w-16 h-16 rounded-full bg-ivory-200 flex items-center justify-center mb-4 text-charcoal-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg text-charcoal-900 mb-1">Your bag is empty</h3>
                <p className="text-xs text-charcoal-700 max-w-xs mb-6">
                  Add artisanal sourdough pizzas, hearth-charred appetizers, or botanical drinks from our menu.
                </p>
                <button
                  onClick={onClose}
                  className="text-xs uppercase tracking-wider font-semibold text-terracotta-600 hover:text-terracotta-700 underline"
                >
                  Browse Menu Dishes
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-ivory-100/70 border border-ivory-200 rounded-xl flex gap-3 relative group"
                >
                  {item.imageUrl && (
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden shrink-0 bg-ivory-300">
                      <FoodImage
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif text-sm font-semibold text-charcoal-900 leading-tight">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-charcoal-400 hover:text-red-600 transition-colors"
                        title="Remove dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <div className="text-[11px] text-charcoal-700 mt-1 space-y-0.5">
                        {item.selectedOptions.map((opt) => (
                          <p key={opt.valueId}>
                            • {opt.valueName}
                            {opt.priceModifier > 0 && ` (+${formatCurrency(opt.priceModifier)})`}
                          </p>
                        ))}
                      </div>
                    )}

                    {item.specialInstructions && (
                      <p className="text-[10px] text-charcoal-700 italic mt-1">
                        Note: &quot;{item.specialInstructions}&quot;
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 border border-ivory-300 bg-ivory-50 rounded-lg px-2 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="text-charcoal-700 hover:text-charcoal-900 p-0.5"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-charcoal-900 w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="text-charcoal-700 hover:text-charcoal-900 p-0.5"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-sans font-bold text-sm text-charcoal-900">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with Subtotal & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-ivory-200 bg-ivory-100 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-charcoal-700">Estimated Food Total:</span>
                <span className="font-bold text-charcoal-900 text-base">
                  {formatCurrency(rawSubtotal)}
                </span>
              </div>
              <p className="text-[10px] text-charcoal-700 leading-tight">
                * Taxes (5% GST), delivery fees, and discount coupons are calculated and verified on the server at checkout.
              </p>

              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full bg-terracotta-600 hover:bg-terracotta-700 text-ivory-50 py-3.5 px-4 rounded-xl font-medium tracking-wide flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg uppercase text-xs"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
