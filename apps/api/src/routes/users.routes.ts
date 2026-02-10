import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import * as usersController from "../controllers/users.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("users", "READ"), usersController.listUsers);
router.get("/:id", usersController.getUser);
router.patch("/:id", usersController.updateUser);
router.post("/:userId/roles", authorize("users", "UPDATE"), usersController.assignRole);
router.delete("/:userId/roles", authorize("users", "UPDATE"), usersController.removeRole);

export default router;
