import { Request, Response } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { reviews, appointments, doctorProfiles } from '../db/schema';
import { generateId } from '../utils/ids';
import { asyncHandler, ApiError } from '../middleware/errorHandler';

const submitReviewSchema = z.object({
  doctorId: z.string().min(1),
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1),
  // appointmentId is REQUIRED (not optional) - a review must always be tied
  // to a real, completed appointment belonging to this patient. Making it
  // optional previously let anyone post an unverified "review" under any
  // patient's name for any doctor.
  appointmentId: z.string().min(1),
});

export const submitReview = asyncHandler(async (req: Request, res: Response) => {
  const parsed = submitReviewSchema.parse(req.body);

  if (!req.user) {
    throw new ApiError(401, 'Authentication required.');
  }
  // A patient can only submit a review as themself.
  if (!['admin_doctor', 'super_admin'].includes(req.user.role) && parsed.patientId !== req.user.id) {
    throw new ApiError(403, 'patientId must match the authenticated user.');
  }

  const doctor = await db.query.doctorProfiles.findFirst({ where: eq(doctorProfiles.id, parsed.doctorId) });
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found.');
  }

  const appointment = await db.query.appointments.findFirst({ where: eq(appointments.id, parsed.appointmentId) });
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found.');
  }
  if (appointment.patientId !== parsed.patientId) {
    throw new ApiError(403, 'This appointment does not belong to this patient.');
  }
  if (appointment.doctorId !== parsed.doctorId) {
    throw new ApiError(400, 'This appointment was not with this doctor.');
  }
  if (appointment.status !== 'completed') {
    throw new ApiError(409, 'You can only review a doctor after your appointment is completed.');
  }
  const existing = await db.query.reviews.findFirst({ where: eq(reviews.appointmentId, parsed.appointmentId) });
  if (existing) {
    throw new ApiError(409, 'A review has already been submitted for this appointment.');
  }

  const [row] = await db
    .insert(reviews)
    .values({
      id: generateId('rev'),
      doctorId: parsed.doctorId,
      patientId: parsed.patientId,
      patientName: parsed.patientName,
      rating: parsed.rating,
      comment: parsed.comment,
      appointmentId: parsed.appointmentId,
    })
    .returning();

  return res.status(201).json({ success: true, review: row });
});
