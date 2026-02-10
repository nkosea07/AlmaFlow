import { z } from "zod";

export const createMealSchema = z.object({
  eventId: z.string().cuid(),
  name: z.string().min(1).max(200),
  type: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK", "REFRESHMENTS"]),
  date: z.string().datetime(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  venue: z.string().max(200).optional(),
  costPerHead: z.number().positive().default(10.0),
  maxCapacity: z.number().int().positive().optional(),
});

export const redeemMealSchema = z.object({
  mealId: z.string().cuid(),
  userId: z.string().cuid(),
  method: z.enum(["QR_CODE", "NFC", "MANUAL"]),
  isOffline: z.boolean().default(false),
});

export const updateMealEntitlementSchema = z.object({
  dietaryRequirements: z.array(z.string()).optional(),
});

export type CreateMealInput = z.infer<typeof createMealSchema>;
export type RedeemMealInput = z.infer<typeof redeemMealSchema>;
export type UpdateMealEntitlementInput = z.infer<typeof updateMealEntitlementSchema>;
