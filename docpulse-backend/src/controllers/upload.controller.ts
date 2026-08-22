import { Request, Response } from 'express';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { generateId } from '../utils/ids';
import { asyncHandler, ApiError } from '../middleware/errorHandler';

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
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

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

  // fileBase64 arrives as a data URL: "data:<mime>;base64,<data>"
  const commaIndex = parsed.fileBase64.indexOf(',');
  const base64Data = commaIndex >= 0 ? parsed.fileBase64.slice(commaIndex + 1) : parsed.fileBase64;
  const buffer = Buffer.from(base64Data, 'base64');

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new ApiError(400, 'File is too large. Maximum size is 10 MB.');
  }

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const ext = path.extname(parsed.fileName) || '';
  const safeName = `${generateId('file')}${ext}`;
  const filePath = path.join(UPLOAD_DIR, safeName);
  fs.writeFileSync(filePath, buffer);

  const url = `/uploads/${safeName}`;

  return res.status(201).json({
    success: true,
    url,
    name: parsed.fileName,
    size: humanFileSize(buffer.length),
    type: parsed.fileType,
  });
});
