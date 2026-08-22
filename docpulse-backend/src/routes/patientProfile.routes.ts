import { Router } from 'express';
import { getPatientProfile, updatePatientProfile } from '../controllers/patientProfile.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/:userId', requireAuth, getPatientProfile);
router.put('/:userId', requireAuth, updatePatientProfile);

export default router;
