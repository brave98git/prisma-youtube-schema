import { Router } from "express";
import { login, register } from "../controllers/auth.controller.ts";
import { validateBody } from "../middlewares/validate.ts";
import { loginSchema, registerSchema } from "../validators/auth.validator.ts";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);

export default router;
