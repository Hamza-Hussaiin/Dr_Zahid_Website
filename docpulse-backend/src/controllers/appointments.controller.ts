import { Request, Response } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { appointments, timeSlots, doctorProfiles, users } from '../db/schema';
import { generateId } from '../utils/ids';
import { serializeAppointment } from '../utils/serialize';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { paramStr } from '../utils/params';
import { sendToUser, sendToUsers } from '../services/sse.service';
import { createNotification } from '../services/notification.service';

const attachmentSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  size: z.string(),
  type: z.string(),
  url: z.string(),
});

const createAppointmentSchema = z.object({
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  patientEmail: z.string().email(),
  patientPhone: z.string().min(1),
  patientAge: z.number().optional(),
  patientGender: z.string().optional(),
  patientHomeAddress: z.string().optional(),
  consultationMode: z.enum(['home_visit', 'online', 'clinic_visit']).default('clinic_visit'),
  doctorId: z.string().min(1),
  slotId: z.string().min(1),
  reasonForVisit: z.string().min(1),
  symptomsDescription: z.string().min(1),
  durationOfSymptoms: z.string().optional(),
  medicalHistory: z.string().optional(),
  currentMedications: z.string().optional(),
  attachments: z.array(attachmentSchema).optional().default([]),
  preferredCommunicationNote: z.string().optional(),
});

type StatusAction = 'accept' | 'reject' | 'propose_reschedule' | 'accept_reschedule' | 'cancel' | 'complete';

// NOTE: actorId / actorName / actorRole are intentionally NOT accepted here.
// Identity for every status change is derived server-side from the
// authenticated JWT (req.user), never from the request body - otherwise
// any logged-in user could forge who performed an action.
const statusActionSchema = z.object({
  action: z.enum(['accept', 'reject', 'propose_reschedule', 'accept_reschedule', 'cancel', 'complete']),
  note: z.string().optional(),
  reason: z.string().optional(),
  proposedSlotId: z.string().optional(),
  consultationNotes: z.string().optional(),
  prescription: z.string().optional(),
});

function doctorLabel(name: string): string {
  return name.trim().toLowerCase().startsWith('dr.') || name.trim().toLowerCase().startsWith('dr ') ? name : `Dr. ${name}`;
}

function historyEntry(status: string, actorId: string, actorName: string, actorRole: string, note?: string) {
  return {
    status,
    timestamp: new Date().toISOString(),
    actorId,
    actorName,
    actorRole,
    note,
  };
}

const ADMIN_ROLES = ['admin_doctor', 'super_admin'];

export const getAppointments = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required.');
  }

  // Identity and scope are derived from the authenticated user, never from
  // client-supplied query params - a patient can only ever see their own
  // appointments, a doctor only their own, regardless of what ?userId= says.
  const { doctorId: queryDoctorId, userId: queryUserId } = req.query as { doctorId?: string; userId?: string };

  let rows: (typeof appointments.$inferSelect)[];

  if (ADMIN_ROLES.includes(req.user.role)) {
    // Admins may optionally filter by a specific doctor or patient for oversight.
    if (queryDoctorId) {
      rows = await db.query.appointments.findMany({ where: eq(appointments.doctorId, queryDoctorId) });
    } else if (queryUserId) {
      rows = await db.query.appointments.findMany({ where: eq(appointments.patientId, queryUserId) });
    } else {
      rows = await db.query.appointments.findMany();
    }
  } else if (req.user.role === 'doctor') {
    const doctorProfile = await db.query.doctorProfiles.findFirst({ where: eq(doctorProfiles.userId, req.user.id) });
    rows = doctorProfile
      ? await db.query.appointments.findMany({ where: eq(appointments.doctorId, doctorProfile.id) })
      : [];
  } else {
    // Patient (or any other non-admin role): only their own appointments.
    rows = await db.query.appointments.findMany({ where: eq(appointments.patientId, req.user.id) });
  }

  return res.json({ success: true, appointments: rows.map(serializeAppointment) });
});

