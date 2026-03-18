import { z } from "zod";

export const createGeneratorSchema = z.object({
  name: z.string().min(1).max(200),
  location: z.string().min(1).max(300),
  fuelCapacity: z.number().positive(),
  currentFuel: z.number().min(0),
  criticalAreas: z.array(z.string()).default([]),
});

export const updateGeneratorSchema = z.object({
  status: z.enum(["ACTIVE", "STANDBY", "MAINTENANCE", "OFFLINE"]).optional(),
  currentFuel: z.number().min(0).optional(),
});

export const fuelLogSchema = z.object({
  generatorId: z.string().cuid(),
  action: z.enum(["REFUEL", "CONSUMPTION_LOG"]),
  liters: z.number().positive(),
});

export const powerIncidentSchema = z.object({
  generatorId: z.string().cuid().optional(),
  description: z.string().min(1).max(2000),
  affectedAreas: z.array(z.string()).default([]),
});

export type CreateGeneratorInput = z.infer<typeof createGeneratorSchema>;
export type UpdateGeneratorInput = z.infer<typeof updateGeneratorSchema>;
export type FuelLogInput = z.infer<typeof fuelLogSchema>;
export type PowerIncidentInput = z.infer<typeof powerIncidentSchema>;
