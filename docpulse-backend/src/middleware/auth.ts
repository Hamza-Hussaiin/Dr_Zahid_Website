import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

/**
 * Requires a valid Bearer token. Rejects the request with 401 if missing/invalid.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

/**
 * Attaches req.user if a valid token is present, but does not reject the
 * request if the token is missing/invalid. Used for public routes whose
 * response can optionally vary for logged-in users (e.g. doctor directory).
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;

  if (token) {
    try {
      const payload = verifyToken(token);
      req.user = { id: payload.userId, role: payload.role };
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}