export const createAppointment = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createAppointmentSchema.parse(req.body);

  if (!req.user) {
    throw new ApiError(401, 'Authentication required.');
  }
  // A patient can only book on their own behalf.
  if (!ADMIN_ROLES.includes(req.user.role) && parsed.patientId !== req.user.id) {
    throw new ApiError(403, 'patientId must match the authenticated user.');
  }

  const doctor = await db.query.doctorProfiles.findFirst({ where: eq(doctorProfiles.id, parsed.doctorId) });
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found.');
  }

  const slot = await db.query.timeSlots.findFirst({ where: eq(timeSlots.id, parsed.slotId) });
  if (!slot || slot.doctorId !== parsed.doctorId) {
    throw new ApiError(404, 'Selected time slot was not found for this doctor.');
  }
  if (slot.status !== 'available') {
    throw new ApiError(409, 'This slot is no longer available. Please choose another time.');
  }

  const fee =
    parsed.consultationMode === 'home_visit'
      ? doctor.homeVisitFee ?? doctor.consultationFee
      : parsed.consultationMode === 'online'
      ? doctor.onlineFee ?? doctor.consultationFee
      : doctor.clinicFee ?? doctor.consultationFee;

  const appointmentId = generateId('apt');
  const status = 'pending';

  const result = await db.transaction(async (tx) => {
    const [appointmentRow] = await tx
      .insert(appointments)
      .values({
        id: appointmentId,
        patientId: parsed.patientId,
        patientName: parsed.patientName,
        patientEmail: parsed.patientEmail,
        patientPhone: parsed.patientPhone,
        patientAge: parsed.patientAge,
        patientGender: parsed.patientGender,
        patientHomeAddress: parsed.patientHomeAddress,
        consultationMode: parsed.consultationMode,
        doctorId: parsed.doctorId,
        doctorName: doctor.name,
        doctorSpecialization: doctor.specialization,
        doctorAvatar: doctor.avatar,
        slotId: parsed.slotId,
        date: slot.date,
        time: `${slot.startTime} - ${slot.endTime}`,
        reasonForVisit: parsed.reasonForVisit,
        symptomsDescription: parsed.symptomsDescription,
        durationOfSymptoms: parsed.durationOfSymptoms,
        medicalHistory: parsed.medicalHistory,
        currentMedications: parsed.currentMedications,
        attachments: parsed.attachments,
        preferredCommunicationNote: parsed.preferredCommunicationNote,
        status,
        fee,
        currency: 'PKR',
        paymentStatus: 'pending',
        statusHistory: [historyEntry(status, parsed.patientId, parsed.patientName, 'patient', 'Appointment requested.')],
      })
      .returning();

    await tx
      .update(timeSlots)
      .set({ status: 'booked', appointmentId, updatedAt: new Date() })
      .where(eq(timeSlots.id, parsed.slotId));

    return appointmentRow;
  });

  // Notify the doctor of the new request (persisted + live push).
  await createNotification({
    userId: doctor.userId,
    title: 'New Appointment Request',
    message: `${parsed.patientName} requested an appointment on ${slot.date} at ${slot.startTime}.`,
    type: 'appointment_request',
    relatedAppointmentId: appointmentId,
  });
  sendToUser(doctor.userId, { type: 'new_appointment_request', payload: serializeAppointment(result) });

  return res.status(201).json({ success: true, appointment: serializeAppointment(result) });
});

