import { ReservationForm } from "@/components/reservations/ReservationForm";
import { Clock, ShieldCheck, MapPin, Sparkles } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "Table Reservations | Olive & Ember Kitchen",
  description:
    "Reserve an intimate wood-fired dining experience in Indiranagar, Bengaluru. Real-time availability, instant confirmation reference, and customizable party sizes.",
};

export default function ReservationsPage() {
  return (
    <div className="bg-ivory-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs uppercase tracking-widest font-bold text-terracotta-600">
            Intimate Hearth Dining
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-charcoal-900 tracking-tight">
            Reserve Your Table
          </h1>
          <p className="text-sm text-charcoal-700 leading-relaxed">
            Join us for an unhurried evening of slow-fermented crusts, embers, and coastal flavors. Bookings are accepted up to 30 days in advance.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Booking Form */}
          <div className="lg:col-span-8">
            <ReservationForm />
          </div>

          {/* Side Info Cards */}
          <div className="lg:col-span-4 space-y-6">
            {/* Dining Policies */}
            <div className="bg-ivory-100 border border-ivory-300 rounded-3xl p-6 space-y-4 shadow-sm text-xs">
              <h3 className="font-serif text-base font-bold text-charcoal-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-terracotta-600" />
                <span>Dining Service &amp; Policies</span>
              </h3>
              <ul className="space-y-2.5 text-charcoal-700 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-terracotta-600 font-bold">•</span>
                  <span><strong>Table Holding Window:</strong> Tables are held for 15 minutes past your reserved seating time before release.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-terracotta-600 font-bold">•</span>
                  <span><strong>Dining Duration:</strong> Each seating is reserved for 90 minutes to ensure a relaxed, multi-course cadence.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-terracotta-600 font-bold">•</span>
                  <span><strong>Dietary Sensitivities:</strong> Please note any severe allergens during booking so our kitchen can prepare clean stations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-terracotta-600 font-bold">•</span>
                  <span><strong>Cancellation:</strong> Modifications or cancellations can be made up to 2 hours prior to service without charge.</span>
                </li>
              </ul>
            </div>

            {/* Atmosphere Card */}
            <div className="relative h-64 rounded-3xl overflow-hidden border border-ivory-300 shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
                alt="Dining booth"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/30 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 text-ivory-50">
                <span className="text-[10px] font-bold uppercase tracking-widest text-terracotta-400">
                  Private Hearth Seating
                </span>
                <p className="font-serif text-sm font-semibold mt-0.5">
                  Handcrafted oak booths with acoustically dampened ambient lighting.
                </p>
              </div>
            </div>

            {/* Direct Line */}
            <div className="p-6 bg-olive-50 border border-olive-200 rounded-3xl space-y-2 text-xs">
              <span className="font-bold text-olive-900 block">Need Immediate Assistance?</span>
              <p className="text-olive-800 leading-relaxed">
                For same-day bookings within the hour or groups exceeding 12 guests:
              </p>
              <p className="font-bold text-charcoal-900 pt-1 text-sm">+91 98765 43210</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
