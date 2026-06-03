import { z } from "zod";

export const createUploadSchema = z.object({
  videoUrl: z.string().url(),
  thumbnail: z.string().url(),
});

export const updateUploadSchema = createUploadSchema.partial().refine(
  data => Object.keys(data).length > 0,
  "At least one field is required",
);
