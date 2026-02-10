import { z } from "zod";

export const createHousekeepingTaskSchema = z.object({
  roomId: z.string().cuid(),
  assigneeId: z.string().cuid().optional(),
  type: z.enum([
    "DAILY_CLEAN",
    "TURNOVER_CLEAN",
    "INSPECTION",
    "DEEP_CLEAN",
    "LINEN_CHANGE",
  ]),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  notes: z.string().max(1000).optional(),
  scheduledAt: z.string().datetime().optional(),
});

export const updateHousekeepingTaskSchema = z.object({
  assigneeId: z.string().cuid().optional().nullable(),
  status: z
    .enum(["PENDING", "IN_PROGRESS", "COMPLETED", "ESCALATED", "CANCELLED"])
    .optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  notes: z.string().max(1000).optional(),
});

export type CreateHousekeepingTaskInput = z.infer<typeof createHousekeepingTaskSchema>;
export type UpdateHousekeepingTaskInput = z.infer<typeof updateHousekeepingTaskSchema>;
