import { describe, it, expect, beforeAll, afterAll } from "vitest";
import prisma from "@/lib/db";
import { GET as getSettings } from "@/app/api/settings/route";
import { GET as getPublicPromotions } from "@/app/api/promotions/route";
import { GET as getAdminPromotions, POST as createPromotion, PATCH as togglePromotion, DELETE as deletePromotion } from "@/app/api/admin/promotions/route";
import { GET as getPublicMenu } from "@/app/api/menu/route";
import { GET as getAdminMenu, PATCH as patchAdminMenu } from "@/app/api/admin/menu/route";
import { GET as getAdminOrders } from "@/app/api/admin/orders/route";
import { POST as updateAdminOrder } from "@/app/api/admin/orders/update/route";
import { GET as getOrderStatus } from "@/app/api/orders/status/route";
import { POST as createOrder } from "@/app/api/orders/create/route";
import { GET as getAdminReservations } from "@/app/api/admin/reservations/route";
import { POST as updateAdminReservation } from "@/app/api/admin/reservations/update/route";
import { GET as getReservationStatus } from "@/app/api/reservations/status/route";
import { POST as createReservation } from "@/app/api/reservations/create/route";
import { GET as getAdminInquiries } from "@/app/api/admin/inquiries/route";
import { POST as submitContact } from "@/app/api/contact/route";
import { signSessionToken } from "@/lib/auth";

