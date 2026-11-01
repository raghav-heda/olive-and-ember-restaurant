import { describe, it, expect, beforeAll, afterAll } from "vitest";
import prisma from "@/lib/db";
import { checkReservationAvailability, DEFAULT_TIME_SLOTS } from "@/lib/availability";

describe("Reservation Capacity & Availability Engine", () => {
  let restaurantId: string;
  const createdReservationIds: string[] = [];

  beforeAll(async () => {
    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) throw new Error("Database must be seeded before running tests");
    restaurantId = restaurant.id;
  });

  afterAll(async () => {
    if (createdReservationIds.length > 0) {
      await prisma.reservation.deleteMany({
        where: { id: { in: createdReservationIds } },
      });
    }
    await prisma.$disconnect();
  });

  it("accepts a valid reservation within service window and covers", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const dateStr = tomorrow.toISOString().split("T")[0];

    const result = await checkReservationAvailability(restaurantId, {
      date: dateStr,
      timeSlot: "19:30",
      guestCount: 4,
    });

    expect(result.isAvailable).toBe(true);
    expect(result.availableSlots).toContain("19:30");
  });

  it("accepts custom 15-minute interval slots like 19:15 and 12:15 within service hours", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);
    const dateStr = tomorrow.toISOString().split("T")[0];

    // Dinner custom slot: 19:15
    const dinnerResult = await checkReservationAvailability(restaurantId, {
      date: dateStr,
      timeSlot: "19:15",
      guestCount: 2,
    });
    expect(dinnerResult.isAvailable).toBe(true);

    // Lunch custom slot: 12:15
    const lunchResult = await checkReservationAvailability(restaurantId, {
      date: dateStr,
      timeSlot: "12:15",
      guestCount: 3,
    });
    expect(lunchResult.isAvailable).toBe(true);
  });

  it("rejects non-15-minute custom times (e.g., 19:17)", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const dateStr = tomorrow.toISOString().split("T")[0];

    const result = await checkReservationAvailability(restaurantId, {
      date: dateStr,
      timeSlot: "19:17",
      guestCount: 2,
    });

    expect(result.isAvailable).toBe(false);
    expect(result.reason).toMatch(/15-minute intervals/i);
  });

  it("rejects reservation requests for past dates", async () => {
    const pastDate = "2020-01-01";
    const result = await checkReservationAvailability(restaurantId, {
      date: pastDate,
      timeSlot: "19:30",
      guestCount: 2,
    });

    expect(result.isAvailable).toBe(false);
    expect(result.reason).toMatch(/past dates/i);
  });

  it("enforces party size constraints (rejects zero or negative)", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];

    const result = await checkReservationAvailability(restaurantId, {
      date: dateStr,
      timeSlot: "19:30",
      guestCount: 0,
    });

    expect(result.isAvailable).toBe(false);
    expect(result.reason).toMatch(/at least 1/i);
  });

  it("enforces maximum party size limit", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];

    const result = await checkReservationAvailability(restaurantId, {
      date: dateStr,
      timeSlot: "19:30",
      guestCount: 20, // max is 12
    });

    expect(result.isAvailable).toBe(false);
    expect(result.reason).toMatch(/limited to parties/i);
  });

  it("rejects invalid service hours time slots (e.g. 04:00 AM)", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];

    const result = await checkReservationAvailability(restaurantId, {
      date: dateStr,
      timeSlot: "04:00", // 4 AM is outside service hours
      guestCount: 2,
    });

    expect(result.isAvailable).toBe(false);
    expect(result.reason).toMatch(/before dining service begins|outside standard/i);
  });

  it("rejects reservations beyond configured advance booking horizon", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 90); // 90 days is past the 30-day limit
    const dateStr = futureDate.toISOString().split("T")[0];

    const result = await checkReservationAvailability(restaurantId, {
      date: dateStr,
      timeSlot: "19:30",
      guestCount: 2,
    });

    expect(result.isAvailable).toBe(false);
    expect(result.reason).toMatch(/advance/i);
  });

  it("persists a newly created custom-time reservation in the database and retrieves it by bookingRef", async () => {
    const testRef = `RES-CUSTOM-${Date.now().toString().slice(-4)}`;
    const created = await prisma.reservation.create({
      data: {
        bookingRef: testRef,
        restaurantId,
        customerName: "Custom Slot Diner",
        customerPhone: "+91 91111 55566",
        customerEmail: "custom.diner@oliveandember.demo",
        guestCount: 2,
        reservationDate: "2026-11-15",
        timeSlot: "19:15", // Exact custom 15-minute slot
        specialRequests: "Anniversary table",
        status: "PENDING",
      },
    });
    createdReservationIds.push(created.id);

    expect(created.id).toBeDefined();
    expect(created.bookingRef).toBe(testRef);
    expect(created.timeSlot).toBe("19:15");

    // Verify database record retrieval
    const fetched = await prisma.reservation.findUnique({
      where: { bookingRef: testRef },
    });

    expect(fetched).not.toBeNull();
    expect(fetched?.customerName).toBe("Custom Slot Diner");
    expect(fetched?.timeSlot).toBe("19:15");
    expect(fetched?.guestCount).toBe(2);
    expect(fetched?.status).toBe("PENDING");
  });

  it("fails and throws an error when attempting to insert a reservation with a duplicate bookingRef", async () => {
    const duplicateRef = `RES-DUP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const initialBooking = await prisma.reservation.create({
      data: {
        bookingRef: duplicateRef,
        restaurantId,
        customerName: "Original Booker",
        customerPhone: "+91 98888 11111",
        guestCount: 2,
        reservationDate: "2026-11-12",
        timeSlot: "19:00",
        status: "CONFIRMED",
      },
    });
    createdReservationIds.push(initialBooking.id);

    // Attempting to insert identical bookingRef must throw a unique constraint error
    await expect(
      prisma.reservation.create({
        data: {
          bookingRef: duplicateRef,
          restaurantId,
          customerName: "Duplicate Imposter",
          customerPhone: "+91 97777 22222",
          guestCount: 4,
          reservationDate: "2026-11-12",
          timeSlot: "19:00",
          status: "PENDING",
        },
      })
    ).rejects.toThrow();
  });
});
