import { Router } from "express";
import { createEventSchema, updateEventSchema, createScheduleItemSchema } from "@almaflow/shared";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import * as eventsController from "../controllers/events.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("events", "READ"), eventsController.listEvents);
router.post("/", authorize("events", "CREATE"), validate(createEventSchema), eventsController.createEvent);
router.get("/:id", authorize("events", "READ"), eventsController.getEvent);
router.patch("/:id", authorize("events", "UPDATE"), validate(updateEventSchema), eventsController.updateEvent);

// Schedule items
router.get("/:eventId/schedule", authorize("events", "READ"), eventsController.listScheduleItems);
router.post("/schedule", authorize("events", "CREATE"), validate(createScheduleItemSchema), eventsController.createScheduleItem);
router.delete("/schedule/:id", authorize("events", "DELETE"), eventsController.deleteScheduleItem);

export default router;
