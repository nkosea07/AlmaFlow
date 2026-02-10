import { z } from "zod";

export const createIncidentSchema = z.object({
  type: z.enum([
    "GUEST_COMPLAINT",
    "SECURITY",
    "MAINTENANCE",
    "MEDICAL",
    "CATERING",
    "OTHER",
  ]),
  severity: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  location: z.string().max(200).optional(),
});

export const updateIncidentSchema = z.object({
  status: z
    .enum(["OPEN", "INVESTIGATING", "RESOLVED", "CLOSED", "ESCALATED"])
    .optional(),
  assignedTo: z.string().cuid().optional().nullable(),
  resolution: z.string().max(5000).optional(),
  severity: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