describe("Complete Real-Time Synchronization & Single Source of Truth Audit", () => {
  let restaurant: any;
  let adminCookie: string;
  let staffCookie: string;
  const createdOrderIds: string[] = [];
  const createdReservationIds: string[] = [];
  const createdInquiryIds: string[] = [];
  const createdCouponIds: string[] = [];
  const testPhone = "+91 98888 77777";
  const testEmail = "realtime.audit@oliveandember.demo";

  beforeAll(async () => {
    restaurant = await prisma.restaurant.findFirst({
      include: { settings: true, users: true },
    });

    if (!restaurant) {
      throw new Error("No restaurant seed record found in database");
    }

    const adminUser = restaurant.users.find((u: any) => u.role === "ADMIN" || u.role === "OWNER") || restaurant.users[0];
    const staffUser = restaurant.users.find((u: any) => u.role === "STAFF") || adminUser;

    adminCookie = signSessionToken({
      userId: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      restaurantId: restaurant.id,
    });

    staffCookie = signSessionToken({
      userId: staffUser.id,
      email: staffUser.email,
      name: staffUser.name,
      role: "STAFF",
      restaurantId: restaurant.id,
    });
  });

  afterAll(async () => {
    // Clean up all temporary test entities
    const validOrderIds = createdOrderIds.filter(Boolean);
    if (validOrderIds.length > 0) {
      await prisma.orderItemOption.deleteMany({
        where: { orderItem: { orderId: { in: validOrderIds } } },
      });
      await prisma.orderItem.deleteMany({
        where: { orderId: { in: validOrderIds } },
      });
      await prisma.order.deleteMany({
        where: { id: { in: validOrderIds } },
      });
    }

    const validResIds = createdReservationIds.filter(Boolean);
    if (validResIds.length > 0) {
      await prisma.reservation.deleteMany({
        where: { id: { in: validResIds } },
      });
    }

    const validInqIds = createdInquiryIds.filter(Boolean);
    if (validInqIds.length > 0) {
      await prisma.contactInquiry.deleteMany({
        where: { id: { in: validInqIds } },
      });
    }

    const validCpnIds = createdCouponIds.filter(Boolean);
    if (validCpnIds.length > 0) {
      await prisma.coupon.deleteMany({
        where: { id: { in: validCpnIds } },
      });
    }
  });

  describe("1. Restaurant Settings as Single Source of Truth", () => {
    it("GET /api/settings returns live settings with no-store headers", async () => {
      const res = await getSettings();
      expect(res.status).toBe(200);
      expect(res.headers.get("cache-control")).toContain("no-store");

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.settings).toBeDefined();
      expect(typeof data.settings.maxPartySize).toBe("number");
      expect(typeof data.settings.advanceBookingDays).toBe("number");
      expect(typeof data.settings.dineInEnabled).toBe("boolean");
      expect(data.settings.restaurantName).toBe(restaurant.name);
    });
  });

  describe("2. Promotions & Coupons Real-Time Lifecycle", () => {
    const testCouponCode = `AUDIT${Date.now().toString().slice(-4)}`;

    it("creates a new coupon via admin and ensures it appears live in GET /api/promotions", async () => {
      const createReq = new Request("http://localhost/api/admin/promotions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `oe_session=${adminCookie}`,
        },
        body: JSON.stringify({
          code: testCouponCode,
          description: "Temporary real-time test coupon",
          discountType: "FIXED",
          discountValue: 50,
          minOrderValue: 300,
          maxUses: 50,
          startDate: "2026-01-01",
          endDate: "2027-12-31",
        }),
      });

      const createRes = await createPromotion(createReq);
      expect(createRes.status).toBe(200);
      const createData = await createRes.json();
      expect(createData.success).toBe(true);
      createdCouponIds.push(createData.coupon.id);

      // Verify immediate appearance in public promotions API
      const publicRes = await getPublicPromotions();
      expect(publicRes.status).toBe(200);
      const publicData = await publicRes.json();
      const found = publicData.coupons.find((c: any) => c.code === testCouponCode);
      expect(found).toBeDefined();
      expect(found.discountValue).toBe(50);
    });

    it("deactivates coupon via admin and verifies it vanishes from public offers live", async () => {
      const couponId = createdCouponIds[createdCouponIds.length - 1];
      const patchReq = new Request("http://localhost/api/admin/promotions", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `oe_session=${adminCookie}`,
        },
        body: JSON.stringify({
          id: couponId,
          isActive: false,
        }),
      });

      const patchRes = await togglePromotion(patchReq);
      expect(patchRes.status).toBe(200);

      // Verify immediate removal from public active offers
      const publicRes = await getPublicPromotions();
      const publicData = await publicRes.json();
      const found = publicData.coupons.find((c: any) => c.id === couponId);
      expect(found).toBeUndefined();
    });
  });

  describe("3. Menu Single Source & Availability Enforcement", () => {
    it("retrieves menu from GET /api/menu and toggles availability in real time", async () => {
      const publicRes = await getPublicMenu();
      expect(publicRes.status).toBe(200);
      expect(publicRes.headers.get("cache-control")).toContain("no-store");
      const publicData = await publicRes.json();
      expect(Array.isArray(publicData.menuItems)).toBe(true);
      expect(publicData.menuItems.length).toBeGreaterThan(0);

      const targetItem = publicData.menuItems[0];
      const originalAvailability = targetItem.isAvailable;

      // Staff toggles availability
      const patchReq = new Request("http://localhost/api/admin/menu", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `oe_session=${staffCookie}`,
        },
        body: JSON.stringify({
          id: targetItem.id,
          isAvailable: !originalAvailability,
        }),
      });

      const patchRes = await patchAdminMenu(patchReq);
      expect(patchRes.status).toBe(200);

      // Verify public menu receives updated availability immediately
      const refreshedRes = await getPublicMenu();
      const refreshedData = await refreshedRes.json();
      const updated = refreshedData.menuItems.find((i: any) => i.id === targetItem.id);
      expect(updated.isAvailable).toBe(!originalAvailability);

      // Restore original availability
      await patchAdminMenu(new Request("http://localhost/api/admin/menu", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `oe_session=${staffCookie}`,
        },
        body: JSON.stringify({ id: targetItem.id, isAvailable: originalAvailability }),
      }));
    });

    it("rejects staff attempting to modify food prices (RBAC guard)", async () => {
      const targetItem = await prisma.menuItem.findFirst();
      if (!targetItem) return;

      const patchReq = new Request("http://localhost/api/admin/menu", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `oe_session=${staffCookie}`,
        },
        body: JSON.stringify({
          id: targetItem.id,
          basePrice: 9999,
        }),
      });

      const patchRes = await patchAdminMenu(patchReq);
      expect(patchRes.status).toBe(403);
      const data = await patchRes.json();
      expect(data.error).toContain("FORBIDDEN");
    });
  });

  describe("4. Order Lifecycle & Real-Time Sync", () => {
    let orderPublicCode: string;

    it("CUSTOMER: Places order -> Saved to DB and appears live in GET /api/admin/orders", async () => {
      const availableItem = await prisma.menuItem.findFirst({
        where: { isAvailable: true },
      });
      if (!availableItem) throw new Error("No available menu item");

      const createReq = new Request("http://localhost/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: "Realtime Test Guest",
          customerPhone: testPhone,
          customerEmail: testEmail,
          fulfilmentType: "PICKUP",
          items: [
            {
              menuItemId: availableItem.id,
              quantity: 1,
            },
          ],
          paymentMethod: "CASH_ON_DELIVERY",
        }),
      });

      const createRes = await createOrder(createReq);
      expect(createRes.status).toBe(200);
      const createData = await createRes.json();
      expect(createData.success).toBe(true);
      expect(createData.order).toBeDefined();

      orderPublicCode = createData.publicCode || createData.order.publicCode;
      const dbOrder = await prisma.order.findUnique({ where: { publicCode: orderPublicCode } });
      if (dbOrder) createdOrderIds.push(dbOrder.id);

      // Verify admin live orders endpoint retrieves it immediately
      const adminOrdersReq = new Request("http://localhost/api/admin/orders", {
        headers: { Cookie: `oe_session=${staffCookie}` },
      });
      const adminOrdersRes = await getAdminOrders(adminOrdersReq);
      expect(adminOrdersRes.status).toBe(200);
      const adminOrdersData = await adminOrdersRes.json();
      const foundInAdmin = adminOrdersData.orders.find((o: any) => o.publicCode === orderPublicCode);
      expect(foundInAdmin).toBeDefined();
      expect(foundInAdmin.status).toBe("PENDING");
    });

    it("STAFF: Updates order status to PREPARING -> Customer status tracking receives it live", async () => {
      const order = await prisma.order.findUnique({ where: { publicCode: orderPublicCode } });
      if (!order) throw new Error("Test order not found");

      const updateReq = new Request("http://localhost/api/admin/orders/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `oe_session=${staffCookie}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          status: "PREPARING",
        }),
      });

      const updateRes = await updateAdminOrder(updateReq);
      expect(updateRes.status).toBe(200);

      // Customer checks tracking URL
      const customerReq = new Request(`http://localhost/api/orders/status?code=${orderPublicCode}`);
      const customerRes = await getOrderStatus(customerReq);
      expect(customerRes.status).toBe(200);
      expect(customerRes.headers.get("cache-control")).toContain("no-store");
      const customerData = await customerRes.json();
      expect(customerData.order.status).toBe("PREPARING");
    });
  });

  describe("5. Table Reservation Lifecycle & Real-Time Sync", () => {
    let bookingRef: string;

    it("CUSTOMER: Creates reservation -> Appears live in GET /api/admin/reservations", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const dateStr = futureDate.toISOString().split("T")[0];

      const createReq = new Request("http://localhost/api/reservations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: "Realtime Booking Guest",
          customerPhone: testPhone,
          customerEmail: testEmail,
          guestCount: 4,
          reservationDate: dateStr,
          timeSlot: "19:30",
          specialRequests: "Anniversary table",
        }),
      });

      const createRes = await createReservation(createReq);
      expect(createRes.status).toBe(200);
      expect(createRes.headers.get("cache-control")).toContain("no-store");
      const createData = await createRes.json();
      expect(createData.success).toBe(true);

      bookingRef = createData.bookingRef;
      const dbRecord = await prisma.reservation.findUnique({ where: { bookingRef } });
      if (dbRecord) createdReservationIds.push(dbRecord.id);

      // Verify admin reservations endpoint retrieves it live
      const adminResReq = new Request("http://localhost/api/admin/reservations", {
        headers: { Cookie: `oe_session=${staffCookie}` },
      });
      const adminResResponse = await getAdminReservations(adminResReq);
      expect(adminResResponse.status).toBe(200);
      const adminResData = await adminResResponse.json();
      const foundInAdmin = adminResData.reservations.find((r: any) => r.bookingRef === bookingRef);
      expect(foundInAdmin).toBeDefined();
      expect(foundInAdmin.status).toBe("PENDING");
    });

    it("ADMIN: Confirms table booking -> Customer tracking page reflects CONFIRMED live", async () => {
      const dbRecord = await prisma.reservation.findUnique({ where: { bookingRef } });
      if (!dbRecord) throw new Error("Reservation not found");

      const updateReq = new Request("http://localhost/api/admin/reservations/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `oe_session=${adminCookie}`,
        },
        body: JSON.stringify({
          reservationId: dbRecord.id,
          status: "CONFIRMED",
          tableAssignment: "Hearth Table 5",
        }),
      });

      const updateRes = await updateAdminReservation(updateReq);
      expect(updateRes.status).toBe(200);

      // Customer checks status tracking endpoint
      const customerReq = new Request(`http://localhost/api/reservations/status?ref=${bookingRef}`);
      const customerRes = await getReservationStatus(customerReq);
      expect(customerRes.status).toBe(200);
      const customerData = await customerRes.json();
      expect(customerData.reservation.status).toBe("CONFIRMED");
      expect(customerData.reservation.tableAssignment).toBe("Hearth Table 5");
    });
  });

  describe("6. Contact Inquiries Real-Time Flow", () => {
    it("CUSTOMER: Submits inquiry -> Appears live in GET /api/admin/inquiries", async () => {
      const contactReq = new Request("http://localhost/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Realtime Contact Test",
          email: testEmail,
          phone: testPhone,
          subject: "Private Hearth Tasting Inquiry",
          message: "Would love to book the private alcove for a 10-person family dinner.",
        }),
      });

      const contactRes = await submitContact(contactReq);
      expect(contactRes.status).toBe(200);

      // Verify in admin inquiries live endpoint
      const adminInquiriesReq = new Request("http://localhost/api/admin/inquiries", {
        headers: { Cookie: `oe_session=${staffCookie}` },
      });
      const adminInquiriesRes = await getAdminInquiries(adminInquiriesReq);
      expect(adminInquiriesRes.status).toBe(200);
      const inquiriesData = await adminInquiriesRes.json();
      const foundInquiry = inquiriesData.inquiries.find((i: any) => i.email === testEmail);
      expect(foundInquiry).toBeDefined();
      expect(foundInquiry.isRead).toBe(false);

      if (foundInquiry) createdInquiryIds.push(foundInquiry.id);
    });
  });
});
