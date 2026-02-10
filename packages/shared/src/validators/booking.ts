import { z } from "zod";

export const createBookingSchema = z
  .object({
    eventId: z.string().cuid(),
    roomId: z.string().cuid().optional(),
    arrivalDate: z.string().datetime(),
    departureDate: z.string().datetime(),
    specialRequirements: z.string().max(1000).optional(),
    groupBookingId: z.string().cuid().optional(),
  })
  .refine((data) => new Date(data.departureDate) > new Date(data.arrivalDate), {
    message: "Departure date must be after arrival date",
    path: ["departureDate"],
  });

export const updateBookingSchema = z.object({
  roomId: z.string().cuid().optional().nullable(),
  status: z
    .enum(["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED", "NO_SHOW"])
    .optional(),
  arrivalDate: z.string().datetime().optional(),
  departureDate: z.string().datetime().optional(),
  specialRequirements: z.string().max(1000).optional(),
});

export const assignRoomSchema = z.object({
  roomId: z.string().cuid(),
});

export const createGroupBookingSchema = z.object({
  name: z.string().min(1).max(200),
  contactId: z.string().cuid(),
  bookingIds: z.array(z.string().cuid()).min(1),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type AssignRoomInput = z.infer<typeof assignRoomSchema>;
export type CreateGroupBookingInput = z.infer<typeof createGroupBookingSchema>;
