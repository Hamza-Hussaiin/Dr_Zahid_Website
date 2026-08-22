import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

/**
 * Same as requireAuth, but also accepts the token via ?token= query param.
 * Needed for endpoints reached via plain URLs (e.g. <img src>, direct links
 * to uploaded attachments) where the browser cannot attach an
 * Authorization header.
 */
export function requireAuthViaHeaderOrQuery(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const headerToken = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  const queryToken = typeof req.query.token === 'string' ? req.query.token : null;
  const token = headerToken || queryToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required to access this file.' });
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}
