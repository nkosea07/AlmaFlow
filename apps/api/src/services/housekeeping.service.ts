import { prisma } from "@almaflow/database";
import type { TaskStatus, Priority, HousekeepingType } from "@almaflow/database";
import { AppError } from "../middleware/error.js";

export async function createTask(data: {
  roomId: string;
  assigneeId?: string;
  type: HousekeepingType;
  priority?: Priority;
  notes?: string;
  scheduledAt?: string;
}) {
  return prisma.housekeepingTask.create({
    data: {
      roomId: data.roomId,
      assigneeId: data.assigneeId,
      type: data.type,
      priority: data.priority ?? "NORMAL",
      notes: data.notes,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
    },
    include: {
      room: {
        include: {
          building: { select: { name: true } },
          roomType: { select: { name: true } },
        },
      },
      assignee: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function listTasks(filters: {
  roomId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: Priority;
  type?: HousekeepingType;
  page?: number;
  limit?: number;
}) {
  const { roomId, assigneeId, status, priority, type, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (roomId) where.roomId = roomId;
  if (assigneeId) where.assigneeId = assigneeId;
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (type) where.type = type;

  const [tasks, total] = await Promise.all([
    prisma.housekeepingTask.findMany({
      where,
      skip,
      take: limit,
      include: {
        room: {
          include: {
            building: { select: { name: true } },
          },
        },
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    }),
    prisma.housekeepingTask.count({ where }),
  ]);

  return { tasks, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getTask(id: string) {
  const task = await prisma.housekeepingTask.findUnique({
    where: { id },
    include: {
      room: {
        include: {
          building: true,
          roomType: true,
        },
      },
      assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  if (!task) throw new AppError(404, "Housekeeping task not found");
  return task;
}

export async function updateTask(
  id: string,
  data: {
    assigneeId?: string | null;
    status?: TaskStatus;
    priority?: Priority;
    notes?: string;
  }
) {
  const task = await prisma.housekeepingTask.findUnique({ where: { id } });
  if (!task) throw new AppError(404, "Housekeeping task not found");

  const updateData: Record<string, unknown> = {};
  if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId;
  if (data.status) updateData.status = data.status;
  if (data.priority) updateData.priority = data.priority;
  if (data.notes !== undefined) updateData.notes = data.notes;

  // Track start and completion times
  if (data.status === "IN_PROGRESS" && !task.startedAt) {
    updateData.startedAt = new Date();
  }
  if (data.status === "COMPLETED") {
    updateData.completedAt = new Date();
    // Update room clean status
    await prisma.room.update({
      where: { id: task.roomId },
      data: { cleanStatus: "CLEAN" },
    });
  }
  if (data.status === "IN_PROGRESS") {
    await prisma.room.update({
      where: { id: task.roomId },
      data: { cleanStatus: "IN_PROGRESS" },
    });
  }

  return prisma.housekeepingTask.update({
    where: { id },
    data: updateData,
    include: {
      room: {
        include: {
          building: { select: { name: true } },
        },
      },
      assignee: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}
