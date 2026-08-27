import { sendEmail, doctorWelcomeEmail } from '../services/email.service';
import { Request, Response } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '../db';
import { doctorProfiles, users, timeSlots, reviews } from '../db/schema';
import { generateId } from '../utils/ids';
import { hashPassword } from '../utils/hash';
import { serializeDoctor, serializeUser, serializeSlot } from '../utils/serialize';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiError } from '../middleware/errorHandler';
import { paramStr } from '../utils/params';
import { broadcast } from '../services/sse.service';

const educationEntry = z.object({
  degree: z.string(),
  institution: z.string(),
  year: z.number(),
});

const addDoctorSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional().default(''),
  name: z.string().min(2),
  title: z.string().optional().default(''),
  specialization: z.string().min(2),
  bio: z.string().optional().default(''),
  qualifications: z.array(z.string()).optional().default([]),
  experienceYears: z.number().optional().default(0),
  consultationFee: z.number().optional().default(0),
  homeVisitFee: z.number().optional(),
  onlineFee: z.number().optional(),
  clinicFee: z.number().optional(),
  languages: z.array(z.string()).optional().default([]),
  avatar: z.string().optional().default(''),
  coverImage: z.string().optional(),
  clinicAddress: z.string().optional().default(''),
  isVerified: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  addedBy: z.string().optional(),
  servicesOffered: z.array(z.string()).optional().default([]),
  education: z.array(educationEntry).optional().default([]),
  awards: z.array(z.string()).optional().default([]),
  paymentAccounts: z.any().optional(),
  // Optional: admin may set the doctor's initial password directly instead
  // of relying on a server-generated one.
  password: z.string().min(6).optional(),
});

const updateDoctorSchema = addDoctorSchema.partial().omit({ email: true });

export const getDoctors = asyncHandler(async (req: Request, res: Response) => {
  const includeInactive = req.query.all === 'true';

  const rows = includeInactive
    ? await db.query.doctorProfiles.findMany()
    : await db.query.doctorProfiles.findMany({ where: eq(doctorProfiles.isActive, true) });

  return res.json({ success: true, doctors: rows.map(serializeDoctor) });
});

export const getDoctorById = asyncHandler(async (req: Request, res: Response) => {
  const id = paramStr(req, 'id');

  const doctor = await db.query.doctorProfiles.findFirst({ where: eq(doctorProfiles.id, id) });
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found.');
  }

  const doctorReviews = await db.query.reviews.findMany({ where: eq(reviews.doctorId, id) });
  const slots = await db.query.timeSlots.findMany({ where: eq(timeSlots.doctorId, id) });

  return res.json({
    success: true,
    doctor: serializeDoctor(doctor),
    reviews: doctorReviews,
    slots: slots.map(serializeSlot),
  });
});

