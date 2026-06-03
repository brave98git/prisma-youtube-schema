import jwt from "jsonwebtoken";
import type { AuthUser } from "../types.ts";

const tokenExpiry = "7d";

export function signToken(user: AuthUser) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing");
  }

  return jwt.sign(user, secret, { expiresIn: tokenExpiry });
}

export function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing");
  }

  return jwt.verify(token, secret) as AuthUser;
}
