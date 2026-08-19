export type UserRole = 'visitor' | 'patient' | 'doctor' | 'admin_doctor' | 'super_admin';

export type ConsultationMode = 'home_visit' | 'online' | 'clinic_visit';

export type AppointmentStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'reschedule_proposed'
  | 'completed'
  | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface PatientProfile {
  userId: string;
  dob: string;
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bloodGroup?: string;
  address: string;
  emergencyContact?: string;
  allergies?: string;
  chronicConditions?: string;
  currentMedications?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
}

export interface DoctorPaymentAccounts {
  easypaisa?: {
    accountTitle: string;
    accountNumber: string;
  };
  jazzcash?: {
    accountTitle: string;
    accountNumber: string;
  };
  upaisa?: {
    accountTitle: string;
    accountNumber: string;
  };
  mastercard?: {
    accountTitle: string;
    bankName: string;
    accountNumber: string;
    iban: string;
  };
}

export interface DoctorProfile {
  id: string; // doctorId or userId
  userId: string;
  name: string;
  title: string;
  specialization: string;
  bio: string;
  qualifications: string[];
  experienceYears: number;
  consultationFee: number; // default/clinic/online (1200 PKR)
  homeVisitFee?: number; // 5000 PKR
  onlineFee?: number; // 1200 PKR
  clinicFee?: number; // 1200 PKR
  languages: string[];
  avatar: string;
  coverImage?: string;
  clinicAddress: string;
  isVerified: boolean;
  isActive: boolean;
  addedBy?: string; // admin doctor ID
  servicesOffered: string[];
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
  awards?: string[];
  paymentAccounts?: DoctorPaymentAccounts;
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: 'available' | 'booked' | 'blocked';
  appointmentId?: string;
  reasonForBlock?: string;
}

export interface AppointmentAttachment {
  id: string;
  name: string;
  size: string;
  type: string; // 'pdf' | 'image' | 'doc'
  url: string;
}

export interface StatusHistoryEntry {
  status: AppointmentStatus;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  note?: string;
}

export type PaymentMethod = 'easypaisa' | 'jazzcash' | 'upaisa' | 'mastercard';

export interface PaymentDetails {
  method: PaymentMethod;
  recipientTitle: string;
  recipientNumber: string;
  bankName?: string;
  branchCode?: string;
  senderAccount: string;
  senderName?: string;
  transactionId: string;
  paidAmount: number;
  currency: string; // e.g. 'PKR'
  depositReceiptNote?: string;
  screenshotName?: string;
  submittedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  patientHomeAddress?: string;
  consultationMode: ConsultationMode; // 'home_visit' | 'online' | 'clinic_visit'
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorAvatar: string;
  slotId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm - HH:mm
  reasonForVisit: string;
  symptomsDescription: string;
  durationOfSymptoms?: string;
  medicalHistory?: string;
  currentMedications?: string;
  attachments: AppointmentAttachment[];
  preferredCommunicationNote?: string;
  status: AppointmentStatus;
  proposedSlot?: {
    slotId: string;
    date: string;
    time: string;
    note: string;
  };
  rejectionReason?: string;
  cancellationReason?: string;
  consultationNotes?: string;
  prescription?: string;
  fee: number;
  currency?: string; // 'PKR'
  paymentStatus: 'paid' | 'pending' | 'refunded';
  paymentMethod?: PaymentMethod;
  paymentDetails?: PaymentDetails;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  appointmentId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar: string;
  content: string;
  attachment?: {
    name: string;
    url: string;
    type: string;
  };
  isRead: boolean;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment_request' | 'appointment_accepted' | 'appointment_rejected' | 'reschedule_proposed' | 'appointment_cancelled' | 'appointment_completed' | 'chat_message' | 'system';
  isRead: boolean;
  relatedAppointmentId?: string;
  createdAt: string;
}

export interface ClinicService {
  id: string;
  title: string;
  description: string;
  iconName: string;
  department: string;
  priceRange?: string;
}

export interface ClinicInfo {
  name: string;
  doctorName: string;
  tagline: string;
  phone: string;
  emergencyHotline: string;
  email: string;
  address: string;
  googleMapsUrl: string;
  workingHours: string;
  timingsClinic: string;
  timingsOnline: string;
  mission: string;
  announcement?: {
    enabled: boolean;
    text: string;
    linkText?: string;
  };
}
