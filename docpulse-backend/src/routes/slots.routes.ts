import { Router } from 'express';
import { getSlots, createSlot, updateSlot, deleteSlot, toggleBlockSlot } from '../controllers/slots.controller';
import { requireAuth, optionalAuth } from '../middleware/auth';

const router = Router();

// Public: patients need to see available slots to book.
router.get('/', optionalAuth, getSlots);

// Doctor-only actions (ownership enforced in controller).
router.post('/', requireAuth, createSlot);
router.put('/:id', requireAuth, updateSlot);
router.delete('/:id', requireAuth, deleteSlot);
router.put('/:id/toggle-block', requireAuth, toggleBlockSlot);

export default router;
