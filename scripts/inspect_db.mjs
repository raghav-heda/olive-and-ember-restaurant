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

async function main() {
  const [
    orderCount,
    reservationCount,
    inquiryCount,
    logCount,
    couponCount,
    userCount,
    categoryCount,
    menuItemCount,
    settingCount,
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

  console.log("DATABASE COUNTS:", JSON.stringify({
    orderCount,
    reservationCount,
    inquiryCount,
    logCount,
    couponCount,
    userCount,
    categoryCount,
    menuItemCount,
    settingCount,
  }, null, 2));

  const allOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, publicCode: true, customerName: true, customerEmail: true, status: true, finalTotal: true, createdAt: true },
  });
  console.log("ALL ORDERS (" + allOrders.length + "):", JSON.stringify(allOrders, null, 2));

  const allReservations = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, bookingRef: true, customerName: true, customerEmail: true, status: true, guestCount: true, reservationDate: true, timeSlot: true, createdAt: true },
  });
  console.log("ALL RESERVATIONS (" + allReservations.length + "):", JSON.stringify(allReservations, null, 2));

  const allInquiries = await prisma.contactInquiry.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, subject: true, isRead: true, createdAt: true },
  });
  console.log("ALL INQUIRIES (" + allInquiries.length + "):", JSON.stringify(allInquiries, null, 2));

  const allLogs = await prisma.activityLog.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    select: { id: true, action: true, entityType: true, entityId: true, userName: true, createdAt: true },
  });
  console.log("SAMPLE ACTIVITY LOGS (" + allLogs.length + "):", JSON.stringify(allLogs, null, 2));

  const allCoupons = await prisma.coupon.findMany({
    select: { id: true, code: true, description: true, discountType: true, discountValue: true, isActive: true, currentUses: true },
  });
  console.log("ALL COUPONS (" + allCoupons.length + "):", JSON.stringify(allCoupons, null, 2));

  const allUsers = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });
  console.log("ALL USERS (" + allUsers.length + "):", JSON.stringify(allUsers, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
