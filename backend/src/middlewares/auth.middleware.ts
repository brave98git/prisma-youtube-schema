import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../types.ts";
import { sendError } from "../utils/apiResponse.ts";
import { verifyToken } from "../utils/jwt.ts";

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return sendError(res, "Authorization token is required", 401);
  }

  try {
    req.user = verifyToken(header.replace("Bearer ", ""));
    return next();
  } catch {
    return sendError(res, "Invalid or expired token", 401);
  }
}