export const addDoctor = asyncHandler(async (req: Request, res: Response) => {
  const parsed = addDoctorSchema.parse(req.body);

  const existing = await db.query.users.findFirst({ where: eq(users.email, parsed.email.toLowerCase()) });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  // Use the admin-supplied password if given; otherwise generate a random
  // temporary one. Either way, the plaintext is only ever exposed once, in
  // this response - it is never stored or logged. In production, wire this
  // up to email.service.ts so the doctor receives it by email instead of
  // (or in addition to) it being shown in the admin's UI.
  const generatedPassword = parsed.password ? null : crypto.randomBytes(6).toString('base64url');
  const plaintextPassword = parsed.password || generatedPassword!;
  const hashedPassword = await hashPassword(plaintextPassword);

  const userId = generateId('usr');
  const [userRow] = await db
    .insert(users)
    .values({
      id: userId,
      name: parsed.name,
      email: parsed.email.toLowerCase(),
      phone: parsed.phone,
      password: hashedPassword,
      role: 'doctor',
      avatar: parsed.avatar,
      status: 'active',
    })
    .returning();

  const doctorId = generateId('doc');
  const [doctorRow] = await db
    .insert(doctorProfiles)
    .values({
      id: doctorId,
      userId,
      name: parsed.name,
      title: parsed.title,
      specialization: parsed.specialization,
      bio: parsed.bio,
      qualifications: parsed.qualifications,
      experienceYears: parsed.experienceYears,
      consultationFee: parsed.consultationFee,
      homeVisitFee: parsed.homeVisitFee,
      onlineFee: parsed.onlineFee,
      clinicFee: parsed.clinicFee,
      languages: parsed.languages,
      avatar: parsed.avatar,
      coverImage: parsed.coverImage,
      clinicAddress: parsed.clinicAddress,
      isVerified: parsed.isVerified,
      isActive: parsed.isActive,
      addedBy: parsed.addedBy || req.user?.id,
      servicesOffered: parsed.servicesOffered,
      education: parsed.education,
      awards: parsed.awards,
      paymentAccounts: parsed.paymentAccounts,
    })
    .returning();

  broadcast({ type: 'doctor_added', payload: serializeDoctor(doctorRow) });


    if (generatedPassword) {
    const { subject, html } = doctorWelcomeEmail(parsed.name, parsed.email, generatedPassword);
    sendEmail(parsed.email, subject, html);
  }

  return res.status(201).json({
    success: true,
    doctor: serializeDoctor(doctorRow),
    user: serializeUser(userRow),
    // Exposed as a first-class field (not just buried in `message`) so the
    // admin UI can reliably read and display/copy it - this is the only
    // time the plaintext password is ever available.
    temporaryPassword: generatedPassword,
    message: generatedPassword
      ? `Doctor account created. Temporary password: ${generatedPassword} (share this with the doctor securely — it will not be shown again).`
      : 'Doctor account created with the password you provided.',
  });
});

export const updateDoctor = asyncHandler(async (req: Request, res: Response) => {
  const id = paramStr(req, 'id');
  const parsed = updateDoctorSchema.parse(req.body);

  const existing = await db.query.doctorProfiles.findFirst({ where: eq(doctorProfiles.id, id) });
  if (!existing) {
    throw new ApiError(404, 'Doctor not found.');
  }

  // A regular doctor may only edit their own profile; admin/super_admin may edit any.
  if (req.user && !['admin_doctor', 'super_admin'].includes(req.user.role) && existing.userId !== req.user.id) {
    throw new ApiError(403, 'You can only edit your own profile.');
  }

  const [updated] = await db
    .update(doctorProfiles)
    .set({ ...parsed, updatedAt: new Date() })
    .where(eq(doctorProfiles.id, id))
    .returning();

  if (parsed.name) {
    await db.update(users).set({ name: parsed.name, updatedAt: new Date() }).where(eq(users.id, existing.userId));
  }
  if (parsed.avatar) {
    await db.update(users).set({ avatar: parsed.avatar, updatedAt: new Date() }).where(eq(users.id, existing.userId));
  }

  broadcast({ type: 'doctor_updated', payload: serializeDoctor(updated) });

  return res.json({ success: true, doctor: serializeDoctor(updated) });
});

export const deleteDoctor = asyncHandler(async (req: Request, res: Response) => {
  const id = paramStr(req, 'id');

  const existing = await db.query.doctorProfiles.findFirst({ where: eq(doctorProfiles.id, id) });
  if (!existing) {
    throw new ApiError(404, 'Doctor not found.');
  }

  // Soft-delete: deactivate rather than hard-delete, so existing appointment
  // history stays intact and valid.
  await db.update(doctorProfiles).set({ isActive: false, updatedAt: new Date() }).where(eq(doctorProfiles.id, id));
  await db.update(users).set({ status: 'inactive', updatedAt: new Date() }).where(eq(users.id, existing.userId));

  broadcast({ type: 'doctor_updated', payload: { id, isActive: false } });

  return res.json({ success: true, message: 'Doctor account deactivated.' });
});
