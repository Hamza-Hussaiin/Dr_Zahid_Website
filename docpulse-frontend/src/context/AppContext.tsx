import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Appointment, DoctorProfile, NotificationItem, ClinicInfo, ClinicService } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export interface ToastAlert {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

export type AppView =
  | 'home'
  | 'about'
  | 'doctors'
  | 'doctor-detail'
  | 'services'
  | 'contact'
  | 'patient-dashboard'
  | 'doctor-dashboard'
  | 'admin-dashboard'
  | 'booking'
  | 'profile-settings';

interface AppContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedDoctorId: string | null;
  setSelectedDoctorId: (id: string | null) => void;
  selectedAppointment: Appointment | null;
  setSelectedAppointment: (apt: Appointment | null) => void;
  
  doctors: DoctorProfile[];
  appointments: Appointment[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  clinicInfo: ClinicInfo | null;
  clinicServices: ClinicService[];
  toasts: ToastAlert[];
  
  // Modals state
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  authModalRole: 'patient' | 'doctor' | 'admin_doctor';
  openAuthModal: (tab?: 'login' | 'register', role?: 'patient' | 'doctor' | 'admin_doctor') => void;
  closeAuthModal: () => void;

  isChatModalOpen: boolean;
  activeChatAppointmentId: string | null;
  openChat: (appointmentId: string) => void;
  closeChat: () => void;

  isAddDoctorModalOpen: boolean;
  setIsAddDoctorModalOpen: (open: boolean) => void;

  // Actions
  refreshAllData: () => Promise<void>;
  addToast: (toast: Omit<ToastAlert, 'id'>) => void;
  removeToast: (id: string) => void;
  navigateToDoctorDetail: (doctorId: string) => void;
  startBookingWithDoctor: (doctorId?: string) => void;
  
  // Appointment Transitions
  handleAcceptAppointment: (appointmentId: string, note?: string) => Promise<boolean>;
  handleRejectAppointment: (appointmentId: string, reason: string) => Promise<boolean>;
  handleProposeReschedule: (appointmentId: string, proposedSlotId: string, note: string) => Promise<boolean>;
  handleAcceptReschedule: (appointmentId: string) => Promise<boolean>;
  handleCancelAppointment: (appointmentId: string, reason: string) => Promise<boolean>;
  handleCompleteAppointment: (appointmentId: string, notes?: string, prescription?: string) => Promise<boolean>;
  handleMarkNotificationRead: (notifId: string) => Promise<void>;
  handleMarkAllNotificationsRead: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null);
  const [clinicServices, setClinicServices] = useState<ClinicService[]>([]);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [authModalRole, setAuthModalRole] = useState<'patient' | 'doctor' | 'admin_doctor'>('patient');

  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [activeChatAppointmentId, setActiveChatAppointmentId] = useState<string | null>(null);

  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);

  const addToast = useCallback((toast: Omit<ToastAlert, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshAllData = useCallback(async () => {
    try {
      const [docsRes, aptsRes, notifsRes, contentRes] = await Promise.all([
        api.getDoctors(true),
        api.getAppointments({
          userId: user?.id,
          role: user?.role
        }),
        api.getNotifications(user?.id),
        api.getClinicContent()
      ]);

      if (docsRes.success) setDoctors(docsRes.doctors);
      if (aptsRes.success) setAppointments(aptsRes.appointments);
      if (notifsRes.success) setNotifications(notifsRes.notifications);
      if (contentRes.success) {
        setClinicInfo(contentRes.clinicInfo);
        setClinicServices(contentRes.services);
      }
    } catch (err) {
      console.error('Error refreshing app data:', err);
    }
  }, [user]);

  useEffect(() => {
    refreshAllData();
    
    // Connect to real-time Server-Sent Events stream when user is logged in
    let unsubscribeSse: (() => void) | null = null;
    if (user?.id) {
      unsubscribeSse = api.subscribeEvents(user.id, (event) => {
        if (event.type === 'notification') {
          setNotifications(prev => [event.payload, ...prev.filter(n => n.id !== event.payload.id)]);
          addToast({
            type: 'info',
            title: event.payload.title || 'New Notification',
            message: event.payload.message || ''
          });
        } else if (event.type === 'appointment_updated' || event.type === 'new_appointment_request') {
          refreshAllData();
        } else if (event.type === 'doctor_added' || event.type === 'doctor_updated') {
          refreshAllData();
        }
      });
    }

    const interval = setInterval(refreshAllData, 12000); // Background heartbeat
    return () => {
      clearInterval(interval);
      if (unsubscribeSse) unsubscribeSse();
    };
  }, [user, refreshAllData, addToast]);

  const openAuthModal = (tab: 'login' | 'register' = 'login', role: 'patient' | 'doctor' | 'admin_doctor' = 'patient') => {
    setAuthModalTab(tab);
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const openChat = (appointmentId: string) => {
    setActiveChatAppointmentId(appointmentId);
    setIsChatModalOpen(true);
  };

  const closeChat = () => {
    setIsChatModalOpen(false);
    setActiveChatAppointmentId(null);
  };

  const navigateToDoctorDetail = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setCurrentView('doctor-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startBookingWithDoctor = (doctorId?: string) => {
    if (!user) {
      openAuthModal('login', 'patient');
      addToast({
        type: 'info',
        title: 'Sign In Required',
        message: 'Please sign in or register as a patient to reserve an appointment slot.'
      });
      return;
    }
    if (doctorId) setSelectedDoctorId(doctorId);
    setCurrentView('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Appointment State Machine Actions
  const handleAcceptAppointment = async (appointmentId: string, note?: string) => {
    if (!user) return false;
    const res = await api.updateAppointmentStatus(appointmentId, {
      action: 'accept',
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      note
    });
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Appointment Accepted',
        message: 'Patient notified. Direct consultation chat is now live!'
      });
      await refreshAllData();
      return true;
    } else {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: res.message || 'Unable to accept appointment'
      });
      return false;
    }
  };

  const handleRejectAppointment = async (appointmentId: string, reason: string) => {
    if (!user) return false;
    const res = await api.updateAppointmentStatus(appointmentId, {
      action: 'reject',
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      reason
    });
    if (res.success) {
      addToast({
        type: 'warning',
        title: 'Appointment Declined',
        message: 'Patient has been notified and the slot was reopened.'
      });
      await refreshAllData();
      return true;
    } else {
      addToast({
        type: 'error',
        title: 'Error',
        message: res.message || 'Unable to reject appointment'
      });
      return false;
    }
  };

  const handleProposeReschedule = async (appointmentId: string, proposedSlotId: string, note: string) => {
    if (!user) return false;
    const res = await api.updateAppointmentStatus(appointmentId, {
      action: 'propose_reschedule',
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      proposedSlotId,
      note
    });
    if (res.success) {
      addToast({
        type: 'info',
        title: 'Reschedule Proposed',
        message: 'The patient has received your proposed slot for review.'
      });
      await refreshAllData();
      return true;
    } else {
      addToast({
        type: 'error',
        title: 'Error',
        message: res.message || 'Failed to propose new time'
      });
      return false;
    }
  };

  const handleAcceptReschedule = async (appointmentId: string) => {
    if (!user) return false;
    const res = await api.updateAppointmentStatus(appointmentId, {
      action: 'accept_reschedule',
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role
    });
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Reschedule Confirmed!',
        message: 'Your new appointment time is locked in and chat is active.'
      });
      await refreshAllData();
      return true;
    } else {
      addToast({
        type: 'error',
        title: 'Error',
        message: res.message || 'Failed to confirm reschedule'
      });
      return false;
    }
  };

  const handleCancelAppointment = async (appointmentId: string, reason: string) => {
    if (!user) return false;
    const res = await api.updateAppointmentStatus(appointmentId, {
      action: 'cancel',
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      reason
    });
    if (res.success) {
      addToast({
        type: 'info',
        title: 'Appointment Cancelled',
        message: 'The appointment has been cancelled and the slot is freed.'
      });
      await refreshAllData();
      return true;
    } else {
      addToast({
        type: 'error',
        title: 'Error',
        message: res.message || 'Unable to cancel appointment'
      });
      return false;
    }
  };

  const handleCompleteAppointment = async (appointmentId: string, notes?: string, prescription?: string) => {
    if (!user) return false;
    const res = await api.updateAppointmentStatus(appointmentId, {
      action: 'complete',
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      consultationNotes: notes,
      prescription
    });
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Consultation Completed',
        message: 'Visit marked complete, notes recorded, and patient invited to review.'
      });
      await refreshAllData();
      return true;
    } else {
      addToast({
        type: 'error',
        title: 'Error',
        message: res.message || 'Unable to complete appointment'
      });
      return false;
    }
  };

  const handleMarkNotificationRead = async (notifId: string) => {
    await api.markNotificationRead(notifId);
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!user) return;
    await api.markAllNotificationsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedDoctorId,
        setSelectedDoctorId,
        selectedAppointment,
        setSelectedAppointment,
        doctors,
        appointments,
        notifications,
        unreadNotificationCount,
        clinicInfo,
        clinicServices,
        toasts,
        isAuthModalOpen,
        authModalTab,
        authModalRole,
        openAuthModal,
        closeAuthModal,
        isChatModalOpen,
        activeChatAppointmentId,
        openChat,
        closeChat,
        isAddDoctorModalOpen,
        setIsAddDoctorModalOpen,
        refreshAllData,
        addToast,
        removeToast,
        navigateToDoctorDetail,
        startBookingWithDoctor,
        handleAcceptAppointment,
        handleRejectAppointment,
        handleProposeReschedule,
        handleAcceptReschedule,
        handleCancelAppointment,
        handleCompleteAppointment,
        handleMarkNotificationRead,
        handleMarkAllNotificationsRead
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
