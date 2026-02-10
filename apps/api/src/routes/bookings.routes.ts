import { Router } from "express";
import {
  createBookingSchema,
  updateBookingSchema,
  assignRoomSchema,
  createGroupBookingSchema,
} from "@almaflow/shared";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import * as bookingsController from "../controllers/bookings.controller.js";

const router = Router();

router.use(authenticate);

// Booking CRUD
router.get("/", authorize("bookings", "READ"), bookingsController.listBookings);
router.post("/", authorize("bookings", "CREATE"), validate(createBookingSchema), bookingsController.createBooking);
router.get("/:id", authorize("bookings", "READ"), bookingsController.getBooking);
router.patch("/:id", authorize("bookings", "UPDATE"), validate(updateBookingSchema), bookingsController.updateBooking);

// Room assignment & cancellation
router.post("/:id/assign-room", authorize("bookings", "UPDATE"), validate(assignRoomSchema), bookingsController.assignRoom);
router.post("/:id/cancel", authorize("bookings", "UPDATE"), bookingsController.cancelBooking);

// Auto-assign rooms for an event
router.post("/events/:eventId/auto-assign", authorize("bookings", "UPDATE"), bookingsController.autoAssignRooms);

// Group bookings
router.post("/groups", authorize("bookings", "CREATE"), validate(createGroupBookingSchema), bookingsController.createGroupBooking);

export default router;
