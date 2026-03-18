import { Router } from "express";
import { createSpaceSchema, updateSpaceSchema, createStructureSchema } from "@almaflow/shared";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import * as spacesController from "../controllers/spaces.controller.js";

const router = Router();

router.use(authenticate);

// Spaces
router.get("/", authorize("spaces", "READ"), spacesController.listSpaces);
router.post("/", authorize("spaces", "CREATE"), validate(createSpaceSchema), spacesController.createSpace);
router.get("/:id", authorize("spaces", "READ"), spacesController.getSpace);
router.patch("/:id", authorize("spaces", "UPDATE"), validate(updateSpaceSchema), spacesController.updateSpace);

// Structures
router.post("/structures", authorize("spaces", "CREATE"), validate(createStructureSchema), spacesController.createStructure);
router.patch("/structures/:id/status", authorize("spaces", "UPDATE"), spacesController.updateStructureStatus);

export default router;
