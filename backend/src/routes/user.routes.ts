import { Router } from "express";
import {
  getProfile,
  getUserById,
  getUsers,
  updateProfile,
} from "../controllers/user.controller.ts";
import { requireAuth } from "../middlewares/auth.middleware.ts";
import { validateBody } from "../middlewares/validate.ts";
import { updateUserSchema } from "../validators/user.validator.ts";

const router = Router();

router.get("/", getUsers);
router.get("/me", requireAuth, getProfile);
router.patch("/me", requireAuth, validateBody(updateUserSchema), updateProfile);
router.get("/:id", getUserById);

export default router;
