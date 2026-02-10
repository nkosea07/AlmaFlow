import { prisma } from "@almaflow/database";
import { AppError } from "../middleware/error.js";

export async function createEvent(data: {
  name: string;
  startDate: string;
  endDate: string;
  venue: string;
  description?: string;
}) {
  return prisma.event.create({
    data: {
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      venue: data.venue,
      description: data.description,
    },
    include: {
      _count: { select: { buildings: true, bookings: true, meals: true, scheduleItems: true } },
    },
  });
}

export async function listEvents(filters: {
  isActive?: boolean;
  page?: number;
  limit?: number;
}) {
  const { isActive, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (isActive !== undefined) where.isActive = isActive;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take: limit,
      include: {
        _count: { select: { buildings: true, bookings: true, meals: true, scheduleItems: true } },
      },
      orderBy: { startDate: "desc" },
    }),
    prisma.event.count({ where }),
  ]);

  return { events, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getEvent(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      buildings: {
        include: {
          rooms: { select: { id: true, status: true, cleanStatus: true } },
        },
      },
      meals: {
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      },
      scheduleItems: {
        orderBy: { startTime: "asc" },
      },
      _count: { select: { bookings: true } },
    },
  });

  if (!event) throw new AppError(404, "Event not found");
  return event;
}

export async function updateEvent(
  id: string,
  data: {
    name?: string;
    startDate?: string;
    endDate?: string;
    venue?: string;
    description?: string;
    isActive?: boolean;
  }
) {
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);
  if (data.venue !== undefined) updateData.venue = data.venue;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  return prisma.event.update({
    where: { id },
    data: updateData,
    include: {
      _count: { select: { buildings: true, bookings: true, meals: true, scheduleItems: true } },
    },
  });
}

export async function createScheduleItem(data: {
  eventId: string;
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  category?: string;
  isRequired?: boolean;
}) {
  const event = await prisma.event.findUnique({ where: { id: data.eventId } });
  if (!event) throw new AppError(404, "Event not found");

  return prisma.scheduleItem.create({
    data: {
      eventId: data.eventId,
      title: data.title,
      description: data.description,
      location: data.location,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      category: data.category,
      isRequired: data.isRequired ?? false,
    },
  });
}

export async function listScheduleItems(eventId: string) {
  return prisma.scheduleItem.findMany({
    where: { eventId },
    orderBy: { startTime: "asc" },
  });
}

export async function deleteScheduleItem(id: string) {
  return prisma.scheduleItem.delete({ where: { id } });
}
