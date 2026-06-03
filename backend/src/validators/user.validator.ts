import { z } from "zod";

export const updateUserSchema = z.object({
  channelName: z.string().trim().min(2).optional(),
  banner: z.string().url().nullable().optional(),
  profilePicture: z.string().url().nullable().optional(),
  description: z.string().trim().nullable().optional(),
});
