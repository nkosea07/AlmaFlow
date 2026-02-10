import { prisma } from "@almaflow/database";
import type { RoomStatus, CleanStatus } from "@almaflow/database";
import { AppError } from "../middleware/error.js";

export async function listRooms(filters: {
  buildingId?: string;
  eventId?: string;
  status?: RoomStatus;
  cleanStatus?: CleanStatus;
  page?: number;
  limit?: number;
}) {
  const { buildingId, eventId, status, cleanStatus, page = 1, limit = 50 } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (buildingId) where.buildingId = buildingId;
  if (status) where.status = status;
  if (cleanStatus) where.cleanStatus = cleanStatus;
  if (eventId) where.building = { eventId };

  const [rooms, total] = await Promise.all([
    prisma.room.findMany({
      where,
      skip,
      take: limit,
      include: {
        building: { select: { id: true, name: true } },
        roomType: { select: { id: true, name: true, capacity: true } },
        bookings: {
          where: {
            status: { in: ["CONFIRMED", "CHECKED_IN"] },
          },
          select: {
            id: true,
            userId: true,
            status: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: [{ building: { name: "asc" } }, { number: "asc" }],
    }),
    prisma.room.count({ where }),
  ]);

  return { rooms, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getRoom(id: string) {
  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      building: true,
      roomType: true,
      bookings: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          checkIn: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      housekeepingTasks: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      maintenanceRequests: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      assets: true,
    },
  });

  if (!room) throw new AppError(404, "Room not found");
  return room;
}

export async function createRoom(data: {
  number: string;
  buildingId: string;
  roomTypeId: string;
  floor?: number;
  notes?: string;
}) {
  const existing = await prisma.room.findUnique({
    where: { number_buildingId: { number: data.number, buildingId: data.buildingId } },
  });

  if (existing) {
    throw new AppError(409, `Room ${data.number} already exists in this building`);
  }

  return prisma.room.create({
    data: {
      number: data.number,
      buildingId: data.buildingId,
      roomTypeId: data.roomTypeId,
      floor: data.floor ?? 1,
      notes: data.notes,
    },
    include: {
      building: { select: { name: true } },
      roomType: { select: { name: true, capacity: true } },
    },
  });
}

export async function updateRoom(
  id: string,
  data: {
    number?: string;
    floor?: number;
    status?: RoomStatus;
    cleanStatus?: CleanStatus;
    notes?: string;
  }
) {
  return prisma.room.update({
    where: { id },
    data,
    include: {
      building: { select: { name: true } },
      roomType: { select: { name: true, capacity: true } },
    },
  });
}

export async function deleteRoom(id: string) {
  const room = await prisma.room.findUnique({
    where: { id },
    include: { bookings: { where: { status: { in: ["CONFIRMED", "CHECKED_IN"] } } } },
  });

  if (!room) throw new AppError(404, "Room not found");
  if (room.bookings.length > 0) {
    throw new AppError(400, "Cannot delete a room with active bookings");
  }

  return prisma.room.delete({ where: { id } });
}

export async function getAvailableRooms(params: {
  eventId: string;
  arrivalDate: Date;
  departureDate: Date;
  roomTypeId?: string;
  buildingId?: string;
}) {
  const { eventId, arrivalDate, departureDate, roomTypeId, buildingId } = params;

  const where: Record<string, unknown> = {
    building: { eventId },
    status: { in: ["AVAILABLE", "RESERVED"] },
    // Exclude rooms that have overlapping bookings
    NOT: {
      bookings: {
        some: {
          status: { in: ["CONFIRMED", "CHECKED_IN"] },
          arrivalDate: { lt: departureDate },
          departureDate: { gt: arrivalDate },
        },
      },
    },
  };

  if (roomTypeId) where.roomTypeId = roomTypeId;
  if (buildingId) where.buildingId = buildingId;

  return prisma.room.findMany({
    where,
    include: {
      building: { select: { id: true, name: true } },
      roomType: { select: { id: true, name: true, capacity: true } },
    },
    orderBy: [{ building: { name: "asc" } }, { number: "asc" }],
  });
}

// ─── Buildings ──────────────────────────────────────────────

export async function listBuildings(eventId?: string) {
  const where = eventId ? { eventId } : {};
  return prisma.building.findMany({
    where,
    include: {
      rooms: { select: { id: true, status: true, cleanStatus: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function createBuilding(data: {
  name: string;
  eventId: string;
  floors?: number;
  location?: string;
}) {
  return prisma.building.create({
    data: {
      name: data.name,
      eventId: data.eventId,
      floors: data.floors ?? 1,
      location: data.location,
    },
  });
}

// ─── Room Types ─────────────────────────────────────────────

export async function listRoomTypes() {
  return prisma.roomType.findMany({
    include: { rooms: { select: { id: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createRoomType(data: { name: string; capacity: number }) {
  return prisma.roomType.create({ data });
}
