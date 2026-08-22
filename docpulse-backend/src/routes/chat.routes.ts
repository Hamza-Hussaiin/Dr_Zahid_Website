import { Router } from 'express';
import { getChatMessages, sendChatMessage } from '../controllers/chat.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/:appointmentId', requireAuth, getChatMessages);
router.post('/', requireAuth, sendChatMessage);

export default router;
