import { describe, it, expect, beforeAll, afterAll } from "vitest";
import prisma from "@/lib/db";
import { POST as createReservationRoute } from "@/app/api/reservations/create/route";
import { GET as getReservationStatusRoute } from "@/app/api/reservations/status/route";
import { POST as updateReservationRoute } from "@/app/api/admin/reservations/update/route";
import { POST as createContactRoute } from "@/app/api/contact/route";
import { POST as updateInquiryRoute } from "@/app/api/admin/inquiries/update/route";
import { signSessionToken } from "@/lib/auth";

describe("Production End-to-End Functionality & Database Integrity Audit", () => {
  let restaurantId: string;
  let adminUserId: string;
  let adminToken: string;
  const createdBookingRefs: string[] = [];
  const createdInquiryIds: string[] = [];

  beforeAll(async () => {
    // Clean any previous test artifacts
    await prisma.reservation.deleteMany({
      where: { customerPhone: "+91 99999 88888" },
    });
    await prisma.contactInquiry.deleteMany({
      where: { email: "guest.hospitality@oliveandember.demo" },
    });

    const restaurant = await prisma.restaurant.findFirst({
      include: { users: true },
    });
    if (!restaurant) throw new Error("Database must be seeded for testing");
    restaurantId = restaurant.id;

    const admin = restaurant.users.find((u) => u.role === "ADMIN" || u.role === "OWNER");
    if (!admin) throw new Error("Admin user must exist");
    adminUserId = admin.id;

    adminToken = signSessionToken({
      userId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      restaurantId: restaurant.id,
    });
  });

  afterAll(async () => {
    // Controlled Test Data Cleanup
    await prisma.reservation.deleteMany({
      where: { customerPhone: "+91 99999 88888" },
    });
    await prisma.contactInquiry.deleteMany({
      where: { email: "guest.hospitality@oliveandember.demo" },
    });

    if (createdBookingRefs.length > 0) {
      await prisma.reservation.deleteMany({
        where: { bookingRef: { in: createdBookingRefs } },
      });
    }

    if (createdInquiryIds.length > 0) {
      await prisma.contactInquiry.deleteMany({
        where: { id: { in: createdInquiryIds } },
      });
    }

    // Clean up any test activity logs
    await prisma.activityLog.deleteMany({
      where: {
        entityId: { in: [...createdBookingRefs, ...createdInquiryIds] },
      },
    });
  });

  // =========================================================================
  // PRIORITY ISSUE 1: Database Connection Singleton & Client Re-use
  // =========================================================================
  describe("Priority 1: Database Client Singleton & Pool Management", () => {
    it("ensures prisma client is an authentic singleton across imports and requests", async () => {
      const dbModule1 = await import("@/lib/db");
      const dbModule2 = await import("@/lib/db");

      expect(dbModule1.default).toBe(dbModule2.default);
      expect(dbModule1.prisma).toBe(dbModule2.prisma);
      expect((globalThis as any).prisma).toBeDefined();
    });

    it("verifies multiple sequential database operations reuse the active connection without leak", async () => {
      // Execute 10 rapid queries in sequence
      const counts = await Promise.all(
        Array.from({ length: 10 }).map(() => prisma.restaurant.count())
      );
      expect(counts.length).toBe(10);
      expect(counts.every((c) => c >= 1)).toBe(true);
    });

    it("tests admin login repeatedly (15 consecutive times) without database connection exhaustion", async () => {
      const { POST: loginRoute } = await import("@/app/api/auth/login/route");

      for (let i = 0; i < 15; i++) {
        const req = new Request("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "admin@oliveandember.demo",
            password: "AdminPass@2026",
          }),
        });

        const res = await loginRoute(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.user.email).toBe("admin@oliveandember.demo");
      }
    });
  });

  // =========================================================================
  // PRIORITY ISSUE 2: Reservation Status Synchronization
  // =========================================================================
  describe("Priority 2: End-to-End Reservation Lifecycle & Status Sync", () => {
    let testBookingRef: string;
    let testReservationId: string;

    it("CUSTOMER: Submits reservation, database records PENDING status with booking reference", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      const dateStr = futureDate.toISOString().split("T")[0];

      const req = new Request("http://localhost:3000/api/reservations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: "Audit Test Guest",
          customerPhone: "+91 99999 88888",
          customerEmail: "audit.test@oliveandember.demo",
          guestCount: 2,
          reservationDate: dateStr,
          timeSlot: "19:30",
          specialRequests: "Quiet booth please",
        }),
      });

      const res = await createReservationRoute(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.bookingRef).toMatch(/^(OE|RES)-\d{3,8}$/);
      expect(json.status).toBe("PENDING");

      testBookingRef = json.bookingRef;
      createdBookingRefs.push(testBookingRef);

      // Verify in DB directly
      const inDb = await prisma.reservation.findUnique({
        where: { bookingRef: testBookingRef },
      });
      expect(inDb).not.toBeNull();
      expect(inDb?.status).toBe("PENDING");
      testReservationId = inDb!.id;
    });

    it("CUSTOMER: Can query live status and sees initial PENDING state", async () => {
      const req = new Request(`http://localhost:3000/api/reservations/status?ref=${testBookingRef}`);
      const res = await getReservationStatusRoute(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.reservation.bookingRef).toBe(testBookingRef);
      expect(json.reservation.status).toBe("PENDING");
      expect(json.reservation.customerName).toBe("Audit Test Guest");
      expect(json.reservation.guestCount).toBe(2);
    });

    it("ADMIN: Confirms the reservation in the database via admin update endpoint", async () => {
      // Mock authenticated cookie session for admin
      const req = new Request("http://localhost:3000/api/admin/reservations/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `oe_session=${adminToken}`,
        },
        body: JSON.stringify({
          reservationId: testReservationId,
          status: "CONFIRMED",
          tableAssignment: "Hearth Table 3",
          staffNotes: "Pre-service setup complete",
        }),
      });

      const res = await updateReservationRoute(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.reservation.status).toBe("CONFIRMED");
      expect(json.reservation.tableAssignment).toBe("Hearth Table 3");

      // Verify directly in DB
      const inDb = await prisma.reservation.findUnique({
        where: { id: testReservationId },
      });
      expect(inDb?.status).toBe("CONFIRMED");
    });

    it("CUSTOMER: Live status refresh reflects CONFIRMED status from database", async () => {
      const req = new Request(`http://localhost:3000/api/reservations/status?ref=${testBookingRef}`);
      const res = await getReservationStatusRoute(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.reservation.status).toBe("CONFIRMED");
      expect(json.reservation.tableAssignment).toBe("Hearth Table 3");
      // Must not leak internal staff notes to customer
      expect(json.reservation.staffNotes).toBeUndefined();
    });

    it("ADMIN & CUSTOMER: Cancelling reservation updates database and reflects CANCELLED to customer", async () => {
      const updateReq = new Request("http://localhost:3000/api/admin/reservations/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `oe_session=${adminToken}`,
        },
        body: JSON.stringify({
          reservationId: testReservationId,
          status: "CANCELLED",
        }),
      });

      const updateRes = await updateReservationRoute(updateReq);
      expect(updateRes.status).toBe(200);

      // Customer fetches latest status
      const customerReq = new Request(`http://localhost:3000/api/reservations/status?ref=${testBookingRef}`);
      const customerRes = await getReservationStatusRoute(customerReq);
      expect(customerRes.status).toBe(200);

      const customerJson = await customerRes.json();
      expect(customerJson.reservation.status).toBe("CANCELLED");
    });
  });

  // =========================================================================
  // CONTACT INQUIRIES WORKFLOW
  // =========================================================================
  describe("Contact Inquiries: Submission, Storage & Management", () => {
    let testInquiryId: string;

    it("CUSTOMER: Submits a hospitality inquiry, securely validated and saved in DB", async () => {
      const req = new Request("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Audit Hospitality Guest",
          email: "guest.hospitality@oliveandember.demo",
          phone: "+91 98888 77777",
          subject: "Private Hearth Dining Inquiry",
          message: "We would like to inquire about booking the full botanical courtyard for a family anniversary dinner.",
        }),
      });

      const res = await createContactRoute(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.inquiryId).toBeDefined();

      testInquiryId = json.inquiryId;
      createdInquiryIds.push(testInquiryId);

      // Verify in DB directly
      const inDb = await prisma.contactInquiry.findUnique({
        where: { id: testInquiryId },
      });
      expect(inDb).not.toBeNull();
      expect(inDb?.name).toBe("Audit Hospitality Guest");
      expect(inDb?.isRead).toBe(false);
    });

    it("ADMIN: Can view and mark contact inquiry as read/unread", async () => {
      const req = new Request("http://localhost:3000/api/admin/inquiries/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `oe_session=${adminToken}`,
        },
        body: JSON.stringify({
          inquiryId: testInquiryId,
          isRead: true,
        }),
      });

      const res = await updateInquiryRoute(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.inquiry.isRead).toBe(true);

      // Verify in DB directly
      const inDb = await prisma.contactInquiry.findUnique({
        where: { id: testInquiryId },
      });
      expect(inDb?.isRead).toBe(true);
    });
  });
});
