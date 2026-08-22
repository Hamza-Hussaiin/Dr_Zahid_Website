import { Router } from 'express';
import { submitReview } from '../controllers/reviews.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/', requireAuth, submitReview);

export default router;
