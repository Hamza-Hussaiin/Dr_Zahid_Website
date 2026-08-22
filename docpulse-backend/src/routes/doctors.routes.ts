import { Router } from 'express';
import { getDoctors, getDoctorById, addDoctor, updateDoctor, deleteDoctor } from '../controllers/doctors.controller';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// Public: anyone can browse the doctor directory / a doctor's profile.
router.get('/', optionalAuth, getDoctors);
router.get('/:id', optionalAuth, getDoctorById);

// Only an admin doctor (or super admin) can onboard new doctors.
router.post('/', requireAuth, requireRole('admin_doctor', 'super_admin'), addDoctor);

// A doctor can edit their own profile; admin/super_admin can edit any (enforced in controller).
router.put('/:id', requireAuth, updateDoctor);

// Only admin can deactivate a doctor account.
router.delete('/:id', requireAuth, requireRole('admin_doctor', 'super_admin'), deleteDoctor);

export default router;
