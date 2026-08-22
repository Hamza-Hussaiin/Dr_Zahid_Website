import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';

// ---------- Enums ----------
export const userRoleEnum = pgEnum('user_role', ['patient', 'doctor', 'admin_doctor', 'super_admin']);
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive']);
export const consultationModeEnum = pgEnum('consultation_mode', ['home_visit', 'online', 'clinic_visit']);
export const appointmentStatusEnum = pgEnum('appointment_status', [
  'pending',
  'accepted',
  'rejected',
  'reschedule_proposed',
  'completed',
  'cancelled',
]);
export const slotStatusEnum = pgEnum('slot_status', ['available', 'booked', 'blocked']);
export const paymentStatusEnum = pgEnum('payment_status', ['paid', 'pending', 'refunded']);
export const paymentMethodEnum = pgEnum('payment_method', ['easypaisa', 'jazzcash', 'upaisa', 'mastercard']);

// ---------- Users ----------
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull().default(''),
  password: text('password').notNull(),
  role: userRoleEnum('role').notNull(),
  avatar: text('avatar').notNull().default(''),
  status: userStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ---------- Patient profile ----------
export const patientProfiles = pgTable('patient_profiles', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  dob: text('dob'),
  age: integer('age'),
  gender: text('gender'),
  bloodGroup: text('blood_group'),
  address: text('address'),
  emergencyContact: text('emergency_contact'),
  allergies: text('allergies'),
  chronicConditions: text('chronic_conditions'),
  currentMedications: text('current_medications'),
  insuranceProvider: text('insurance_provider'),
  insurancePolicyNumber: text('insurance_policy_number'),
});

