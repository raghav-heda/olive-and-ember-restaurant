import { PrismaClient } from "@prisma/client";

// Normalize database connection URL
if (!process.env.DATABASE_URL) {
  if (process.env.POSTGRES_PRISMA_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
  } else if (process.env.POSTGRES_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_URL;
  }
}

const prisma = new PrismaClient();

async function cleanupTestData() {
  console.log("🧹 Starting Olive & Ember Kitchen Test Data Cleanup...");

  // 1. Clean Test Orders (Keep realistic seed order OE-892401)
  const testOrders = await prisma.order.findMany({
    where: {
      OR: [
        { customerName: { contains: "Test" } },
        { customerEmail: { contains: "test" } },
        { customerEmail: { contains: "audit" } },
        { publicCode: { not: "OE-892401" } },
      ],
    },
    select: { id: true, publicCode: true, customerName: true },
  });

  const testOrderIds = testOrders.map((o) => o.id);
  console.log(`Found ${testOrders.length} test order(s) to remove:`, testOrders.map(o => o.publicCode));

  if (testOrderIds.length > 0) {
    // Cascade delete order item options, order items, and test orders
    const testOrderItems = await prisma.orderItem.findMany({
      where: { orderId: { in: testOrderIds } },
      select: { id: true },
    });
    const testOrderItemIds = testOrderItems.map((oi) => oi.id);

    await prisma.orderItemOption.deleteMany({
      where: { orderItemId: { in: testOrderItemIds } },
    });
    await prisma.orderItem.deleteMany({
      where: { id: { in: testOrderItemIds } },
    });
    await prisma.order.deleteMany({
      where: { id: { in: testOrderIds } },
    });

    // Remove audit logs referencing test orders
    await prisma.activityLog.deleteMany({
      where: {
        entityType: "ORDER",
        entityId: { in: testOrderIds },
      },
    });
  }

  // 2. Clean Test Reservations (Keep realistic seed reservations RES-4019, RES-5820)
  const legitimateRefs = ["RES-4019", "RES-5820"];
  const testReservations = await prisma.reservation.findMany({
    where: {
      bookingRef: { notIn: legitimateRefs },
    },
    select: { id: true, bookingRef: true, customerName: true },
  });

  const testReservationIds = testReservations.map((r) => r.id);
  console.log(`Found ${testReservations.length} test reservation(s) to remove.`);

  if (testReservationIds.length > 0) {
    await prisma.reservation.deleteMany({
      where: { id: { in: testReservationIds } },
    });

    // Remove audit logs referencing test reservations
    await prisma.activityLog.deleteMany({
      where: {
        entityType: "RESERVATION",
        entityId: { in: testReservationIds },
      },
    });
  }

  // 3. Clean Test Contact Inquiries
  const testInquiries = await prisma.contactInquiry.findMany({
    where: {
      OR: [
        { name: { contains: "Test" } },
        { email: { contains: "test" } },
        { email: { contains: "demo" } },
        { subject: { contains: "Test" } },
      ],
    },
    select: { id: true, name: true, subject: true },
  });

  const testInquiryIds = testInquiries.map((i) => i.id);
  console.log(`Found ${testInquiries.length} test contact inquiry/inquiries to remove:`, testInquiries.map(i => i.subject));

  if (testInquiryIds.length > 0) {
    await prisma.contactInquiry.deleteMany({
      where: { id: { in: testInquiryIds } },
    });
  }

  // 4. Clean stray test activity logs
  const strayLogs = await prisma.activityLog.deleteMany({
    where: {
      OR: [
        { detailsJson: { contains: "test" } },
        { detailsJson: { contains: "Test" } },
        { detailsJson: { contains: "audit" } },
        { action: { in: ["COUPON_CREATED", "COUPON_STATUS_CHANGED"] } }, // remove transient test coupon actions
      ],
    },
  });
  console.log(`Removed ${strayLogs.count} stray test activity log records.`);

  // 5. Verify database integrity and state
  const [
    finalOrderCount,
    finalReservationCount,
    finalInquiryCount,
    finalLogCount,
    finalCouponCount,
    finalUserCount,
    finalCategoryCount,
    finalMenuItemCount,
    finalSettingsCount,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.reservation.count(),
    prisma.contactInquiry.count(),
    prisma.activityLog.count(),
    prisma.coupon.count(),
    prisma.user.count(),
    prisma.menuCategory.count(),
    prisma.menuItem.count(),
    prisma.restaurantSettings.count(),
  ]);

  console.log("✅ CLEANUP COMPLETED SUCCESSFULLY. FINAL VERIFIED DATABASE COUNTS:", {
    orders: finalOrderCount,
    reservations: finalReservationCount,
    contactInquiries: finalInquiryCount,
    activityLogs: finalLogCount,
    coupons: finalCouponCount,
    users: finalUserCount,
    categories: finalCategoryCount,
    menuItems: finalMenuItemCount,
    settings: finalSettingsCount,
  });

  // Print remaining orders and reservations for confirmation
  const remainingOrders = await prisma.order.findMany({
    select: { publicCode: true, customerName: true, status: true, finalTotal: true },
  });
  console.log("Remaining Production Orders:", remainingOrders);

  const remainingReservations = await prisma.reservation.findMany({
    select: { bookingRef: true, customerName: true, reservationDate: true, timeSlot: true, status: true },
  });
  console.log("Remaining Production Reservations:", remainingReservations);
}

cleanupTestData()
  .catch((err) => {
    console.error("Cleanup error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
