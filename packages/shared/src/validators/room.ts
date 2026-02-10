import { z } from "zod";

export const createRoomSchema = z.object({
  number: z.string().min(1).max(20),
  buildingId: z.string().cuid(),
  roomTypeId: z.string().cuid(),
  floor: z.number().int().min(0).default(1),
  notes: z.string().max(500).optional(),
});

export const updateRoomSchema = z.object({
  number: z.string().min(1).max(20).optional(),
  floor: z.number().int().min(0).optional(),
  status: z
    .enum(["AVAILABLE", "OCCUPIED", "RESERVED", "OUT_OF_SERVICE", "MAINTENANCE"])
    .optional(),
  cleanStatus: z.enum(["CLEAN", "DIRTY", "IN_PROGRESS", "INSPECTED"]).optional(),
  notes: z.string().max(500).optional(),
});

export const createBuildingSchema = z.object({
  name: z.string().min(1).max(200),
  eventId: z.string().cuid(),
  floors: z.number().int().min(1).default(1),
  location: z.string().max(500).optional(),
});

export const createRoomTypeSchema = z.object({
  name: z.string().min(1).max(100),
  capacity: z.number().int().min(1),
});

export const roomAvailabilityQuerySchema = z.object({
  eventId: z.string().cuid(),
  arrivalDate: z.string().datetime(),
  departureDate: z.string().datetime(),
  roomTypeId: z.string().cuid().optional(),
  buildingId: z.string().cuid().optional(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type CreateBuildingInput = z.infer<typeof createBuildingSchema>;
export type CreateRoomTypeInput = z.infer<typeof createRoomTypeSchema>;
export type RoomAvailabilityQuery = z.infer<typeof roomAvailabilityQuerySchema>;
