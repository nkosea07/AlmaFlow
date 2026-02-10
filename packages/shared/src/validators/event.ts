import { z } from "zod";

export const createEventSchema = z.object({
  name: z.string().min(1).max(200),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  venue: z.string().min(1).max(300),
  description: z.string().max(5000).optional(),
});

export const updateEventSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  venue: z.string().min(1).max(300).optional(),
  description: z.string().max(5000).optional(),
  isActive: z.boolean().optional(),
});

export const createScheduleItemSchema = z.object({
  eventId: z.string().cuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  location: z.string().max(300).optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  category: z.string().max(100).optional(),
  isRequired: z.boolean().default(false),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateScheduleItemInput = z.infer<typeof createScheduleItemSchema>;
