import { 
  Appointment, 
  ChatMessage, 
  DoctorProfile, 
  NotificationItem, 
  PatientProfile, 
  TimeSlot, 
  User, 
  ClinicInfo, 
  ClinicService 
} from '../types';

// Base URL for the backend API. Leave VITE_API_URL unset to keep using relative
// paths (e.g. when the backend serves the built frontend from the same origin,
// or a dev proxy handles /api — see vite.config.ts). Set VITE_API_URL in a .env
// file (e.g. http://localhost:5000) to point at a backend running elsewhere.
const API_BASE: string = (import.meta as any).env?.VITE_API_URL || '';

function getAuthHeaders(contentType: string = 'application/json'): Record<string, string> {
  const headers: Record<string, string> = {};
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  const token = localStorage.getItem('zahid_clinic_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(email?: string, password?: string, role?: string): Promise<{ success: boolean; user: User; token?: string; message?: string }> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    const data = await res.json();
    if (data.success && data.token) {
      localStorage.setItem('zahid_clinic_token', data.token);
    }
    return data;
  },

  async register(data: any): Promise<{ success: boolean; user: User; token?: string; message?: string }> {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const resData = await res.json();
    if (resData.success && resData.token) {
      localStorage.setItem('zahid_clinic_token', resData.token);
    }
    return resData;
  },

  async getMe(): Promise<{ success: boolean; user?: User; message?: string }> {
    const token = localStorage.getItem('zahid_clinic_token');
    if (!token) return { success: false, message: 'No token stored' };
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Real Clinical File Upload (Base64 wrapper with validation)
  async uploadAttachment(file: File): Promise<{ success: boolean; url: string; name: string; size: string; type: string; message?: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              fileName: file.name,
              fileType: file.type,
              fileBase64: base64
            })
          });
          const json = await res.json();
          resolve(json);
        } catch (err: any) {
          resolve({ success: false, url: '', name: file.name, size: '0 KB', type: 'unknown', message: err.message || 'Upload failed' });
        }
      };
      reader.onerror = () => {
        resolve({ success: false, url: '', name: file.name, size: '0 KB', type: 'unknown', message: 'Failed to read file from disk.' });
      };
      reader.readAsDataURL(file);
    });
  },

  // Real-Time Server-Sent Events (SSE) Stream Listener
  subscribeEvents(userId: string, onEvent: (event: { type: string; payload: any; timestamp: string }) => void): () => void {
    const token = localStorage.getItem('zahid_clinic_token') || '';
    const eventSource = new EventSource(`${API_BASE}/api/events?userId=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}`);

    eventSource.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);
        onEvent(parsed);
      } catch (err) {
        console.error('Failed to parse SSE event data', err);
      }
    };

    eventSource.onerror = (err) => {
      // EventSource auto-reconnects natively
      console.warn('SSE stream connection notice, retrying in background...', err);
    };

    return () => {
      eventSource.close();
    };
  },

  // Doctors
  async getDoctors(all?: boolean): Promise<{ success: boolean; doctors: DoctorProfile[] }> {
    const res = await fetch(`${API_BASE}/api/doctors${all ? '?all=true' : ''}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getDoctorById(id: string): Promise<{ success: boolean; doctor: DoctorProfile; reviews: any[]; slots: TimeSlot[] }> {
    const res = await fetch(`${API_BASE}/api/doctors/${id}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async addDoctor(data: Partial<DoctorProfile> & { email: string; phone?: string; addedBy?: string }): Promise<{ success: boolean; doctor: DoctorProfile; user: User; message?: string }> {
    const res = await fetch(`${API_BASE}/api/doctors`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async createDoctor(data: Partial<DoctorProfile> & { email: string; phone?: string; addedBy?: string }): Promise<{ success: boolean; doctor: DoctorProfile; user: User; message?: string }> {
    return this.addDoctor(data);
  },

  async updateDoctor(id: string, data: Partial<DoctorProfile>): Promise<{ success: boolean; doctor: DoctorProfile }> {
    const res = await fetch(`${API_BASE}/api/doctors/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateDoctorProfile(id: string, data: Partial<DoctorProfile>): Promise<{ success: boolean; doctor: DoctorProfile }> {
    return this.updateDoctor(id, data);
  },

  async deleteDoctor(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`${API_BASE}/api/doctors/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Appointments
  async getAppointments(params: { userId?: string; role?: string; doctorId?: string }): Promise<{ success: boolean; appointments: Appointment[] }> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const res = await fetch(`${API_BASE}/api/appointments?${query}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async createAppointment(data: any): Promise<{ success: boolean; appointment: Appointment; message?: string }> {
    const res = await fetch(`${API_BASE}/api/appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateAppointmentStatus(
    id: string,
    actionPayload: {
      action: 'accept' | 'reject' | 'propose_reschedule' | 'accept_reschedule' | 'cancel' | 'complete';
      actorId: string;
      actorName: string;
      actorRole: string;
      note?: string;
      reason?: string;
      proposedSlotId?: string;
      consultationNotes?: string;
      prescription?: string;
    }
  ): Promise<{ success: boolean; appointment: Appointment; message?: string }> {
    const res = await fetch(`${API_BASE}/api/appointments/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(actionPayload)
    });
    return res.json();
  },

  // Slots
  async getSlots(doctorId?: string, date?: string): Promise<{ success: boolean; slots: TimeSlot[] }> {
    const query = new URLSearchParams();
    if (doctorId) query.append('doctorId', doctorId);
    if (date) query.append('date', date);
    const res = await fetch(`${API_BASE}/api/slots?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async addSlot(data: { doctorId: string; date: string; startTime: string; endTime: string; status?: string; isRecurring?: boolean }): Promise<{ success: boolean; slot: TimeSlot }> {
    const res = await fetch(`${API_BASE}/api/slots`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async createSlot(data: { doctorId: string; date: string; startTime: string; endTime: string; status?: string; isRecurring?: boolean }): Promise<{ success: boolean; slot: TimeSlot }> {
    return this.addSlot(data);
  },

  async updateSlot(id: string, data: Partial<TimeSlot>): Promise<{ success: boolean; slot: TimeSlot }> {
    const res = await fetch(`${API_BASE}/api/slots/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteSlot(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`${API_BASE}/api/slots/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async toggleBlockSlot(id: string, reason?: string): Promise<{ success: boolean; slot: TimeSlot }> {
    const res = await fetch(`${API_BASE}/api/slots/${id}/toggle-block`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    return res.json();
  },

  // Chat
  async getChatMessages(appointmentId: string): Promise<{ success: boolean; messages: ChatMessage[] }> {
    const res = await fetch(`${API_BASE}/api/chat/${appointmentId}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async sendChatMessage(data: {
    appointmentId: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    senderAvatar?: string;
    content?: string;
    message?: string;
    attachment?: { name: string; url: string; type: string };
  }): Promise<{ success: boolean; message: ChatMessage; chatMessage?: ChatMessage }> {
    const payload = {
      ...data,
      content: data.content || data.message || ''
    };
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.message && !json.chatMessage) {
      json.chatMessage = json.message;
    }
    return json;
  },

  // Notifications
  async getNotifications(userId?: string): Promise<{ success: boolean; notifications: NotificationItem[] }> {
    const res = await fetch(`${API_BASE}/api/notifications${userId ? `?userId=${userId}` : ''}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, { 
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async markAllNotificationsRead(userId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/api/notifications/read-all`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId })
    });
    return res.json();
  },

  // Patient Profile
  async getPatientProfile(userId: string): Promise<{ success: boolean; profile: PatientProfile | null }> {
    const res = await fetch(`${API_BASE}/api/patient-profile/${userId}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async updatePatientProfile(userId: string, profile: Partial<PatientProfile>): Promise<{ success: boolean; profile: PatientProfile }> {
    const res = await fetch(`${API_BASE}/api/patient-profile/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profile)
    });
    return res.json();
  },

  // Reviews
  async submitReview(data: { doctorId: string; patientId: string; patientName: string; rating: number; comment: string; appointmentId?: string }): Promise<{ success: boolean; review: any }> {
    const res = await fetch(`${API_BASE}/api/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Analytics & Content
  async getAdminAnalytics(): Promise<{ success: boolean; analytics: any }> {
    const res = await fetch(`${API_BASE}/api/admin/analytics`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getClinicContent(): Promise<{ success: boolean; clinicInfo: ClinicInfo; services: ClinicService[] }> {
    const res = await fetch(`${API_BASE}/api/content/clinic-info`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async updateClinicContent(data: Partial<ClinicInfo>): Promise<{ success: boolean; clinicInfo: ClinicInfo; clinic?: ClinicInfo }> {
    const res = await fetch(`${API_BASE}/api/content/clinic-info`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (json.clinicInfo && !json.clinic) json.clinic = json.clinicInfo;
    return json;
  },

  async updateClinicInfo(data: Partial<ClinicInfo>): Promise<{ success: boolean; clinicInfo: ClinicInfo; clinic?: ClinicInfo }> {
    return this.updateClinicContent(data);
  },

  async createService(data: Partial<ClinicService>): Promise<{ success: boolean; service: ClinicService }> {
    const res = await fetch(`${API_BASE}/api/services`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteService(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`${API_BASE}/api/services/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // AI Summary
  async getClinicalAiSummary(payload: any): Promise<{ success: boolean; summary: string; source: string }> {
    const res = await fetch(`${API_BASE}/api/ai/clinical-summary`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async getAiClinicalSummary(payload: any): Promise<{ success: boolean; summary: string; source: string }> {
    return this.getClinicalAiSummary(payload);
  }
};
