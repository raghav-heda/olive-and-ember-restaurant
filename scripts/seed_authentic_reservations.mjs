import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rest = await prisma.restaurant.findFirst();
  if (!rest) {
    console.error("No restaurant found!");
    return;
  }

  // Check if RES-4019 or RES-5820 already exist
  const existing = await prisma.reservation.findMany({
    where: { bookingRef: { in: ["RES-4019", "RES-5820"] } },
  });

  if (existing.length === 0) {
    await prisma.reservation.createMany({
      data: [
        {
          bookingRef: "RES-4019",
          restaurantId: rest.id,
          customerName: "Aarav Sharma",
          customerPhone: "+91 98201 12345",
          customerEmail: "aarav.sharma@example.com",
          guestCount: 2,
          reservationDate: "2026-11-05",
          timeSlot: "19:30",
          tableAssignment: "Hearth Booth 4",
          specialRequests: "Anniversary dinner, quiet corner booth requested",
          status: "CONFIRMED",
          staffNotes: "Complimentary chef welcome prosecco glass arranged",
        },
        {
          bookingRef: "RES-5820",
          restaurantId: rest.id,
          customerName: "Priya Nair",
          customerPhone: "+91 98450 67890",
          customerEmail: "priya.nair@example.com",
          guestCount: 4,
          reservationDate: "2026-11-06",
          timeSlot: "20:00",
          tableAssignment: null,
          specialRequests: "One guest has a severe peanut allergy",
          status: "PENDING",
          staffNotes: "Awaiting staff table re-allocation",
        },
      ],
    });
    console.log("Seeded authentic reservations RES-4019 and RES-5820");
  } else {
    console.log("Reservations already present:", existing.map(e => e.bookingRef));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
