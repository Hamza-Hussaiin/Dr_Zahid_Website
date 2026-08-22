import { Request, Response } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { patientProfiles, users } from '../db/schema';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { paramStr } from '../utils/params';

const updateProfileSchema = z.object({
  dob: z.string().optional(),
  age: z.number().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  currentMedications: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
});

export const getPatientProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = paramStr(req, 'userId');

  if (!req.user) {
    throw new ApiError(401, 'Authentication required.');
  }
  // Medical profile data is sensitive - only the patient themself or an
  // admin may read it. (Doctors already receive relevant medical history
  // as part of the appointment record itself when a patient books.)
  if (req.user.id !== userId && !['admin_doctor', 'super_admin'].includes(req.user.role)) {
    throw new ApiError(403, 'You can only view your own medical profile.');
  }

  const profile = await db.query.patientProfiles.findFirst({ where: eq(patientProfiles.userId, userId) });

  return res.json({ success: true, profile: profile || null });
});

export const updatePatientProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = paramStr(req, 'userId');
  const parsed = updateProfileSchema.parse(req.body);

  if (req.user && req.user.id !== userId && !['admin_doctor', 'super_admin'].includes(req.user.role)) {
    throw new ApiError(403, 'You can only edit your own profile.');
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const existing = await db.query.patientProfiles.findFirst({ where: eq(patientProfiles.userId, userId) });

  let row;
  if (existing) {
    [row] = await db.update(patientProfiles).set(parsed).where(eq(patientProfiles.userId, userId)).returning();
  } else {
    [row] = await db.insert(patientProfiles).values({ userId, ...parsed }).returning();
  }

  return res.json({ success: true, profile: row });
});
