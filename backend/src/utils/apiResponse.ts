import type { Response } from "express";

export function sendSuccess(res: Response, message: string, data?: unknown, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(res: Response, message: string, statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    message,
  });
}
