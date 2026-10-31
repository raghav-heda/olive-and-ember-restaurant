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
} from "lucide-react";

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
              {successBooking.date} at {successBooking.time}
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

      {/* Step 2: Time Slot Selection */}
      <div className="space-y-4 border-t border-ivory-200 pt-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-serif text-lg text-charcoal-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-charcoal-900 text-ivory-50 text-xs flex items-center justify-center font-sans font-bold">
              2
            </span>
            <span>Select Service Slot</span>
          </h3>

          {/* Toggle for Custom Time Picker */}
          <button
            type="button"
            onClick={() => setIsCustomMode(!isCustomMode)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-terracotta-600 hover:text-terracotta-700 transition-colors bg-terracotta-50 hover:bg-terracotta-100 px-3 py-1.5 rounded-full border border-terracotta-200"
          >
            {isCustomMode ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Show standard slots</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Choose a different time</span>
              </>
            )}
          </button>
        </div>

        {/* Selected Time Badge */}
        <div className="flex items-center gap-2 text-xs text-charcoal-800">
          <Clock className="w-4 h-4 text-terracotta-600" />
          <span>Selected Seating:</span>
          <span className="font-mono font-bold text-charcoal-950 bg-ivory-200 px-2 py-0.5 rounded text-xs">
            {timeSlot}
          </span>
          {isCustomSelected && (
            <span className="text-[10px] uppercase font-bold text-terracotta-700 bg-terracotta-100 px-2 py-0.5 rounded-full">
              Custom Time
            </span>
          )}
        </div>

        {/* Standard Predefined Time Slots Grid */}
        {!isCustomMode && (
          <div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {DEFAULT_TIME_SLOTS.map((slot) => {
                const isSelected = timeSlot === slot;
                const isDinner = parseInt(slot.split(":")[0], 10) >= 18;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handleSelectTime(slot)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center border ${
                      isSelected
                        ? "bg-charcoal-900 text-ivory-50 border-charcoal-900 shadow-sm scale-105"
                        : "bg-ivory-50 text-charcoal-800 border-ivory-300 hover:border-terracotta-400"
                    }`}
                  >
                    <span>{slot}</span>
                    <span className="block text-[9px] font-normal text-charcoal-700">
                      {isDinner ? "Dinner" : "Lunch"}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className="text-xs text-terracotta-600 hover:underline font-semibold"
              >
                Need a specific time like 12:15, 14:15, or 19:15? + Choose a different time
              </button>
            </div>
          </div>
        )}

        {/* Custom 15-Minute Interval Time Picker */}
        {isCustomMode && (
          <div className="bg-ivory-50 border border-ivory-300 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in-50 duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-ivory-200 pb-3">
              <div>
                <span className="font-bold text-xs text-charcoal-900 uppercase tracking-wider block">
                  Select Custom 15-Minute Seating Time
                </span>
                <span className="text-[11px] text-charcoal-600">
                  Choose any 15-minute interval within daily operating hours (12:00 – 22:30).
                </span>
              </div>

              {/* Lunch / Dinner Tabs */}
              <div className="flex items-center gap-1 bg-ivory-200 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCustomShift("LUNCH")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    customShift === "LUNCH"
                      ? "bg-charcoal-900 text-ivory-50 shadow-sm"
                      : "text-charcoal-700 hover:text-charcoal-950"
                  }`}
                >
                  Lunch (12:00 – 15:00)
                </button>
                <button
                  type="button"
                  onClick={() => setCustomShift("DINNER")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    customShift === "DINNER"
                      ? "bg-charcoal-900 text-ivory-50 shadow-sm"
                      : "text-charcoal-700 hover:text-charcoal-950"
                  }`}
                >
                  Dinner (18:00 – 22:30)
                </button>
              </div>
            </div>

            {/* 15-Minute Slots Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {(customShift === "LUNCH" ? LUNCH_15_MIN_SLOTS : DINNER_15_MIN_SLOTS).map((slot) => {
                const isSelected = timeSlot === slot;
                const isStandard = DEFAULT_TIME_SLOTS.includes(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handleSelectTime(slot)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold font-mono transition-all text-center border ${
                      isSelected
                        ? "bg-terracotta-600 text-ivory-50 border-terracotta-600 shadow-md scale-105"
                        : "bg-ivory-100 text-charcoal-800 border-ivory-300 hover:border-terracotta-400"
                    }`}
                  >
                    <span>{slot}</span>
                    {!isStandard && (
                      <span className="block text-[8px] font-sans font-normal text-terracotta-800">
                        Custom
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Direct Custom Time Input */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs border-t border-ivory-200">
              <span className="text-charcoal-700">Or type any 15-minute time directly:</span>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  step="900"
                  value={timeSlot}
                  onChange={(e) => handleSelectTime(e.target.value)}
                  className="bg-ivory-100 border border-ivory-300 rounded-lg px-3 py-1 text-xs font-mono font-bold text-charcoal-900 focus:outline-none focus:border-terracotta-500"
                />
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="text-xs text-charcoal-600 hover:text-charcoal-900 underline"
                >
                  Reset to standard slots
                </button>
              </div>
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
              <span>Request Table Reservation for {timeSlot}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
