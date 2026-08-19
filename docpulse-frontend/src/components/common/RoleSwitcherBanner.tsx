import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Activity, User, Stethoscope, ShieldCheck, LogOut, CheckCircle2 } from 'lucide-react';

export const RoleSwitcherBanner: React.FC = () => {
  const { user, isVisitor, isPatient, isDoctor, isAdminDoctor, quickLogin, logout } = useAuth();
  const { setCurrentView, addToast } = useApp();

  const handleSwitch = async (role: 'patient' | 'doctor' | 'admin_doctor' | 'visitor') => {
    await quickLogin(role);
    if (role === 'patient') {
      setCurrentView('patient-dashboard');
      addToast({
        type: 'success',
        title: 'Switched to Patient: Sarah Jenkins',
        message: 'You can now book appointments, view status, and chat with Dr. Zahid Hussain.'
      });
    } else if (role === 'doctor' || role === 'admin_doctor') {
      setCurrentView(role === 'doctor' ? 'doctor-dashboard' : 'admin-dashboard');
      addToast({
        type: 'success',
        title: 'Switched to Doctor & Admin: Dr. Zahid Hussain',
        message: 'Manage consultation requests, clinic schedule, Pakistani payments, and medical notes.'
      });
    } else {
      setCurrentView('home');
      addToast({
        type: 'info',
        title: 'Switched to Public Visitor',
        message: 'Browsing public medical consultation services and booking flow.'
      });
    }
  };

  return (
    <div className="bg-[#39393A] text-[#E6E6E6] text-xs border-b border-[#39393A]/40 py-2 px-4 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#5B8C5A] shrink-0" />
          <span className="font-semibold text-[#E6E6E6]">Role Switcher:</span>
          <span className="hidden sm:inline text-stone-300">Active mode:</span>
          <span className="inline-flex items-center gap-1 font-semibold text-[#E6E6E6] bg-[#5B8C5A]/25 px-2.5 py-0.5 rounded-full border border-[#5B8C5A]/40">
            {isAdminDoctor
              ? 'Admin Doctor (Dr. Zahid Hussain)'
              : isDoctor
              ? 'Doctor (Dr. Zahid Hussain)'
              : isPatient
              ? `Patient (${user?.name || 'Sarah Jenkins'})`
              : 'Public Visitor'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <button
            id="role-switch-patient"
            onClick={() => handleSwitch('patient')}
            className={`px-3 py-1 rounded-md font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              isPatient
                ? 'bg-[#5B8C5A] text-white font-semibold shadow-xs'
                : 'bg-stone-700/60 hover:bg-stone-700 text-[#E6E6E6]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Patient View</span>
          </button>

          <button
            id="role-switch-doctor"
            onClick={() => handleSwitch('doctor')}
            className={`px-3 py-1 rounded-md font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              isDoctor && !isAdminDoctor
                ? 'bg-[#5B8C5A] text-white font-semibold shadow-xs'
                : 'bg-stone-700/60 hover:bg-stone-700 text-[#E6E6E6]'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor Dashboard</span>
          </button>

          <button
            id="role-switch-admin"
            onClick={() => handleSwitch('admin_doctor')}
            className={`px-3 py-1 rounded-md font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              isAdminDoctor
                ? 'bg-[#A37774] text-white font-semibold shadow-xs'
                : 'bg-stone-700/60 hover:bg-stone-700 text-[#E6E6E6]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Doctor</span>
          </button>

          <button
            id="role-switch-visitor"
            onClick={() => handleSwitch('visitor')}
            className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-all cursor-pointer ${
              isVisitor
                ? 'bg-stone-600 text-white font-semibold'
                : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
            }`}
          >
            <span>Visitor</span>
          </button>

          {user && (
            <button
              id="role-switch-logout"
              onClick={() => {
                logout();
                setCurrentView('home');
              }}
              title="Logout"
              className="p-1.5 rounded-md hover:bg-stone-700 text-stone-300 hover:text-white transition-colors ml-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
