"use client";

import { useState } from "react";
import { Sliders, Save, Check, ShieldCheck, AlertCircle } from "lucide-react";

export interface RestaurantSettingsData {
  restaurantName: string;
  phone: string;
  email: string;
  address: string;
  taxPercentage: number;
  baseDeliveryFee: number;
  freeDeliveryThreshold: number;
  deliveryRadiusKm: number;
  maxPartySize: number;
  advanceBookingDays: number;
  autoConfirmBookings: boolean;
  dineInEnabled: boolean;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
}

export function SettingsManagerClient({ initialData }: { initialData: RestaurantSettingsData }) {
  const [formData, setFormData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-xs text-ivory-200">
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="font-bold">Restaurant settings saved and synchronized successfully.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-950 border border-red-800 text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Identity & Contact */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="font-serif text-lg font-bold text-ivory-50">
          Restaurant Identity &amp; Contact
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-ivory-400 mb-1">
              Restaurant Brand Name
            </label>
            <input
              type="text"
              required
              value={formData.restaurantName}
              onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3.5 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-ivory-400 mb-1">
              Contact Phone
            </label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3.5 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-ivory-400 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3.5 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-ivory-400 mb-1">
              Physical Address
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3.5 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Taxes & Delivery Configuration */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="font-serif text-lg font-bold text-ivory-50">
          Financial Taxes &amp; Delivery Logistics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-ivory-400 mb-1">
              GST / Tax Percentage (%)
            </label>
            <input
              type="number"
              step="0.5"
              min={0}
              max={30}
              value={formData.taxPercentage}
              onChange={(e) =>
                setFormData({ ...formData, taxPercentage: parseFloat(e.target.value) || 0 })
              }
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3.5 py-2 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-ivory-400 mb-1">
              Base Delivery Fee (₹)
            </label>
            <input
              type="number"
              min={0}
              value={formData.baseDeliveryFee}
              onChange={(e) =>
                setFormData({ ...formData, baseDeliveryFee: parseFloat(e.target.value) || 0 })
              }
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3.5 py-2 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-ivory-400 mb-1">
              Free Delivery Min (₹)
            </label>
            <input
              type="number"
              min={0}
              value={formData.freeDeliveryThreshold}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  freeDeliveryThreshold: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3.5 py-2 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-ivory-400 mb-1">
              Delivery Radius (KM)
            </label>
            <input
              type="number"
              step="0.5"
              min={1}
              value={formData.deliveryRadiusKm}
              onChange={(e) =>
                setFormData({ ...formData, deliveryRadiusKm: parseFloat(e.target.value) || 0 })
              }
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3.5 py-2 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500"
            />
          </div>
        </div>

        {/* Channel Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <label className="p-3 rounded-2xl bg-charcoal-950 border border-charcoal-800 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.pickupEnabled}
              onChange={(e) => setFormData({ ...formData, pickupEnabled: e.target.checked })}
              className="accent-terracotta-600"
            />
            <span className="font-bold text-ivory-200">Pickup Ordering Enabled</span>
          </label>

          <label className="p-3 rounded-2xl bg-charcoal-950 border border-charcoal-800 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.deliveryEnabled}
              onChange={(e) => setFormData({ ...formData, deliveryEnabled: e.target.checked })}
              className="accent-terracotta-600"
            />
            <span className="font-bold text-ivory-200">Delivery Ordering Enabled</span>
          </label>

          <label className="p-3 rounded-2xl bg-charcoal-950 border border-charcoal-800 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.dineInEnabled}
              onChange={(e) => setFormData({ ...formData, dineInEnabled: e.target.checked })}
              className="accent-terracotta-600"
            />
            <span className="font-bold text-ivory-200">Table Dine-In Enabled</span>
          </label>
        </div>
      </div>

      {/* 3. Table Reservation Constraints */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="font-serif text-lg font-bold text-ivory-50">
          Table Reservation Engine Controls
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-ivory-400 mb-1">
              Max Party Size Online
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={formData.maxPartySize}
              onChange={(e) =>
                setFormData({ ...formData, maxPartySize: parseInt(e.target.value, 10) || 12 })
              }
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3.5 py-2 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-ivory-400 mb-1">
              Advance Booking Horizon (Days)
            </label>
            <input
              type="number"
              min={1}
              max={90}
              value={formData.advanceBookingDays}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  advanceBookingDays: parseInt(e.target.value, 10) || 30,
                })
              }
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3.5 py-2 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500"
            />
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoConfirmBookings}
                onChange={(e) =>
                  setFormData({ ...formData, autoConfirmBookings: e.target.checked })
                }
                className="accent-terracotta-600"
              />
              <span className="font-bold text-ivory-200">
                Instant Auto-Confirm Table Bookings
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="bg-terracotta-600 hover:bg-terracotta-500 text-ivory-50 px-8 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-2 transition-colors shadow-lg disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Operational Rules..." : "Save Restaurant Settings"}</span>
        </button>
      </div>
    </form>
  );
}
