import { Router } from "express";
import { createMealSchema, redeemMealSchema } from "@almaflow/shared";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import * as mealsController from "../controllers/meals.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("meals", "READ"), mealsController.listMeals);
router.post("/", authorize("meals", "CREATE"), validate(createMealSchema), mealsController.createMeal);
router.get("/:id", authorize("meals", "READ"), mealsController.getMeal);
router.get("/:id/stats", authorize("meals", "READ"), mealsController.getMealStats);
router.post("/redeem", authorize("meal_redemptions", "CREATE"), validate(redeemMealSchema), mealsController.redeemMeal);

export default router;
