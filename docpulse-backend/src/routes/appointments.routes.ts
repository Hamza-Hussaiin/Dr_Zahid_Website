import { Router } from 'express';
import { getAppointments, createAppointment, updateAppointmentStatus } from '../controllers/appointments.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, getAppointments);
router.post('/', requireAuth, createAppointment);
router.put('/:id/status', requireAuth, updateAppointmentStatus);

export default router;
