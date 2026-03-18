import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import * as reportingController from "../controllers/reporting.controller.js";

const router = Router();

router.use(authenticate);

router.get("/dashboard", authorize("reports", "READ"), reportingController.getDashboardStats);
router.get("/financial", authorize("reports", "READ"), reportingController.getFinancialReport);
router.get("/occupancy", authorize("reports", "READ"), reportingController.getOccupancyReport);
router.get("/incidents", authorize("reports", "READ"), reportingController.getIncidentReport);

export default router;
