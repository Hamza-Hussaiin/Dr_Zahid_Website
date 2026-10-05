import { Router } from 'express';
import { register, login, me, updateMyAvatar, forgotPassword, resetPassword, changeMyPassword, updateMyContactInfo } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { loginRateLimiter, registerRateLimiter, forgotPasswordRateLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/register', registerRateLimiter, register);
router.post('/login', loginRateLimiter, login);
router.get('/me', requireAuth, me);
router.patch('/me/avatar', requireAuth, updateMyAvatar);
router.patch('/me/password', requireAuth, changeMyPassword);
router.patch('/me/contact', requireAuth, updateMyContactInfo);
router.post('/forgot-password', forgotPasswordRateLimiter, forgotPassword);
router.post('/reset-password', forgotPasswordRateLimiter, resetPassword);

export default router;