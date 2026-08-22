import { Request, Response } from 'express';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { timeSlots, doctorProfiles } from '../db/schema';
import { generateId } from '../utils/ids';
import { serializeSlot } from '../utils/serialize';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { paramStr } from '../utils/params';
import { broadcast } from '../services/sse.service';

const createSlotSchema = z.object({
  doctorId: z.string().min(1),
  date: z.string().min(1), // YYYY-MM-DD
  startTime: z.string().min(1), // HH:mm
  endTime: z.string().min(1), // HH:mm
  status: z.enum(['available', 'booked', 'blocked']).optional().default('available'),
  isRecurring: z.boolean().optional().default(false),
});

const updateSlotSchema = z.object({
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  status: z.enum(['available', 'booked', 'blocked']).optional(),
  reasonForBlock: z.string().optional(),
  appointmentId: z.string().optional(),
});

const ADMIN_ROLES = ['admin_doctor', 'super_admin'];

/**
 * Loads the slot and its owning doctor profile, then verifies the
 * authenticated user is either that doctor or an admin. Throws otherwise.
 * Used by every mutating slot endpoint (update/delete/toggle-block) so
 * ownership can never be skipped by accident.
 */
async function loadSlotAndAuthorize(slotId: string, req: Request) {
  const slot = await db.query.timeSlots.findFirst({ where: eq(timeSlots.id, slotId) });
  if (!slot) {
    throw new ApiError(404, 'Slot not found.');
  }

  const doctor = await db.query.doctorProfiles.findFirst({ where: eq(doctorProfiles.id, slot.doctorId) });
  if (!doctor) {
    throw new ApiError(404, 'Doctor for this slot was not found.');
  }

  if (!req.user) {
    throw new ApiError(401, 'Authentication required.');
  }
  const isOwner = doctor.userId === req.user.id;
  const isAdmin = ADMIN_ROLES.includes(req.user.role);
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You can only manage your own availability.');
  }

  return { slot, doctor };
}

export const getSlots = asyncHandler(async (req: Request, res: Response) => {
  const { doctorId, date } = req.query as { doctorId?: string; date?: string };

  const conditions = [];
  if (doctorId) conditions.push(eq(timeSlots.doctorId, doctorId));
  if (date) conditions.push(eq(timeSlots.date, date));

  const rows = conditions.length
    ? await db.query.timeSlots.findMany({ where: and(...conditions) })
    : await db.query.timeSlots.findMany();

  return res.json({ success: true, slots: rows.map(serializeSlot) });
});

export const createSlot = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createSlotSchema.parse(req.body);

  const doctor = await db.query.doctorProfiles.findFirst({ where: eq(doctorProfiles.id, parsed.doctorId) });
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found.');
  }

  // A regular doctor may only manage their own slots.
  if (req.user && !['admin_doctor', 'super_admin'].includes(req.user.role) && doctor.userId !== req.user.id) {
    throw new ApiError(403, 'You can only manage your own availability.');
  }

  const datesToCreate: string[] = [parsed.date];
  if (parsed.isRecurring) {
    // Create the same weekly slot for the following 7 weeks (8 total).
    const base = new Date(parsed.date + 'T00:00:00Z');
    for (let i = 1; i <= 7; i++) {
      const next = new Date(base);
      next.setUTCDate(base.getUTCDate() + i * 7);
      datesToCreate.push(next.toISOString().slice(0, 10));
    }
  }

  const created = [];
  for (const date of datesToCreate) {
    const existing = await db.query.timeSlots.findFirst({
      where: and(
        eq(timeSlots.doctorId, parsed.doctorId),
        eq(timeSlots.date, date),
        eq(timeSlots.startTime, parsed.startTime)
      ),
    });
    if (existing) continue; // skip duplicates silently for recurring batches

    const [row] = await db
      .insert(timeSlots)
      .values({
        id: generateId('slt'),
        doctorId: parsed.doctorId,
        date,
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        status: parsed.status,
      })
      .returning();
    created.push(row);
  }

  if (created.length === 0) {
    throw new ApiError(409, 'This slot already exists.');
  }

  return res.status(201).json({ success: true, slot: serializeSlot(created[0]), slots: created.map(serializeSlot) });
});

export const updateSlot = asyncHandler(async (req: Request, res: Response) => {
  const id = paramStr(req, 'id');
  const parsed = updateSlotSchema.parse(req.body);

  const { slot: existing } = await loadSlotAndAuthorize(id, req);

  const [updated] = await db
    .update(timeSlots)
    .set({ ...parsed, updatedAt: new Date() })
    .where(eq(timeSlots.id, id))
    .returning();

  return res.json({ success: true, slot: serializeSlot(updated) });
});

export const deleteSlot = asyncHandler(async (req: Request, res: Response) => {
  const id = paramStr(req, 'id');

  const { slot: existing } = await loadSlotAndAuthorize(id, req);
  if (existing.status === 'booked') {
    throw new ApiError(409, 'Cannot delete a slot that has an active appointment. Cancel the appointment first.');
  }

  await db.delete(timeSlots).where(eq(timeSlots.id, id));

  return res.json({ success: true, message: 'Slot deleted.' });
});

export const toggleBlockSlot = asyncHandler(async (req: Request, res: Response) => {
  const id = paramStr(req, 'id');
  const { reason } = req.body as { reason?: string };

  const { slot: existing } = await loadSlotAndAuthorize(id, req);
  if (existing.status === 'booked') {
    throw new ApiError(409, 'Cannot block a slot that already has an appointment booked.');
  }

  const nextStatus = existing.status === 'blocked' ? 'available' : 'blocked';

  const [updated] = await db
    .update(timeSlots)
    .set({
      status: nextStatus,
      reasonForBlock: nextStatus === 'blocked' ? reason || 'Unavailable' : null,
      updatedAt: new Date(),
    })
    .where(eq(timeSlots.id, id))
    .returning();

  broadcast({ type: 'doctor_updated', payload: { slotId: id, doctorId: existing.doctorId } });

  return res.json({ success: true, slot: serializeSlot(updated) });
});
