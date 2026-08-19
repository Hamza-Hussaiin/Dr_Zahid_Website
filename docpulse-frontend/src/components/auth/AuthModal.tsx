import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { X, User, Stethoscope, Lock, Mail, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { login, register, quickLogin } = useAuth();
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalTab, 
    authModalRole, 
    setCurrentView,
    addToast 
  } = useApp();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'patient' | 'doctor' | 'admin_doctor'>('patient');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('0300-1234567');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('1995-06-14');
  const [gender, setGender] = useState('female');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setTab(authModalTab);
    setRole(authModalRole);
    setErrorMsg('');
  }, [authModalTab, authModalRole, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    if (tab === 'login') {
      const res = await login(email, password, role);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Welcome Back',
          message: `Successfully signed in.`
        });
        closeAuthModal();
        if (role === 'admin_doctor' || role === 'doctor') setCurrentView('doctor-dashboard');
        else setCurrentView('patient-dashboard');
      } else {
        setErrorMsg(res.message || 'Login failed. Please check your credentials.');
      }
    } else {
      if (!name.trim()) {
        setErrorMsg('Please enter your full legal name.');
        setIsLoading(false);
        return;
      }
      const res = await register({
        name,
        email,
        phone,
        password,
        role,
        dob,
        gender
      });
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Account Created',
          message: `Welcome to Zahid's Clinic, ${name}.`
        });
        closeAuthModal();
        if (role === 'doctor' || role === 'admin_doctor') setCurrentView('doctor-dashboard');
        else setCurrentView('patient-dashboard');
      } else {
        setErrorMsg(res.message || 'Registration failed.');
      }
    }
    setIsLoading(false);
  };

  const handleQuickDemo = async (demoRole: 'patient' | 'doctor' | 'admin_doctor') => {
    setIsLoading(true);
    await quickLogin(demoRole);
    addToast({
      type: 'success',
      title: 'Demo Session Active',
      message: `Signed in as ${demoRole === 'admin_doctor' || demoRole === 'doctor' ? 'Dr. Zahid Hussain' : 'Patient Sarah Jenkins'}.`
    });
    setIsLoading(false);
    closeAuthModal();
    if (demoRole === 'admin_doctor' || demoRole === 'doctor') setCurrentView('doctor-dashboard');
    else setCurrentView('patient-dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#D6D6D6] w-full max-w-md overflow-hidden relative">
        
        {/* Header */}
        <div className="p-6 bg-[#39393A] text-white relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 text-stone-300 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#5B8C5A] flex items-center justify-center text-white font-bold text-sm">
              ZC
            </div>
            <span className="font-bold text-lg text-white">Zahid's Clinic</span>
          </div>
          <p className="text-xs text-stone-300">
            {tab === 'login' ? 'Sign in to access your consultations and health records.' : 'Create an account to book specialist appointments.'}
          </p>

          {/* Tab Switcher */}
          <div className="flex bg-[#2A2A2B] rounded-xl p-1 mt-4 border border-stone-600">
            <button
              onClick={() => { setTab('login'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                tab === 'login' ? 'bg-[#5B8C5A] text-white shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('register'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                tab === 'register' ? 'bg-[#5B8C5A] text-white shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6">

          {/* Quick 1-Click Demo Profiles */}
          <div className="mb-5 p-3 rounded-xl bg-[#E6E6E6]/60 border border-[#D6D6D6]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-2">
              Instant 1-Click Demo Profiles:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('patient')}
                className="p-2 text-center rounded-lg bg-white hover:bg-[#E6E6E6] border border-[#D6D6D6] hover:border-[#5B8C5A] transition-all cursor-pointer text-xs"
              >
                <span className="block font-bold text-[#39393A]">Sarah Jenkins</span>
                <span className="text-[10px] text-[#5B8C5A] font-medium">Patient</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin_doctor')}
                className="p-2 text-center rounded-lg bg-white hover:bg-[#E6E6E6] border border-[#D6D6D6] hover:border-[#5B8C5A] transition-all cursor-pointer text-xs"
              >
                <span className="block font-bold text-[#39393A]">Dr. Zahid Hussain</span>
                <span className="text-[10px] text-[#5B8C5A] font-medium">Consultant Physician</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {errorMsg && (
              <div className="p-3 text-xs bg-[#A37774]/15 text-[#A37774] rounded-lg border border-[#A37774]/30 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Role Selection for Registration */}
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#39393A] mb-1">Select Account Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('patient')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                      role === 'patient'
                        ? 'border-[#5B8C5A] bg-[#5B8C5A]/15 text-[#5B8C5A] font-bold'
                        : 'border-[#D6D6D6] text-[#39393A] hover:bg-[#E6E6E6]/40'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Patient</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('doctor')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer ${
                      role === 'doctor'
                        ? 'border-[#5B8C5A] bg-[#5B8C5A]/15 text-[#5B8C5A] font-bold'
                        : 'border-[#D6D6D6] text-[#39393A] hover:bg-[#E6E6E6]/40'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>Doctor</span>
                  </button>
                </div>
              </div>
            )}

            {tab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#39393A] mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ali Raza"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#D6D6D6] focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/20 focus:border-[#5B8C5A]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#39393A] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#D6D6D6] focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/20 focus:border-[#5B8C5A]"
                />
              </div>
            </div>

            {tab === 'register' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#39393A] mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D6D6D6] focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/20 focus:border-[#5B8C5A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#39393A] mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D6D6D6] focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/20 focus:border-[#5B8C5A] bg-white"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#39393A] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#D6D6D6] focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/20 focus:border-[#5B8C5A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#39393A] hover:bg-[#2A2A2B] text-white font-bold text-xs py-2.5 rounded-lg shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Processing...' : tab === 'login' ? 'Sign In' : 'Complete Registration'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] text-stone-500">
            By continuing, you agree to Zahid's Clinic Terms & Patient Privacy Guidelines.
          </p>
        </div>
      </div>
    </div>
  );
};
