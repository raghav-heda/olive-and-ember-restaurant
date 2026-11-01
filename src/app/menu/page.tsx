import prisma from "@/lib/db";
import { MenuClient, MenuItemData } from "@/components/menu/MenuClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MenuPage() {
  const categories = await prisma.menuCategory.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  });

  const rawMenuItems = await prisma.menuItem.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      options: {
        orderBy: { displayOrder: "asc" },
        include: {
          values: true,
        },
      },
    },
  });

  const menuItems: MenuItemData[] = rawMenuItems.map((item) => ({
    id: item.id,
    categoryId: item.categoryId,
    name: item.name,
    slug: item.slug,
    description: item.description,
    basePrice: item.basePrice,
    imageUrl: item.imageUrl,
    isVegetarian: item.isVegetarian,
    isVegan: item.isVegan,
    isGlutenFree: item.isGlutenFree,
    spiceLevel: item.spiceLevel,
    allergens: item.allergens,
    preparationTimeMinutes: item.preparationTimeMinutes,
    isAvailable: item.isAvailable,
    isFeatured: item.isFeatured,
    displayOrder: item.displayOrder,
    category: item.category,
    options: item.options.map((opt) => ({
      id: opt.id,
      name: opt.name,
      isRequired: opt.isRequired,
      minSelect: opt.minSelect,
      maxSelect: opt.maxSelect,
      values: opt.values.map((val) => ({
        id: val.id,
        name: val.name,
        priceModifier: val.priceModifier,
      })),
    })),
  }));

  return (
    <div className="bg-ivory-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="text-xs uppercase tracking-widest font-bold text-terracotta-600">
            Artisanal Offerings
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-charcoal-900 tracking-tight">
            Our Hearthside Menu
          </h1>
          <p className="text-sm text-charcoal-700 leading-relaxed">
            Slow-fermented sourdough, fresh hand-pulled cheeses, and seasonal harvests charred to perfection over burning olive wood.
          </p>
        </div>

        {/* Client Interactive Filter & Order Engine */}
        <MenuClient
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
          }))}
          menuItems={menuItems}
        />
      </div>
    </div>
  );
}
