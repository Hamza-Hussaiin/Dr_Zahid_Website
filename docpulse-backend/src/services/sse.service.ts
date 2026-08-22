import { Response } from 'express';

/**
 * Keeps track of every open Server-Sent-Events connection, keyed by userId.
 * A user can have more than one open tab/device, so each userId maps to a
 * Set of open Express Response objects.
 *
 * The frontend (services/api.ts -> subscribeEvents) opens:
 *   GET /api/events?userId=...&token=...
 * and listens for JSON payloads shaped like:
 *   { type: string; payload: any; timestamp: string }
 *
 * Known event types the frontend already handles (see AppContext.tsx):
 *   - 'notification'
 *   - 'appointment_updated'
 *   - 'new_appointment_request'
 *   - 'doctor_added'
 *   - 'doctor_updated'
 */

type ClientMap = Map<string, Set<Response>>;

const clients: ClientMap = new Map();

export function addClient(userId: string, res: Response) {
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }
  clients.get(userId)!.add(res);
}

export function removeClient(userId: string, res: Response) {
  const set = clients.get(userId);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) {
    clients.delete(userId);
  }
}

export interface SseEvent {
  type: string;
  payload: any;
}

/**
 * Sends an event to a single user (all of their open tabs/devices).
 */
export function sendToUser(userId: string, event: SseEvent) {
  const set = clients.get(userId);
  if (!set || set.size === 0) return;

  const data = JSON.stringify({ ...event, timestamp: new Date().toISOString() });
  for (const res of set) {
    res.write(`data: ${data}\n\n`);
  }
}

/**
 * Sends an event to multiple users at once.
 */
export function sendToUsers(userIds: string[], event: SseEvent) {
  for (const id of userIds) {
    sendToUser(id, event);
  }
}

/**
 * Sends an event to every currently connected user (e.g. a new doctor
 * was added and should appear in every open directory page).
 */
export function broadcast(event: SseEvent) {
  const data = JSON.stringify({ ...event, timestamp: new Date().toISOString() });
  for (const set of clients.values()) {
    for (const res of set) {
      res.write(`data: ${data}\n\n`);
    }
  }
}
