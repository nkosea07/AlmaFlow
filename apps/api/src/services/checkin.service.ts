import { prisma } from "@almaflow/database";
import { AppError } from "../middleware/error.js";

export async function checkIn(data: {
  bookingId: string;
  method: "QR_SELF" | "STAFF_ASSISTED" | "MOBILE_SELF";
  checkedInBy?: string;
}) {
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    include: { checkIn: true },
  });

  if (!booking) throw new AppError(404, "Booking not found");
  if (booking.checkIn) throw new AppError(409, "Guest is already checked in");
  if (booking.status === "CANCELLED" || booking.status === "NO_SHOW") {
    throw new AppError(400, `Cannot check in a ${booking.status.toLowerCase()} booking`);
  }
  if (!booking.roomId) {
    throw new AppError(400, "No room assigned to this booking. Assign a room first.");
  }

  const [checkIn] = await prisma.$transaction([
    prisma.checkIn.create({
      data: {
        bookingId: data.bookingId,
        method: data.method,
        checkedInBy: data.checkedInBy,
      },
      include: {
        booking: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            room: {
              include: {
                building: { select: { name: true } },
                roomType: { select: { name: true } },
              },
            },
          },
        },
      },
    }),
    prisma.booking.update({
      where: { id: data.bookingId },
      data: { status: "CHECKED_IN" },
    }),
    prisma.room.update({
      where: { id: booking.roomId! },
      data: { status: "OCCUPIED" },
    }),
  ]);

  return checkIn;
}

export async function checkOut(data: {
  bookingId: string;
  checkedOutBy?: string;
  damageNotes?: string;
  damagePhotos?: string[];
}) {
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    include: { checkIn: true },
  });

  if (!booking) throw new AppError(404, "Booking not found");
  if (!booking.checkIn) throw new AppError(400, "Guest has not checked in");
  if (booking.checkIn.checkedOutAt) throw new AppError(409, "Guest is already checked out");

  const [checkIn] = await prisma.$transaction([
    prisma.checkIn.update({
      where: { id: booking.checkIn.id },
      data: {
        checkedOutAt: new Date(),
        checkedOutBy: data.checkedOutBy,
        damageNotes: data.damageNotes,
        damagePhotos: data.damagePhotos ?? [],
      },
      include: {
        booking: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            room: {
              include: {
                building: { select: { name: true } },
                roomType: { select: { name: true } },
              },
            },
          },
        },
      },
    }),
    prisma.booking.update({
      where: { id: data.bookingId },
      data: { status: "CHECKED_OUT" },
    }),
    // Mark room as dirty and trigger housekeeping
    prisma.room.update({
      where: { id: booking.roomId! },
      data: { status: "AVAILABLE", cleanStatus: "DIRTY" },
    }),
    // Auto-create turnover cleaning task
    prisma.housekeepingTask.create({
      data: {
        roomId: booking.roomId!,
        type: "TURNOVER_CLEAN",
        priority: "HIGH",
        notes: `Auto-created after checkout of booking ${data.bookingId}`,
      },
    }),
  ]);

  return checkIn;
}

export async function getCheckIn(bookingId: string) {
  const checkIn = await prisma.checkIn.findUnique({
    where: { bookingId },
    include: {
      booking: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          room: {
            include: {
              building: { select: { name: true } },
              roomType: { select: { name: true, capacity: true } },
            },
          },
          event: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!checkIn) throw new AppError(404, "Check-in record not found");
  return checkIn;
}

export async function listCheckIns(filters: {
  eventId?: string;
  status?: "checked_in" | "checked_out";
  page?: number;
  limit?: number;
}) {
  const { eventId, status, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (eventId) where.booking = { eventId };
  if (status === "checked_in") where.checkedOutAt = null;
  if (status === "checked_out") where.checkedOutAt = { not: null };

  const [checkIns, total] = await Promise.all([
    prisma.checkIn.findMany({
      where,
      skip,
      take: limit,
      include: {
        booking: {
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
        },
      },
      orderBy: { checkedInAt: "desc" },
    }),
    prisma.checkIn.count({ where }),
  ]);

  return { checkIns, total, page, limit, totalPages: Math.ceil(total / limit) };
}
