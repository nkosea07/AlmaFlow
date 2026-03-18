import { z } from "zod";

export const createNotificationSchema = z.object({
  userId: z.string().cuid(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  type: z.enum([
    "BOOKING_CONFIRMATION",
    "CHECK_IN_REMINDER",
    "MEAL_REMINDER",
    "SCHEDULE_UPDATE",
    "EMERGENCY",
    "TASK_ASSIGNED",
    "INCIDENT_UPDATE",
    "SYSTEM",
  ]),
  data: z.record(z.unknown()).optional(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
