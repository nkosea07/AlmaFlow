import { Router } from "express";
import {
  createRoomSchema,
  updateRoomSchema,
  createBuildingSchema,
  createRoomTypeSchema,
  roomAvailabilityQuerySchema,
} from "@almaflow/shared";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import * as roomsController from "../controllers/rooms.controller.js";

const router = Router();

router.use(authenticate);

// Room CRUD
router.get("/", authorize("rooms", "READ"), roomsController.listRooms);
router.post("/", authorize("rooms", "CREATE"), validate(createRoomSchema), roomsController.createRoom);
router.get("/available", authorize("rooms", "READ"), validate(roomAvailabilityQuerySchema, "query"), roomsController.getAvailableRooms);
router.get("/:id", authorize("rooms", "READ"), roomsController.getRoom);
router.patch("/:id", authorize("rooms", "UPDATE"), validate(updateRoomSchema), roomsController.updateRoom);
router.delete("/:id", authorize("rooms", "DELETE"), roomsController.deleteRoom);

// Buildings
router.get("/buildings/list", authorize("rooms", "READ"), roomsController.listBuildings);
router.post("/buildings", authorize("rooms", "CREATE"), validate(createBuildingSchema), roomsController.createBuilding);

// Room types
router.get("/types/list", authorize("rooms", "READ"), roomsController.listRoomTypes);
router.post("/types", authorize("rooms", "CREATE"), validate(createRoomTypeSchema), roomsController.createRoomType);

export default router;
