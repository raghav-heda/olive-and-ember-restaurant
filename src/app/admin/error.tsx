"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin portal runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-8 sm:p-10 max-w-lg w-full text-center space-y-6 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-800/80 text-red-400 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-ivory-50">
            Unable to Load Dashboard Data
          </h2>
          <p className="text-xs text-ivory-400 leading-relaxed">
            A temporary issue occurred while loading management records from the database. Your session and permissions remain active.
          </p>
          {error.message && (
            <div className="p-3 bg-charcoal-950 rounded-xl border border-charcoal-800 text-[11px] font-mono text-red-300 text-left overflow-x-auto">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-4 rounded-xl bg-terracotta-600 hover:bg-terracotta-500 text-ivory-50 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-colors shadow"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Loading</span>
          </button>
          <Link
            href="/admin/orders"
            className="flex-1 py-3 px-4 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-ivory-200 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-colors border border-charcoal-700"
          >
            <Home className="w-4 h-4" />
            <span>Live Orders</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
