import { Router } from "express";
import { createInventoryItemSchema, updateInventoryItemSchema, inventoryLogSchema } from "@almaflow/shared";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import * as inventoryController from "../controllers/inventory.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("inventory", "READ"), inventoryController.listItems);
router.post("/", authorize("inventory", "CREATE"), validate(createInventoryItemSchema), inventoryController.createItem);
router.get("/:id", authorize("inventory", "READ"), inventoryController.getItem);
router.patch("/:id", authorize("inventory", "UPDATE"), validate(updateInventoryItemSchema), inventoryController.updateItem);
router.post("/log", authorize("inventory", "UPDATE"), validate(inventoryLogSchema), inventoryController.logAction);

export default router;
