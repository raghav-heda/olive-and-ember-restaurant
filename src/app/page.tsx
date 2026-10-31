import Link from "next/link";
import Image from "next/image";
import { FoodImage } from "@/components/ui/FoodImage";
import prisma from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import {
  Flame,
  Calendar,
  ArrowRight,
  Sparkles,
  Clock,
  MapPin,
  Star,
  Award,
  Leaf,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export const revalidate = 60; // ISR cache revalidation every minute

export default async function HomePage() {
  const restaurant = await prisma.restaurant.findFirst({
    include: { settings: true },
  });

  const featuredDishes = await prisma.menuItem.findMany({
    where: { isFeatured: true, isAvailable: true },
    take: 6,
    include: { category: true },
  });

  const categories = await prisma.menuCategory.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    take: 4,
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-charcoal-950 overflow-hidden text-ivory-50">
        {/* Background Image with Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/restaurant-cover.jpg"
            alt="Artisanal Hearth cooking at Olive & Ember"
            fill
            priority
            className="object-cover object-center opacity-40 scale-105 transition-transform duration-1000 ease-out"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/60 to-transparent" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-charcoal-950/80" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-terracotta-900/60 border border-terracotta-500/40 text-terracotta-300 text-xs uppercase tracking-widest font-medium backdrop-blur-sm">
            <Flame className="w-3.5 h-3.5 text-terracotta-400" />
            <span>450°C Stone Hearth • Naturally Leavened</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-ivory-50 leading-[1.1]">
            Slow fires, cold presses &amp; <br className="hidden sm:inline" />
            <span className="italic font-serif text-terracotta-400">timeless culinary craft.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-ivory-300 font-sans font-light leading-relaxed">
            Welcome to Olive &amp; Ember Kitchen. An intimate sanctuary where slow-fermented heritage dough meets roaring olive-wood hearths and handpicked coastal produce.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/menu"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-terracotta-600 hover:bg-terracotta-500 text-ivory-50 px-8 py-4 rounded-full text-sm font-semibold tracking-wider uppercase transition-all duration-300 shadow-lg hover:shadow-terracotta-600/30 hover:-translate-y-0.5"
            >
              <span>Explore Digital Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/reservations"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-charcoal-800/80 hover:bg-charcoal-700 text-ivory-100 border border-ivory-300/20 px-8 py-4 rounded-full text-sm font-semibold tracking-wider uppercase transition-all duration-300 backdrop-blur-sm hover:-translate-y-0.5"
            >
              <Calendar className="w-4 h-4 text-terracotta-400" />
              <span>Reserve a Table</span>
            </Link>
          </div>

          {/* Quick Info Strip */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-left border-t border-charcoal-800/80 text-xs text-ivory-400">
            <div>
              <p className="font-bold text-ivory-200">Stone Oven Heat</p>
              <p className="text-[11px] text-ivory-400">450°C Olive Wood Flame</p>
            </div>
            <div>
              <p className="font-bold text-ivory-200">Sourdough Ferment</p>
              <p className="text-[11px] text-ivory-400">48-Hour Cold Hydration</p>
            </div>
            <div>
              <p className="font-bold text-ivory-200">Table Bookings</p>
              <p className="text-[11px] text-ivory-400">Instant Real-Time Slots</p>
            </div>
            <div>
              <p className="font-bold text-ivory-200">Fulfillment</p>
              <p className="text-[11px] text-ivory-400">Dine-in, Pickup &amp; Delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. RESTAURANT INTRODUCTION & PHILOSOPHY */}
      <section className="py-20 sm:py-28 bg-ivory-50 border-b border-ivory-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Visual Mosaic */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-md">
                  <Image
                    src="https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&w=800&q=80"
                    alt="Chef kneading artisan dough"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 300px"
                  />
                </div>
                <div className="p-6 bg-olive-50 rounded-2xl border border-olive-100 space-y-2">
                  <Leaf className="w-5 h-5 text-olive-600" />
                  <h4 className="font-serif text-sm font-bold text-charcoal-900">Zero Shortcuts</h4>
                  <p className="text-xs text-charcoal-700 leading-relaxed">
                    Whole grains, stone-milled flour, and fresh herbs harvested daily.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-8">
                <div className="p-6 bg-terracotta-50 rounded-2xl border border-terracotta-100 space-y-2">
                  <Flame className="w-5 h-5 text-terracotta-600" />
                  <h4 className="font-serif text-sm font-bold text-charcoal-900">Living Hearth</h4>
                  <p className="text-xs text-charcoal-700 leading-relaxed">
                    Every dish touches fire, char, and smoked fragrant embers.
                  </p>
                </div>
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-md">
                  <Image
                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"
                    alt="Wood-fired pizza baking"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 300px"
                  />
                </div>
              </div>
            </div>

            {/* Narrative Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-terracotta-600 text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                <span>The Culinary Story</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl text-charcoal-900 leading-tight">
                Where ancient fire meets modern artisanal simplicity.
              </h2>

              <p className="text-base text-charcoal-700 leading-relaxed">
                Founded by Chef Raghav Heda, Olive &amp; Ember was born out of an unhurried reverence for hearth cooking. We reject industrial additives in favor of 48-hour cold sourdough fermentation, stone-pressed virgin olive oils from solar orchards, and charred coastal produce.
              </p>

              <p className="text-sm text-charcoal-700 leading-relaxed">
                From our blistered Neapolitan crusts topped with San Marzano tomatoes to our 6-hour braised lamb shanks and torched rosemary elixirs, each offering is composed to nourish and delight.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-8 border-t border-ivory-200">
                <div>
                  <span className="block font-serif text-3xl font-bold text-terracotta-600">48h</span>
                  <span className="text-xs text-charcoal-700">Dough Fermentation</span>
                </div>
                <div className="w-px h-10 bg-ivory-300" />
                <div>
                  <span className="block font-serif text-3xl font-bold text-olive-600">100%</span>
                  <span className="text-xs text-charcoal-700">Extra Virgin Olive Oil</span>
                </div>
                <div className="w-px h-10 bg-ivory-300" />
                <div>
                  <span className="block font-serif text-3xl font-bold text-charcoal-900">450°C</span>
                  <span className="text-xs text-charcoal-700">Refractory Stone Hearth</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-terracotta-600 hover:text-terracotta-700 group"
                >
                  <span>Read our full culinary manifesto</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR MENU CATEGORIES */}
      <section className="py-20 bg-ivory-100 border-b border-ivory-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-terracotta-600">
                Curated Offerings
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 mt-1">
                Explore Our Courses
              </h2>
            </div>
            <Link
              href="/menu"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-charcoal-800 hover:text-terracotta-600"
            >
              <span>View Full Interactive Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <Link
                key={cat.id}
                href={`/menu?category=${cat.slug}`}
                className="group p-6 bg-ivory-50 rounded-2xl border border-ivory-300 hover:border-terracotta-400 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-mono text-terracotta-500 font-semibold">
                    0{idx + 1}
                  </span>
                  <h3 className="font-serif text-xl text-charcoal-900 mt-2 group-hover:text-terracotta-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-charcoal-700 mt-2 line-clamp-3 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs font-medium text-charcoal-700 group-hover:text-terracotta-600">
                  <span>Browse Category</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CHEF'S FEATURED HEARTH DISHES */}
      <section className="py-20 sm:py-28 bg-ivory-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase tracking-widest font-bold text-terracotta-600">
              Chef&apos;s Recommendations
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-charcoal-900">
              Featured from the Hearth
            </h2>
            <p className="text-sm text-charcoal-700">
              Each dish reflects our obsession with seasonal freshness, fire-caramelized crusts, and delicate balance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredDishes.map((dish) => (
              <div
                key={dish.id}
                className="group bg-ivory-100 rounded-2xl border border-ivory-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {/* Dish Photo */}
                <div className="relative h-60 w-full overflow-hidden bg-ivory-300">
                  <FoodImage
                    src={dish.imageUrl}
                    alt={dish.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Dietary Badge */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {dish.isVegetarian && (
                      <span className="px-2 py-0.5 rounded-full bg-olive-700 text-ivory-50 text-[10px] font-bold tracking-wide">
                        VEG
                      </span>
                    )}
                    {dish.isVegan && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-ivory-50 text-[10px] font-bold tracking-wide">
                        VEGAN
                      </span>
                    )}
                    {dish.isGlutenFree && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-700 text-ivory-50 text-[10px] font-bold tracking-wide">
                        GF
                      </span>
                    )}
                  </div>

                  {/* Price Tag */}
                  <div className="absolute bottom-3 right-3 bg-charcoal-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-ivory-50 border border-ivory-100/10">
                    {formatCurrency(dish.basePrice)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] font-medium text-terracotta-600 uppercase tracking-wider">
                      {dish.category.name}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-charcoal-900 mt-1">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-charcoal-700 mt-2 leading-relaxed">
                      {dish.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-ivory-200 flex items-center justify-between">
                    <span className="text-[11px] text-charcoal-700">
                      Prep: ~{dish.preparationTimeMinutes} mins
                    </span>
                    <Link
                      href="/menu"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta-600 hover:text-terracotta-700"
                    >
                      <span>Order Dish</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-charcoal-900 hover:bg-terracotta-600 text-ivory-50 px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors shadow-md"
            >
              <span>Explore Complete 25+ Dish Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. SEASONAL PROMOTIONS BANNER */}
      <section className="bg-charcoal-900 text-ivory-50 py-16 border-y border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-terracotta-900/60 via-charcoal-800 to-olive-900/40 p-8 sm:p-12 rounded-3xl border border-charcoal-700/60 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl text-center lg:text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-terracotta-500/20 text-terracotta-400 text-xs font-bold uppercase tracking-widest">
                Seasonal Welcome Offer
              </span>
              <h3 className="font-serif text-2xl sm:text-4xl text-ivory-50">
                Enjoy 10% off your first hearthside order
              </h3>
              <p className="text-xs sm:text-sm text-ivory-300 leading-relaxed font-light">
                Use code <span className="font-mono font-bold text-terracotta-300 bg-charcoal-950/80 px-2 py-0.5 rounded border border-terracotta-500/40">EMBER10</span> at checkout on orders above ₹500. Valid for pickup, delivery &amp; dine-in orders.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link
                href="/offers"
                className="bg-ivory-50 hover:bg-ivory-100 text-charcoal-950 px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors text-center"
              >
                View All Active Codes
              </Link>
              <Link
                href="/menu"
                className="bg-terracotta-600 hover:bg-terracotta-500 text-ivory-50 px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors text-center"
              >
                Redeem in Menu
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DINING EXPERIENCE & AMBIENCE */}
      <section className="py-20 sm:py-28 bg-ivory-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-widest font-bold text-olive-600">
                The Ambiance
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-charcoal-900 leading-tight">
                An intimate refuge in the heart of Indiranagar.
              </h2>
              <p className="text-sm text-charcoal-700 leading-relaxed">
                Step away from the city&apos;s bustle into warm acoustic wood paneling, terracotta lamps, and the intoxicating perfume of burning olive wood.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-terracotta-100 flex items-center justify-center text-terracotta-700 shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-charcoal-900">Private Hearth Booths</h4>
                    <p className="text-xs text-charcoal-700">Perfect for celebratory dinners and intimate conversations.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-terracotta-100 flex items-center justify-center text-terracotta-700 shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-charcoal-900">Chef&apos;s Counter Seating</h4>
                    <p className="text-xs text-charcoal-700">Front-row views of sourdough stretch and stone hearth baking.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-terracotta-100 flex items-center justify-center text-terracotta-700 shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-charcoal-900">Sunlit Courtyard Terrace</h4>
                    <p className="text-xs text-charcoal-700">Open-air botanical dining for golden hour aperitifs.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/reservations"
                  className="inline-flex items-center gap-2 bg-charcoal-900 hover:bg-terracotta-600 text-ivory-50 px-6 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors shadow"
                >
                  <Calendar className="w-4 h-4 text-terracotta-400" />
                  <span>Reserve an Evening Table</span>
                </Link>
              </div>
            </div>

            <div className="relative h-[480px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
                alt="Olive & Ember interior ambience"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 600px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER TESTIMONIALS (CLEARLY LABELED DEMO CONTENT) */}
      <section className="py-20 bg-ivory-50 border-t border-ivory-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
            <span className="text-xs uppercase tracking-widest font-bold text-terracotta-600">
              Guest Impressions
            </span>
            <h2 className="font-serif text-3xl text-charcoal-900">
              Reflections from the Hearth
            </h2>
            <p className="text-xs text-charcoal-700">
              (Representative sample dining reviews illustrating user feedback presentation)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-ivory-100 rounded-2xl border border-ivory-200 space-y-4">
              <div className="flex text-amber-500 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-sm text-charcoal-800 italic leading-relaxed">
                &quot;The Burnt Basque Cheesecake and the Smoked Ember Margherita are unmissable. You can taste the 48-hour slow ferment in every blistered bite.&quot;
              </p>
              <div className="pt-2 border-t border-ivory-200">
                <p className="font-serif font-bold text-sm text-charcoal-900">Ananya Deshmukh</p>
                <p className="text-xs text-charcoal-700">Weekend Table Guest</p>
              </div>
            </div>

            <div className="p-8 bg-ivory-100 rounded-2xl border border-ivory-200 space-y-4">
              <div className="flex text-amber-500 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-sm text-charcoal-800 italic leading-relaxed">
                &quot;The online ordering was seamless, and the pizza arrived still steaming with crispy leopard spots. The Rosemary Paloma was a revelation.&quot;
              </p>
              <div className="pt-2 border-t border-ivory-200">
                <p className="font-serif font-bold text-sm text-charcoal-900">Vikramaditya Roy</p>
                <p className="text-xs text-charcoal-700">Delivery Customer</p>
              </div>
            </div>

            <div className="p-8 bg-ivory-100 rounded-2xl border border-ivory-200 space-y-4">
              <div className="flex text-amber-500 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-sm text-charcoal-800 italic leading-relaxed">
                &quot;Intimate booth seating, attentive staff, and real wood smoke aromatics. Easily our favorite new culinary escape in Indiranagar.&quot;
              </p>
              <div className="pt-2 border-t border-ivory-200">
                <p className="font-serif font-bold text-sm text-charcoal-900">Natasha Fernandes</p>
                <p className="text-xs text-charcoal-700">Anniversary Dinner Reservation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. LOCATION, HOURS & INSTANT BOOKING BANNER */}
      <section className="bg-charcoal-950 text-ivory-100 py-16 border-t border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-full bg-charcoal-800 flex items-center justify-center text-terracotta-400 shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-base text-ivory-50">Visit Our Kitchen</h4>
                <p className="text-xs text-ivory-400 mt-0.5">
                  100ft Road, Indiranagar, Bengaluru
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-full bg-charcoal-800 flex items-center justify-center text-terracotta-400 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-base text-ivory-50">Daily Table Service</h4>
                <p className="text-xs text-ivory-400 mt-0.5">
                  12:00 PM – 3:30 PM | 6:30 PM – 11:30 PM
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-end gap-3">
              <Link
                href="/reservations"
                className="bg-terracotta-600 hover:bg-terracotta-500 text-ivory-50 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow"
              >
                Reserve Your Seat
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
