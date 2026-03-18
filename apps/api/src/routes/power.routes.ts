import { Router } from "express";
import { createGeneratorSchema, updateGeneratorSchema, fuelLogSchema, powerIncidentSchema } from "@almaflow/shared";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import * as powerController from "../controllers/power.controller.js";

const router = Router();

router.use(authenticate);

// Generators
router.get("/generators", authorize("power", "READ"), powerController.listGenerators);
router.post("/generators", authorize("power", "CREATE"), validate(createGeneratorSchema), powerController.createGenerator);
router.get("/generators/:id", authorize("power", "READ"), powerController.getGenerator);
router.patch("/generators/:id", authorize("power", "UPDATE"), validate(updateGeneratorSchema), powerController.updateGenerator);

// Fuel
router.post("/fuel", authorize("power", "CREATE"), validate(fuelLogSchema), powerController.logFuel);

// Power incidents
router.get("/incidents", authorize("power", "READ"), powerController.listPowerIncidents);
router.post("/incidents", authorize("power", "CREATE"), validate(powerIncidentSchema), powerController.createPowerIncident);

export default router;
