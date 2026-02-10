import { prisma } from "@almaflow/database";
import type { IncidentStatus, Priority, IncidentType } from "@almaflow/database";
import { AppError } from "../middleware/error.js";

export async function createIncident(
  reporterId: string,
  data: {
    type: IncidentType;
    severity: Priority;
    title: string;
    description: string;
    location?: string;
  }
) {
  return prisma.incident.create({
    data: {
      reporterId,
      type: data.type,
      severity: data.severity,
      title: data.title,
      description: data.description,
      location: data.location,
    },
    include: {
      reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });
}

export async function listIncidents(filters: {
  type?: IncidentType;
  status?: IncidentStatus;
  severity?: Priority;
  page?: number;
  limit?: number;
}) {
  const { type, status, severity, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (status) where.status = status;
  if (severity) where.severity = severity;

  const [incidents, total] = await Promise.all([
    prisma.incident.findMany({
      where,
      skip,
      take: limit,
      include: {
        reporter: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.incident.count({ where }),
  ]);

  return { incidents, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getIncident(id: string) {
  const incident = await prisma.incident.findUnique({
    where: { id },
    include: {
      reporter: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
    },
  });

  if (!incident) throw new AppError(404, "Incident not found");
  return incident;
}

export async function updateIncident(
  id: string,
  data: {
    status?: IncidentStatus;
    assignedTo?: string | null;
    resolution?: string;
    severity?: Priority;
  }
) {
  const updateData: Record<string, unknown> = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
  if (data.severity !== undefined) updateData.severity = data.severity;
  if (data.resolution !== undefined) updateData.resolution = data.resolution;

  if (data.status === "RESOLVED" || data.status === "CLOSED") {
    updateData.resolvedAt = new Date();
  }

  return prisma.incident.update({
    where: { id },
    data: updateData,
    include: {
      reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });
}
