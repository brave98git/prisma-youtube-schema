import type { Response } from "express";
import { prisma } from "../../db.ts";
import type { AuthRequest } from "../types.ts";
import { sendError, sendSuccess } from "../utils/apiResponse.ts";

export async function getUploads(_req: AuthRequest, res: Response) {
  const uploads = await prisma.uploads.findMany({
    include: {
      user: {
        select: {
          id: true,
          username: true,
          channelName: true,
          profilePicture: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return sendSuccess(res, "Uploads fetched", uploads);
}

export async function getUploadById(req: AuthRequest, res: Response) {
  const uploadId = req.params.id as string;
  const upload = await prisma.uploads.findUnique({
    where: { id: uploadId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          channelName: true,
          profilePicture: true,
        },
      },
    },
  });

  if (!upload) {
    return sendError(res, "Upload not found", 404);
  }

  return sendSuccess(res, "Upload fetched", upload);
}

export async function createUpload(req: AuthRequest, res: Response) {
  const upload = await prisma.uploads.create({
    data: {
      ...req.body,
      userId: req.user!.id,
    },
  });

  return sendSuccess(res, "Upload created", upload, 201);
}

export async function updateUpload(req: AuthRequest, res: Response) {
  const uploadId = req.params.id as string;
  const upload = await prisma.uploads.findUnique({
    where: { id: uploadId },
  });

  if (!upload) {
    return sendError(res, "Upload not found", 404);
  }

  if (upload.userId !== req.user!.id) {
    return sendError(res, "You can update only your own uploads", 403);
  }

  const updatedUpload = await prisma.uploads.update({
    where: { id: uploadId },
    data: req.body,
  });

  return sendSuccess(res, "Upload updated", updatedUpload);
}

export async function deleteUpload(req: AuthRequest, res: Response) {
  const uploadId = req.params.id as string;
  const upload = await prisma.uploads.findUnique({
    where: { id: uploadId },
  });

  if (!upload) {
    return sendError(res, "Upload not found", 404);
  }

  if (upload.userId !== req.user!.id) {
    return sendError(res, "You can delete only your own uploads", 403);
  }

  await prisma.uploads.delete({
    where: { id: uploadId },
  });

  return sendSuccess(res, "Upload deleted");
}
