"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { FoodImage } from "@/components/ui/FoodImage";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/lib/store";
import {
  Search,
  SlidersHorizontal,
  Flame,
  Plus,
  Check,
  X,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";

interface MenuItemValue {
  id: string;
  name: string;
  priceModifier: number;
}

interface MenuItemOption {
  id: string;
  name: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  values: MenuItemValue[];
}

export interface MenuItemData {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  imageUrl: string | null;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  spiceLevel: number;
  allergens: string; // JSON string
  preparationTimeMinutes: number;
  isAvailable: boolean;
  isFeatured: boolean;
  displayOrder: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  options: MenuItemOption[];
}

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export function MenuClient({
  categories,
  menuItems,
}: {
  categories: CategoryData[];
  menuItems: MenuItemData[];
}) {
  const { addItem } = useCart();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dietaryFilter, setDietaryFilter] = useState<"all" | "veg" | "vegan" | "gf">("all");
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "prep_time">("featured");

  // Modal State for Dish Customization
  const [activeModalItem, setActiveModalItem] = useState<MenuItemData | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [selectedOptionValues, setSelectedOptionValues] = useState<{
    [optionId: string]: string[]; // array of value IDs
  }>({});
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [addedToast, setAddedToast] = useState<string | null>(null);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return menuItems
      .filter((item) => {
        // Category filter
        if (selectedCategory !== "all" && item.category.slug !== selectedCategory) {
          return false;
        }

        // Dietary filter
        if (dietaryFilter === "veg" && !item.isVegetarian) return false;
        if (dietaryFilter === "vegan" && !item.isVegan) return false;
        if (dietaryFilter === "gf" && !item.isGlutenFree) return false;

        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(query);
          const matchDesc = item.description.toLowerCase().includes(query);
          const matchCat = item.category.name.toLowerCase().includes(query);
          if (!matchName && !matchDesc && !matchCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.basePrice - b.basePrice;
        if (sortBy === "price_desc") return b.basePrice - a.basePrice;
        if (sortBy === "prep_time") return a.preparationTimeMinutes - b.preparationTimeMinutes;
        // Default "featured"
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return a.displayOrder - b.displayOrder;
      });
  }, [menuItems, selectedCategory, dietaryFilter, searchQuery, sortBy]);

  // Open customization modal
  const handleOpenItem = (item: MenuItemData) => {
    if (!item.isAvailable) return;
    setActiveModalItem(item);
    setModalQuantity(1);
    setSpecialInstructions("");

    // Initialize default required options
    const initialOptions: { [optionId: string]: string[] } = {};
    for (const opt of item.options) {
      if (opt.isRequired && opt.values.length > 0) {
        initialOptions[opt.id] = [opt.values[0].id];
      } else {
        initialOptions[opt.id] = [];
      }
    }
    setSelectedOptionValues(initialOptions);
  };

  // Toggle option value selection in modal
  const handleToggleOptionValue = (option: MenuItemOption, val: MenuItemValue) => {
    const current = selectedOptionValues[option.id] || [];

    if (option.maxSelect === 1) {
      // Radio style
      setSelectedOptionValues({
        ...selectedOptionValues,
        [option.id]: [val.id],
      });
    } else {
      // Multi-select checkbox style
      if (current.includes(val.id)) {
        setSelectedOptionValues({
          ...selectedOptionValues,
          [option.id]: current.filter((id) => id !== val.id),
        });
      } else {
        if (current.length < option.maxSelect) {
          setSelectedOptionValues({
            ...selectedOptionValues,
            [option.id]: [...current, val.id],
          });
        }
      }
    }
  };

  // Calculate unit price in modal
  const calculatedModalUnitPrice = useMemo(() => {
    if (!activeModalItem) return 0;
    let extra = 0;
    for (const opt of activeModalItem.options) {
      const selectedIds = selectedOptionValues[opt.id] || [];
      for (const val of opt.values) {
        if (selectedIds.includes(val.id)) {
          extra += val.priceModifier;
        }
      }
    }
    return activeModalItem.basePrice + extra;
  }, [activeModalItem, selectedOptionValues]);

  // Commit to cart
  const handleAddToCart = () => {
    if (!activeModalItem) return;

    // Check that all required options have been selected
    for (const opt of activeModalItem.options) {
      if (opt.isRequired) {
        const selected = selectedOptionValues[opt.id] || [];
        if (selected.length < opt.minSelect) {
          alert(`Please make a selection for required option: ${opt.name}`);
          return;
        }
      }
    }

    // Collect snapshot of selected option details
    const selectedOptionsList: {
      optionId: string;
      optionName: string;
      valueId: string;
      valueName: string;
      priceModifier: number;
    }[] = [];

    for (const opt of activeModalItem.options) {
      const selectedIds = selectedOptionValues[opt.id] || [];
      for (const val of opt.values) {
        if (selectedIds.includes(val.id)) {
          selectedOptionsList.push({
            optionId: opt.id,
            optionName: opt.name,
            valueId: val.id,
            valueName: val.name,
            priceModifier: val.priceModifier,
          });
        }
      }
    }

    addItem({
      menuItemId: activeModalItem.id,
      name: activeModalItem.name,
      basePrice: activeModalItem.basePrice,
      imageUrl: activeModalItem.imageUrl,
      quantity: modalQuantity,
      selectedOptions: selectedOptionsList,
      specialInstructions: specialInstructions.trim() || undefined,
      unitPrice: calculatedModalUnitPrice,
    });

    setAddedToast(`Added ${modalQuantity}x ${activeModalItem.name} to your order.`);
    setTimeout(() => setAddedToast(null), 3000);
    setActiveModalItem(null);
  };

  // Lock background body scroll when customization modal is active
  useEffect(() => {
    if (activeModalItem) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [activeModalItem]);

  // Close modal on Escape key press
  useEffect(() => {
    if (!activeModalItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveModalItem(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModalItem]);

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-charcoal-900 text-ivory-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-terracotta-500 animate-in fade-in slide-in-from-bottom duration-300">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-medium">{addedToast}</span>
        </div>
      )}

      {/* Controls: Search, Category Pills, Dietary Badges, Sorting */}
      <div className="bg-ivory-100 p-6 rounded-2xl border border-ivory-300 space-y-4">
        {/* Row 1: Search & Sorting */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-700" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, ingredients, or courses..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ivory-50 border border-ivory-300 text-xs text-charcoal-900 placeholder-charcoal-700 focus:outline-none focus:border-terracotta-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-700 hover:text-charcoal-900"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SlidersHorizontal className="w-4 h-4 text-charcoal-700 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-ivory-50 border border-ivory-300 text-xs rounded-xl px-3 py-2.5 text-charcoal-800 focus:outline-none focus:border-terracotta-500 w-full sm:w-auto"
            >
              <option value="featured">Sort: Chef&apos;s Highlights</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="prep_time">Fastest Preparation</option>
            </select>
          </div>
        </div>

        {/* Row 2: Category Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === "all"
                ? "bg-charcoal-900 text-ivory-50 shadow-sm"
                : "bg-ivory-50 text-charcoal-700 hover:bg-ivory-200 border border-ivory-300"
            }`}
          >
            All Courses ({menuItems.length})
          </button>
          {categories.map((cat) => {
            const count = menuItems.filter((i) => i.category.slug === cat.slug).length;
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? "bg-charcoal-900 text-ivory-50 shadow-sm"
                    : "bg-ivory-50 text-charcoal-700 hover:bg-ivory-200 border border-ivory-300"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Row 3: Dietary Classification Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-ivory-200 text-xs">
          <span className="text-[11px] font-bold text-charcoal-700 uppercase tracking-wider">
            Dietary:
          </span>
          <button
            onClick={() => setDietaryFilter("all")}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              dietaryFilter === "all"
                ? "bg-charcoal-800 text-ivory-50 font-medium"
                : "text-charcoal-700 hover:text-charcoal-900"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setDietaryFilter("veg")}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${
              dietaryFilter === "veg"
                ? "bg-olive-700 text-ivory-50 font-medium"
                : "text-charcoal-700 hover:text-olive-700"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-olive-500" />
            Vegetarian
          </button>
          <button
            onClick={() => setDietaryFilter("vegan")}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${
              dietaryFilter === "vegan"
                ? "bg-emerald-700 text-ivory-50 font-medium"
                : "text-charcoal-700 hover:text-emerald-700"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Vegan
          </button>
          <button
            onClick={() => setDietaryFilter("gf")}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${
              dietaryFilter === "gf"
                ? "bg-amber-700 text-ivory-50 font-medium"
                : "text-charcoal-700 hover:text-amber-700"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Gluten-Free
          </button>
        </div>
      </div>

      {/* Menu Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-ivory-100 rounded-3xl border border-ivory-200">
          <div className="w-12 h-12 rounded-full bg-ivory-200 text-charcoal-700 flex items-center justify-center mx-auto mb-3">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg font-bold text-charcoal-900">No matching dishes found</h3>
          <p className="text-xs text-charcoal-700 mt-1">
            Try adjusting your search keywords, category, or dietary filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setDietaryFilter("all");
            }}
            className="mt-4 text-xs font-semibold text-terracotta-600 underline"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item) => {
            const hasOptions = item.options.length > 0;
            const parsedAllergens: string[] = (() => {
              try {
                return JSON.parse(item.allergens || "[]");
              } catch {
                return [];
              }
            })();

            return (
              <div
                key={item.id}
                className={`bg-ivory-100 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-sm hover:shadow-md ${
                  item.isAvailable ? "border-ivory-200 hover:border-terracotta-300" : "border-gray-200 opacity-60"
                }`}
              >
                <div>
                  {/* Photo & Badges */}
                  <div className="relative h-52 w-full bg-ivory-300 overflow-hidden">
                    <FoodImage
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />

                    {/* Dietary Indicators */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                      {item.isVegetarian && (
                        <span className="px-2 py-0.5 rounded-full bg-olive-700 text-ivory-50 text-[10px] font-bold">
                          VEG
                        </span>
                      )}
                      {item.isVegan && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-ivory-50 text-[10px] font-bold">
                          VEGAN
                        </span>
                      )}
                      {item.isGlutenFree && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-700 text-ivory-50 text-[10px] font-bold">
                          GF
                        </span>
                      )}
                      {item.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full bg-terracotta-600 text-ivory-50 text-[10px] font-bold flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>CHEF&apos;S CHOICE</span>
                        </span>
                      )}
                    </div>

                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-charcoal-950/70 flex items-center justify-center">
                        <span className="bg-red-950 text-red-200 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-red-700">
                          Sold Out Today
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Details */}
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif text-lg font-bold text-charcoal-900 group-hover:text-terracotta-600 transition-colors">
                        {item.name}
                      </h3>
                      <span className="font-bold text-charcoal-900 text-base shrink-0">
                        {formatCurrency(item.basePrice)}
                      </span>
                    </div>

                    <p className="text-xs text-charcoal-700 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    {/* Allergens & Prep Time */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-charcoal-700 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-terracotta-500" />
                        {item.preparationTimeMinutes} min
                      </span>

                      {parsedAllergens.length > 0 && (
                        <span className="text-[10px] text-charcoal-700">
                          Allergens: {parsedAllergens.join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="p-5 pt-0">
                  <button
                    disabled={!item.isAvailable}
                    onClick={() => handleOpenItem(item)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                      item.isAvailable
                        ? "bg-charcoal-900 hover:bg-terracotta-600 text-ivory-50 shadow-sm"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{hasOptions ? "Customize & Add" : "Add to Order"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DISH CUSTOMIZATION MODAL */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setActiveModalItem(null)}
            className="absolute inset-0 bg-charcoal-950/70 backdrop-blur-sm"
          />

          <div className="relative bg-ivory-50 border border-ivory-300 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="relative h-48 w-full bg-ivory-300 shrink-0">
              <FoodImage
                src={activeModalItem.imageUrl}
                alt={activeModalItem.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 600px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-transparent" />
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-charcoal-900/80 text-ivory-50 hover:bg-charcoal-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <span className="text-[11px] font-bold uppercase tracking-widest text-terracotta-400">
                  {activeModalItem.category.name}
                </span>
                <h3 className="font-serif text-2xl font-bold text-ivory-50 mt-0.5">
                  {activeModalItem.name}
                </h3>
              </div>
            </div>

            {/* Modal Options Scroll Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              <p className="text-charcoal-700 leading-relaxed text-sm">
                {activeModalItem.description}
              </p>

              {/* Options */}
              {activeModalItem.options.map((opt) => (
                <div key={opt.id} className="space-y-2 border-t border-ivory-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-charcoal-900 text-sm">
                      {opt.name}
                    </span>
                    {opt.isRequired ? (
                      <span className="text-[10px] font-bold text-terracotta-600 uppercase tracking-wider bg-terracotta-100 px-2 py-0.5 rounded">
                        Required
                      </span>
                    ) : (
                      <span className="text-[10px] text-charcoal-700">
                        Optional (Max {opt.maxSelect})
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {opt.values.map((val) => {
                      const selected = (selectedOptionValues[opt.id] || []).includes(val.id);
                      return (
                        <div
                          key={val.id}
                          onClick={() => handleToggleOptionValue(opt, val)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            selected
                              ? "bg-terracotta-50 border-terracotta-400 text-terracotta-900 font-medium"
                              : "bg-ivory-100/70 border-ivory-200 text-charcoal-800 hover:border-charcoal-400"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                selected
                                  ? "border-terracotta-600 bg-terracotta-600 text-ivory-50"
                                  : "border-ivory-400"
                              }`}
                            >
                              {selected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <span>{val.name}</span>
                          </div>

                          <span className="text-charcoal-700 font-semibold">
                            {val.priceModifier > 0
                              ? `+${formatCurrency(val.priceModifier)}`
                              : "Included"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Special Instructions */}
              <div className="border-t border-ivory-200 pt-4 space-y-1.5">
                <label className="font-serif font-bold text-charcoal-900 text-sm block">
                  Special Kitchen Notes
                </label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Extra crispy base, sauce on the side..."
                  className="w-full bg-ivory-100 border border-ivory-300 rounded-xl p-3 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-ivory-200 bg-ivory-100 flex items-center justify-between gap-3 sm:gap-4">
              {/* Quantity Counter */}
              <div className="flex items-center gap-3 border border-ivory-300 bg-ivory-50 rounded-xl px-3 py-2">
                <button
                  type="button"
                  onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                  className="text-charcoal-700 hover:text-charcoal-950 font-bold"
                >
                  -
                </button>
                <span className="font-bold text-charcoal-900 text-sm w-4 text-center">
                  {modalQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setModalQuantity(modalQuantity + 1)}
                  className="text-charcoal-700 hover:text-charcoal-950 font-bold"
                >
                  +
                </button>
              </div>

              {/* Add CTA */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 bg-terracotta-600 hover:bg-terracotta-700 text-ivory-50 py-3.5 px-6 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-between shadow-lg transition-colors"
              >
                <span>Add to Order</span>
                <span>{formatCurrency(calculatedModalUnitPrice * modalQuantity)}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
