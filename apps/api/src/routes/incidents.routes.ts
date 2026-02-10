import { Router } from "express";
import { createIncidentSchema, updateIncidentSchema } from "@almaflow/shared";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import * as incidentsController from "../controllers/incidents.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("incidents", "READ"), incidentsController.listIncidents);
router.post("/", authorize("incidents", "CREATE"), validate(createIncidentSchema), incidentsController.createIncident);
router.get("/:id", authorize("incidents", "READ"), incidentsController.getIncident);
router.patch("/:id", authorize("incidents", "UPDATE"), validate(updateIncidentSchema), incidentsController.updateIncident);

export default router;
