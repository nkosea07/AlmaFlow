import { Router } from "express";
import { checkInSchema, checkOutSchema } from "@almaflow/shared";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import * as checkinController from "../controllers/checkin.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("bookings", "READ"), checkinController.listCheckIns);
router.post("/in", authorize("bookings", "UPDATE"), validate(checkInSchema), checkinController.checkIn);
router.post("/out", authorize("bookings", "UPDATE"), validate(checkOutSchema), checkinController.checkOut);
router.get("/:bookingId", authorize("bookings", "READ"), checkinController.getCheckIn);

export default router;
