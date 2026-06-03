import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { sendError } from "../utils/apiResponse.ts";

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues.map(issue => issue.message).join(", ");
      return sendError(res, message, 400);
    }

    req.body = result.data;
    return next();
  };
}
