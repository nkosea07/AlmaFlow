import { z } from "zod";

export const createMaintenanceRequestSchema = z.object({
  roomId: z.string().cuid(),
  severity: z.enum(["MINOR", "MAJOR", "CRITICAL"]),
  category: z.string().min(1).max(100),
  description: z.string().min(1).max(5000),
});

export const updateMaintenanceRequestSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "ESCALATED", "CANCELLED"]).optional(),
  assignedTo: z.string().cuid().optional().nullable(),
  severity: z.enum(["MINOR", "MAJOR", "CRITICAL"]).optional(),
  estimatedCost: z.number().min(0).optional(),
  actualCost: z.number().min(0).optional(),
  resolution: z.string().max(5000).optional(),
});

export type CreateMaintenanceRequestInput = z.infer<typeof createMaintenanceRequestSchema>;
export type UpdateMaintenanceRequestInput = z.infer<typeof updateMaintenanceRequestSchema>;
