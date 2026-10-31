import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/db";
import { MenuManagerClient, AdminMenuItem, AdminCategory } from "@/components/admin/MenuManagerClient";

export const revalidate = 0;

export default async function AdminMenuPage() {
  const session = await requireAuth();

  const categories = await prisma.menuCategory.findMany({
    where: { restaurantId: session.restaurantId },
    orderBy: { displayOrder: "asc" },
  });

  const rawItems = await prisma.menuItem.findMany({
    where: { restaurantId: session.restaurantId },
    orderBy: { displayOrder: "asc" },
    include: {
      category: {
        select: { id: true, name: true },
      },
    },
  });

  const items: AdminMenuItem[] = rawItems.map((i) => ({
    id: i.id,
    categoryId: i.categoryId,
    name: i.name,
    slug: i.slug,
    description: i.description,
    basePrice: i.basePrice,
    imageUrl: i.imageUrl,
    isVegetarian: i.isVegetarian,
    isVegan: i.isVegan,
    isGlutenFree: i.isGlutenFree,
    spiceLevel: i.spiceLevel,
    preparationTimeMinutes: i.preparationTimeMinutes,
    isAvailable: i.isAvailable,
    isFeatured: i.isFeatured,
    category: i.category,
  }));

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest font-mono text-terracotta-400 font-bold">
          Culinary Catalog
        </span>
        <h1 className="font-serif text-3xl font-bold text-ivory-50 mt-1">
          Menu &amp; Dish Management
        </h1>
        <p className="text-xs text-ivory-400 mt-1">
          Add wood-fired dishes, calibrate prices, manage stock availability, and feature seasonal specialties.
        </p>
      </div>

      <MenuManagerClient
        userRole={session.role}
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        }))}
        initialItems={items}
      />
    </div>
  );
}
