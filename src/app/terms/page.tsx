export const metadata = {
  title: "Terms & Cancellation Policy | Olive & Ember Kitchen",
  description: "Terms of service, dining cancellation guidelines, and ordering conditions.",
};

export default function TermsPage() {
  return (
    <div className="bg-ivory-50 min-h-screen py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-charcoal-800 text-xs sm:text-sm leading-relaxed">
        <div className="border-b border-ivory-300 pb-6 space-y-2">
          <span className="text-xs uppercase tracking-widest font-bold text-terracotta-600">
            Terms of Dining
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-bold">
            Terms &amp; Cancellation Policy
          </h1>
          <p className="text-xs text-charcoal-700">
            Last Updated: October 2026 &bull; Commercial Website Template
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-charcoal-900">1. Dining Reservations</h2>
          <p>
            Confirmed table reservations guarantee a seating slot for 90 minutes. Tables are preserved for a grace period of 15 minutes past the scheduled booking time before release to walk-in guests.
          </p>
          <p>
            Reservation cancellations or party size modifications may be performed without penalty up to 2 hours prior to the reserved slot.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-charcoal-900">2. Online Orders &amp; Delivery</h2>
          <p>
            All prices are shown in Indian Rupees (₹ INR) and include applicable Goods and Services Tax (GST) as itemized during checkout.
          </p>
          <p>
            Due to the perishable nature of wood-fired items and immediate dough stretching in the stone hearth, delivery orders can only be cancelled within 5 minutes of ticket submission.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-charcoal-900">3. Promotional Codes &amp; Coupons</h2>
          <p>
            Promotional coupons (e.g., EMBER10) must be applied prior to placing the order. Discounts are computed on the pre-tax food subtotal and cannot be retroactively credited to historical orders.
          </p>
        </section>
      </div>
    </div>
  );
}
