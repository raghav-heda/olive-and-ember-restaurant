import Link from "next/link";
import { HelpCircle, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Frequently Asked Questions | Olive & Ember Kitchen",
  description:
    "Common inquiries regarding dining reservations, wood-fired dough fermentation, delivery zones, allergen protocols, and cancellation policies.",
};

const FAQ_ITEMS = [
  {
    q: "How does the 48-hour sourdough fermentation benefit digestion?",
    a: "Our sourdough is leavened solely with a live indigenous culture without commercial baker's yeast. During the 48-hour cold proof, wild yeasts and lactobacilli naturally predigest gluten proteins and break down phytic acid, resulting in a lighter crust that is remarkably gentle on digestion.",
  },
  {
    q: "Can I book a table for large groups exceeding 12 guests?",
    a: "For parties larger than 12, we curate bespoke multi-course family-style dining menus across our botanical terrace or private hearth booth. Please contact our events team at hello@oliveandember.demo or via our contact page to coordinate seating.",
  },
  {
    q: "What is your table holding grace period?",
    a: "We hold reserved tables for up to 15 minutes past your booked seating time. If you anticipate delayed arrival due to city traffic, please message our front-of-house desk so we can protect your table.",
  },
  {
    q: "Do you accommodate gluten-friendly and vegan dietary requirements?",
    a: "Yes. We offer an artisan almond-flour gluten-friendly crust, multiple completely vegan hearth mains (such as our Spiced Ember-Charred Butternut Squash), and bronze-die gluten-free pasta options. All dietary badges are transparently indicated on our interactive menu.",
  },
  {
    q: "What are your delivery zones and minimum order requirements?",
    a: "We currently deliver within an 8.5 km radius of Indiranagar, Bengaluru. A standard delivery fee of ₹50 applies, which is completely waived for orders of ₹800 and above.",
  },
  {
    q: "What payment methods are supported for orders and dining?",
    a: "We support Cash on Delivery, UPI on Arrival, and direct table payment. We also provide online Razorpay integration supporting all major credit/debit cards, net banking, and UPI handles.",
  },
  {
    q: "What is your reservation and order cancellation policy?",
    a: "Table reservations can be modified or cancelled without fee up to 2 hours prior to service. Food delivery orders can be cancelled within 5 minutes of placement prior to the kitchen stoking and stretching dough.",
  },
];

export default function FaqPage() {
  return (
    <div className="bg-ivory-50 min-h-screen py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-widest font-bold text-terracotta-600">
            Guest Guidance
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-charcoal-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-charcoal-700 max-w-xl mx-auto leading-relaxed">
            Everything you need to know about our hearthside craft, table booking rules, delivery reach, and culinary sourcing.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="bg-ivory-100 border border-ivory-300 rounded-2xl p-6 sm:p-7 shadow-sm space-y-2.5"
            >
              <h3 className="font-serif text-lg font-bold text-charcoal-900 flex items-start gap-3">
                <span className="text-terracotta-600 font-sans text-xs mt-1 font-bold">
                  Q{idx + 1}.
                </span>
                <span>{item.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed pl-7">
                {item.a}
              </p>
            </div>
          ))}
        </div>

        {/* Still Have Questions Card */}
        <div className="p-8 bg-charcoal-950 text-ivory-50 rounded-3xl text-center space-y-4 shadow-md">
          <h3 className="font-serif text-2xl font-bold">Have an unlisted question?</h3>
          <p className="text-xs text-ivory-300 max-w-md mx-auto leading-relaxed font-light">
            Our guest concierge is available daily to address specific allergen concerns, corporate catering, and special occasion requests.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-terracotta-600 hover:bg-terracotta-500 text-ivory-50 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <span>Contact Hospitality Team</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
