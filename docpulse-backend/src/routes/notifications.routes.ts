import { Router } from 'express';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../controllers/notifications.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, getNotifications);
router.put('/read-all', requireAuth, markAllNotificationsRead);
router.put('/:id/read', requireAuth, markNotificationRead);

export default router;
