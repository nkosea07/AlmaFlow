import { prisma } from "@almaflow/database";
import type { ScanMethod } from "@almaflow/database";
import { AppError } from "../middleware/error.js";

export async function createMeal(data: {
  eventId: string;
  name: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  venue?: string;
  costPerHead?: number;
  maxCapacity?: number;
}) {
  return prisma.meal.create({
    data: {
      eventId: data.eventId,
      name: data.name,
      type: data.type as any,
      date: new Date(data.date),
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      venue: data.venue,
      costPerHead: data.costPerHead ?? 10.0,
      maxCapacity: data.maxCapacity,
    },
    include: {
      event: { select: { id: true, name: true } },
      _count: { select: { entitlements: true, redemptions: true } },
    },
  });
}

export async function listMeals(filters: {
  eventId?: string;
  type?: string;
  date?: string;
  page?: number;
  limit?: number;
}) {
  const { eventId, type, date, page = 1, limit = 50 } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (eventId) where.eventId = eventId;
  if (type) where.type = type;
  if (date) {
    const d = new Date(date);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    where.date = { gte: d, lt: next };
  }

  const [meals, total] = await Promise.all([
    prisma.meal.findMany({
      where,
      skip,
      take: limit,
      include: {
        event: { select: { id: true, name: true } },
        _count: { select: { entitlements: true, redemptions: true } },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
    prisma.meal.count({ where }),
  ]);

  return { meals, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getMeal(id: string) {
  const meal = await prisma.meal.findUnique({
    where: { id },
    include: {
      event: { select: { id: true, name: true } },
      entitlements: {
        include: {
          booking: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
      },
      redemptions: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!meal) throw new AppError(404, "Meal not found");
  return meal;
}

export async function redeemMeal(data: {
  mealId: string;
  userId: string;
  method: ScanMethod;
  scannedBy?: string;
  isOffline?: boolean;
}) {
  // Check entitlement
  const entitlement = await prisma.mealEntitlement.findFirst({
    where: {
      mealId: data.mealId,
      booking: { userId: data.userId, status: { in: ["CONFIRMED", "CHECKED_IN"] } },
    },
  });

  if (!entitlement) {
    throw new AppError(403, "Guest is not entitled to this meal");
  }

  if (entitlement.isRedeemed) {
    throw new AppError(409, "Meal has already been redeemed");
  }

  // Check for duplicate redemption
  const existing = await prisma.mealRedemption.findUnique({
    where: { mealId_userId: { mealId: data.mealId, userId: data.userId } },
  });

  if (existing) {
    throw new AppError(409, "Meal has already been redeemed by this guest");
  }

  const [redemption] = await prisma.$transaction([
    prisma.mealRedemption.create({
      data: {
        mealId: data.mealId,
        userId: data.userId,
        method: data.method,
        scannedBy: data.scannedBy,
        isOffline: data.isOffline ?? false,
      },
      include: {
        meal: { select: { name: true, type: true } },
        user: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.mealEntitlement.update({
      where: { id: entitlement.id },
      data: { isRedeemed: true },
    }),
  ]);

  return redemption;
}

export async function getMealStats(mealId: string) {
  const [meal, totalEntitlements, totalRedemptions] = await Promise.all([
    prisma.meal.findUnique({ where: { id: mealId } }),
    prisma.mealEntitlement.count({ where: { mealId } }),
    prisma.mealRedemption.count({ where: { mealId } }),
  ]);

  if (!meal) throw new AppError(404, "Meal not found");

  return {
    meal,
    totalEntitlements,
    totalRedemptions,
    remaining: totalEntitlements - totalRedemptions,
    redemptionRate: totalEntitlements > 0
      ? Math.round((totalRedemptions / totalEntitlements) * 100)
      : 0,
  };
}
