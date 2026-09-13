import crypto from 'crypto';
import { env } from '../config/env';
import { sendEmail, passwordResetEmail } from '../services/email.service';
import { Request, Response } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, patientProfiles, doctorProfiles } from '../db/schema';
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
const updateAvatarSchema = z.object({
  avatarUrl: z.string().min(1).max(2000),
});

export const updateMyAvatar = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }
  const parsed = updateAvatarSchema.parse(req.body);

  const [updatedUser] = await db
    .update(users)
    .set({ avatar: parsed.avatarUrl, updatedAt: new Date() })
    .where(eq(users.id, req.user.id))
    .returning();

  // Keep the doctor's public-facing profile photo in sync too, since
  // patients see doctorProfiles.avatar (not users.avatar) on the public
  // doctor directory and detail pages.
  if (req.user.role === 'doctor' || req.user.role === 'admin_doctor' || req.user.role === 'super_admin') {
    await db
      .update(doctorProfiles)
      .set({ avatar: parsed.avatarUrl, updatedAt: new Date() })
      .where(eq(doctorProfiles.userId, req.user.id));
  }

  return res.json({ success: true, user: serializeUser(updatedUser) });
});

const forgotPasswordSchema = z.object({
  email: z.string().email('A valid email is required.'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Reset token is missing or invalid.'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
});

function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const parsed = forgotPasswordSchema.parse(req.body);
  const email = parsed.email.toLowerCase();

  const userRow = await db.query.users.findFirst({ where: eq(users.email, email) });

  // Always respond the same way whether or not the account exists - this
  // prevents someone from using this form to discover which emails are
  // registered on the platform.
  const genericResponse = {
    success: true,
    message: 'If an account exists with that email, a password reset link has been sent.',
  };

  if (!userRow || userRow.status === 'inactive') {
    return res.json(genericResponse);
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db
    .update(users)
    .set({ resetTokenHash: tokenHash, resetTokenExpiresAt: expiresAt, updatedAt: new Date() })
    .where(eq(users.id, userRow.id));

  const resetUrl = `${env.frontendUrl}/?resetToken=${rawToken}`;
  const { subject, html } = passwordResetEmail(userRow.name, resetUrl);
  await sendEmail(userRow.email, subject, html);

  return res.json(genericResponse);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const parsed = resetPasswordSchema.parse(req.body);
  const tokenHash = hashToken(parsed.token);

  const userRow = await db.query.users.findFirst({ where: eq(users.resetTokenHash, tokenHash) });

  if (!userRow || !userRow.resetTokenExpiresAt || userRow.resetTokenExpiresAt.getTime() < Date.now()) {
    return res.status(400).json({
      success: false,
      message: 'This reset link is invalid or has expired. Please request a new one.',
    });
  }

  const hashedPassword = await hashPassword(parsed.newPassword);

  await db
    .update(users)
    .set({
      password: hashedPassword,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userRow.id));

  return res.json({ success: true, message: 'Your password has been updated. You can now sign in.' });
});