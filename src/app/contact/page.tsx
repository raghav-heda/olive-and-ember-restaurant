"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit message");
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-ivory-50 min-h-screen py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest font-bold text-terracotta-600">
            Reach Out
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-charcoal-900 tracking-tight">
            Location, Hours &amp; Concierge
          </h1>
          <p className="text-sm text-charcoal-700 leading-relaxed">
            Whether inquiring about private dining buyouts, dietary questions, or directions to our hearth room, we look forward to connecting.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Contact Cards & Map Link */}
          <div className="lg:col-span-5 space-y-6">
            {/* Address & Direction Card */}
            <div className="bg-ivory-100 border border-ivory-300 rounded-3xl p-8 space-y-4 shadow-sm text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-charcoal-900 text-terracotta-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-charcoal-900">
                    Indiranagar Kitchen
                  </h3>
                  <p className="text-charcoal-700 text-[11px]">Flagship Dining Destination</p>
                </div>
              </div>

              <p className="text-charcoal-800 leading-relaxed text-sm pt-2">
                14/2 Hearthstone Avenue, 100ft Road, Indiranagar, Bengaluru, Karnataka 560038
              </p>

              <div className="pt-2">
                <a
                  href="https://maps.google.com/?q=100ft+Road+Indiranagar+Bengaluru"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-terracotta-600 hover:text-terracotta-700 group"
                >
                  <span>Open in Google Maps Directions</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>

            {/* Hours Breakdown */}
            <div className="bg-ivory-100 border border-ivory-300 rounded-3xl p-7 sm:p-8 space-y-5 shadow-sm text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-charcoal-900 text-terracotta-400 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-charcoal-900">Service Hours</h3>
                    <p className="text-charcoal-600 text-[11px]">Lunch, Dinner &amp; Weekend Service</p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-olive-100 text-olive-800 text-[10px] font-bold tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-olive-600 animate-pulse" />
                  Kitchen Active
                </span>
              </div>

              <div className="space-y-3.5 pt-1">
                {/* Monday - Thursday */}
                <div className="p-3.5 bg-ivory-50/80 rounded-2xl border border-ivory-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-charcoal-900">
                      Monday &ndash; Thursday
                    </span>
                    <span className="text-[10px] text-charcoal-500 font-medium uppercase tracking-wider">
                      Weekday Cadence
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between sm:justify-start gap-2 text-charcoal-700">
                      <span className="px-2 py-0.5 rounded bg-amber-100/70 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                        Lunch
                      </span>
                      <span className="font-medium text-charcoal-900">12:00 PM &ndash; 3:30 PM</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-2 text-charcoal-700">
                      <span className="px-2 py-0.5 rounded bg-terracotta-100/70 text-terracotta-800 text-[10px] font-bold uppercase tracking-wider">
                        Dinner
                      </span>
                      <span className="font-medium text-charcoal-900">6:30 PM &ndash; 11:00 PM</span>
                    </div>
                  </div>
                </div>

                {/* Friday & Saturday */}
                <div className="p-3.5 bg-ivory-50/80 rounded-2xl border border-ivory-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-charcoal-900">
                      Friday &amp; Saturday
                    </span>
                    <span className="text-[10px] text-terracotta-700 font-bold uppercase tracking-wider">
                      Extended Hearth
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between sm:justify-start gap-2 text-charcoal-700">
                      <span className="px-2 py-0.5 rounded bg-amber-100/70 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                        Lunch
                      </span>
                      <span className="font-medium text-charcoal-900">12:00 PM &ndash; 3:30 PM</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-2 text-charcoal-700">
                      <span className="px-2 py-0.5 rounded bg-terracotta-100/70 text-terracotta-800 text-[10px] font-bold uppercase tracking-wider">
                        Dinner
                      </span>
                      <span className="font-medium text-charcoal-900">6:30 PM &ndash; 11:45 PM</span>
                    </div>
                  </div>
                </div>

                {/* Sunday */}
                <div className="p-3.5 bg-ivory-50/80 rounded-2xl border border-ivory-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-charcoal-900">
                      Sunday Hearth
                    </span>
                    <span className="text-[10px] text-olive-700 font-bold uppercase tracking-wider">
                      Continuous Service
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-charcoal-700">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-olive-100/80 text-olive-800 text-[10px] font-bold uppercase tracking-wider">
                        All-Day
                      </span>
                      <span className="font-medium text-charcoal-900">12:00 PM &ndash; 10:30 PM</span>
                    </div>
                    <span className="text-[11px] text-charcoal-500 hidden sm:inline">No afternoon reset closure</span>
                  </div>
                </div>
              </div>

              {/* Kitchen Last Seating Note */}
              <div className="pt-2 border-t border-ivory-200/80 flex items-center justify-between text-[11px] text-charcoal-500">
                <span>Last seating / orders: 45 mins before close</span>
                <span className="font-serif italic text-charcoal-600">Wood-Fired Hearth</span>
              </div>
            </div>

            {/* Direct Line & WhatsApp Action */}
            <div className="bg-charcoal-950 text-ivory-50 rounded-3xl p-8 space-y-4 shadow-md">
              <h3 className="font-serif text-xl font-bold">Need Fast WhatsApp Support?</h3>
              <p className="text-xs text-ivory-300 leading-relaxed font-light">
                Message our reservations desk directly for seating queries or dietary questions.
              </p>
              <div className="pt-2">
                <a
                  href="https://wa.me/919876543210?text=Hello%20Olive%20%26%20Ember,%20I%20have%20an%20inquiry%20regarding%20table%20reservations."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-ivory-50 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-colors w-full shadow"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Inquiry Form */}
          <div className="lg:col-span-7 bg-ivory-100 border border-ivory-300 rounded-3xl p-8 sm:p-10 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-charcoal-900 mb-2">
              Send a Note to Our Hospitality Team
            </h2>
            <p className="text-xs text-charcoal-700 mb-6">
              Inquiries regarding private party buyouts, corporate bookings, or special chef tastings.
            </p>

            {success ? (
              <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-serif text-xl font-bold text-emerald-950">
                  Message Dispatched Successfully
                </h3>
                <p className="text-xs text-emerald-800 max-w-sm mx-auto">
                  Thank you for reaching out to Olive &amp; Ember Kitchen. Our hospitality team will review your inquiry and follow up within 24 hours.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-4 text-xs font-bold uppercase tracking-wider text-charcoal-900 underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-800">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priya Nair"
                      className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3.5 py-2.5 text-charcoal-900 focus:outline-none focus:border-terracotta-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="priya@example.com"
                      className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3.5 py-2.5 text-charcoal-900 focus:outline-none focus:border-terracotta-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3.5 py-2.5 text-charcoal-900 focus:outline-none focus:border-terracotta-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Private Dining Inquiry"
                      className="w-full bg-ivory-50 border border-ivory-300 rounded-xl px-3.5 py-2.5 text-charcoal-900 focus:outline-none focus:border-terracotta-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your event, date, or specific culinary questions..."
                    className="w-full bg-ivory-50 border border-ivory-300 rounded-xl p-3 text-charcoal-900 focus:outline-none focus:border-terracotta-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-terracotta-600 hover:bg-terracotta-700 text-ivory-50 py-3.5 px-6 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-colors shadow disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Submitting Inquiry...</span>
                  ) : (
                    <>
                      <span>Transmit Message</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
