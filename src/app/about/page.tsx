import Image from "next/image";
import Link from "next/link";
import { Flame, Sparkles, Leaf, Award, HeartHandshake, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Our Story & Culinary Craft | Olive & Ember Kitchen",
  description:
    "Discover the philosophy behind Olive & Ember Kitchen. Naturally leavened sourdough, refractory stone hearths, and cold-pressed coastal harvests.",
};

export default function AboutPage() {
  return (
    <div className="bg-ivory-50 min-h-screen py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {/* Hero Banner */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-xs uppercase tracking-widest font-bold text-terracotta-600">
            Artisanal Manifesto
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl text-charcoal-900 tracking-tight leading-tight">
            Rooted in hearth embers, unhurried time &amp; honest earth.
          </h1>
          <p className="text-base text-charcoal-700 font-light leading-relaxed">
            Olive &amp; Ember Kitchen began as an antidote to industrial fast dining: a celebration of 48-hour wild sourdough ferments, live fire cooking, and organic sun-ripened botanicals.
          </p>
        </div>

        {/* Feature Split 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative h-[450px] rounded-3xl overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&w=1200&q=80"
              alt="Artisan sourdough baker"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 600px"
            />
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-terracotta-600 text-xs font-bold uppercase tracking-widest">
              <Flame className="w-4 h-4" />
              <span>Living Culture</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 leading-tight">
              The 48-Hour Heritage Ferment
            </h2>
            <p className="text-sm text-charcoal-700 leading-relaxed">
              Our sourdough culture was started with wild indigenous yeast and spring water. Every batch undergoes a 48-hour cold proofing cycle, allowing natural lactobacilli to break down complex starches, resulting in extraordinary digestibility, a crisp honeycomb crumb, and subtle sourdough acidity.
            </p>
            <p className="text-sm text-charcoal-700 leading-relaxed">
              When our dough touches the 450°C refractory hearth floor, moisture vaporizes instantly into blistered &apos;leopard-spot&apos; air pockets that are feather-light and fragrant.
            </p>
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-ivory-100 rounded-3xl border border-ivory-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-olive-100 text-olive-800 flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-charcoal-900">
              Stone-Pressed Olive Oils
            </h3>
            <p className="text-xs text-charcoal-700 leading-relaxed">
              We exclusively use unblended, single-estate cold-pressed extra virgin olive oil for finishing, emulsifying, and slow-confit garlic poaching.
            </p>
          </div>

          <div className="p-8 bg-ivory-100 rounded-3xl border border-ivory-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-terracotta-100 text-terracotta-800 flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-charcoal-900">
              Aged Olive Wood Fire
            </h3>
            <p className="text-xs text-charcoal-700 leading-relaxed">
              Seasoned orchard wood imparts a gentle, aromatic incense rather than pungent bitter smoke. Fire caramelizes natural vegetable sugars into sublime umami.
            </p>
          </div>

          <div className="p-8 bg-ivory-100 rounded-3xl border border-ivory-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-charcoal-900">
              Locally Foraged Botanicals
            </h3>
            <p className="text-xs text-charcoal-700 leading-relaxed">
              Garden rosemary, purple basil, pink peppercorns, and wild mountain honey are delivered fresh every dawn from ethical regional farm collectives.
            </p>
          </div>
        </div>

        {/* Chef Introduction */}
        <div className="bg-charcoal-950 text-ivory-50 rounded-3xl p-8 sm:p-14 border border-charcoal-800 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="relative h-80 lg:col-span-5 rounded-2xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=800&q=80"
              alt="Executive Chef"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 400px"
            />
          </div>

          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs uppercase tracking-widest font-bold text-terracotta-400">
              Executive Culinary Director
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl text-ivory-50">Chef Raghav Heda</h3>
            <p className="text-xs sm:text-sm text-ivory-300 font-light leading-relaxed">
              &quot;Cooking with live embers forces mindfulness. There are no computer screens regulating temperature in a wood hearth — only the baker&apos;s intuition, the flame&apos;s color, and the sound of sizzling moisture. Our mission is to restore that pure, communal joy of breaking hot bread together.&quot;
            </p>
            <div className="pt-4 flex items-center gap-4">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 bg-terracotta-600 hover:bg-terracotta-500 text-ivory-50 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <span>Experience the Menu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