// ---------- Doctor profile ----------
export const doctorProfiles = pgTable('doctor_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  title: text('title').notNull().default(''),
  specialization: text('specialization').notNull().default(''),
  bio: text('bio').notNull().default(''),
  qualifications: jsonb('qualifications').$type<string[]>().notNull().default([]),
  experienceYears: integer('experience_years').notNull().default(0),
  consultationFee: integer('consultation_fee').notNull().default(0),
  homeVisitFee: integer('home_visit_fee'),
  onlineFee: integer('online_fee'),
  clinicFee: integer('clinic_fee'),
  languages: jsonb('languages').$type<string[]>().notNull().default([]),
  avatar: text('avatar').notNull().default(''),
  coverImage: text('cover_image'),
  clinicAddress: text('clinic_address').notNull().default(''),
  isVerified: boolean('is_verified').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  addedBy: text('added_by'),
  servicesOffered: jsonb('services_offered').$type<string[]>().notNull().default([]),
  education: jsonb('education').$type<{ degree: string; institution: string; year: number }[]>().notNull().default([]),
  awards: jsonb('awards').$type<string[]>().notNull().default([]),
  paymentAccounts: jsonb('payment_accounts').$type<Record<string, any> | null>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ---------- Time slots ----------
export const timeSlots = pgTable('time_slots', {
  id: text('id').primaryKey(),
  doctorId: text('doctor_id').notNull().references(() => doctorProfiles.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  status: slotStatusEnum('status').notNull().default('available'),
  appointmentId: text('appointment_id'),
  reasonForBlock: text('reason_for_block'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  doctorDateIdx: index('time_slots_doctor_date_idx').on(t.doctorId, t.date),
}));

// ---------- Appointments ----------
export const appointments = pgTable('appointments', {
  id: text('id').primaryKey(),
  patientId: text('patient_id').notNull().references(() => users.id),
  patientName: text('patient_name').notNull(),
  patientEmail: text('patient_email').notNull(),
  patientPhone: text('patient_phone').notNull(),
  patientAge: integer('patient_age'),
  patientGender: text('patient_gender'),
  patientHomeAddress: text('patient_home_address'),
  consultationMode: consultationModeEnum('consultation_mode').notNull().default('clinic_visit'),
  doctorId: text('doctor_id').notNull().references(() => doctorProfiles.id),
  doctorName: text('doctor_name').notNull(),
  doctorSpecialization: text('doctor_specialization').notNull().default(''),
  doctorAvatar: text('doctor_avatar').notNull().default(''),
  slotId: text('slot_id').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  reasonForVisit: text('reason_for_visit').notNull().default(''),
  symptomsDescription: text('symptoms_description').notNull().default(''),
  durationOfSymptoms: text('duration_of_symptoms'),
  medicalHistory: text('medical_history'),
  currentMedications: text('current_medications'),
  attachments: jsonb('attachments').$type<any[]>().notNull().default([]),
  preferredCommunicationNote: text('preferred_communication_note'),
  status: appointmentStatusEnum('status').notNull().default('pending'),
  proposedSlot: jsonb('proposed_slot').$type<any | null>(),
  rejectionReason: text('rejection_reason'),
  cancellationReason: text('cancellation_reason'),
  consultationNotes: text('consultation_notes'),
  prescription: text('prescription'),
  fee: integer('fee').notNull().default(0),
  currency: text('currency').notNull().default('PKR'),
  paymentStatus: paymentStatusEnum('payment_status').notNull().default('pending'),
  paymentMethod: paymentMethodEnum('payment_method'),
  paymentDetails: jsonb('payment_details').$type<any | null>(),
  statusHistory: jsonb('status_history').$type<any[]>().notNull().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  patientIdx: index('appointments_patient_idx').on(t.patientId),
  doctorIdx: index('appointments_doctor_idx').on(t.doctorId),
}));

// ---------- Chat messages ----------
export const chatMessages = pgTable('chat_messages', {
  id: text('id').primaryKey(),
  threadId: text('thread_id').notNull(),
  appointmentId: text('appointment_id').notNull().references(() => appointments.id, { onDelete: 'cascade' }),
  senderId: text('sender_id').notNull().references(() => users.id),
  senderName: text('sender_name').notNull(),
  senderRole: userRoleEnum('sender_role').notNull(),
  senderAvatar: text('sender_avatar').notNull().default(''),
  content: text('content').notNull().default(''),
  attachment: jsonb('attachment').$type<{ name: string; url: string; type: string } | null>(),
  isRead: boolean('is_read').notNull().default(false),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
}, (t) => ({
  appointmentIdx: index('chat_messages_appointment_idx').on(t.appointmentId),
}));

// ---------- Notifications ----------
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  relatedAppointmentId: text('related_appointment_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  userIdx: index('notifications_user_idx').on(t.userId),
}));

// ---------- Reviews ----------
export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  doctorId: text('doctor_id').notNull().references(() => doctorProfiles.id, { onDelete: 'cascade' }),
  patientId: text('patient_id').notNull().references(() => users.id),
  patientName: text('patient_name').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull().default(''),
  appointmentId: text('appointment_id').unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ---------- Clinic services ----------
export const clinicServices = pgTable('clinic_services', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  iconName: text('icon_name').notNull().default(''),
  department: text('department').notNull().default(''),
  priceRange: text('price_range'),
});

// ---------- Clinic info (singleton row) ----------
export const clinicInfo = pgTable('clinic_info', {
  id: text('id').primaryKey().default('singleton'),
  name: text('name').notNull().default(''),
  doctorName: text('doctor_name').notNull().default(''),
  tagline: text('tagline').notNull().default(''),
  phone: text('phone').notNull().default(''),
  emergencyHotline: text('emergency_hotline').notNull().default(''),
  email: text('email').notNull().default(''),
  address: text('address').notNull().default(''),
  googleMapsUrl: text('google_maps_url').notNull().default(''),
  workingHours: text('working_hours').notNull().default(''),
  timingsClinic: text('timings_clinic').notNull().default(''),
  timingsOnline: text('timings_online').notNull().default(''),
  mission: text('mission').notNull().default(''),
  announcement: jsonb('announcement').$type<{ enabled: boolean; text: string; linkText?: string } | null>(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
