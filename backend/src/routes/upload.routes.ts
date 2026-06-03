import { Router } from "express";
import {
  createUpload,
  deleteUpload,
  getUploadById,
  getUploads,
  updateUpload,
} from "../controllers/upload.controller.ts";
import { requireAuth } from "../middlewares/auth.middleware.ts";
import { validateBody } from "../middlewares/validate.ts";
import {
  createUploadSchema,
  updateUploadSchema,
} from "../validators/upload.validator.ts";

const router = Router();

router.get("/", getUploads);
router.get("/:id", getUploadById);
router.post("/", requireAuth, validateBody(createUploadSchema), createUpload);
router.patch(
  "/:id",
  requireAuth,
  validateBody(updateUploadSchema),
  updateUpload
);
router.delete("/:id", requireAuth, deleteUpload);

export default router;
