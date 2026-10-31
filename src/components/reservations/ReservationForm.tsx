"use client";

import { useState } from "react";
import { DEFAULT_TIME_SLOTS } from "@/lib/availability";
import {
  Calendar as CalendarIcon,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  PlusCircle,
  RotateCcw,
  Check,
  Sun,
  Moon,
} from "lucide-react";

// Convert 24-hour time "19:30" to user-friendly 12-hour format "7:30 PM"
function formatTo12Hour(time24: string): string {
  if (!time24 || !time24.includes(":")) return time24;
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr || "00";
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

const DEFAULT_LUNCH_SLOTS = DEFAULT_TIME_SLOTS.filter(
  (slot) => parseInt(slot.split(":")[0], 10) < 16
);
const DEFAULT_DINNER_SLOTS = DEFAULT_TIME_SLOTS.filter(
  (slot) => parseInt(slot.split(":")[0], 10) >= 16
);

// All 15-minute intervals within restaurant operating hours (12:00 to 22:30)
const LUNCH_15_MIN_SLOTS = [
  "12:00", "12:15", "12:30", "12:45",
  "13:00", "13:15", "13:30", "13:45",
  "14:00", "14:15", "14:30", "14:45",
];

const DINNER_15_MIN_SLOTS = [
  "18:00", "18:15", "18:30", "18:45",
  "19:00", "19:15", "19:30", "19:45",
  "20:00", "20:15", "20:30", "20:45",
  "21:00", "21:15", "21:30", "21:45",
  "22:00", "22:15", "22:30",
];

export function ReservationForm() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split("T")[0];

  const [date, setDate] = useState(defaultDateStr);
  const [timeSlot, setTimeSlot] = useState("19:30");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customShift, setCustomShift] = useState<"LUNCH" | "DINNER">("DINNER");
  const [guestCount, setGuestCount] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [suggestedSlots, setSuggestedSlots] = useState<string[]>([]);
  const [successBooking, setSuccessBooking] = useState<{
    bookingRef: string;
    status: string;
    message: string;
    date: string;
    time: string;
    guestCount: number;
    customerName: string;
  } | null>(null);

  const handleSelectTime = (selected: string) => {
    setTimeSlot(selected);
    setErrorMessage(null);
    setSuggestedSlots([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuggestedSlots([]);
    setSubmitting(true);

    try {
      const res = await fetch("/api/reservations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerEmail: email || undefined,
          guestCount,
          reservationDate: date,
          timeSlot,
          specialRequests: specialRequests || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.suggestedSlots && Array.isArray(data.suggestedSlots)) {
          setSuggestedSlots(data.suggestedSlots);
        }
        throw new Error(data.error || "Failed to submit reservation");
      }

      setSuccessBooking({
        bookingRef: data.bookingRef,
        status: data.status,
        message: data.message,
        date,
        time: timeSlot,
        guestCount,
        customerName: name,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (successBooking) {
    return (
      <div className="bg-ivory-100 border border-ivory-300 rounded-3xl p-8 sm:p-10 shadow-lg text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest font-bold text-terracotta-600">
            Reservation Reference: #{successBooking.bookingRef}
          </span>
          <h2 className="font-serif text-3xl text-charcoal-900">
            {successBooking.status === "CONFIRMED"
              ? "Your Table is Reserved!"
              : "Table Request Received"}
          </h2>
          <p className="text-sm text-charcoal-700 max-w-md mx-auto leading-relaxed">
            {successBooking.message}
          </p>
        </div>

        {/* Booking Card Snapshot */}
        <div className="bg-ivory-50 border border-ivory-300 rounded-2xl p-6 max-w-md mx-auto text-left space-y-3 shadow-sm text-xs">
          <div className="flex justify-between border-b border-ivory-200 pb-2">
            <span className="text-charcoal-700">Primary Guest:</span>
            <span className="font-bold text-charcoal-900">{successBooking.customerName}</span>
          </div>
          <div className="flex justify-between border-b border-ivory-200 pb-2">
            <span className="text-charcoal-700">Date &amp; Seating Time:</span>
            <span className="font-bold text-charcoal-900">
              {successBooking.date} at {formatTo12Hour(successBooking.time)} ({successBooking.time})
            </span>
          </div>
          <div className="flex justify-between border-b border-ivory-200 pb-2">
            <span className="text-charcoal-700">Party Size:</span>
            <span className="font-bold text-charcoal-900">{successBooking.guestCount} Guests</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-700">Booking Status:</span>
            <span
              className={`font-bold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded ${
                successBooking.status === "CONFIRMED"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {successBooking.status}
            </span>
          </div>
        </div>

        <div className="text-xs text-charcoal-700 space-y-1">
          <p>A confirmation notification has been dispatched to your contact phone.</p>
          <p>Please arrive within 15 minutes of your confirmed seating slot ({successBooking.time}).</p>
        </div>

        <button
          onClick={() => {
            setSuccessBooking(null);
            setName("");
            setPhone("");
            setEmail("");
            setSpecialRequests("");
            setTimeSlot("19:30");
            setIsCustomMode(false);
          }}
          className="inline-flex items-center gap-2 bg-charcoal-900 hover:bg-terracotta-600 text-ivory-50 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow"
        >
          <span>Book Another Reservation</span>
        </button>
      </div>
    );
  }

  const isCustomSelected = !DEFAULT_TIME_SLOTS.includes(timeSlot);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-ivory-100 border border-ivory-300 rounded-3xl p-6 sm:p-10 shadow-lg space-y-8"
    >
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col gap-3 text-red-800 text-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-bold">Reservation Unavailable</p>
              <p className="mt-0.5 text-charcoal-800">{errorMessage}</p>
            </div>
          </div>

          {/* Real-time Suggested Nearby Times */}
          {suggestedSlots.length > 0 && (
            <div className="border-t border-red-200/80 pt-3 mt-1 pl-8">
              <span className="font-bold uppercase tracking-wider text-[10px] text-terracotta-700 block mb-2">
                Suggested Nearby Available Times:
              </span>
              <div className="flex flex-wrap gap-2">
                {suggestedSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handleSelectTime(slot)}
                    className="px-3 py-1.5 rounded-lg bg-ivory-50 hover:bg-terracotta-600 hover:text-ivory-50 border border-terracotta-300 text-charcoal-900 font-mono font-bold text-xs transition-colors shadow-sm"
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 1: Party Size & Date Selection */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg text-charcoal-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-charcoal-900 text-ivory-50 text-xs flex items-center justify-center font-sans font-bold">
            1
          </span>
          <span>Party Size &amp; Date</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Party Size Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Number of Guests
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setGuestCount(num)}
                  className={`w-10 h-10 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    guestCount === num
                      ? "bg-terracotta-600 text-ivory-50 shadow-md scale-105"
                      : "bg-ivory-50 text-charcoal-800 border border-ivory-300 hover:border-charcoal-400"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-charcoal-700 mt-1">
              Parties larger than 12 can be arranged via our events concierge.
            </p>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Dining Date
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-700 pointer-events-none" />
              <input
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-ivory-50 border border-ivory-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500 font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Select Your Time */}
      <div className="space-y-5 border-t border-ivory-200 pt-6">
        {/* 1. Clear Section Header & Selected Time Feedback */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg text-charcoal-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-charcoal-900 text-ivory-50 text-xs flex items-center justify-center font-sans font-bold">
                2
              </span>
              <span>Select Your Time</span>
            </h3>
            <p className="text-xs text-charcoal-600 mt-0.5 ml-8">
              Choose an available time for your table.
            </p>
          </div>

          {/* 4. Elegant Selected Time Confirmation Summary */}
          {timeSlot && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ivory-50 border border-ivory-300 shadow-sm text-xs self-start sm:self-auto ml-8 sm:ml-0">
              <Clock className="w-3.5 h-3.5 text-terracotta-600 shrink-0" />
              <div className="flex items-center gap-1.5">
                <span className="text-charcoal-500 font-medium">Selected time:</span>
                <span className="font-bold text-charcoal-950 font-sans">
                  {formatTo12Hour(timeSlot)}
                </span>
                <span className="text-charcoal-400">—</span>
                <span className="text-charcoal-700 font-medium">
                  {parseInt(timeSlot.split(":")[0], 10) >= 16 ? "Dinner" : "Lunch"}
                </span>
                {isCustomSelected && (
                  <span className="text-[10px] uppercase font-bold text-terracotta-700 bg-terracotta-100 px-1.5 py-0.5 rounded-full ml-0.5">
                    Custom
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Standard Time Slots Divided by Service Shift (Lunch & Dinner) */}
        {!isCustomMode && (
          <div className="space-y-5">
            {/* Lunch Service Group */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-serif text-sm font-bold text-charcoal-900">
                    Lunch
                  </span>
                  <span className="text-xs text-charcoal-500 font-normal">
                    — Afternoon service (12:00 PM – 2:30 PM)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {DEFAULT_LUNCH_SLOTS.map((slot) => {
                  const isSelected = timeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleSelectTime(slot)}
                      className={`h-11 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border ${
                        isSelected
                          ? "bg-charcoal-900 text-ivory-50 border-charcoal-900 shadow-md ring-1 ring-charcoal-900"
                          : "bg-ivory-50 text-charcoal-800 border-ivory-300 hover:border-terracotta-400 hover:bg-white"
                      }`}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-terracotta-400 shrink-0 animate-in zoom-in-75 duration-150" />
                      )}
                      <span>{formatTo12Hour(slot)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="border-t border-ivory-200/70" />

            {/* Dinner Service Group */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-terracotta-600 shrink-0" />
                  <span className="font-serif text-sm font-bold text-charcoal-900">
                    Dinner
                  </span>
                  <span className="text-xs text-charcoal-500 font-normal">
                    — Evening service (6:30 PM – 10:00 PM)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
                {DEFAULT_DINNER_SLOTS.map((slot) => {
                  const isSelected = timeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleSelectTime(slot)}
                      className={`h-11 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border ${
                        isSelected
                          ? "bg-charcoal-900 text-ivory-50 border-charcoal-900 shadow-md ring-1 ring-charcoal-900"
                          : "bg-ivory-50 text-charcoal-800 border-ivory-300 hover:border-terracotta-400 hover:bg-white"
                      }`}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-terracotta-400 shrink-0 animate-in zoom-in-75 duration-150" />
                      )}
                      <span>{formatTo12Hour(slot)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Clean Secondary Action for Custom / Preferred Time */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-ivory-200/70">
              <span className="text-charcoal-600 font-medium">
                Can&apos;t find your preferred time?
              </span>
              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-terracotta-300 text-terracotta-700 bg-terracotta-50/60 hover:bg-terracotta-100/70 font-semibold text-xs transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5 text-terracotta-600" />
                <span>Request a different time</span>
              </button>
            </div>
          </div>
        )}

        {/* Custom 15-Minute Seating Option */}
        {isCustomMode && (
          <div className="bg-ivory-50 border border-ivory-300 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm animate-in fade-in-50 duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-ivory-200 pb-3">
              <div>
                <span className="font-serif text-sm font-bold text-charcoal-900 block">
                  Request a Specific Seating Time
                </span>
                <span className="text-xs text-charcoal-600">
                  Select any 15-minute interval during our operating hours (12:00 PM – 10:30 PM).
                </span>
              </div>

              {/* Lunch / Dinner Shift Selector */}
              <div className="flex items-center gap-1 bg-ivory-200/70 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCustomShift("LUNCH")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    customShift === "LUNCH"
                      ? "bg-charcoal-900 text-ivory-50 shadow-sm"
                      : "text-charcoal-700 hover:text-charcoal-950"
                  }`}
                >
                  Lunch (12:00 – 2:45 PM)
                </button>
                <button
                  type="button"
                  onClick={() => setCustomShift("DINNER")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    customShift === "DINNER"
                      ? "bg-charcoal-900 text-ivory-50 shadow-sm"
                      : "text-charcoal-700 hover:text-charcoal-950"
                  }`}
                >
                  Dinner (6:00 – 10:30 PM)
                </button>
              </div>
            </div>

            {/* 15-Minute Interval Buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {(customShift === "LUNCH" ? LUNCH_15_MIN_SLOTS : DINNER_15_MIN_SLOTS).map((slot) => {
                const isSelected = timeSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handleSelectTime(slot)}
                    className={`h-10 px-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 border ${
                      isSelected
                        ? "bg-charcoal-900 text-ivory-50 border-charcoal-900 shadow-md ring-1 ring-charcoal-900"
                        : "bg-ivory-100 text-charcoal-800 border-ivory-300 hover:border-terracotta-400 hover:bg-white"
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-terracotta-400 shrink-0" />
                    )}
                    <span>{formatTo12Hour(slot)}</span>
                  </button>
                );
              })}
            </div>

            {/* Direct Input & Return Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border-t border-ivory-200">
              <div className="flex items-center gap-2">
                <span className="text-charcoal-700 font-medium">Or type exact time:</span>
                <input
                  type="time"
                  step="900"
                  value={timeSlot}
                  onChange={(e) => handleSelectTime(e.target.value)}
                  className="bg-white border border-ivory-300 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-charcoal-900 focus:outline-none focus:border-terracotta-500 shadow-sm"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className="inline-flex items-center gap-1.5 text-xs text-charcoal-700 hover:text-charcoal-950 font-semibold underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Return to standard slots</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Contact & Special Requests */}
      <div className="space-y-4 border-t border-ivory-200 pt-6">
        <h3 className="font-serif text-lg text-charcoal-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-charcoal-900 text-ivory-50 text-xs flex items-center justify-center font-sans font-bold">
            3
          </span>
          <span>Guest Details &amp; Requests</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
            Special Requests &amp; Dietary Notes
          </label>
          <textarea
            rows={2}
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="e.g. Anniversary dinner, corner booth preferred, peanut allergy for one guest..."
            className="w-full bg-ivory-50 border border-ivory-300 rounded-xl p-3 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-terracotta-600 hover:bg-terracotta-700 text-ivory-50 py-4 px-6 rounded-2xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {submitting ? (
            <span>Verifying Table Capacity &amp; Booking...</span>
          ) : (
            <>
              <span>Request Table Reservation for {formatTo12Hour(timeSlot)}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
