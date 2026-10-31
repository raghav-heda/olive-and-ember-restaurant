export const metadata = {
  title: "Privacy Policy | Olive & Ember Kitchen",
  description: "Privacy policy, data retention, and guest information guidelines.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-ivory-50 min-h-screen py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-charcoal-800 text-xs sm:text-sm leading-relaxed">
        <div className="border-b border-ivory-300 pb-6 space-y-2">
          <span className="text-xs uppercase tracking-widest font-bold text-terracotta-600">
            Legal &amp; Compliance
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-bold">
            Privacy Policy
          </h1>
          <p className="text-xs text-charcoal-700">
            Last Updated: October 2026 &bull; Document Template for Commercial Customization
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <strong>Notice for Restaurant Owners:</strong> This document represents a commercial template designed for demonstration. It should be reviewed and customized by legal counsel to reflect your specific jurisdiction and local consumer data regulations.
        </div>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-charcoal-900">1. Information We Collect</h2>
          <p>
            When placing orders or requesting table reservations with Olive &amp; Ember Kitchen, we collect necessary contact information including your full name, telephone number, email address, delivery destination, and voluntarily disclosed dietary preferences.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-charcoal-900">2. Utilization of Guest Data</h2>
          <p>
            Guest information is exclusively utilized to verify table bookings, fulfill delivery consignments, calculate accurate promotional totals, and dispatch automated status updates via email or WhatsApp messaging.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-charcoal-900">3. Payment Security &amp; Credentials</h2>
          <p>
            Olive &amp; Ember Kitchen does not collect, record, or store raw credit or debit card numbers on its servers. Online financial transactions are tokenized and processed through PCI-DSS certified payment intermediaries (such as Razorpay).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-charcoal-900">4. Retention &amp; Data Rights</h2>
          <p>
            Order history is retained for statutory accounting and tax compliance. Guests may request review, modification, or erasure of personal records by writing to hello@oliveandember.demo.
          </p>
        </section>
      </div>
    </div>
  );
}