export const updateAppointmentStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = paramStr(req, 'id');
  const parsed = statusActionSchema.parse(req.body);

  if (!req.user) {
    throw new ApiError(401, 'Authentication required.');
  }

  const appointment = await db.query.appointments.findFirst({ where: eq(appointments.id, id) });
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found.');
  }

  const doctor = await db.query.doctorProfiles.findFirst({ where: eq(doctorProfiles.id, appointment.doctorId) });
  if (!doctor) {
    throw new ApiError(404, 'Doctor for this appointment was not found.');
  }

  const isAdmin = ADMIN_ROLES.includes(req.user.role);
  const isPatient = appointment.patientId === req.user.id;
  const isDoctor = doctor.userId === req.user.id;

  if (!isAdmin && !isPatient && !isDoctor) {
    throw new ApiError(403, 'You do not have access to this appointment.');
  }

  const action: StatusAction = parsed.action;

  // Per-action role enforcement: only the doctor can accept/reject/propose/complete,
  // only the patient can accept a proposed reschedule, either party (or admin) can cancel.
  const doctorOnlyActions: StatusAction[] = ['accept', 'reject', 'propose_reschedule', 'complete'];
  const patientOnlyActions: StatusAction[] = ['accept_reschedule'];

  if (doctorOnlyActions.includes(action) && !isDoctor && !isAdmin) {
    throw new ApiError(403, 'Only the assigned doctor can perform this action.');
  }
  if (patientOnlyActions.includes(action) && !isPatient && !isAdmin) {
    throw new ApiError(403, 'Only the patient can accept a proposed reschedule.');
  }
  // 'cancel' is allowed for isPatient, isDoctor, or isAdmin - already covered by the
  // participant check above.

  // Look up the authenticated user's real name/role for an honest audit trail
  // (never trust actorName/actorRole from the client).
  const actorUserRow = await db.query.users.findFirst({ where: eq(users.id, req.user.id) });
  const actorId = req.user.id;
  const actorName = actorUserRow?.name || (isDoctor ? doctor.name : appointment.patientName);
  const actorRole = req.user.role;

  const existingHistory = (appointment.statusHistory as any[]) || [];

  const notify = async (userId: string, title: string, message: string, type: any) => {
    await createNotification({ userId, title, message, type, relatedAppointmentId: id });
  };

  let updated;

  switch (action) {
    case 'accept': {
      if (!['pending', 'reschedule_proposed'].includes(appointment.status)) {
        throw new ApiError(409, `Cannot accept an appointment with status "${appointment.status}".`);
      }
      const [row] = await db
        .update(appointments)
        .set({
          status: 'accepted',
          statusHistory: [...existingHistory, historyEntry('accepted', actorId, actorName, actorRole, parsed.note)],
          updatedAt: new Date(),
        })
        .where(eq(appointments.id, id))
        .returning();
      updated = row;
      await notify(appointment.patientId, 'Appointment Accepted', `${doctorLabel(doctor.name)} accepted your appointment for ${appointment.date}. You can now chat with your doctor.`, 'appointment_accepted');
      break;
    }

    case 'reject': {
      if (!['pending', 'reschedule_proposed'].includes(appointment.status)) {
        throw new ApiError(409, `Cannot reject an appointment with status "${appointment.status}".`);
      }
      const [row] = await db
        .update(appointments)
        .set({
          status: 'rejected',
          rejectionReason: parsed.reason,
          statusHistory: [...existingHistory, historyEntry('rejected', actorId, actorName, actorRole, parsed.reason)],
          updatedAt: new Date(),
        })
        .where(eq(appointments.id, id))
        .returning();
      updated = row;

      // Re-open the original slot.
      await db.update(timeSlots).set({ status: 'available', appointmentId: null, updatedAt: new Date() }).where(eq(timeSlots.id, appointment.slotId));

      await notify(appointment.patientId, 'Appointment Declined', `${doctorLabel(doctor.name)} was unable to accept your appointment request.${parsed.reason ? ` Reason: ${parsed.reason}` : ''}`, 'appointment_rejected');
      break;
    }

    case 'propose_reschedule': {
      if (!parsed.proposedSlotId) {
        throw new ApiError(400, 'proposedSlotId is required to propose a reschedule.');
      }
      if (!['pending', 'reschedule_proposed'].includes(appointment.status)) {
        throw new ApiError(409, `Cannot propose a reschedule for an appointment with status "${appointment.status}".`);
      }
      const proposedSlot = await db.query.timeSlots.findFirst({ where: eq(timeSlots.id, parsed.proposedSlotId) });
      if (!proposedSlot || proposedSlot.status !== 'available') {
        throw new ApiError(409, 'The proposed slot is not available.');
      }
      if (proposedSlot.doctorId !== doctor.id) {
        throw new ApiError(400, 'The proposed slot does not belong to this doctor.');
      }

      const proposedSlotPayload = {
        slotId: proposedSlot.id,
        date: proposedSlot.date,
        time: `${proposedSlot.startTime} - ${proposedSlot.endTime}`,
        note: parsed.note || '',
      };

      const [row] = await db
        .update(appointments)
        .set({
          status: 'reschedule_proposed',
          proposedSlot: proposedSlotPayload,
          statusHistory: [...existingHistory, historyEntry('reschedule_proposed', actorId, actorName, actorRole, parsed.note)],
          updatedAt: new Date(),
        })
        .where(eq(appointments.id, id))
        .returning();
      updated = row;

      await notify(appointment.patientId, 'New Time Proposed', `${doctorLabel(doctor.name)} proposed a new time: ${proposedSlot.date} at ${proposedSlot.startTime}.`, 'reschedule_proposed');
      break;
    }

    case 'accept_reschedule': {
      if (appointment.status !== 'reschedule_proposed' || !appointment.proposedSlot) {
        throw new ApiError(409, 'There is no proposed reschedule to accept for this appointment.');
      }
      const proposed = appointment.proposedSlot as any;

      const result = await db.transaction(async (tx) => {
        // Free the old slot.
        await tx.update(timeSlots).set({ status: 'available', appointmentId: null, updatedAt: new Date() }).where(eq(timeSlots.id, appointment.slotId));
        // Book the new slot.
        await tx.update(timeSlots).set({ status: 'booked', appointmentId: id, updatedAt: new Date() }).where(eq(timeSlots.id, proposed.slotId));

        const [row] = await tx
          .update(appointments)
          .set({
            status: 'accepted',
            slotId: proposed.slotId,
            date: proposed.date,
            time: proposed.time,
            proposedSlot: null,
            statusHistory: [...existingHistory, historyEntry('accepted', actorId, actorName, actorRole, 'Patient accepted the proposed new time.')],
            updatedAt: new Date(),
          })
          .where(eq(appointments.id, id))
          .returning();
        return row;
      });
      updated = result;

      await notify(doctor.userId, 'Reschedule Accepted', `${appointment.patientName} accepted the new time you proposed.`, 'appointment_accepted');
      break;
    }

    case 'cancel': {
      if (!['pending', 'accepted', 'reschedule_proposed'].includes(appointment.status)) {
        throw new ApiError(409, `Cannot cancel an appointment with status "${appointment.status}".`);
      }
      const [row] = await db
        .update(appointments)
        .set({
          status: 'cancelled',
          cancellationReason: parsed.reason,
          statusHistory: [...existingHistory, historyEntry('cancelled', actorId, actorName, actorRole, parsed.reason)],
          updatedAt: new Date(),
        })
        .where(eq(appointments.id, id))
        .returning();
      updated = row;

      await db.update(timeSlots).set({ status: 'available', appointmentId: null, updatedAt: new Date() }).where(eq(timeSlots.id, appointment.slotId));

      // Notify whichever party did not initiate the cancellation.
      const otherPartyUserId = actorId === appointment.patientId ? doctor.userId : appointment.patientId;
      await notify(otherPartyUserId, 'Appointment Cancelled', `The appointment on ${appointment.date} was cancelled.${parsed.reason ? ` Reason: ${parsed.reason}` : ''}`, 'appointment_cancelled');
      break;
    }

    case 'complete': {
      if (appointment.status !== 'accepted') {
        throw new ApiError(409, `Only an accepted appointment can be marked completed (current status: "${appointment.status}").`);
      }
      const [row] = await db
        .update(appointments)
        .set({
          status: 'completed',
          consultationNotes: parsed.consultationNotes,
          prescription: parsed.prescription,
          statusHistory: [...existingHistory, historyEntry('completed', actorId, actorName, actorRole, parsed.note)],
          updatedAt: new Date(),
        })
        .where(eq(appointments.id, id))
        .returning();
      updated = row;

      await notify(appointment.patientId, 'Appointment Completed', `Your appointment with ${doctorLabel(doctor.name)} has been marked complete. You can now leave a review.`, 'appointment_completed');
      break;
    }
  }

  // Push a live update to both participants so open dashboards refresh instantly.
  sendToUsers([appointment.patientId, doctor.userId], { type: 'appointment_updated', payload: serializeAppointment(updated) });

  return res.json({ success: true, appointment: serializeAppointment(updated) });
});
