import { prisma } from "@almaflow/database";
import type { SpaceStatus, SpaceType, TaskStatus } from "@almaflow/database";
import { AppError } from "../middleware/error.js";

export async function createSpace(data: {
  eventId: string;
  name: string;
  type: SpaceType;
  capacity?: number;
  location: string;
  mapUrl?: string;
  notes?: string;
}) {
  return prisma.space.create({
    data: {
      eventId: data.eventId,
      name: data.name,
      type: data.type,
      capacity: data.capacity,
      location: data.location,
      mapUrl: data.mapUrl,
      notes: data.notes,
    },
    include: { _count: { select: { structures: true } } },
  });
}

export async function listSpaces(filters: {
  eventId?: string;
  type?: SpaceType;
  status?: SpaceStatus;
  page?: number;
  limit?: number;
}) {
  const { eventId, type, status, page = 1, limit = 50 } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (eventId) where.eventId = eventId;
  if (type) where.type = type;
  if (status) where.status = status;

  const [spaces, total] = await Promise.all([
    prisma.space.findMany({
      where,
      skip,
      take: limit,
      include: {
        structures: true,
        _count: { select: { structures: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.space.count({ where }),
  ]);

  return { spaces, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getSpace(id: string) {
  const space = await prisma.space.findUnique({
    where: { id },
    include: { structures: true },
  });
  if (!space) throw new AppError(404, "Space not found");
  return space;
}

export async function updateSpace(id: string, data: {
  name?: string;
  status?: SpaceStatus;
  capacity?: number;
  notes?: string;
}) {
  return prisma.space.update({
    where: { id },
    data,
    include: { _count: { select: { structures: true } } },
  });
}

export async function createStructure(data: {
  spaceId: string;
  type: string;
  dimensions?: string;
  setupBy?: string;
  teardownBy?: string;
}) {
  return prisma.structure.create({
    data: {
      spaceId: data.spaceId,
      type: data.type,
      dimensions: data.dimensions,
      setupBy: data.setupBy ? new Date(data.setupBy) : null,
      teardownBy: data.teardownBy ? new Date(data.teardownBy) : null,
    },
  });
}

export async function updateStructureStatus(id: string, status: TaskStatus) {
  return prisma.structure.update({
    where: { id },
    data: { status },
  });
}
