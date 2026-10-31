"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Flame, Lock, Mail, ArrowRight, AlertTriangle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col justify-center items-center p-4 sm:p-6 text-ivory-50">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform shadow relative">
              <Image
                src="/images/restaurant-logo.png"
                alt="Olive & Ember Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span className="font-serif text-2xl tracking-wide text-ivory-50">
              Olive &amp; Ember
            </span>
          </Link>
          <h2 className="font-serif text-2xl font-bold text-ivory-100">
            Back of House Management
          </h2>
          <p className="text-xs text-ivory-400">
            Secure management console for authorized restaurant administrators and floor staff.
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-8 space-y-5 shadow-2xl"
        >
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-200 flex items-center gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-ivory-300">
              Account Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-700 pointer-events-none" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="staff@oliveandember.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-ivory-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-700 pointer-events-none" />
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-terracotta-600 hover:bg-terracotta-500 text-ivory-50 py-3.5 px-6 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <span>Verifying Session...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-ivory-400 hover:text-ivory-200 transition-colors"
          >
            &larr; Return to Olive &amp; Ember Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
