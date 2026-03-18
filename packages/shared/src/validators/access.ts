import { z } from "zod";

export const issueBadgeSchema = z.object({
  userId: z.string().cuid(),
  type: z.enum(["ALUMNI", "STAFF", "VIP", "VENDOR"]),
  nfcTag: z.string().max(200).optional(),
});

export const scanBadgeSchema = z.object({
  qrCode: z.string().min(1),
  location: z.string().min(1).max(200),
  action: z.enum(["ENTRY", "EXIT", "MEAL_SCAN", "SESSION_SCAN"]),
});

export type IssueBadgeInput = z.infer<typeof issueBadgeSchema>;
export type ScanBadgeInput = z.infer<typeof scanBadgeSchema>;
