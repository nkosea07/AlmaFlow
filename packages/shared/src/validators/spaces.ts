import { z } from "zod";

export const createSpaceSchema = z.object({
  eventId: z.string().cuid(),
  name: z.string().min(1).max(200),
  type: z.enum(["OUTDOOR", "INDOOR", "PARKING", "CEREMONY", "RECREATION"]),
  capacity: z.number().int().positive().optional(),
  location: z.string().min(1).max(300),
  mapUrl: z.string().url().optional(),
  notes: z.string().max(1000).optional(),
});

export const updateSpaceSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  status: z.enum(["AVAILABLE", "RESERVED", "IN_USE", "UNDER_SETUP", "CLEARED"]).optional(),
  capacity: z.number().int().positive().optional(),
  notes: z.string().max(1000).optional(),
});

export const createStructureSchema = z.object({
  spaceId: z.string().cuid(),
  type: z.string().min(1).max(100),
  dimensions: z.string().max(100).optional(),
  setupBy: z.string().datetime().optional(),
  teardownBy: z.string().datetime().optional(),
});

export type CreateSpaceInput = z.infer<typeof createSpaceSchema>;
export type UpdateSpaceInput = z.infer<typeof updateSpaceSchema>;
export type CreateStructureInput = z.infer<typeof createStructureSchema>;
