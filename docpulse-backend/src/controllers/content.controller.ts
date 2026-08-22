import { Request, Response } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { clinicInfo, clinicServices } from '../db/schema';
import { asyncHandler } from '../middleware/errorHandler';

const SINGLETON_ID = 'singleton';

const updateClinicInfoSchema = z.object({
  name: z.string().optional(),
  doctorName: z.string().optional(),
  tagline: z.string().optional(),
  phone: z.string().optional(),
  emergencyHotline: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  googleMapsUrl: z.string().optional(),
  workingHours: z.string().optional(),
  timingsClinic: z.string().optional(),
  timingsOnline: z.string().optional(),
  mission: z.string().optional(),
  announcement: z
    .object({
      enabled: z.boolean(),
      text: z.string(),
      linkText: z.string().optional(),
    })
    .nullable()
    .optional(),
});

export const getClinicContent = asyncHandler(async (_req: Request, res: Response) => {
  let info = await db.query.clinicInfo.findFirst({ where: eq(clinicInfo.id, SINGLETON_ID) });
  if (!info) {
    [info] = await db.insert(clinicInfo).values({ id: SINGLETON_ID }).returning();
  }

  const services = await db.query.clinicServices.findMany();

  return res.json({ success: true, clinicInfo: info, services });
});

export const updateClinicContent = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateClinicInfoSchema.parse(req.body);

  const existing = await db.query.clinicInfo.findFirst({ where: eq(clinicInfo.id, SINGLETON_ID) });

  let row;
  if (existing) {
    [row] = await db.update(clinicInfo).set({ ...parsed, updatedAt: new Date() }).where(eq(clinicInfo.id, SINGLETON_ID)).returning();
  } else {
    [row] = await db.insert(clinicInfo).values({ id: SINGLETON_ID, ...parsed }).returning();
  }

  return res.json({ success: true, clinicInfo: row, clinic: row });
});
