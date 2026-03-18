import { Router } from "express";
import { createNotificationSchema } from "@almaflow/shared";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import * as notificationsController from "../controllers/notifications.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", notificationsController.listNotifications);
router.get("/unread-count", notificationsController.getUnreadCount);
router.post("/", authorize("notifications", "CREATE"), validate(createNotificationSchema), notificationsController.createNotification);
router.patch("/:id/read", notificationsController.markAsRead);
router.patch("/read-all", notificationsController.markAllAsRead);

export default router;
