"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  UtensilsCrossed,
  Sparkles,
  MapPin,
  XCircle,
} from "lucide-react";

interface ReservationData {
  bookingRef: string;
  customerName: string;
  guestCount: number;
  date: string;
  time: string;
  status: "PENDING" | "CONFIRMED" | "SEATED" | "COMPLETED" | "CANCELLED" | string;
  tableAssignment?: string | null;
  specialRequests?: string | null;
  createdAt: string;
}

function formatTo12Hour(time24: string): string {
  if (!time24 || !time24.includes(":")) return time24;
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr, 10);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr} ${period}`;
}

export default function ReservationTrackingPage({
  params,
}: {
  params: { ref: string };
}) {
  const { ref } = params;
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await fetch(`/api/reservations/status?ref=${encodeURIComponent(ref)}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load reservation status.");
      } else {
        setReservation(data.reservation);
        setError(null);
      }
    } catch {
      setError("Unable to connect to the restaurant service. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [ref]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Auto-refresh every 10 seconds while booking is PENDING to catch admin approval
  useEffect(() => {
    if (!reservation || reservation.status !== "PENDING") return;
    const interval = setInterval(() => {
      fetchStatus(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [reservation, fetchStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory-50 py-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-terracotta-600 animate-spin mx-auto" />
          <p className="font-serif text-lg text-charcoal-900">
            Checking reservation records for #{ref}...
          </p>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-ivory-50 py-16 px-4">
        <div className="max-w-md mx-auto bg-ivory-100 border border-ivory-300 rounded-3xl p-8 text-center space-y-6 shadow-md">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-2xl text-charcoal-900 font-bold">
              Reservation Not Found
            </h1>
            <p className="text-xs text-charcoal-700 leading-relaxed">
              {error || `We could not find an active reservation for reference #${ref}.`}
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => fetchStatus()}
              className="w-full flex items-center justify-center gap-2 bg-charcoal-900 hover:bg-terracotta-600 text-ivory-50 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Lookup</span>
            </button>
            <Link
              href="/reservations"
              className="w-full text-center text-xs font-semibold text-terracotta-700 hover:text-terracotta-800 py-1"
            >
              Book a New Table Reservation
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isConfirmed = reservation.status === "CONFIRMED";
  const isPending = reservation.status === "PENDING";
  const isCancelled = reservation.status === "CANCELLED";
  const isSeated = reservation.status === "SEATED";
  const isCompleted = reservation.status === "COMPLETED";

  return (
    <div className="bg-ivory-50 min-h-screen py-12 sm:py-16 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link
            href="/reservations"
            className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal-700 hover:text-terracotta-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Table Reservations</span>
          </Link>

          <button
            onClick={() => fetchStatus()}
            disabled={refreshing}
            className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal-800 hover:text-terracotta-600 bg-ivory-100 hover:bg-ivory-200 border border-ivory-300 px-3.5 py-1.5 rounded-full transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-terracotta-600" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh Status"}</span>
          </button>
        </div>

        {/* Main Status Hero Card */}
        <div className="bg-ivory-100 border border-ivory-300 rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
          <div className="text-center space-y-3">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-inner ${
                isConfirmed
                  ? "bg-emerald-100 text-emerald-700"
                  : isPending
                  ? "bg-amber-100 text-amber-700"
                  : isCancelled
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {isConfirmed ? (
                <CheckCircle2 className="w-9 h-9" />
              ) : isCancelled ? (
                <XCircle className="w-9 h-9" />
              ) : isPending ? (
                <Clock className="w-9 h-9 animate-pulse" />
              ) : (
                <UtensilsCrossed className="w-9 h-9" />
              )}
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest font-mono font-bold text-terracotta-600 block">
                Booking Reference #{reservation.bookingRef}
              </span>
              <h1 className="font-serif text-3xl text-charcoal-900 font-bold mt-1">
                {isConfirmed && "Your Table is Confirmed!"}
                {isPending && "Reservation Request Pending"}
                {isSeated && "Table Seated — Dining Active"}
                {isCompleted && "Dining Experience Completed"}
                {isCancelled && "Reservation Cancelled"}
              </h1>
              <p className="text-xs sm:text-sm text-charcoal-700 mt-2 max-w-md mx-auto leading-relaxed">
                {isConfirmed &&
                  "Our hearth team has reviewed and confirmed your reservation. We look forward to hosting you."}
                {isPending &&
                  "Your request has reached our host desk. It will be reviewed and approved shortly. This page automatically refreshes."}
                {isSeated &&
                  "Welcome to Olive & Ember. Your table is seated and service is underway."}
                {isCompleted &&
                  "Thank you for dining with us. We hope you enjoyed your time around our wood-fired hearth."}
                {isCancelled &&
                  "This reservation has been cancelled. If you believe this is an error, please reach out to our concierge."}
              </p>
            </div>
          </div>

          {/* Status Badge Indicator */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm text-xs font-bold uppercase tracking-wider">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConfirmed
                    ? "bg-emerald-500 animate-ping"
                    : isPending
                    ? "bg-amber-500 animate-pulse"
                    : isCancelled
                    ? "bg-red-500"
                    : "bg-blue-500"
                }`}
              />
              <span className="text-charcoal-600 font-medium lowercase">status:</span>
              <span
                className={
                  isConfirmed
                    ? "text-emerald-700"
                    : isPending
                    ? "text-amber-700"
                    : isCancelled
                    ? "text-red-700"
                    : "text-blue-700"
                }
              >
                {reservation.status}
              </span>
            </div>
          </div>

          {/* Booking Summary Details Grid */}
          <div className="bg-ivory-50 border border-ivory-300 rounded-2xl p-6 space-y-3.5 text-xs">
            <div className="flex justify-between border-b border-ivory-200 pb-2.5">
              <span className="text-charcoal-700 font-medium">Primary Guest:</span>
              <span className="font-bold text-charcoal-900">{reservation.customerName}</span>
            </div>

            <div className="flex justify-between border-b border-ivory-200 pb-2.5">
              <span className="text-charcoal-700 font-medium">Dining Date:</span>
              <span className="font-bold text-charcoal-900">{reservation.date}</span>
            </div>

            <div className="flex justify-between border-b border-ivory-200 pb-2.5">
              <span className="text-charcoal-700 font-medium">Reserved Time Slot:</span>
              <span className="font-bold text-charcoal-900">
                {formatTo12Hour(reservation.time)} ({reservation.time})
              </span>
            </div>

            <div className="flex justify-between border-b border-ivory-200 pb-2.5">
              <span className="text-charcoal-700 font-medium">Party Size:</span>
              <span className="font-bold text-charcoal-900">{reservation.guestCount} Guests</span>
            </div>

            {reservation.tableAssignment && (
              <div className="flex justify-between border-b border-ivory-200 pb-2.5">
                <span className="text-charcoal-700 font-medium">Assigned Seating:</span>
                <span className="font-bold text-terracotta-600">{reservation.tableAssignment}</span>
              </div>
            )}

            {reservation.specialRequests && (
              <div className="flex flex-col gap-1 border-b border-ivory-200 pb-2.5">
                <span className="text-charcoal-700 font-medium">Kitchen / Seating Requests:</span>
                <span className="text-charcoal-900 italic bg-ivory-100 p-2 rounded-lg">
                  &ldquo;{reservation.specialRequests}&rdquo;
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-1 text-[11px] text-charcoal-700">
              <span>Booking Status in Database:</span>
              <span
                className={`font-bold uppercase tracking-wider text-[11px] px-2.5 py-0.5 rounded-lg border ${
                  isConfirmed
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : isPending
                    ? "bg-amber-100 text-amber-800 border-amber-300"
                    : isCancelled
                    ? "bg-red-100 text-red-800 border-red-300"
                    : "bg-blue-100 text-blue-800 border-blue-300"
                }`}
              >
                {reservation.status}
              </span>
            </div>
          </div>

          {/* Restaurant Notes & Directions */}
          <div className="p-4 bg-olive-50 border border-olive-200 rounded-2xl text-xs space-y-1.5 text-charcoal-800">
            <div className="flex items-center gap-1.5 font-bold text-olive-900">
              <MapPin className="w-4 h-4 text-olive-700 shrink-0" />
              <span>Olive &amp; Ember Kitchen &bull; Indiranagar</span>
            </div>
            <p className="text-[11px] text-charcoal-700">
              14/2 Hearthstone Ave, 100ft Road, Indiranagar, Bengaluru. Tables are held for 15 minutes past your reserved seating time.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/menu"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-charcoal-900 hover:bg-terracotta-600 text-ivory-50 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Explore Menu</span>
            </Link>

            <Link
              href="/reservations"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-ivory-50 hover:bg-ivory-200 text-charcoal-900 border border-ivory-300 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Another Table</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
