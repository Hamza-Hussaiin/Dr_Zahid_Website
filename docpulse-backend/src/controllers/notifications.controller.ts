import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { notifications } from '../db/schema';
import { serializeNotification } from '../utils/serialize';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { paramStr } from '../utils/params';

const ADMIN_ROLES = ['admin_doctor', 'super_admin'];

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required.');
  }

  const requestedUserId = req.query.userId as string | undefined;

  // A user always gets their own notifications by default. Only an admin
  // may look up another user's notifications (e.g. for support/oversight),
  // and only by explicitly passing ?userId=. Non-admins can never override
  // their identity via the query string.
  let targetUserId = req.user.id;
  if (requestedUserId && requestedUserId !== req.user.id) {
    if (!ADMIN_ROLES.includes(req.user.role)) {
      throw new ApiError(403, 'You can only view your own notifications.');
    }
    targetUserId = requestedUserId;
  }

  const rows = await db.query.notifications.findMany({ where: eq(notifications.userId, targetUserId) });
  rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.json({ success: true, notifications: rows.map(serializeNotification) });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const id = paramStr(req, 'id');

  if (!req.user) {
    throw new ApiError(401, 'Authentication required.');
  }

  const existing = await db.query.notifications.findFirst({ where: eq(notifications.id, id) });
  if (!existing) {
    throw new ApiError(404, 'Notification not found.');
  }

  const isOwner = existing.userId === req.user.id;
  const isAdmin = ADMIN_ROLES.includes(req.user.role);
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You can only manage your own notifications.');
  }

  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));

  return res.json({ success: true });
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required.');
  }

  const requestedUserId = (req.body as { userId?: string }).userId;

  let targetUserId = req.user.id;
  if (requestedUserId && requestedUserId !== req.user.id) {
    if (!ADMIN_ROLES.includes(req.user.role)) {
      throw new ApiError(403, 'You can only update your own notifications.');
    }
    targetUserId = requestedUserId;
  }

  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, targetUserId));

  return res.json({ success: true });
});
