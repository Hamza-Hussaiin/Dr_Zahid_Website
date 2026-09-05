import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, DoctorProfile, PatientProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  doctorProfile: DoctorProfile | null;
  patientProfile: PatientProfile | null;
  isAuthenticated: boolean;
  isVisitor: boolean;
  isPatient: boolean;
  isDoctor: boolean;
  isAdminDoctor: boolean;
  isSuperAdmin: boolean;
  login: (email?: string, password?: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  register: (data: any) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => void;
  updateCurrentUser: (userData: Partial<User>) => void;
  updateDoctorProfile: (profile: DoctorProfile) => void;
  updatePatientProfile: (profile: PatientProfile) => void;
  refreshProfiles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('zahid_clinic_user') || localStorage.getItem('docpulse_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);

  // Validate token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('zahid_clinic_token');
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('zahid_clinic_user', JSON.stringify(res.user));
          }
        } catch {
          // Token expired or invalid
        }
      }
    };
    checkAuth();
  }, []);

  const refreshProfiles = async () => {
    if (!user) {
      setDoctorProfile(null);
      setPatientProfile(null);
      return;
    }

    if (user.role === 'doctor' || user.role === 'admin_doctor' || user.role === 'super_admin') {
      const res = await api.getDoctors(true);
      if (res.success) {
        const found = res.doctors.find(d => d.userId === user.id);
        setDoctorProfile(found || null);
      }
    } else if (user.role === 'patient') {
      const res = await api.getPatientProfile(user.id);
      if (res.success && res.profile) {
        setPatientProfile(res.profile);
      }
    }
  };

  useEffect(() => {
    refreshProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const login = async (email?: string, password?: string) => {
    try {
      const res = await api.login(email, password);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('zahid_clinic_user', JSON.stringify(res.user));
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const register = async (data: any) => {
    try {
      const res = await api.register(data);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('zahid_clinic_user', JSON.stringify(res.user));
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    setDoctorProfile(null);
    setPatientProfile(null);
    localStorage.removeItem('zahid_clinic_user');
    localStorage.removeItem('zahid_clinic_token');
    localStorage.removeItem('docpulse_user');
  };

  const updateCurrentUser = (userData: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...userData };
    setUser(updated);
    localStorage.setItem('zahid_clinic_user', JSON.stringify(updated));
  };

  // Local-state setters, called after a successful save so the UI reflects
  // the change immediately without waiting for the next background refresh.
  const updateDoctorProfile = (profile: DoctorProfile) => {
    setDoctorProfile(profile);
  };

  const updatePatientProfile = (profile: PatientProfile) => {
    setPatientProfile(profile);
  };

  const isVisitor = !user;
  const isPatient = user?.role === 'patient';
  const isDoctor = user?.role === 'doctor';
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdminDoctor = user?.role === 'admin_doctor' || user?.role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        doctorProfile,
        patientProfile,
        isAuthenticated: !!user,
        isVisitor,
        isPatient,
        isDoctor,
        isAdminDoctor,
        isSuperAdmin,
        login,
        register,
        logout,
        updateCurrentUser,
        updateDoctorProfile,
        updatePatientProfile,
        refreshProfiles
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};