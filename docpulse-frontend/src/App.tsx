/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';

// Common UI Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { RoleSwitcherBanner } from './components/common/RoleSwitcherBanner';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/auth/AuthModal';

// Public Components
import { HeroSection } from './components/public/HeroSection';
import { ServicesSection } from './components/public/ServicesSection';
import { DoctorDirectory } from './components/public/DoctorDirectory';
import { DoctorDetailPage } from './components/public/DoctorDetailPage';
import { TestimonialsSection } from './components/public/TestimonialsSection';
import { AboutClinic } from './components/public/AboutClinic';
import { ContactSection } from './components/public/ContactSection';

// Booking Flow
import { BookingWizard } from './components/booking/BookingWizard';

// Patient Views
import { PatientDashboard } from './components/patient/PatientDashboard';
import { PatientProfileEditor } from './components/patient/PatientProfileEditor';

// Doctor Views
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { SlotManager } from './components/doctor/SlotManager';
import { DoctorProfileEditor } from './components/doctor/DoctorProfileEditor';
import { DoctorManagement } from './components/doctor/DoctorManagement';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';

// Real-Time Modals
import { ChatModal } from './components/chat/ChatModal';

const MainContent: React.FC = () => {
  const { currentView } = useApp();

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <>
            <HeroSection />
            <ServicesSection />
            <TestimonialsSection />
          </>
        );
      case 'doctors':
        return <DoctorDirectory />;
      case 'doctor-detail':
        return <DoctorDetailPage />;
      case 'booking':
        return <BookingWizard />;
      case 'patient-dashboard':
        return <PatientDashboard />;
      case 'profile-settings':
        return <PatientProfileEditor />;
      case 'doctor-dashboard':
        return <DoctorDashboard />;
      case 'doctor-slots':
        return <SlotManager />;
      case 'doctor-profile-edit':
        return <DoctorProfileEditor />;
      case 'doctor-management':
        return <DoctorManagement />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'about':
        return <AboutClinic />;
      case 'services':
        return (
          <div className="py-8 bg-white min-h-screen">
            <ServicesSection />
          </div>
        );
      case 'contact':
        return <ContactSection />;
      default:
        return (
          <>
            <HeroSection />
            <ServicesSection />
            <TestimonialsSection />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-teal-100 selection:text-teal-900">
      <RoleSwitcherBanner />
      <Navbar />
      
      <main className="flex-1">
        {renderView()}
      </main>

      <Footer />

      {/* Global Interactive Modals */}
      <AuthModal />
      <ChatModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </AuthProvider>
  );
}
