import { Router } from 'express';
import { uploadFile } from '../controllers/upload.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/', requireAuth, uploadFile);

export default router;
