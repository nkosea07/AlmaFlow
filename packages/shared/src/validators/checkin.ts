import { z } from "zod";

export const checkInSchema = z.object({
  bookingId: z.string().cuid(),
  method: z.enum(["QR_SELF", "STAFF_ASSISTED", "MOBILE_SELF"]),
});

export const checkOutSchema = z.object({
  bookingId: z.string().cuid(),
  damageNotes: z.string().max(2000).optional(),
  damagePhotos: z.array(z.string()).optional(),
});

export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
