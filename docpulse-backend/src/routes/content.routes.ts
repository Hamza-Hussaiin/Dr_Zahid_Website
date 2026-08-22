import { Router } from 'express';
import { getClinicContent, updateClinicContent } from '../controllers/content.controller';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// Public: the Home/About pages need this without login.
router.get('/clinic-info', getClinicContent);

// Only admin can edit clinic-wide content.
router.put('/clinic-info', requireAuth, requireRole('admin_doctor', 'super_admin'), updateClinicContent);

export default router;
