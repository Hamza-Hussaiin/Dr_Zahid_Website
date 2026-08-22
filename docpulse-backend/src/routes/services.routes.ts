import { Router } from 'express';
import { createService, deleteService } from '../controllers/services.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.post('/', requireAuth, requireRole('admin_doctor', 'super_admin'), createService);
router.delete('/:id', requireAuth, requireRole('admin_doctor', 'super_admin'), deleteService);

export default router;
