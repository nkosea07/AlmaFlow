import { prisma } from "@almaflow/database";

export async function getDashboardStats(eventId?: string) {
  const bookingWhere = eventId ? { eventId } : {};
  const roomWhere = eventId ? { building: { eventId } } : {};

  const [
    totalBookings,
    confirmedBookings,
    checkedInBookings,
    totalRooms,
    occupiedRooms,
    availableRooms,
    maintenanceRooms,
    totalMealsServed,
    openIncidents,
    pendingHousekeeping,
    pendingMaintenance,
  ] = await Promise.all([
    prisma.booking.count({ where: bookingWhere }),
    prisma.booking.count({ where: { ...bookingWhere, status: "CONFIRMED" } }),
    prisma.booking.count({ where: { ...bookingWhere, status: "CHECKED_IN" } }),
    prisma.room.count({ where: roomWhere }),
    prisma.room.count({ where: { ...roomWhere, status: "OCCUPIED" } }),
    prisma.room.count({ where: { ...roomWhere, status: "AVAILABLE" } }),
    prisma.room.count({ where: { ...roomWhere, status: "MAINTENANCE" } }),
    prisma.mealRedemption.count(),
    prisma.incident.count({ where: { status: { in: ["OPEN", "INVESTIGATING", "ESCALATED"] } } }),
    prisma.housekeepingTask.count({ where: { status: { in: ["PENDING", "IN_PROGRESS"] } } }),
    prisma.maintenanceRequest.count({ where: { status: { in: ["PENDING", "IN_PROGRESS"] } } }),
  ]);

  return {
    bookings: { total: totalBookings, confirmed: confirmedBookings, checkedIn: checkedInBookings },
    rooms: { total: totalRooms, occupied: occupiedRooms, available: availableRooms, maintenance: maintenanceRooms },
    meals: { served: totalMealsServed },
    incidents: { open: openIncidents },
    housekeeping: { pending: pendingHousekeeping },
    maintenance: { pending: pendingMaintenance },
  };
}

export async function getFinancialReport(eventId?: string) {
  const mealWhere = eventId ? { eventId } : {};

  const [meals, redemptionCount, bookingCount] = await Promise.all([
    prisma.meal.findMany({ where: mealWhere, select: { costPerHead: true } }),
    prisma.mealRedemption.count(),
    prisma.booking.count({ where: eventId ? { eventId, status: { notIn: ["CANCELLED", "NO_SHOW"] } } : { status: { notIn: ["CANCELLED", "NO_SHOW"] } } }),
  ]);

  const avgCostPerHead = meals.length > 0
    ? meals.reduce((sum, m) => sum + m.costPerHead, 0) / meals.length
    : 10;

  const totalCateringCost = redemptionCount * avgCostPerHead;

  const maintenanceRequests = await prisma.maintenanceRequest.findMany({
    where: { status: "COMPLETED", actualCost: { not: null } },
    select: { actualCost: true, estimatedCost: true },
  });

  const totalMaintenanceCost = maintenanceRequests.reduce((sum, r) => sum + (r.actualCost ?? 0), 0);
  const totalEstimatedMaintenance = maintenanceRequests.reduce((sum, r) => sum + (r.estimatedCost ?? 0), 0);

  return {
    catering: {
      totalMealsServed: redemptionCount,
      avgCostPerHead,
      totalCost: totalCateringCost,
    },
    maintenance: {
      completedRequests: maintenanceRequests.length,
      totalActualCost: totalMaintenanceCost,
      totalEstimatedCost: totalEstimatedMaintenance,
    },
    guests: {
      totalBookings: bookingCount,
      costPerGuest: bookingCount > 0
        ? (totalCateringCost + totalMaintenanceCost) / bookingCount
        : 0,
    },
  };
}

export async function getOccupancyReport(eventId?: string) {
  const roomWhere = eventId ? { building: { eventId } } : {};

  const rooms = await prisma.room.groupBy({
    by: ["status"],
    where: roomWhere,
    _count: true,
  });

  const cleanStatus = await prisma.room.groupBy({
    by: ["cleanStatus"],
    where: roomWhere,
    _count: true,
  });

  return {
    byStatus: rooms.map((r) => ({ status: r.status, count: r._count })),
    byCleanStatus: cleanStatus.map((c) => ({ status: c.cleanStatus, count: c._count })),
  };
}

export async function getIncidentReport() {
  const byType = await prisma.incident.groupBy({
    by: ["type"],
    _count: true,
  });

  const byStatus = await prisma.incident.groupBy({
    by: ["status"],
    _count: true,
  });

  const bySeverity = await prisma.incident.groupBy({
    by: ["severity"],
    _count: true,
  });

  return {
    byType: byType.map((t) => ({ type: t.type, count: t._count })),
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
    bySeverity: bySeverity.map((s) => ({ severity: s.severity, count: s._count })),
  };
}
