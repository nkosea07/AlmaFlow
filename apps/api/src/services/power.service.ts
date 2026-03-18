import { prisma } from "@almaflow/database";
import type { GeneratorStatus, FuelAction } from "@almaflow/database";
import { AppError } from "../middleware/error.js";

export async function createGenerator(data: {
  name: string;
  location: string;
  fuelCapacity: number;
  currentFuel: number;
  criticalAreas?: string[];
}) {
  return prisma.generator.create({
    data: {
      name: data.name,
      location: data.location,
      fuelCapacity: data.fuelCapacity,
      currentFuel: data.currentFuel,
      criticalAreas: data.criticalAreas ?? [],
    },
  });
}

export async function listGenerators() {
  return prisma.generator.findMany({
    include: {
      _count: { select: { fuelLogs: true, incidents: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getGenerator(id: string) {
  const gen = await prisma.generator.findUnique({
    where: { id },
    include: {
      fuelLogs: { orderBy: { createdAt: "desc" }, take: 20 },
      incidents: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!gen) throw new AppError(404, "Generator not found");
  return gen;
}

export async function updateGenerator(id: string, data: {
  status?: GeneratorStatus;
  currentFuel?: number;
}) {
  return prisma.generator.update({
    where: { id },
    data,
  });
}

export async function logFuel(loggedBy: string, data: {
  generatorId: string;
  action: FuelAction;
  liters: number;
}) {
  const gen = await prisma.generator.findUnique({ where: { id: data.generatorId } });
  if (!gen) throw new AppError(404, "Generator not found");

  const fuelDelta = data.action === "REFUEL" ? data.liters : -data.liters;
  const newFuel = Math.max(0, Math.min(gen.fuelCapacity, gen.currentFuel + fuelDelta));

  const [log] = await prisma.$transaction([
    prisma.fuelLog.create({
      data: {
        generatorId: data.generatorId,
        action: data.action,
        liters: data.liters,
        loggedBy,
      },
    }),
    prisma.generator.update({
      where: { id: data.generatorId },
      data: { currentFuel: newFuel },
    }),
  ]);

  return log;
}

export async function createPowerIncident(reportedBy: string, data: {
  generatorId?: string;
  description: string;
  affectedAreas?: string[];
}) {
  return prisma.powerIncident.create({
    data: {
      generatorId: data.generatorId,
      description: data.description,
      affectedAreas: data.affectedAreas ?? [],
      reportedBy,
    },
    include: {
      generator: { select: { name: true, location: true } },
    },
  });
}

export async function listPowerIncidents(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [incidents, total] = await Promise.all([
    prisma.powerIncident.findMany({
      skip,
      take: limit,
      include: { generator: { select: { name: true, location: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.powerIncident.count(),
  ]);
  return { incidents, total, page, limit, totalPages: Math.ceil(total / limit) };
}
