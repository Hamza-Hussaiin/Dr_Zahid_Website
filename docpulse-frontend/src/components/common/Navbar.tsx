import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp, AppView } from '../../context/AppContext';
import { 
  Activity, 
  Calendar, 
  User as UserIcon, 
  Stethoscope, 
  ShieldCheck, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown,
  Clock,
  MapPin,
  Sparkles,
  Users
} from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

export const Navbar: React.FC = () => {
  const { user, isVisitor, isPatient, isDoctor, isAdminDoctor, logout } = useAuth();
  const { 
    currentView, 
    setCurrentView, 
    openAuthModal, 
    unreadNotificationCount,
    startBookingWithDoctor,
    clinicInfo 
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navLinks: { label: string; view: AppView }[] = [
    { label: 'Home', view: 'home' },
    { label: 'Specialist Profile', view: 'doctors' },
    { label: 'Specialized Care', view: 'services' },
    { label: 'About Clinic', view: 'about' },
    { label: 'Contact & Map', view: 'contact' }
  ];

  const handleNavClick = (view: AppView) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDashboardView = (): AppView => {
    if (isAdminDoctor) return 'admin-dashboard';
    if (isDoctor) return 'doctor-dashboard';
    return 'patient-dashboard';
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#D6D6D6] shadow-xs">
      {/* Top Clinic Status Notice Bar */}
      <div className="bg-[#39393A] text-[#E6E6E6] text-xs font-medium py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-stone-300">
            <span className="w-2 h-2 rounded-full bg-[#5B8C5A] animate-pulse" />
            <span>Clinic Hours: 4:00 PM – 12:00 AM Daily</span>
            <span className="hidden md:inline text-stone-400">•</span>
            <span className="hidden md:inline text-[#E6E6E6]">24/7 Online Consultations & Direct Chat</span>
          </div>
          <div className="flex items-center gap-3 text-stone-300 text-[11px]">
            <span className="hidden sm:inline">Mughalpura, Lahore</span>
            <button
              onClick={() => startBookingWithDoctor()}
              className="text-[#E6E6E6] bg-[#5B8C5A] hover:bg-[#4A7349] font-medium px-2.5 py-0.5 rounded transition-colors cursor-pointer"
            >
              Book Consultation &rarr;
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-17">
          
          {/* Brand Logo & Title */}
          <button 
            id="nav-logo-button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-[#39393A] flex items-center justify-center text-[#5B8C5A] shadow-xs group-hover:bg-[#2A2A2B] transition-colors">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-[#39393A] tracking-tight">Zahid Clinic</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#5B8C5A]/15 text-[#5B8C5A] border border-[#5B8C5A]/30">
                  Lahore
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">Dr. Zahid Hussain • MBBS, FCPS Internal Medicine</p>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map(link => {
              const isActive = currentView === link.view;
              return (
                <button
                  key={link.view}
                  id={`nav-link-${link.view}`}
                  onClick={() => handleNavClick(link.view)}
                  className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[#5B8C5A] bg-[#5B8C5A]/10 font-semibold'
                      : 'text-[#39393A] hover:text-[#5B8C5A] hover:bg-[#E6E6E6]/60'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Quick Book CTA */}
            {!isDoctor && !isAdminDoctor && (
              <button
                id="navbar-quick-book-btn"
                onClick={() => startBookingWithDoctor()}
                className="hidden sm:inline-flex items-center gap-2 bg-[#5B8C5A] hover:bg-[#4A7349] text-white text-sm font-semibold px-4 py-2 rounded-md shadow-xs transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>
            )}

            {/* Notifications Bell */}
            {!isVisitor && (
              <div className="relative">
                <button
                  id="nav-notifications-btn"
                  onClick={() => {
                    setIsNotifOpen(!isNotifOpen);
                    setIsUserMenuOpen(false);
                  }}
                  className="p-2 rounded-md text-[#39393A] hover:bg-[#E6E6E6] relative transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#A37774] text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadNotificationCount}
                    </span>
                  )}
                </button>
                {isNotifOpen && (
                  <NotificationDropdown onClose={() => setIsNotifOpen(false)} />
                )}
              </div>
            )}

            {/* Authenticated User Menu or Sign In Button */}
            {isVisitor ? (
              <div className="flex items-center gap-2">
                <button
                  id="nav-signin-btn"
                  onClick={() => openAuthModal('login', 'patient')}
                  className="text-sm font-medium text-[#39393A] hover:text-[#5B8C5A] px-3 py-2 rounded-md hover:bg-[#E6E6E6]/60 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  id="nav-register-btn"
                  onClick={() => openAuthModal('register', 'patient')}
                  className="text-sm font-semibold text-white bg-[#39393A] hover:bg-[#2A2A2B] px-3.5 py-2 rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  Patient Portal
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  id="nav-user-profile-menu-btn"
                  onClick={() => {
                    setIsUserMenuOpen(!isUserMenuOpen);
                    setIsNotifOpen(false);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-md hover:bg-[#E6E6E6] transition-colors cursor-pointer"
                >
                  <img
                    src={user?.avatar || '/blank-pfp.svg'}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover border border-[#D6D6D6] bg-stone-800"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-[#39393A] leading-tight truncate max-w-[120px]">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-[#5B8C5A] font-medium capitalize">
                      {user?.role === 'admin_doctor' ? 'Admin Doctor' : user?.role}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-stone-500" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#D6D6D6] py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-[#E6E6E6]">
                      <p className="text-xs font-semibold text-[#39393A] truncate">{user?.name}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                      <span className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#5B8C5A]/15 text-[#5B8C5A] border border-[#5B8C5A]/30">
                        {user?.role.replace('_', ' ')}
                      </span>
                    </div>

                    <button
                      id="dropdown-dashboard-btn"
                      onClick={() => {
                        handleNavClick(getDashboardView());
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#39393A] hover:bg-[#5B8C5A]/10 hover:text-[#5B8C5A] text-left transition-colors cursor-pointer"
                    >
                      {isAdminDoctor ? (
                        <ShieldCheck className="w-4 h-4 text-[#A37774]" />
                      ) : isDoctor ? (
                        <Stethoscope className="w-4 h-4 text-[#5B8C5A]" />
                      ) : (
                        <Calendar className="w-4 h-4 text-[#5B8C5A]" />
                      )}
                      <span>
                        {isAdminDoctor
                          ? 'Admin Doctor Hub'
                          : isDoctor
                          ? 'Doctor Portal'
                          : 'Patient Dashboard'}
                      </span>
                    </button>

                    {isAdminDoctor && (
                      <button
                        onClick={() => {
                          handleNavClick('admin-dashboard');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#39393A] hover:bg-[#E6E6E6] text-left transition-colors cursor-pointer"
                      >
                        <Users className="w-4 h-4 text-stone-500" />
                        <span>Clinic Doctor Records</span>
                      </button>
                    )}

                    <button
                      id="dropdown-profile-btn"
                      onClick={() => {
                        handleNavClick('profile-settings');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#39393A] hover:bg-[#E6E6E6] text-left transition-colors cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-stone-500" />
                      <span>Profile & Settings</span>
                    </button>

                    <div className="border-t border-[#E6E6E6] my-1" />

                    <button
                      id="dropdown-logout-btn"
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                        setCurrentView('home');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#A37774] hover:bg-[#A37774]/10 text-left transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-[#39393A] hover:bg-[#E6E6E6] md:hidden transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#D6D6D6] space-y-1">
            {navLinks.map(link => (
              <button
                key={link.view}
                onClick={() => handleNavClick(link.view)}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${
                  currentView === link.view
                    ? 'text-[#5B8C5A] bg-[#5B8C5A]/10 font-semibold'
                    : 'text-[#39393A] hover:bg-[#E6E6E6]'
                }`}
              >
                {link.label}
              </button>
            ))}

            {!isVisitor && (
              <button
                onClick={() => handleNavClick(getDashboardView())}
                className="w-full text-left px-4 py-2 rounded-md text-sm font-semibold text-[#5B8C5A] bg-[#5B8C5A]/10 mt-2 flex items-center gap-2"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Open {isAdminDoctor ? 'Admin Hub' : isDoctor ? 'Doctor Portal' : 'Patient Dashboard'}</span>
              </button>
            )}

            <div className="pt-2">
              <button
                onClick={() => {
                  startBookingWithDoctor();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-[#5B8C5A] text-white text-sm font-semibold py-2.5 rounded-md flex items-center justify-center gap-2 shadow-xs"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
