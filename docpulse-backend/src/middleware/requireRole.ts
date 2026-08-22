import { Request, Response, NextFunction } from 'express';

/**
 * Restricts a route to specific roles. Must run after requireAuth.
 * Usage: router.post('/doctors', requireAuth, requireRole('admin_doctor', 'super_admin'), handler)
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' });
    }
    next();
  };
}
