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
      { resource_type: 'auto', folder: 'docpulse' },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });

  return res.status(201).json({
    success: true,
    url: uploadResult.secure_url,
    name: parsed.fileName,
    size: humanFileSize(buffer.length),
    type: parsed.fileType,
  });
});