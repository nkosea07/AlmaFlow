import { prisma } from "@almaflow/database";
import type { BadgeType, AccessAction } from "@almaflow/database";
import { randomBytes } from "crypto";
import { AppError } from "../middleware/error.js";

export async function issueBadge(data: {
  userId: string;
  type: BadgeType;
  nfcTag?: string;
}) {
  // Check if user already has an active badge
  const existing = await prisma.badge.findFirst({
    where: { userId: data.userId, isActive: true },
  });

  if (existing) {
    throw new AppError(409, "User already has an active badge. Revoke it first.");
  }

  const qrCode = `ALMA-${randomBytes(16).toString("hex").toUpperCase()}`;

  return prisma.badge.create({
    data: {
      userId: data.userId,
      type: data.type,
      qrCode,
      nfcTag: data.nfcTag,
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });
}

export async function revokeBadge(id: string) {
  return prisma.badge.update({
    where: { id },
    data: { isActive: false, revokedAt: new Date() },
  });
}

export async function scanBadge(
  scannedBy: string,
  data: {
    qrCode: string;
    location: string;
    action: AccessAction;
  }
) {
  const badge = await prisma.badge.findUnique({
    where: { qrCode: data.qrCode },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!badge) {
    throw new AppError(404, "Badge not found");
  }

  const granted = badge.isActive;

  const log = await prisma.accessLog.create({
    data: {
      badgeId: badge.id,
      userId: badge.userId,
      location: data.location,
      action: data.action,
      granted,
      scannedBy,
    },
    include: {
      badge: { select: { qrCode: true, type: true } },
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return { log, granted, badge };
}

export async function listBadges(filters: {
  type?: BadgeType;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) {
  const { type, isActive, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (isActive !== undefined) where.isActive = isActive;

  const [badges, total] = await Promise.all([
    prisma.badge.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { accessLogs: true } },
      },
      orderBy: { issuedAt: "desc" },
    }),
    prisma.badge.count({ where }),
  ]);

  return { badges, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function listAccessLogs(filters: {
  badgeId?: string;
  userId?: string;
  location?: string;
  page?: number;
  limit?: number;
}) {
  const { badgeId, userId, location, page = 1, limit = 50 } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (badgeId) where.badgeId = badgeId;
  if (userId) where.userId = userId;
  if (location) where.location = { contains: location, mode: "insensitive" };

  const [logs, total] = await Promise.all([
    prisma.accessLog.findMany({
      where,
      skip,
      take: limit,
      include: {
        badge: { select: { qrCode: true, type: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { scannedAt: "desc" },
    }),
    prisma.accessLog.count({ where }),
  ]);

  return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
}
