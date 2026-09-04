import { Router } from 'express';
import { register, login, me } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { loginRateLimiter, registerRateLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/register', registerRateLimiter, register);
router.post('/login', loginRateLimiter, login);
router.get('/me', requireAuth, me);

export default router;