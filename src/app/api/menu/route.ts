import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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

    const menuItems = rawMenuItems.map((item) => ({
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

    return NextResponse.json(
      {
        success: true,
        categories,
        menuItems,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve menu items" },
      { status: 500 }
    );
  }
}
