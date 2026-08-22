import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, doctorProfiles, clinicInfo } from '../db/schema';
import { generateId } from '../utils/ids';
import { hashPassword } from '../utils/hash';
import { env } from '../config/env';

/**
 * Runs once on server start. Creates the very first admin doctor account
 * from .env values if no user with that email exists yet, and seeds a
 * default clinic_info row so the public site never renders with empty
 * content. Safe to run on every restart - it no-ops once the data exists.
 */
export async function runBootstrap() {
  const existingAdmin = await db.query.users.findFirst({ where: eq(users.email, env.bootstrapAdmin.email.toLowerCase()) });

  if (!existingAdmin) {
    const hashedPassword = await hashPassword(env.bootstrapAdmin.password);
    const userId = generateId('usr');

    await db.insert(users).values({
      id: userId,
      name: env.bootstrapAdmin.name,
      email: env.bootstrapAdmin.email.toLowerCase(),
      phone: env.bootstrapAdmin.phone,
      password: hashedPassword,
      role: 'admin_doctor',
      status: 'active',
    });

    await db.insert(doctorProfiles).values({
      id: generateId('doc'),
      userId,
      name: env.bootstrapAdmin.name,
      title: 'Founder & Lead Physician',
      specialization: 'General Medicine',
      isVerified: true,
      isActive: true,
    });

    console.log(`[bootstrap] Created admin doctor account: ${env.bootstrapAdmin.email}`);
  }

  const existingInfo = await db.query.clinicInfo.findFirst({ where: eq(clinicInfo.id, 'singleton') });
  if (!existingInfo) {
    await db.insert(clinicInfo).values({
      id: 'singleton',
      name: 'DocPulse Clinic',
      doctorName: env.bootstrapAdmin.name,
      tagline: 'Compassionate care, modern convenience.',
      phone: env.bootstrapAdmin.phone,
      emergencyHotline: env.bootstrapAdmin.phone,
      email: env.bootstrapAdmin.email,
      address: '',
      googleMapsUrl: '',
      workingHours: 'Mon-Sat, 9:00 AM - 6:00 PM',
      timingsClinic: '9:00 AM - 6:00 PM',
      timingsOnline: '9:00 AM - 9:00 PM',
      mission: 'Providing accessible, modern healthcare for every patient.',
    });
    console.log('[bootstrap] Seeded default clinic info.');
  }
}
