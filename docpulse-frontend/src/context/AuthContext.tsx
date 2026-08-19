import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, DoctorProfile, PatientProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  currentDoctorProfile: DoctorProfile | null;
  patientProfile: PatientProfile | null;
  isAuthenticated: boolean;
  isVisitor: boolean;
  isPatient: boolean;
  isDoctor: boolean;
  isAdminDoctor: boolean;
  login: (email?: string, password?: string, role?: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: any) => Promise<{ success: boolean; message?: string }>;
  quickLogin: (role: 'patient' | 'doctor' | 'admin_doctor' | 'visitor') => Promise<void>;
  logout: () => void;
  updateCurrentUser: (userData: Partial<User>) => void;
  refreshProfiles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('zahid_clinic_user') || localStorage.getItem('docpulse_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentDoctorProfile, setCurrentDoctorProfile] = useState<DoctorProfile | null>(null);
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
      setCurrentDoctorProfile(null);
      setPatientProfile(null);
      return;
    }

    if (user.role === 'doctor' || user.role === 'admin_doctor') {
      const res = await api.getDoctors(true);
      if (res.success) {
        const found = res.doctors.find(d => d.userId === user.id);
        setCurrentDoctorProfile(found || null);
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
  }, [user]);

  const login = async (email?: string, password?: string, role?: string) => {
    try {
      const res = await api.login(email, password, role);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('zahid_clinic_user', JSON.stringify(res.user));
        return { success: true };
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
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const quickLogin = async (role: 'patient' | 'doctor' | 'admin_doctor' | 'visitor') => {
    if (role === 'visitor') {
      logout();
      return;
    }
    await login(undefined, undefined, role);
  };

  const logout = () => {
    setUser(null);
    setCurrentDoctorProfile(null);
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

  const isVisitor = !user;
  const isPatient = user?.role === 'patient';
  const isDoctor = user?.role === 'doctor';
  const isAdminDoctor = user?.role === 'admin_doctor' || user?.role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        currentDoctorProfile,
        patientProfile,
        isAuthenticated: !!user,
        isVisitor,
        isPatient,
        isDoctor,
        isAdminDoctor,
        login,
        register,
        quickLogin,
        logout,
        updateCurrentUser,
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
