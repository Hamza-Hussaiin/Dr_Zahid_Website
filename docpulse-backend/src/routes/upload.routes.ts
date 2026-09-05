import { Router } from 'express';
import { uploadFile, uploadAvatar } from '../controllers/upload.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/', requireAuth, uploadFile);
router.post('/avatar', requireAuth, uploadAvatar);

export default router;