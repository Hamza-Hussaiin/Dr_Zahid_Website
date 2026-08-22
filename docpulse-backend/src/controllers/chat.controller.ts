import { Request, Response } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { chatMessages, appointments, doctorProfiles } from '../db/schema';
import { generateId } from '../utils/ids';
import { serializeChatMessage } from '../utils/serialize';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { paramStr } from '../utils/params';
import { sendToUser } from '../services/sse.service';

const sendMessageSchema = z.object({
  appointmentId: z.string().min(1),
  senderId: z.string().min(1),
  senderName: z.string().min(1),
  senderRole: z.string().min(1),
  senderAvatar: z.string().optional().default(''),
  content: z.string().min(1),
  attachment: z.object({ name: z.string(), url: z.string(), type: z.string() }).optional(),
});

/**
 * Loads the appointment for a chat action and verifies the requesting user
 * is actually one of the two participants (or an admin), and that the
 * appointment has reached a status where chat is unlocked. This is the
 * enforcement point for "a doctor can only chat with their own patients".
 */
async function authorizeChatParticipant(appointmentId: string, userId: string, userRole: string) {
  const appointment = await db.query.appointments.findFirst({ where: eq(appointments.id, appointmentId) });
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found.');
  }

  const doctor = await db.query.doctorProfiles.findFirst({ where: eq(doctorProfiles.id, appointment.doctorId) });
  if (!doctor) {
    throw new ApiError(404, 'Doctor for this appointment was not found.');
  }

  const isAdmin = userRole === 'admin_doctor' || userRole === 'super_admin';
  const isPatient = appointment.patientId === userId;
  const isDoctor = doctor.userId === userId;

  if (!isAdmin && !isPatient && !isDoctor) {
    throw new ApiError(403, 'You do not have access to this conversation.');
  }

  if (!['accepted', 'completed'].includes(appointment.status)) {
    throw new ApiError(403, 'Chat unlocks once the doctor accepts the appointment.');
  }

  return { appointment, doctor };
}

export const getChatMessages = asyncHandler(async (req: Request, res: Response) => {
  const appointmentId = paramStr(req, 'appointmentId');

  if (!req.user) {
    throw new ApiError(401, 'Authentication required.');
  }
  await authorizeChatParticipant(appointmentId, req.user.id, req.user.role);

  const rows = await db.query.chatMessages.findMany({ where: eq(chatMessages.appointmentId, appointmentId) });
  rows.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return res.json({ success: true, messages: rows.map(serializeChatMessage) });
});

export const sendChatMessage = asyncHandler(async (req: Request, res: Response) => {
  const parsed = sendMessageSchema.parse(req.body);

  if (!req.user) {
    throw new ApiError(401, 'Authentication required.');
  }
  // The sender must be the authenticated user, not an arbitrary id from the body.
  if (parsed.senderId !== req.user.id) {
    throw new ApiError(403, 'senderId must match the authenticated user.');
  }

  const { appointment, doctor } = await authorizeChatParticipant(parsed.appointmentId, req.user.id, req.user.role);

  const [row] = await db
    .insert(chatMessages)
    .values({
      id: generateId('msg'),
      threadId: parsed.appointmentId,
      appointmentId: parsed.appointmentId,
      senderId: parsed.senderId,
      senderName: parsed.senderName,
      senderRole: parsed.senderRole as any,
      senderAvatar: parsed.senderAvatar,
      content: parsed.content,
      attachment: parsed.attachment,
      isRead: false,
    })
    .returning();

  const serialized = serializeChatMessage(row);

  // Push to whichever participant did NOT send this message.
  const recipientUserId = parsed.senderId === appointment.patientId ? doctor.userId : appointment.patientId;
  sendToUser(recipientUserId, { type: 'chat_message', payload: serialized });

  return res.status(201).json({ success: true, message: serialized, chatMessage: serialized });
});
