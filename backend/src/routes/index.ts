import { Router } from "express";
import authRoutes from "./auth.routes.ts";
import uploadRoutes from "./upload.routes.ts";
import userRoutes from "./user.routes.ts";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Backend is running",
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/uploads", uploadRoutes);

export default router;
