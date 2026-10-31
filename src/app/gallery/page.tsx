"use client";

import { useState } from "react";
import { FoodImage } from "@/components/ui/FoodImage";

interface GalleryPhoto {
  id: string;
  category: "food" | "interior" | "kitchen";
  title: string;
  caption: string;
  url: string;
}

const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: "burrata-peaches",
    category: "food",
    title: "Truffled Burrata & Hearth Peaches",
    caption: "Artisanal burrata, wood-charred peaches, wild clover honey, toasted pine nuts, and sourdough crisps.",
    url: "/images/menu/burrata-peaches.jpg",
  },
  {
    id: "focaccia-garlic",
    category: "food",
    title: "Hearth Focaccia & Confit Garlic Dip",
    caption: "Warm olive oil-drenched sourdough focaccia with sea salt flakes, charred rosemary, and whipped confit garlic butter.",
    url: "/images/menu/focaccia-garlic.jpg",
  },
  {
    id: "margherita-pizza",
    category: "food",
    title: "Smoked Ember Margherita Pizza",
    caption: "San Marzano DOP tomato passata, fresh buffalo mozzarella, hand-torn sweet basil, and cold-pressed olive oil.",
    url: "/images/menu/margherita-pizza.jpg",
  },
  {
    id: "truffle-mushroom-pizza",
    category: "food",
    title: "Wild Mushroom & Black Truffle Pizza",
    caption: "Roasted shiitake and porcini cream, fontina, charred thyme, shaved black summer truffle, and aged pecorino.",
    url: "/images/menu/truffle-mushroom-pizza.jpg",
  },
  {
    id: "pepperoni-pizza",
    category: "food",
    title: "Charred Pepperoni & Hot Honey Pizza",
    caption: "Crispy-edged artisanal pepperoni, whole-milk mozzarella, fiery chili flakes, and slow-infused habanero honey.",
    url: "/images/menu/pepperoni-pizza.jpg",
  },
  {
    id: "cacio-e-pepe",
    category: "food",
    title: "Artisanal Cacio e Pepe Tagliolini",
    caption: "House-extruded fresh tagliolini tossed with 24-month aged Pecorino Romano and toasted Tellicherry peppercorn emulsion.",
    url: "/images/menu/cacio-e-pepe.jpg",
  },
  {
    id: "lamb-pappardelle",
    category: "food",
    title: "Braised Lamb Shank Pappardelle",
    caption: "6-hour slow-cooked tender pulled lamb shank, rich rosemary tomato jus, wide bronze-cut ribbons, and Parmigiano Reggiano.",
    url: "/images/menu/lamb-pappardelle.jpg",
  },
  {
    id: "coastal-seabass",
    category: "food",
    title: "Wood-Fired Coastal Seabass",
    caption: "Pan-crisped whole sea bass fillet baked over olive wood coals, fennel citrus salad, caperberry vinaigrette, and crushed baby potatoes.",
    url: "/images/menu/coastal-seabass.jpg",
  },
  {
    id: "butternut-squash",
    category: "food",
    title: "Ember-Charred Butternut Squash",
    caption: "Spiced roasted butternut squash steaks, whipped cashew garlic crème, pomegranate molasses reduction, and toasted pumpkin seeds.",
    url: "/images/menu/butternut-squash.jpg",
  },
  {
    id: "basque-cheesecake",
    category: "food",
    title: "Burnt Basque Olive Oil Cheesecake",
    caption: "Caramelized crust with a molten creamy center, finished with extra virgin olive oil and Maldon smoked sea salt flakes.",
    url: "/images/menu/basque-cheesecake.jpg",
  },
  {
    id: "rosemary-paloma",
    category: "food",
    title: "Smoked Rosemary & Pink Grapefruit Elixir",
    caption: "Freshly pressed ruby grapefruit juice, torched garden rosemary sprig, sparkling pink tonic, and volcanic black salt rim.",
    url: "/images/menu/rosemary-paloma.jpg",
  },
  {
    id: "dining-room",
    category: "interior",
    title: "The Hearth Dining Room",
    caption: "Acoustic oak booths, hand-thrown terracotta pendant lighting, and warm hearth ambiance.",
    url: "/images/gallery/hearth-dining-room.jpg",
  },
  {
    id: "courtyard-terrace",
    category: "interior",
    title: "Botanical Courtyard Terrace",
    caption: "Sunlit open-air terrace surrounded by purple basil, fragrant herbs, and olive pots.",
    url: "/images/gallery/courtyard-terrace.jpg",
  },
  {
    id: "chef-hearth",
    category: "kitchen",
    title: "Chef Raghav at the Hearth",
    caption: "Inspecting naturally leavened sourdough crusts blistered fresh off the hearth stone.",
    url: "/images/gallery/chef-hearth.jpg",
  },
];

export default function GalleryPage() {
  const [filter, setFilter] = useState<"all" | "food" | "interior" | "kitchen">("all");

  const filteredPhotos =
    filter === "all" ? GALLERY_PHOTOS : GALLERY_PHOTOS.filter((p) => p.category === filter);

  return (
    <div className="bg-ivory-50 min-h-screen py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest font-bold text-terracotta-600">
            Visual Journal
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-charcoal-900 tracking-tight">
            Ambience, Fire &amp; Food
          </h1>
          <p className="text-sm text-charcoal-700 leading-relaxed">
            A glimpse inside our Indiranagar dining room, the glowing wood-fired stone oven, and our seasonal culinary creations.
          </p>
        </div>

        {/* Filter Navigation */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-colors ${
              filter === "all"
                ? "bg-charcoal-900 text-ivory-50 shadow-sm"
                : "bg-ivory-100 text-charcoal-700 hover:bg-ivory-200 border border-ivory-300"
            }`}
          >
            All Perspectives
          </button>
          <button
            onClick={() => setFilter("food")}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-colors ${
              filter === "food"
                ? "bg-charcoal-900 text-ivory-50 shadow-sm"
                : "bg-ivory-100 text-charcoal-700 hover:bg-ivory-200 border border-ivory-300"
            }`}
          >
            Hearth Dishes
          </button>
          <button
            onClick={() => setFilter("interior")}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-colors ${
              filter === "interior"
                ? "bg-charcoal-900 text-ivory-50 shadow-sm"
                : "bg-ivory-100 text-charcoal-700 hover:bg-ivory-200 border border-ivory-300"
            }`}
          >
            Dining Room &amp; Bar
          </button>
          <button
            onClick={() => setFilter("kitchen")}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-colors ${
              filter === "kitchen"
                ? "bg-charcoal-900 text-ivory-50 shadow-sm"
                : "bg-ivory-100 text-charcoal-700 hover:bg-ivory-200 border border-ivory-300"
            }`}
          >
            Kitchen &amp; Embers
          </button>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-ivory-300 bg-ivory-200"
            >
              <div className="relative h-72 w-full overflow-hidden">
                <FoodImage
                  src={photo.url}
                  alt={photo.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              {/* Caption Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/90 via-charcoal-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-ivory-50">
                <span className="text-[10px] font-bold uppercase tracking-widest text-terracotta-400">
                  {photo.category}
                </span>
                <h3 className="font-serif text-lg font-bold mt-0.5">{photo.title}</h3>
                <p className="text-xs text-ivory-300 mt-1">{photo.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
