import { requireAuth, isAdminRole } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  PromotionsManagerClient,
  AdminCoupon,
} from "@/components/admin/PromotionsManagerClient";
import { ForbiddenCard } from "@/components/admin/ForbiddenCard";

export const revalidate = 0;

export default async function AdminPromotionsPage() {
  const session = await requireAuth();

  if (!isAdminRole(session.role)) {
    return <ForbiddenCard moduleName="Promotions & Coupon Management" />;
  }

  const rawCoupons = await prisma.coupon.findMany({
    where: { restaurantId: session.restaurantId },
    orderBy: { createdAt: "desc" },
  });

  const coupons: AdminCoupon[] = rawCoupons.map((c) => ({
    id: c.id,
    code: c.code,
    description: c.description,
    discountType: c.discountType,
    discountValue: c.discountValue,
    minOrderValue: c.minOrderValue,
    maxDiscountAmount: c.maxDiscountAmount,
    startDate: c.startDate.toISOString(),
    endDate: c.endDate.toISOString(),
    maxUses: c.maxUses,
    currentUses: c.currentUses,
    isActive: c.isActive,
  }));

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest font-mono text-terracotta-400 font-bold">
          Revenue Optimization
        </span>
        <h1 className="font-serif text-3xl font-bold text-ivory-50 mt-1">
          Promotions &amp; Coupon Codes
        </h1>
        <p className="text-xs text-ivory-400 mt-1">
          Configure seasonal campaigns, enforce basket thresholds, and track usage velocity.
        </p>
      </div>

      <PromotionsManagerClient initialCoupons={coupons} />
    </div>
  );
}
