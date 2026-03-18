import { Router } from "express";
import { issueBadgeSchema, scanBadgeSchema } from "@almaflow/shared";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import * as accessController from "../controllers/access.controller.js";

const router = Router();

router.use(authenticate);

// Badges
router.get("/badges", authorize("access", "READ"), accessController.listBadges);
router.post("/badges", authorize("access", "CREATE"), validate(issueBadgeSchema), accessController.issueBadge);
router.post("/badges/:id/revoke", authorize("access", "UPDATE"), accessController.revokeBadge);

// Scanning
router.post("/scan", authorize("access", "CREATE"), validate(scanBadgeSchema), accessController.scanBadge);

// Access logs
router.get("/logs", authorize("access", "READ"), accessController.listAccessLogs);

export default router;
