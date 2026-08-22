import { db } from '../db';
import { notifications } from '../db/schema';
import { generateId } from '../utils/ids';
import { serializeNotification } from '../utils/serialize';
import { sendToUser } from './sse.service';

export type NotificationType =
  | 'appointment_request'
  | 'appointment_accepted'
  | 'appointment_rejected'
  | 'reschedule_proposed'
  | 'appointment_cancelled'
  | 'appointment_completed'
  | 'chat_message'
  | 'system';

interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedAppointmentId?: string;
}

/**
 * Persists a notification row (for the notification bell/history) and
 * immediately pushes it to the user over SSE if they're currently connected.
 */
export async function createNotification(input: CreateNotificationInput) {
  const [row] = await db
    .insert(notifications)
    .values({
      id: generateId('ntf'),
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type,
      relatedAppointmentId: input.relatedAppointmentId,
    })
    .returning();

  const serialized = serializeNotification(row);

  sendToUser(input.userId, {
    type: 'notification',
    payload: serialized,
  });

  return serialized;
}
