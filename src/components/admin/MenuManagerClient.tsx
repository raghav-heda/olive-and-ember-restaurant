"use client";

import { useState } from "react";
import Image from "next/image";
import { FoodImage } from "@/components/ui/FoodImage";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Search,
  Sparkles,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
}

export interface AdminMenuItem {
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
  preparationTimeMinutes: number;
  isAvailable: boolean;
  isFeatured: boolean;
  category: {
    id: string;
    name: string;
  };
}

export function MenuManagerClient({
  categories,
  initialItems,
  userRole = "STAFF",
}: {
  categories: AdminCategory[];
  initialItems: AdminMenuItem[];
  userRole?: string;
}) {
  const isAdmin = userRole === "ADMIN" || userRole === "OWNER";
  const [items, setItems] = useState<AdminMenuItem[]>(initialItems);
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [search, setSearch] = useState("");

  // Modal State for Create / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminMenuItem | null>(null);

  const [formName, setFormName] = useState("");
  const [formCatId, setFormCatId] = useState(categories[0]?.id || "");
  const [formPrice, setFormPrice] = useState(450);
  const [formDesc, setFormDesc] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formVeg, setFormVeg] = useState(true);
  const [formVegan, setFormVegan] = useState(false);
  const [formGf, setFormGf] = useState(false);
  const [formPrep, setFormPrep] = useState(15);
  const [formFeatured, setFormFeatured] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = items.filter((item) => {
    if (selectedCat !== "ALL" && item.categoryId !== selectedCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormName("");
    setFormCatId(categories[0]?.id || "");
    setFormPrice(450);
    setFormDesc("");
    setFormImage("");
    setFormVeg(true);
    setFormVegan(false);
    setFormGf(false);
    setFormPrep(15);
    setFormFeatured(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: AdminMenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCatId(item.categoryId);
    setFormPrice(item.basePrice);
    setFormDesc(item.description);
    setFormImage(item.imageUrl || "");
    setFormVeg(item.isVegetarian);
    setFormVegan(item.isVegan);
    setFormGf(item.isGlutenFree);
    setFormPrep(item.preparationTimeMinutes);
    setFormFeatured(item.isFeatured);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingItem?.id,
          categoryId: formCatId,
          name: formName,
          basePrice: formPrice,
          description: formDesc,
          imageUrl: formImage || undefined,
          isVegetarian: formVeg,
          isVegan: formVegan,
          isGlutenFree: formGf,
          preparationTimeMinutes: formPrep,
          isFeatured: formFeatured,
          isAvailable: editingItem ? editingItem.isAvailable : true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (editingItem) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === editingItem.id
              ? {
                  ...i,
                  ...data.item,
                  category: categories.find((c) => c.id === formCatId) || i.category,
                }
              : i
          )
        );
      } else {
        setItems((prev) => [
          {
            ...data.item,
            category: categories.find((c) => c.id === formCatId) || {
              id: formCatId,
              name: "Dish",
            },
          },
          ...prev,
        ]);
      }
      setModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to save dish");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (item: AdminMenuItem) => {
    const nextVal = !item.isAvailable;
    try {
      const res = await fetch("/api/admin/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isAvailable: nextVal }),
      });
      if (!res.ok) throw new Error("Failed to toggle availability");
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isAvailable: nextVal } : i))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleFeatured = async (item: AdminMenuItem) => {
    const nextVal = !item.isFeatured;
    try {
      const res = await fetch("/api/admin/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, isFeatured: nextVal }),
      });
      if (!res.ok) throw new Error("Failed to toggle featured");
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isFeatured: nextVal } : i))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this menu item permanently?")) return;
    try {
      const res = await fetch(`/api/admin/menu?id=${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete menu item");
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Ribbon */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes..."
              className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl pl-9 pr-3 py-2 text-xs text-ivory-100 placeholder-charcoal-500 focus:outline-none focus:border-terracotta-500"
            />
          </div>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-charcoal-950 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-ivory-200 focus:outline-none focus:border-terracotta-500"
          >
            <option value="ALL">All Categories ({items.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-terracotta-600 hover:bg-terracotta-500 text-ivory-50 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </button>
        )}
      </div>

      {/* Grid of Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`bg-charcoal-900 border rounded-3xl overflow-hidden flex flex-col justify-between transition-all ${
              item.isAvailable ? "border-charcoal-800" : "border-red-950/60 opacity-60"
            }`}
          >
            <div>
              {/* Photo & Quick Toggles */}
              <div className="relative h-44 w-full bg-charcoal-950">
                <FoodImage src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="400px" />
                <div className="absolute top-3 left-3 flex gap-1">
                  {item.isVegetarian && (
                    <span className="px-2 py-0.5 rounded bg-olive-700 text-ivory-50 text-[9px] font-bold">
                      VEG
                    </span>
                  )}
                  {item.isVegan && (
                    <span className="px-2 py-0.5 rounded bg-emerald-700 text-ivory-50 text-[9px] font-bold">
                      VEGAN
                    </span>
                  )}
                  {item.isGlutenFree && (
                    <span className="px-2 py-0.5 rounded bg-amber-700 text-ivory-50 text-[9px] font-bold">
                      GF
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleToggleFeatured(item)}
                  title={item.isFeatured ? "Featured on Home" : "Click to feature"}
                  className={`absolute top-3 right-3 p-1.5 rounded-full text-xs transition-colors ${
                    item.isFeatured
                      ? "bg-terracotta-600 text-ivory-50 shadow"
                      : "bg-charcoal-900/80 text-charcoal-400 hover:text-ivory-100"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Details */}
              <div className="p-5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-base font-bold text-ivory-100">{item.name}</h3>
                  <span className="font-bold text-ivory-50 text-sm">
                    {formatCurrency(item.basePrice)}
                  </span>
                </div>
                <p className="text-[11px] text-terracotta-400 uppercase font-mono font-bold">
                  {item.category.name}
                </p>
                <p className="text-xs text-ivory-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-5 pt-0 border-t border-charcoal-800 flex items-center justify-between text-xs">
              <button
                onClick={() => handleToggleAvailability(item)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] transition-colors ${
                  item.isAvailable
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    : "bg-red-950 text-red-400 border border-red-800"
                }`}
              >
                {item.isAvailable ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{item.isAvailable ? "Available" : "Sold Out"}</span>
              </button>

              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-ivory-200 transition-colors"
                    title="Edit dish"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl bg-charcoal-800 hover:bg-red-950/80 text-red-400 transition-colors"
                    title="Delete dish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <span className="text-[10px] text-ivory-500 font-mono">
                  Staff View
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT DISH MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setModalOpen(false)}
            className="absolute inset-0 bg-charcoal-950/80 backdrop-blur-sm"
          />

          <form
            onSubmit={handleSave}
            className="relative bg-charcoal-900 border border-charcoal-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl text-xs text-ivory-200"
          >
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
              <h3 className="font-serif text-xl font-bold text-ivory-50">
                {editingItem ? "Edit Menu Dish" : "Create New Menu Dish"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-ivory-400 hover:text-ivory-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-ivory-300">
                Dish Name *
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Charred Artichoke & Truffle Flatbread"
                className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3.5 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ivory-300 mb-1">
                  Category *
                </label>
                <select
                  value={formCatId}
                  onChange={(e) => setFormCatId(e.target.value)}
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ivory-300 mb-1">
                  Base Price (₹ INR) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formPrice}
                  onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3.5 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ivory-300 mb-1">
                Description &amp; Ingredients *
              </label>
              <textarea
                required
                rows={3}
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Artisanal sourdough, fire-blistered tomatoes, wild mountain oregano..."
                className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl p-3 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ivory-300 mb-1">
                Photo URL (Unsplash or CDN)
              </label>
              <input
                type="url"
                value={formImage}
                onChange={(e) => setFormImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-charcoal-950 border border-charcoal-700 rounded-xl px-3.5 py-2 text-xs text-ivory-100 focus:outline-none focus:border-terracotta-500"
              />
            </div>

            {/* Dietary Checkboxes */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <label className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formVeg}
                  onChange={(e) => setFormVeg(e.target.checked)}
                  className="accent-terracotta-600"
                />
                <span className="text-xs font-bold text-ivory-200">Vegetarian</span>
              </label>
              <label className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formVegan}
                  onChange={(e) => setFormVegan(e.target.checked)}
                  className="accent-terracotta-600"
                />
                <span className="text-xs font-bold text-ivory-200">Vegan</span>
              </label>
              <label className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formGf}
                  onChange={(e) => setFormGf(e.target.checked)}
                  className="accent-terracotta-600"
                />
                <span className="text-xs font-bold text-ivory-200">Gluten-Free</span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="accent-terracotta-600"
                />
                <span className="font-bold text-terracotta-400">
                  Feature Dish on Homepage (Chef&apos;s Recommendation)
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-charcoal-800">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-charcoal-800 text-ivory-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-500 text-ivory-50 font-bold uppercase tracking-wider shadow"
              >
                {saving ? "Saving..." : editingItem ? "Update Dish" : "Create Dish"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
