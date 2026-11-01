"use client";

import { useState, useEffect, useCallback } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Tag, Plus, Trash2, Check, X, Percent, IndianRupee, RefreshCw } from "lucide-react";

export interface AdminCoupon {
  id: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number | null;
  startDate: string;
  endDate: string;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
}

export function PromotionsManagerClient({ initialCoupons }: { initialCoupons: AdminCoupon[] }) {
  const [coupons, setCoupons] = useState<AdminCoupon[]>(initialCoupons);
  const [modalOpen, setModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real-time synchronization with production database
  const fetchLiveCoupons = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/promotions", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.coupons)) {
        setCoupons(data.coupons);
      }
    } catch {
      // background polling fallback
    } finally {
      if (!isSilent) setIsRefreshing(false);
    }
  }, []);

  // Poll database every 4 seconds when page is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        fetchLiveCoupons(true);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchLiveCoupons]);

  // Form state
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrder, setMinOrder] = useState(500);
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>(150);
  const [maxUses, setMaxUses] = useState(200);
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          description,
          discountType,
          discountValue,
          minOrderValue: minOrder,
          maxDiscountAmount: maxDiscount,
          maxUses,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCoupons([
        {
          ...data.coupon,
          startDate: data.coupon.startDate,
          endDate: data.coupon.endDate,
        },
        ...coupons,
      ]);
      setModalOpen(false);
      setCode("");
      setDescription("");
      fetchLiveCoupons(true);
    } catch (err: any) {
      alert(err.message || "Failed to create coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (coupon: AdminCoupon) => {
    const nextVal = !coupon.isActive;
    try {
      const res = await fetch("/api/admin/promotions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coupon.id, isActive: nextVal }),
      });
      if (!res.ok) throw new Error("Failed to toggle coupon");
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: nextVal } : c))
      );
      fetchLiveCoupons(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon code?")) return;
    try {
      const res = await fetch(`/api/admin/promotions?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete coupon");
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      fetchLiveCoupons(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Ribbon */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-lg font-bold text-ivory-50">Active Promo Rules</h2>
          <p className="text-xs text-ivory-400">
            Configure server-enforced discounts, minimum basket values, and redemption ceilings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Sync 4s</span>
          </span>

          <button
            type="button"
            onClick={() => fetchLiveCoupons(false)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-950 hover:bg-charcoal-800 border border-charcoal-700 text-xs text-ivory-200 transition-colors shadow-sm"
            title="Immediately refresh coupons from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-terracotta-400" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-terracotta-600 hover:bg-terracotta-500 text-ivory-50 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow"
          >
            <Plus className="w-4 h-4" />
            <span>New Coupon Rule</span>
          </button>
        </div>
      </div>

      {/* Grid of Coupons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div
            key={c.id}
            className={`p-6 rounded-3xl bg-charcoal-900 border flex flex-col justify-between space-y-4 transition-all ${
              c.isActive ? "border-charcoal-800" : "border-red-950/40 opacity-60"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold bg-charcoal-950 px-3 py-1 rounded-xl text-terracotta-400 border border-charcoal-800">
                  {c.code}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    c.isActive
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : "bg-red-950 text-red-400 border border-red-800"
                  }`}
                >
                  {c.isActive ? "Active" : "Disabled"}
                </span>
              </div>

              <div>
                <p className="font-serif font-bold text-ivory-100 text-base">
                  {c.discountType === "PERCENTAGE"
                    ? `${c.discountValue}% OFF`
                    : `${formatCurrency(c.discountValue)} FLAT OFF`}
                </p>
                <p className="text-xs text-ivory-400 mt-1">{c.description}</p>
              </div>

              <div className="p-3 bg-charcoal-950 rounded-2xl border border-charcoal-800 space-y-1 text-xs">
                <div className="flex justify-between text-ivory-400">
                  <span>Min Cart Order:</span>
                  <span className="text-ivory-200 font-semibold">{formatCurrency(c.minOrderValue)}</span>
                </div>
                {c.maxDiscountAmount && (
                  <div className="flex justify-between text-ivory-400">
                    <span>Max Discount Cap:</span>
                    <span className="text-ivory-200 font-semibold">{formatCurrency(c.maxDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-ivory-400">
                  <span>Redemptions:</span>
                  <span className="text-ivory-200 font-semibold">
                    {c.currentUses} / {c.maxUses}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-charcoal-800 flex items-center justify-between text-xs">
              <button
                onClick={() => handleToggle(c)}
                className="text-[11px] font-bold uppercase tracking-wider text-ivory-400 hover:text-ivory-100"
              >
                {c.isActive ? "Deactivate" : "Activate"}
              </button>

              <button
                onClick={() => handleDelete(c.id)}
                className="text-red-400 hover:text-red-300 p-1"
                title="Delete coupon"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE COUPON MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setModalOpen(false)}
            className="absolute inset-0 bg-charcoal-950/80 backdrop-blur-sm"
          />

          <form
            onSubmit={handleCreate}
            className="relative bg-charcoal-900 border border-charcoal-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl text-xs text-ivory-200 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-ivory-50">Create Coupon Code</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-ivory-400 hover:text-ivory-100"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ivory-300 mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. HEARTH15"
                className="w-full uppercase bg-charcoal-950 border border-charcoal-700 rounded-xl px-3.5 py-2.5 text-xs text-ivory-100 font-mono font-bold focus:outline-none focus:border-terracotta-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ivory-300 mb-1">
                Description *
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="15% off orders above ₹700"
                className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3.5 py-2 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ivory-300 mb-1">
                  Discount Type
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ivory-300 mb-1">
                  Discount Value *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3.5 py-2 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ivory-300 mb-1">
                  Min Cart (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={minOrder}
                  onChange={(e) => setMinOrder(parseFloat(e.target.value) || 0)}
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3.5 py-2 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ivory-300 mb-1">
                  Max Cap (₹)
                </label>
                <input
                  type="number"
                  value={maxDiscount || ""}
                  onChange={(e) => setMaxDiscount(parseFloat(e.target.value) || undefined)}
                  placeholder="Optional limit"
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3.5 py-2 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-charcoal-800">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-charcoal-800 text-ivory-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-terracotta-600 hover:bg-terracotta-500 text-ivory-50 font-bold uppercase tracking-wider shadow"
              >
                {saving ? "Creating..." : "Save Coupon"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
