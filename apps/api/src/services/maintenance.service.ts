import { prisma } from "@almaflow/database";
import type { TaskStatus, MaintenanceSeverity } from "@almaflow/database";
import { AppError } from "../middleware/error.js";

export async function createRequest(
  reportedBy: string,
  data: {
    roomId: string;
    severity: MaintenanceSeverity;
    category: string;
    description: string;
  }
) {
  return prisma.maintenanceRequest.create({
    data: {
      roomId: data.roomId,
      reportedBy,
      severity: data.severity,
      category: data.category,
      description: data.description,
    },
    include: {
      room: {
        include: {
          building: { select: { name: true } },
          roomType: { select: { name: true } },
        },
      },
    },
  });
}

export async function listRequests(filters: {
  roomId?: string;
  status?: TaskStatus;
  severity?: MaintenanceSeverity;
  page?: number;
  limit?: number;
}) {
  const { roomId, status, severity, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (roomId) where.roomId = roomId;
  if (status) where.status = status;
  if (severity) where.severity = severity;

  const [requests, total] = await Promise.all([
    prisma.maintenanceRequest.findMany({
      where,
      skip,
      take: limit,
      include: {
        room: {
          include: {
            building: { select: { name: true } },
          },
        },
      },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    }),
    prisma.maintenanceRequest.count({ where }),
  ]);

  return { requests, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getRequest(id: string) {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id },
    include: {
      room: {
        include: {
          building: true,
          roomType: true,
          assets: true,
        },
      },
    },
  });

  if (!request) throw new AppError(404, "Maintenance request not found");
  return request;
}

export async function updateRequest(
  id: string,
  data: {
    status?: TaskStatus;
    assignedTo?: string | null;
    severity?: MaintenanceSeverity;
    estimatedCost?: number;
    actualCost?: number;
  }
) {
  const request = await prisma.maintenanceRequest.findUnique({ where: { id } });
  if (!request) throw new AppError(404, "Maintenance request not found");

  const updateData: Record<string, unknown> = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
  if (data.severity !== undefined) updateData.severity = data.severity;
  if (data.estimatedCost !== undefined) updateData.estimatedCost = data.estimatedCost;
  if (data.actualCost !== undefined) updateData.actualCost = data.actualCost;

  if (data.status === "COMPLETED") {
    updateData.resolvedAt = new Date();
  }

  // If critical, put room out of service
  if (data.severity === "CRITICAL" && request.severity !== "CRITICAL") {
    await prisma.room.update({
      where: { id: request.roomId },
      data: { status: "MAINTENANCE" },
    });
  }

  return prisma.maintenanceRequest.update({
    where: { id },
    data: updateData,
    include: {
      room: {
        include: {
          building: { select: { name: true } },
        },
      },
    },
  });
}
