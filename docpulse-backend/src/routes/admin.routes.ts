import { Router } from 'express';
import { getAdminAnalytics } from '../controllers/admin.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/analytics', requireAuth, requireRole('admin_doctor', 'super_admin'), getAdminAnalytics);

export default router;
