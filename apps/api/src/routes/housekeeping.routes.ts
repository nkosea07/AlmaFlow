import { Router } from "express";
import { createHousekeepingTaskSchema, updateHousekeepingTaskSchema } from "@almaflow/shared";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import * as housekeepingController from "../controllers/housekeeping.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("housekeeping", "READ"), housekeepingController.listTasks);
router.post("/", authorize("housekeeping", "CREATE"), validate(createHousekeepingTaskSchema), housekeepingController.createTask);
router.get("/:id", authorize("housekeeping", "READ"), housekeepingController.getTask);
router.patch("/:id", authorize("housekeeping", "UPDATE"), validate(updateHousekeepingTaskSchema), housekeepingController.updateTask);

export default router;
