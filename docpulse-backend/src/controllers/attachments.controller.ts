import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { appointments, doctorProfiles } from '../db/schema';
import { verifyToken } from '../utils/jwt';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { paramStr } from '../utils/params';

const ADMIN_ROLES = ['admin_doctor', 'super_admin'];

export const viewAttachment = asyncHandler(async (req: Request, res: Response) => {
  const publicId = paramStr(req, 'publicId');
  const resourceType = (req.query.rt as string) || 'image';

  const headerToken = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
  const queryToken = typeof req.query.token === 'string' ? req.query.token : null;
  const token = headerToken || queryToken;
  if (!token) {
    throw new ApiError(401, 'Authentication required to access this file.');
  }

  let user: { id: string; role: string };
  try {
    const payload = verifyToken(token);
    user = { id: payload.userId, role: payload.role };
  } catch {
    throw new ApiError(401, 'Invalid or expired token.');
  }

  if (!ADMIN_ROLES.includes(user.role)) {
    const proxyPathPrefix = `/api/attachments/${encodeURIComponent(publicId)}`;
    const allAppointments = await db.query.appointments.findMany();
    const owningAppointment = allAppointments.find(
      (apt) =>
        Array.isArray(apt.attachments) &&
        (apt.attachments as any[]).some((att) => att && typeof att.url === 'string' && att.url.startsWith(proxyPathPrefix))
    );

    if (owningAppointment) {
      const doctor = await db.query.doctorProfiles.findFirst({ where: eq(doctorProfiles.id, owningAppointment.doctorId) });
      const isParticipant = owningAppointment.patientId === user.id || (doctor && doctor.userId === user.id);
      if (!isParticipant) {
        throw new ApiError(403, 'You do not have access to this file.');
      }
    }
  }

  const signedUrl = cloudinary.url(publicId, {
    type: 'authenticated',
    resource_type: resourceType,
    sign_url: true,
    secure: true,
  });

  return res.redirect(signedUrl);
});