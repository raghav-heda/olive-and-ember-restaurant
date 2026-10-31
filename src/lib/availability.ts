import prisma from "@/lib/db";

export interface ReservationSlotCheck {
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  guestCount: number;
}

export interface SlotAvailabilityResult {
  isAvailable: boolean;
  reason?: string;
  maxPartySize: number;
  availableSlots: string[];
  suggestedSlots?: string[];
}

export const DEFAULT_TIME_SLOTS = [
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
];

const DEFAULT_MAX_COVERS_PER_SLOT = 30;

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map((v) => parseInt(v, 10));
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Generates all 15-minute interval slots between open and close times.
 */
export function generate15MinuteSlots(openTime: string, closeTime: string, lastSeatingBufferMinutes = 45): string[] {
  const openMin = timeToMinutes(openTime);
  const closeMin = timeToMinutes(closeTime);
  const lastSeatingMin = closeMin - lastSeatingBufferMinutes;

  const slots: string[] = [];
  for (let m = openMin; m <= lastSeatingMin; m += 15) {
    slots.push(minutesToTime(m));
  }
  return slots;
}

export async function checkReservationAvailability(
  restaurantId: string,
  params: ReservationSlotCheck
): Promise<SlotAvailabilityResult> {
  const { date, timeSlot, guestCount } = params;

  const settings = await prisma.restaurantSettings.findUnique({
    where: { restaurantId },
  });

  const maxPartySize = settings?.maxPartySize ?? 12;
  const advanceBookingDays = settings?.advanceBookingDays ?? 30;
  const slotDurationMinutes = settings?.slotDurationMinutes ?? 90;

  // 1. Dine-in service status guard
  if (settings && !settings.dineInEnabled) {
    return {
      isAvailable: false,
      reason: "Table reservations and dine-in service are currently paused at this restaurant.",
      maxPartySize,
      availableSlots: [],
    };
  }

  // 2. Guest count bounds
  if (guestCount <= 0) {
    return {
      isAvailable: false,
      reason: "Number of guests must be at least 1",
      maxPartySize,
      availableSlots: [],
    };
  }

  if (guestCount > maxPartySize) {
    return {
      isAvailable: false,
      reason: `Online bookings are limited to parties of ${maxPartySize} guests or fewer. For larger private gatherings, please contact our events team directly.`,
      maxPartySize,
      availableSlots: [],
    };
  }

  // 2. Date validation
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = new Date(`${date}T00:00:00`);
  if (isNaN(selectedDate.getTime())) {
    return {
      isAvailable: false,
      reason: "Invalid reservation date format (expected YYYY-MM-DD)",
      maxPartySize,
      availableSlots: [],
    };
  }

  if (selectedDate < today) {
    return {
      isAvailable: false,
      reason: "Reservations cannot be booked for past dates",
      maxPartySize,
      availableSlots: [],
    };
  }

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + advanceBookingDays);
  if (selectedDate > maxDate) {
    return {
      isAvailable: false,
      reason: `Reservations can only be placed up to ${advanceBookingDays} days in advance`,
      maxPartySize,
      availableSlots: [],
    };
  }

  // 3. Time format & 15-minute interval check
  if (!/^\d{2}:\d{2}$/.test(timeSlot)) {
    return {
      isAvailable: false,
      reason: "Invalid time format (expected HH:mm)",
      maxPartySize,
      availableSlots: DEFAULT_TIME_SLOTS,
    };
  }

  const reqMinutes = timeToMinutes(timeSlot);
  if (reqMinutes % 15 !== 0) {
    return {
      isAvailable: false,
      reason: "Reservation times must be at 15-minute intervals (e.g., 12:15, 14:30, 19:45)",
      maxPartySize,
      availableSlots: DEFAULT_TIME_SLOTS,
    };
  }

  // 4. Restaurant Opening Hours Check
  let daySchedule = { open: "12:00", close: "23:00", closed: false };
  if (settings?.openingHoursJson) {
    try {
      const parsedHours = JSON.parse(settings.openingHoursJson);
      const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const dayName = dayNames[selectedDate.getDay()];
      if (parsedHours[dayName]) {
        daySchedule = parsedHours[dayName];
      }
    } catch {
      // Fallback to default hours if JSON parsing fails
    }
  }

  if (daySchedule.closed) {
    return {
      isAvailable: false,
      reason: "Olive & Ember Kitchen is closed on this day. Please select another date.",
      maxPartySize,
      availableSlots: [],
    };
  }

  const openMinutes = timeToMinutes(daySchedule.open);
  const closeMinutes = timeToMinutes(daySchedule.close);
  // Last seating is at least 30 minutes before kitchen close
  const lastSeatingMinutes = closeMinutes - 30;

  if (reqMinutes < openMinutes) {
    return {
      isAvailable: false,
      reason: `Selected time (${timeSlot}) is before dining service begins at ${daySchedule.open}.`,
      maxPartySize,
      availableSlots: DEFAULT_TIME_SLOTS.filter((s) => timeToMinutes(s) >= openMinutes),
    };
  }

  if (reqMinutes > lastSeatingMinutes) {
    return {
      isAvailable: false,
      reason: `Selected time (${timeSlot}) is too close to our closing time of ${daySchedule.close}. Last seating is accepted until ${minutesToTime(lastSeatingMinutes)}.`,
      maxPartySize,
      availableSlots: DEFAULT_TIME_SLOTS.filter((s) => timeToMinutes(s) <= lastSeatingMinutes),
    };
  }

  // 5. Same-Day Past Time Check
  const now = new Date();
  const isSameDay =
    now.getFullYear() === selectedDate.getFullYear() &&
    now.getMonth() === selectedDate.getMonth() &&
    now.getDate() === selectedDate.getDate();

  if (isSameDay) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    // Enforce 15-minute lead time for online table preparation
    if (reqMinutes <= currentMinutes + 15) {
      return {
        isAvailable: false,
        reason: `Selected time (${timeSlot}) has already passed or is too immediate. For walk-in seating, please contact the host stand directly.`,
        maxPartySize,
        availableSlots: DEFAULT_TIME_SLOTS.filter((s) => timeToMinutes(s) > currentMinutes + 30),
      };
    }
  }

  // 6. Real Capacity & Overlapping Seating Validation
  // Fetch all active reservations on this date
  const activeBookings = await prisma.reservation.findMany({
    where: {
      restaurantId,
      reservationDate: date,
      status: { in: ["CONFIRMED", "PENDING", "SEATED"] },
    },
    select: { timeSlot: true, guestCount: true },
  });

  // Helper: Calculate peak concurrent covers at any 15-minute checkpoint within a proposed [start, start + duration) window
  const getPeakCovers = (startTimeMin: number, durationMin: number, excludeExistingIndex = -1) => {
    let peak = 0;
    // Checkpoints every 15 minutes during the requested seating
    for (let cp = startTimeMin; cp < startTimeMin + durationMin; cp += 15) {
      let concurrentGuests = 0;
      for (let i = 0; i < activeBookings.length; i++) {
        if (i === excludeExistingIndex) continue;
        const b = activeBookings[i];
        const bStart = timeToMinutes(b.timeSlot);
        const bEnd = bStart + slotDurationMinutes;
        if (cp >= bStart && cp < bEnd) {
          concurrentGuests += b.guestCount;
        }
      }
      if (concurrentGuests > peak) {
        peak = concurrentGuests;
      }
    }
    return peak;
  };

  const peakExisting = getPeakCovers(reqMinutes, slotDurationMinutes);

  if (peakExisting + guestCount > DEFAULT_MAX_COVERS_PER_SLOT) {
    // Slot is over capacity: calculate real nearby suggestions
    const possibleOffsets = [-15, 15, -30, 30, -45, 45, -60, 60, -75, 75, -90, 90];
    const suggested: string[] = [];

    for (const offset of possibleOffsets) {
      const candMin = reqMinutes + offset;
      if (candMin >= openMinutes && candMin <= lastSeatingMinutes) {
        if (isSameDay) {
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          if (candMin <= currentMinutes + 15) continue;
        }
        const candPeak = getPeakCovers(candMin, slotDurationMinutes);
        if (candPeak + guestCount <= DEFAULT_MAX_COVERS_PER_SLOT) {
          const formatted = minutesToTime(candMin);
          if (!suggested.includes(formatted)) {
            suggested.push(formatted);
          }
          if (suggested.length >= 4) break;
        }
      }
    }

    // Sort suggestions chronologically
    suggested.sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

    return {
      isAvailable: false,
      reason:
        suggested.length > 0
          ? `The requested time (${timeSlot}) is fully booked for a party of ${guestCount}. Nearby available tables found: ${suggested.join(", ")}.`
          : `The requested time (${timeSlot}) is fully booked for a party of ${guestCount}. Please select another time or date.`,
      maxPartySize,
      availableSlots: DEFAULT_TIME_SLOTS.filter((s) => {
        const sm = timeToMinutes(s);
        return getPeakCovers(sm, slotDurationMinutes) + guestCount <= DEFAULT_MAX_COVERS_PER_SLOT;
      }),
      suggestedSlots: suggested,
    };
  }

  // Slot is available!
  return {
    isAvailable: true,
    maxPartySize,
    availableSlots: DEFAULT_TIME_SLOTS,
  };
}

export function generateReservationRef(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `RES-${randomNum}`;
}

export function generateOrderCode(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `OE-${randomNum}`;
}
