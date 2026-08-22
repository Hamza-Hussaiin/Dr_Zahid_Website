import { Request, Response } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, patientProfiles } from '../db/schema';
import { generateId } from '../utils/ids';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken } from '../utils/jwt';
import { serializeUser } from '../utils/serialize';
import { asyncHandler } from '../middleware/errorHandler';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('A valid email is required.'),
  phone: z.string().min(6, 'A valid phone number is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  // Public self-registration is always a patient. Doctor accounts are
  // created separately by an admin doctor via POST /api/doctors.
});

const loginSchema = z.object({
  email: z.string().email('A valid email is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const parsed = registerSchema.parse(req.body);

  const existing = await db.query.users.findFirst({ where: eq(users.email, parsed.email.toLowerCase()) });
  if (existing) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }

  const hashedPassword = await hashPassword(parsed.password);
  const userId = generateId('usr');

  const [userRow] = await db
    .insert(users)
    .values({
      id: userId,
      name: parsed.name,
      email: parsed.email.toLowerCase(),
      phone: parsed.phone,
      password: hashedPassword,
      role: 'patient',
      avatar: '',
      status: 'active',
    })
    .returning();

  await db.insert(patientProfiles).values({ userId });

  const token = signToken({ userId: userRow.id, role: userRow.role });

  return res.status(201).json({ success: true, user: serializeUser(userRow), token });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.parse(req.body);

  const userRow = await db.query.users.findFirst({ where: eq(users.email, parsed.email.toLowerCase()) });
  if (!userRow) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  if (userRow.status === 'inactive') {
    return res.status(403).json({ success: false, message: 'This account has been deactivated. Please contact the clinic.' });
  }

  const passwordMatches = await comparePassword(parsed.password, userRow.password);
  if (!passwordMatches) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const token = signToken({ userId: userRow.id, role: userRow.role });

  return res.json({ success: true, user: serializeUser(userRow), token });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }

  const userRow = await db.query.users.findFirst({ where: eq(users.id, req.user.id) });
  if (!userRow) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  return res.json({ success: true, user: serializeUser(userRow) });
});
