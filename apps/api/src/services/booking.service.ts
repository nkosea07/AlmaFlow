import { prisma } from "@almaflow/database";
import type { BookingStatus } from "@almaflow/database";
import { AppError } from "../middleware/error.js";

export async function createBooking(
  userId: string,
  data: {
    eventId: string;
    roomId?: string;
    arrivalDate: string;
    departureDate: string;
    specialRequirements?: string;
    groupBookingId?: string;
  }
) {
  const event = await prisma.event.findUnique({ where: { id: data.eventId } });
  if (!event || !event.isActive) {
    throw new AppError(404, "Event not found or not active");
  }

  // Check for existing booking for this user/event
  const existingBooking = await prisma.booking.findFirst({
    where: {
      userId,
      eventId: data.eventId,
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
    },
  });

  if (existingBooking) {
    throw new AppError(409, "You already have an active booking for this event");
  }

  // If room specified, check availability (double-booking prevention)
  if (data.roomId) {
    await assertRoomAvailable(
      data.roomId,
      new Date(data.arrivalDate),
      new Date(data.departureDate)
    );
  }

  const booking = await prisma.booking.create({
    data: {
      userId,
      eventId: data.eventId,
      roomId: data.roomId ?? null,
      arrivalDate: new Date(data.arrivalDate),
      departureDate: new Date(data.departureDate),
      specialRequirements: data.specialRequirements,
      groupBookingId: data.groupBookingId,
      status: data.roomId ? "CONFIRMED" : "PENDING",
      confirmedAt: data.roomId ? new Date() : null,
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      room: {
        include: {
          building: { select: { name: true } },
          roomType: { select: { name: true } },
        },
      },
      event: { select: { id: true, name: true } },
    },
  });

  // Auto-generate meal entitlements for confirmed bookings
  if (booking.status === "CONFIRMED") {
    await generateMealEntitlements(booking.id, booking.eventId, booking.arrivalDate, booking.departureDate);
  }

  // Update room status if assigned
  if (data.roomId) {
    await prisma.room.update({
      where: { id: data.roomId },
      data: { status: "RESERVED" },
    });
  }

  return booking;
}

export async function listBookings(filters: {
  eventId?: string;
  userId?: string;
  status?: BookingStatus;
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { eventId, userId, status, page = 1, limit = 20, search } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (eventId) where.eventId = eventId;
  if (userId) where.userId = userId;
  if (status) where.status = status;
  if (search) {
    where.user = {
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        room: {
          include: {
            building: { select: { name: true } },
            roomType: { select: { name: true } },
          },
        },
        event: { select: { id: true, name: true } },
        checkIn: { select: { checkedInAt: true, checkedOutAt: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.count({ where }),
  ]);

  return { bookings, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getBooking(id: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      room: {
        include: {
          building: true,
          roomType: true,
        },
      },
      event: true,
      checkIn: true,
      mealEntitlements: {
        include: { meal: true },
      },
      groupBooking: { include: { bookings: { select: { id: true, status: true } } } },
    },
  });

  if (!booking) throw new AppError(404, "Booking not found");
  return booking;
}

export async function updateBooking(
  id: string,
  data: {
    roomId?: string | null;
    status?: BookingStatus;
    arrivalDate?: string;
    departureDate?: string;
    specialRequirements?: string;
  }
) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw new AppError(404, "Booking not found");

  // Handle room assignment
  if (data.roomId !== undefined && data.roomId !== booking.roomId) {
    if (data.roomId) {
      await assertRoomAvailable(
        data.roomId,
        data.arrivalDate ? new Date(data.arrivalDate) : booking.arrivalDate,
        data.departureDate ? new Date(data.departureDate) : booking.departureDate,
        id // exclude current booking from overlap check
      );
      // Reserve the new room
      await prisma.room.update({
        where: { id: data.roomId },
        data: { status: "RESERVED" },
      });
    }
    // Free the old room if it was assigned
    if (booking.roomId) {
      await prisma.room.update({
        where: { id: booking.roomId },
        data: { status: "AVAILABLE" },
      });
    }
  }

  const updateData: Record<string, unknown> = {};
  if (data.roomId !== undefined) updateData.roomId = data.roomId;
  if (data.status) updateData.status = data.status;
  if (data.arrivalDate) updateData.arrivalDate = new Date(data.arrivalDate);
  if (data.departureDate) updateData.departureDate = new Date(data.departureDate);
  if (data.specialRequirements !== undefined) updateData.specialRequirements = data.specialRequirements;

  // Auto-confirm if room is newly assigned
  if (data.roomId && booking.status === "PENDING") {
    updateData.status = "CONFIRMED";
    updateData.confirmedAt = new Date();
    // Generate meal entitlements on confirmation
    await generateMealEntitlements(
      id,
      booking.eventId,
      data.arrivalDate ? new Date(data.arrivalDate) : booking.arrivalDate,
      data.departureDate ? new Date(data.departureDate) : booking.departureDate
    );
  }

  // Handle cancellation
  if (data.status === "CANCELLED") {
    updateData.cancelledAt = new Date();
    if (booking.roomId) {
      await prisma.room.update({
        where: { id: booking.roomId },
        data: { status: "AVAILABLE" },
      });
    }
  }

  return prisma.booking.update({
    where: { id },
    data: updateData,
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      room: {
        include: {
          building: { select: { name: true } },
          roomType: { select: { name: true } },
        },
      },
      event: { select: { id: true, name: true } },
    },
  });
}

