import { Router } from "express";
import { createMaintenanceRequestSchema, updateMaintenanceRequestSchema } from "@almaflow/shared";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import * as maintenanceController from "../controllers/maintenance.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("maintenance", "READ"), maintenanceController.listRequests);
router.post("/", authorize("maintenance", "CREATE"), validate(createMaintenanceRequestSchema), maintenanceController.createRequest);
router.get("/:id", authorize("maintenance", "READ"), maintenanceController.getRequest);
router.patch("/:id", authorize("maintenance", "UPDATE"), validate(updateMaintenanceRequestSchema), maintenanceController.updateRequest);

export default router;
