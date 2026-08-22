import { Request, Response } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { clinicServices } from '../db/schema';
import { generateId } from '../utils/ids';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { paramStr } from '../utils/params';

const createServiceSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(''),
  iconName: z.string().optional().default(''),
  department: z.string().optional().default(''),
  priceRange: z.string().optional(),
});

export const createService = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createServiceSchema.parse(req.body);

  const [row] = await db
    .insert(clinicServices)
    .values({ id: generateId('svc'), ...parsed })
    .returning();

  return res.status(201).json({ success: true, service: row });
});

export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  const id = paramStr(req, 'id');

  const existing = await db.query.clinicServices.findFirst({ where: eq(clinicServices.id, id) });
  if (!existing) {
    throw new ApiError(404, 'Service not found.');
  }

  await db.delete(clinicServices).where(eq(clinicServices.id, id));

  return res.json({ success: true, message: 'Service deleted.' });
});