export async function assignRoom(bookingId: string, roomId: string) {
  return updateBooking(bookingId, { roomId });
}

export async function cancelBooking(id: string) {
  return updateBooking(id, { status: "CANCELLED" });
}

// ─── Auto Room Assignment ───────────────────────────────────

export async function autoAssignRooms(eventId: string) {
  // Find all pending bookings without rooms
  const pendingBookings = await prisma.booking.findMany({
    where: {
      eventId,
      status: "PENDING",
      roomId: null,
    },
    orderBy: { createdAt: "asc" }, // first-come-first-served
  });

  const results: { bookingId: string; roomId: string | null; error?: string }[] = [];

  for (const booking of pendingBookings) {
    // Find available rooms for this booking's date range
    const available = await prisma.room.findFirst({
      where: {
        building: { eventId },
        status: { in: ["AVAILABLE"] },
        NOT: {
          bookings: {
            some: {
              status: { in: ["CONFIRMED", "CHECKED_IN"] },
              arrivalDate: { lt: booking.departureDate },
              departureDate: { gt: booking.arrivalDate },
            },
          },
        },
      },
      orderBy: { number: "asc" },
    });

    if (available) {
      await updateBooking(booking.id, { roomId: available.id });
      results.push({ bookingId: booking.id, roomId: available.id });
    } else {
      results.push({ bookingId: booking.id, roomId: null, error: "No rooms available" });
    }
  }

  return results;
}

// ─── Group Bookings ─────────────────────────────────────────

export async function createGroupBooking(data: {
  name: string;
  contactId: string;
  bookingIds: string[];
}) {
  const group = await prisma.groupBooking.create({
    data: {
      name: data.name,
      contactId: data.contactId,
    },
  });

  await prisma.booking.updateMany({
    where: { id: { in: data.bookingIds } },
    data: { groupBookingId: group.id },
  });

  return prisma.groupBooking.findUnique({
    where: { id: group.id },
    include: {
      bookings: {
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      },
    },
  });
}

// ─── Helpers ────────────────────────────────────────────────

async function assertRoomAvailable(
  roomId: string,
  arrivalDate: Date,
  departureDate: Date,
  excludeBookingId?: string
) {
  const where: Record<string, unknown> = {
    roomId,
    status: { in: ["CONFIRMED", "CHECKED_IN"] },
    arrivalDate: { lt: departureDate },
    departureDate: { gt: arrivalDate },
  };

  if (excludeBookingId) {
    where.id = { not: excludeBookingId };
  }

  const overlap = await prisma.booking.findFirst({ where });

  if (overlap) {
    throw new AppError(
      409,
      "Room is not available for the selected dates (overlapping booking exists)"
    );
  }

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw new AppError(404, "Room not found");
  if (room.status === "OUT_OF_SERVICE" || room.status === "MAINTENANCE") {
    throw new AppError(400, `Room is currently ${room.status.toLowerCase()}`);
  }
}

async function generateMealEntitlements(
  bookingId: string,
  eventId: string,
  arrivalDate: Date,
  departureDate: Date
) {
  // Find all meals for the event within the booking dates
  const meals = await prisma.meal.findMany({
    where: {
      eventId,
      date: {
        gte: arrivalDate,
        lte: departureDate,
      },
    },
  });

  // Check existing entitlements to avoid duplicates
  const existingEntitlements = await prisma.mealEntitlement.findMany({
    where: { bookingId },
    select: { mealId: true },
  });
  const existingMealIds = new Set(existingEntitlements.map((e) => e.mealId));

  const newEntitlements = meals
    .filter((m) => !existingMealIds.has(m.id))
    .map((meal) => ({
      bookingId,
      mealId: meal.id,
      dietaryRequirements: [],
      isRedeemed: false,
    }));

  if (newEntitlements.length > 0) {
    await prisma.mealEntitlement.createMany({ data: newEntitlements });
  }
}
