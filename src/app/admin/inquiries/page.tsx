import { requirePageAuth } from "@/lib/auth";
import prisma from "@/lib/db";
import { InquiriesManagerClient } from "@/components/admin/InquiriesManagerClient";
import { Mail, Sparkles } from "lucide-react";

export const revalidate = 0; // Dynamic server component

export default async function AdminInquiriesPage() {
  await requirePageAuth(["ADMIN", "OWNER", "STAFF"]);

  const inquiries = await prisma.contactInquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-terracotta-400 font-bold">
            Hospitality Concierge
          </span>
          <h1 className="font-serif text-3xl font-bold text-ivory-50 mt-1">
            Guest Notes &amp; Inquiries
          </h1>
          <p className="text-xs text-ivory-400 mt-1">
            Review and respond to guest inquiries submitted through the hospitality contact form.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-charcoal-900 border border-charcoal-800 px-4 py-2 rounded-2xl shadow-sm text-xs">
          <Mail className="w-4 h-4 text-terracotta-400" />
          <span className="text-ivory-300">
            Total Notes: <strong className="text-ivory-50">{inquiries.length}</strong>
          </span>
        </div>
      </div>

      {/* Main Inquiries Client */}
      <InquiriesManagerClient
        initialInquiries={inquiries.map((i) => ({
          ...i,
          createdAt: i.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
