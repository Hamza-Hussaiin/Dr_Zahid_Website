import { Request, Response } from 'express';
import { db } from '../db';
import { users, doctorProfiles, appointments } from '../db/schema';
import { asyncHandler } from '../middleware/errorHandler';

export const getAdminAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const [allUsers, allDoctors, allAppointments] = await Promise.all([
    db.query.users.findMany(),
    db.query.doctorProfiles.findMany(),
    db.query.appointments.findMany(),
  ]);

  const totalPatients = allUsers.filter((u) => u.role === 'patient').length;
  const totalDoctors = allDoctors.length;
  const activeDoctors = allDoctors.filter((d) => d.isActive).length;

  const appointmentsByStatus: Record<string, number> = {
    pending: 0,
    accepted: 0,
    rejected: 0,
    reschedule_proposed: 0,
    completed: 0,
    cancelled: 0,
  };
  for (const a of allAppointments) {
    appointmentsByStatus[a.status] = (appointmentsByStatus[a.status] || 0) + 1;
  }

  const revenue = allAppointments
    .filter((a) => a.paymentStatus === 'paid')
    .reduce((sum, a) => sum + (a.fee || 0), 0);

  const appointmentCountByDoctor = new Map<string, number>();
  for (const a of allAppointments) {
    appointmentCountByDoctor.set(a.doctorId, (appointmentCountByDoctor.get(a.doctorId) || 0) + 1);
  }
  const mostActiveDoctors = allDoctors
    .map((d) => ({ id: d.id, name: d.name, specialization: d.specialization, appointmentCount: appointmentCountByDoctor.get(d.id) || 0 }))
    .sort((a, b) => b.appointmentCount - a.appointmentCount)
    .slice(0, 5);

  return res.json({
    success: true,
    analytics: {
      totalPatients,
      totalDoctors,
      activeDoctors,
      totalAppointments: allAppointments.length,
      appointmentsByStatus,
      revenue,
      currency: 'PKR',
      mostActiveDoctors,
    },
  });
});
