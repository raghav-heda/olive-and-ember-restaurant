"use client";

import { useState } from "react";
import Image from "next/image";

interface GalleryPhoto {
  id: string;
  category: "food" | "interior" | "kitchen";
  title: string;
  caption: string;
  url: string;
}

const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: "1",
    category: "food",
    title: "Smoked Ember Margherita",
    caption: "48-hour cold proof sourdough blistered in 450°C stone oven.",
    url: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "2",
    category: "interior",
    title: "The Hearth Dining Room",
    caption: "Acoustic oak booths, hand-thrown terracotta pendant lighting.",
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "3",
    category: "kitchen",
    title: "Wood Flame & Embers",
    caption: "Seasoned olive wood feeding the continuous hearth coals.",
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "4",
    category: "food",
    title: "Truffled Burrata & Charred Peaches",
    caption: "Creamy artisanal cheese paired with caramelized stone fruit.",
    url: "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a85?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "5",
    category: "kitchen",
    title: "Hand-Shaping Bronze-Die Tagliolini",
    caption: "Fresh extruded egg pasta prepped daily before lunch service.",
    url: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "6",
    category: "interior",
    title: "Botanical Courtyard Terrace",
    caption: "Sunlit open-air terrace surrounded by purple basil and olive pots.",
    url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "7",
    category: "food",
    title: "Burnt Basque Olive Oil Cheesecake",
    caption: "Molten creamy interior with caramelized smoked sea salt crust.",
    url: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "8",
    category: "food",
    title: "Smoked Rosemary Paloma",
    caption: "Pink ruby grapefruit with charred garden rosemary smoke.",
    url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "9",
    category: "kitchen",
    title: "Chef Raghav at the Hearth",
    caption: "Inspecting blistered crusts fresh off the baking stone.",
    url: "https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&w=1000&q=80",
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
                <Image
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
