import { Request, Response } from 'express';
import { z } from 'zod';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';
import { asyncHandler, ApiError } from '../middleware/errorHandler';

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

const uploadSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().optional().default('application/octet-stream'),
  fileBase64: z.string().min(1),
});

const ALLOWED_MIME_PREFIXES = ['image/', 'application/pdf'];
const ALLOWED_EXACT_TYPES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function humanFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  const parsed = uploadSchema.parse(req.body);

  const isAllowedType =
    ALLOWED_MIME_PREFIXES.some((prefix) => parsed.fileType.startsWith(prefix)) ||
    ALLOWED_EXACT_TYPES.includes(parsed.fileType);
  if (!isAllowedType) {
    throw new ApiError(400, 'Unsupported file type. Please upload a PDF, Word document, or image.');
  }

  const commaIndex = parsed.fileBase64.indexOf(',');
  const base64Data = commaIndex >= 0 ? parsed.fileBase64.slice(commaIndex + 1) : parsed.fileBase64;
  const buffer = Buffer.from(base64Data, 'base64');

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new ApiError(400, 'File is too large. Maximum size is 10 MB.');
  }

  const uploadResult = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', folder: 'docpulse', type: 'authenticated' },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });

  const proxyUrl = `/api/attachments/${encodeURIComponent(uploadResult.public_id)}?rt=${uploadResult.resource_type}`;

  return res.status(201).json({
    success: true,
    url: proxyUrl,
    name: parsed.fileName,
    size: humanFileSize(buffer.length),
    type: parsed.fileType,
  });
});
const AVATAR_MAX_SIZE_BYTES = 3 * 1024 * 1024;

export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  const parsed = uploadSchema.parse(req.body);

  if (!parsed.fileType.startsWith('image/')) {
    throw new ApiError(400, 'Profile pictures must be an image file.');
  }

  const commaIndex = parsed.fileBase64.indexOf(',');
  const base64Data = commaIndex >= 0 ? parsed.fileBase64.slice(commaIndex + 1) : parsed.fileBase64;
  const buffer = Buffer.from(base64Data, 'base64');

  if (buffer.length > AVATAR_MAX_SIZE_BYTES) {
    throw new ApiError(400, 'Profile picture is too large. Maximum size is 3 MB.');
  }

  // Unlike medical attachments, avatars are stored as plain public images -
  // they need to render on public pages (doctor directory, etc.) without a
  // signed URL or an auth check.
  const uploadResult = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'docpulse/avatars',
        type: 'upload',
        transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }],
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });

  return res.status(201).json({
    success: true,
    url: uploadResult.secure_url,
  });
});