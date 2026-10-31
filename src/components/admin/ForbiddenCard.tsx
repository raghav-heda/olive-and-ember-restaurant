import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export function ForbiddenCard({
  moduleName = "This Management Area",
}: {
  moduleName?: string;
}) {
  return (
    <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-10 text-center max-w-lg mx-auto my-12 space-y-5 shadow-2xl">
      <div className="w-16 h-16 rounded-full bg-red-950/80 text-red-400 border border-red-800 flex items-center justify-center mx-auto shadow-inner">
        <ShieldAlert className="w-9 h-9" />
      </div>

      <div className="space-y-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-terracotta-400">
          403 Forbidden &bull; Restricted Access
        </span>
        <h2 className="font-serif text-2xl font-bold text-ivory-50">
          Administrator Privileges Required
        </h2>
        <p className="text-xs text-ivory-400 leading-relaxed">
          {moduleName} is strictly restricted to Owner and Administrator accounts. Floor staff members do not have permission to view or modify this configuration.
        </p>
      </div>

      <div className="pt-2">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 bg-charcoal-800 hover:bg-charcoal-700 text-ivory-100 px-5 py-2.5 rounded-xl text-xs font-bold transition-colors border border-charcoal-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Shared Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
