import type { Response } from "express";
import { prisma } from "../../db.ts";
import type { AuthRequest } from "../types.ts";
import { sendError, sendSuccess } from "../utils/apiResponse.ts";

const userSelect = {
  id: true,
  username: true,
  gender: true,
  channelName: true,
  banner: true,
  profilePicture: true,
  subscriberCount: true,
  description: true,
  uploads: true,
};

export async function getUsers(_req: AuthRequest, res: Response) {
  const users = await prisma.user.findMany({
    select: userSelect,
    orderBy: { channelName: "asc" },
  });

  return sendSuccess(res, "Users fetched", users);
}

export async function getUserById(req: AuthRequest, res: Response) {
  const userId = req.params.id as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });

  if (!user) {
    return sendError(res, "User not found", 404);
  }

  return sendSuccess(res, "User fetched", user);
}

export async function getProfile(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: userSelect,
  });

  if (!user) {
    return sendError(res, "User not found", 404);
  }

  return sendSuccess(res, "Profile fetched", user);
}

export async function updateProfile(req: AuthRequest, res: Response) {
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: req.body,
    select: userSelect,
  });

  return sendSuccess(res, "Profile updated", user);
}
