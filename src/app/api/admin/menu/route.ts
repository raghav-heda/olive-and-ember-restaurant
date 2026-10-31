import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireAuth, isAdminRole } from "@/lib/auth";

const menuItemSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().min(2, "Dish name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  basePrice: z.number().min(0, "Price must be non-negative"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  spiceLevel: z.number().int().min(0).max(3).default(0),
  preparationTimeMinutes: z.number().int().min(1).default(15),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export async function POST(req: Request) {
  try {
    const session = await requireAuth(["OWNER", "ADMIN"]);
    const body = await req.json();
    const validated = menuItemSchema.parse(body);

    const slug = validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    let item;
    if (validated.id) {
      item = await prisma.menuItem.update({
        where: { id: validated.id },
        data: {
          categoryId: validated.categoryId,
          name: validated.name.trim(),
          description: validated.description.trim(),
          basePrice: validated.basePrice,
          imageUrl: validated.imageUrl || null,
          isVegetarian: validated.isVegetarian,
          isVegan: validated.isVegan,
          isGlutenFree: validated.isGlutenFree,
          spiceLevel: validated.spiceLevel,
          preparationTimeMinutes: validated.preparationTimeMinutes,
          isAvailable: validated.isAvailable,
          isFeatured: validated.isFeatured,
        },
      });

      await prisma.activityLog.create({
        data: {
          restaurantId: session.restaurantId,
          userId: session.userId,
          userName: session.name,
          action: "MENU_ITEM_UPDATED",
          entityType: "MENU_ITEM",
          entityId: item.id,
          detailsJson: JSON.stringify({ name: item.name, price: item.basePrice }),
        },
      });
    } else {
      item = await prisma.menuItem.create({
        data: {
          restaurantId: session.restaurantId,
          categoryId: validated.categoryId,
          name: validated.name.trim(),
          slug: `${slug}-${Date.now().toString().slice(-4)}`,
          description: validated.description.trim(),
          basePrice: validated.basePrice,
          imageUrl:
            validated.imageUrl ||
            "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
          isVegetarian: validated.isVegetarian,
          isVegan: validated.isVegan,
          isGlutenFree: validated.isGlutenFree,
          spiceLevel: validated.spiceLevel,
          preparationTimeMinutes: validated.preparationTimeMinutes,
          isAvailable: validated.isAvailable,
          isFeatured: validated.isFeatured,
        },
      });

      await prisma.activityLog.create({
        data: {
          restaurantId: session.restaurantId,
          userId: session.userId,
          userName: session.name,
          action: "MENU_ITEM_CREATED",
          entityType: "MENU_ITEM",
          entityId: item.id,
          detailsJson: JSON.stringify({ name: item.name, price: item.basePrice }),
        },
      });
    }

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    const status = error.message?.includes("FORBIDDEN") ? 403 : error.message?.includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { id, isAvailable, isFeatured, basePrice } = body;

    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    // Changing food prices or featured status strictly requires ADMIN / OWNER permissions
    if (basePrice !== undefined || isFeatured !== undefined) {
      if (!isAdminRole(session.role)) {
        return NextResponse.json(
          { error: "FORBIDDEN: Staff members are not authorized to modify food prices or featured highlights." },
          { status: 403 }
        );
      }
    }

    const dataToUpdate: any = {};
    if (isAvailable !== undefined) dataToUpdate.isAvailable = Boolean(isAvailable);
    if (isFeatured !== undefined) dataToUpdate.isFeatured = Boolean(isFeatured);
    if (basePrice !== undefined) dataToUpdate.basePrice = parseFloat(basePrice);

    const updated = await prisma.menuItem.update({
      where: { id },
      data: dataToUpdate,
    });

    await prisma.activityLog.create({
      data: {
        restaurantId: session.restaurantId,
        userId: session.userId,
        userName: session.name,
        action: "MENU_ITEM_AVAILABILITY_CHANGED",
        entityType: "MENU_ITEM",
        entityId: updated.id,
        detailsJson: JSON.stringify({
          name: updated.name,
          isAvailable: updated.isAvailable,
          updatedBy: session.role,
        }),
      },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    const status = error.message?.includes("FORBIDDEN") ? 403 : error.message?.includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireAuth(["OWNER", "ADMIN"]);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    }

    const item = await prisma.menuItem.findUnique({ where: { id } });

    await prisma.menuItem.delete({
      where: { id },
    });

    if (item) {
      await prisma.activityLog.create({
        data: {
          restaurantId: session.restaurantId,
          userId: session.userId,
          userName: session.name,
          action: "MENU_ITEM_DELETED",
          entityType: "MENU_ITEM",
          entityId: id,
          detailsJson: JSON.stringify({ name: item.name }),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error.message?.includes("FORBIDDEN") ? 403 : error.message?.includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
