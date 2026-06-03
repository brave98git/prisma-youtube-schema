import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { prisma } from "../../db.ts";
import { sendError, sendSuccess } from "../utils/apiResponse.ts";
import { signToken } from "../utils/jwt.ts";

const userSelect = {
  id: true,
  username: true,
  gender: true,
  channelName: true,
  banner: true,
  profilePicture: true,
  subscriberCount: true,
  description: true,
};

export async function register(req: Request, res: Response) {
  const existingUser = await prisma.user.findFirst({
    where: { username: req.body.username },
  });

  if (existingUser) {
    return sendError(res, "Username already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = await prisma.user.create({
    data: {
      ...req.body,
      password: hashedPassword,
    },
    select: userSelect,
  });
  const token = signToken({ id: user.id, username: user.username });

  return sendSuccess(res, "User registered", { user, token }, 201);
}

export async function login(req: Request, res: Response) {
  const user = await prisma.user.findFirst({
    where: { username: req.body.username },
  });

  if (!user) {
    return sendError(res, "Invalid username or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

  if (!isPasswordValid) {
    return sendError(res, "Invalid username or password", 401);
  }

  const token = signToken({ id: user.id, username: user.username });
  const { password, ...safeUser } = user;

  void password;

  return sendSuccess(res, "Login successful", { user: safeUser, token });
}
