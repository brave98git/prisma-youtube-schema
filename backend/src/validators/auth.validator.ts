import { z } from "zod";

const genderSchema = z.enum(["MALE", "FEMALE", "OTHER"]);

export const registerSchema = z.object({
  username: z.string().trim().min(3),
  password: z.string().min(6),
  gender: genderSchema,
  channelName: z.string().trim().min(2),
  banner: z.string().url().optional(),
  profilePicture: z.string().url().optional(),
  description: z.string().trim().optional(),
});

export const loginSchema = z.object({
  username: z.string().trim().min(3),
  password: z.string().min(1),
});
