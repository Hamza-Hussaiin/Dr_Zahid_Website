import { Router } from 'express';
import { getClinicalAiSummary } from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/clinical-summary', requireAuth, getClinicalAiSummary);

export default router;
