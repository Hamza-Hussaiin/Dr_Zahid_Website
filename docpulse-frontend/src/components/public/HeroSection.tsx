import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ConsultationMode } from '../../types';
import { 
  Search, 
  Calendar, 
  Globe,
  MessageSquare,
  ShieldCheck, 
  Clock, 
  MapPin, 
  ArrowRight,
  Home,
  Building2,
  ExternalLink,
  Activity,
  CheckCircle2,
  Sparkles,
  Phone,
  HelpCircle
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { doctors, clinicInfo, startBookingWithDoctor, setCurrentView } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMode, setActiveMode] = useState<ConsultationMode>('clinic_visit');
  
  // Real-time PKT Clock & Status
  const [pktTimeStr, setPktTimeStr] = useState('');
  const [isClinicOpenNow, setIsClinicOpenNow] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      // Calculate Pakistan Time (UTC+5)
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const pktDate = new Date(utc + (3600000 * 5));
      
      const hours = pktDate.getHours();
      const minutes = pktDate.getMinutes();
      const seconds = pktDate.getSeconds();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
      
      setPktTimeStr(`${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm} PKT`);
      
      // Clinic hours: 4:00 PM (16:00) to 12:00 AM (24:00/00:00)
      const isOpen = hours >= 16 && hours < 24;
      setIsClinicOpenNow(isOpen);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const mainDoctor = doctors[0];

  const modeDetails: Record<ConsultationMode, {
    title: string;
    badge: string;
    fee: string;
    timing: string;
    description: string;
    inclusions: string[];
    icon: typeof Building2;
  }> = {
    clinic_visit: {
      title: 'Clinic Consultation',
      badge: 'In-Person Evaluation',
      fee: 'Rs. 1,200 PKR',
      timing: '4:00 PM – 12:00 AM Daily',
      description: 'Comprehensive physical examination, vital signs, blood pressure monitoring, and tailored prescription at Zahid Clinic Lahore.',
      inclusions: ['Complete In-Person Evaluation', 'Digital Prescription & Diet Chart', 'Follow-up Guidance'],
      icon: Building2
    },
    online: {
      title: 'Online Medical Consultation',
      badge: '24/7 Digital Clinic',
      fee: 'Rs. 1,200 PKR',
      timing: '24/7 Available Round-the-Clock',
      description: 'Comprehensive digital consultation, symptom review, lab report analysis, and signed prescriptions from anywhere in Pakistan & abroad.',
      inclusions: ['Direct Physician Consultation & Chat', 'Signed Digital Prescription (PDF)', 'Lab Report Review & Follow-up'],
      icon: Globe
    },
    home_visit: {
      title: 'Home Medical Visit',
      badge: 'Lahore Residence Service',
      fee: 'Rs. 5,000 PKR',
      timing: 'By Scheduled Appointment',
      description: 'Dedicated doctor home visit for elderly patients, stroke rehabilitation, immobility, or acute medical assessment in Lahore.',
      inclusions: ['Direct Doctor Home Visit in Lahore', 'Physical Diagnostics & Vital Check', 'Medication Management at Home'],
      icon: Home
    }
  };

  const currentModeInfo = modeDetails[activeMode];

  return (
    <section className="relative overflow-hidden bg-[#E6E6E6] pt-8 pb-14 lg:pt-12 lg:pb-18 border-b border-[#D6D6D6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Real-Time Status & Clock Banner */}
        <div className="mb-8 bg-[#FFFFFF] rounded-xl p-3 sm:p-4 border border-[#D6D6D6] shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isClinicOpenNow ? 'bg-[#5B8C5A] animate-pulse' : 'bg-[#A37774]'}`} />
              <span className="text-xs font-bold text-[#39393A] uppercase tracking-wider">
                {isClinicOpenNow ? 'Clinic In-Person Active' : 'Clinic Opens at 4:00 PM'}
              </span>
            </div>
            <span className="text-stone-300 hidden sm:inline">•</span>
            <span className="text-xs text-stone-600 hidden sm:inline">
              Online Consultations Available 24/7
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#39393A] bg-[#E6E6E6] px-3 py-1 rounded-md border border-[#D6D6D6]">
              <Clock className="w-3.5 h-3.5 text-[#5B8C5A]" />
              <span>{pktTimeStr || 'Pakistan Time (PKT)'}</span>
            </div>
            <div className="text-xs text-stone-600 font-medium hidden md:block">
              Lahore, Pakistan
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Clinic Introduction & Consultation Mode Selector */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Title & Qualification Subheader */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B8C5A]/15 text-[#5B8C5A] border border-[#5B8C5A]/30 text-xs font-semibold">
                <Activity className="w-3.5 h-3.5" />
                <span>Internal Medicine & Specialized Clinical Practice</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#39393A] tracking-tight leading-tight">
                Professional Medical Consultation, Diagnosis & Treatment
              </h1>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-sm font-semibold text-[#39393A]">
                <span className="text-[#5B8C5A] font-bold text-base">Dr. Zahid Hussain</span>
                <span className="text-stone-400">•</span>
                <span className="bg-[#39393A] text-[#E6E6E6] px-2.5 py-0.5 rounded text-xs font-bold">
                  MBBS, FCPS Internal Medicine
                </span>
                <span className="text-stone-400">•</span>
                <span className="text-stone-600 text-xs">Consultant Physician</span>
              </div>
            </div>

            <p className="text-sm text-stone-700 leading-relaxed">
              Serving patients with comprehensive internal medicine assessment, evidence-based diagnostic protocols, and targeted treatment plans for neurological, metabolic, respiratory, renal, and gastrointestinal conditions.
            </p>

            {/* Dynamic Consultation Mode Calculator & Card Switcher */}
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D6D6D6] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#39393A]">
                  Select Consultation Channel
                </h3>
                <span className="text-[11px] text-[#A37774] font-semibold">
                  Transparent Fee Structure
                </span>
              </div>

              {/* Mode Toggle Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {(['clinic_visit', 'online', 'home_visit'] as ConsultationMode[]).map((mode) => {
                  const info = modeDetails[mode];
                  const Icon = info.icon;
                  const isSelected = activeMode === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => setActiveMode(mode)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#39393A] text-white border-[#39393A] shadow-xs'
                          : 'bg-[#E6E6E6]/60 text-[#39393A] border-[#D6D6D6] hover:bg-[#E6E6E6]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#5B8C5A]' : 'text-stone-600'}`} />
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#5B8C5A]" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">{info.title.split(' ')[0]}</p>
                        <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                          {mode === 'home_visit' ? 'Lahore Area' : mode === 'online' ? '24/7 Online' : '4pm - 12am'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Mode Interactive Preview Panel */}
              <div className="bg-[#E6E6E6]/50 p-4 rounded-xl border border-[#D6D6D6] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A37774] tracking-wider">
                      {currentModeInfo.badge}
                    </span>
                    <h4 className="text-sm font-bold text-[#39393A]">{currentModeInfo.title}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-500 block">Consultation Fee</span>
                    <span className="text-base font-extrabold text-[#5B8C5A]">{currentModeInfo.fee}</span>
                  </div>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed">
                  {currentModeInfo.description}
                </p>

                <div className="pt-2 border-t border-[#D6D6D6]/80 flex flex-wrap gap-2">
                  {currentModeInfo.inclusions.map((inc, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-[11px] text-[#39393A] bg-white px-2.5 py-1 rounded-md border border-[#D6D6D6]">
                      <CheckCircle2 className="w-3 h-3 text-[#5B8C5A]" />
                      <span>{inc}</span>
                    </span>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-stone-600 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#5B8C5A]" />
                    <span>{currentModeInfo.timing}</span>
                  </div>
                  <button
                    onClick={() => startBookingWithDoctor(mainDoctor?.id)}
                    className="bg-[#5B8C5A] hover:bg-[#4A7349] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Proceed to Book ({currentModeInfo.title.split(' ')[0]})</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Doctor Spotlight, Practice Info & Specialized Care Shortcuts */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Doctor Profile Card */}
            <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#D6D6D6] shadow-sm space-y-5">
              
              <div className="flex items-start gap-4">
                <img
                  src={mainDoctor?.avatar || '/blank-pfp.svg'}
                  alt="Dr. Zahid Hussain"
                  className="w-20 h-20 rounded-xl object-cover border border-[#D6D6D6] shrink-0 bg-stone-800"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-bold text-[#39393A] truncate">Dr. Zahid Hussain</h3>
                    <ShieldCheck className="w-4 h-4 text-[#5B8C5A] shrink-0" />
                  </div>
                  <p className="text-xs font-semibold text-[#5B8C5A]">{mainDoctor?.specialization}</p>
                  <p className="text-[11px] text-stone-600 mt-1">
                    Senior Consultant Physician with 16+ years of clinical excellence in Internal Medicine.
                  </p>
                </div>
              </div>

              {/* Key Practice Parameters */}
              <div className="grid grid-cols-2 gap-2.5 text-xs bg-[#E6E6E6]/60 p-3.5 rounded-xl border border-[#D6D6D6]">
                <div>
                  <span className="text-[10px] text-stone-500 font-semibold block">Clinic Timings</span>
                  <span className="font-bold text-[#39393A] text-xs">4:00 PM – 12:00 AM</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-semibold block">Online Care</span>
                  <span className="font-bold text-[#5B8C5A] text-xs">24/7 Available</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-semibold block">Qualifications</span>
                  <span className="font-bold text-[#39393A] text-xs">MBBS, FCPS</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 font-semibold block">Clinical Experience</span>
                  <span className="font-bold text-[#39393A] text-xs">16+ Years</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={() => startBookingWithDoctor(mainDoctor?.id)}
                  className="w-full bg-[#39393A] hover:bg-[#2A2A2B] text-[#E6E6E6] font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Calendar className="w-4 h-4 text-[#5B8C5A]" />
                  <span>Book Consultation & Select Mode</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentView('services');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full bg-[#E6E6E6] hover:bg-[#D6D6D6] text-[#39393A] font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>View All 9 Specialized Medical Areas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Location & Direct Maps Reference */}
              <div className="pt-3 border-t border-[#E6E6E6] flex items-start gap-2.5 text-xs text-stone-600">
                <MapPin className="w-4 h-4 text-[#5B8C5A] mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-[#39393A]">
                    {clinicInfo?.address || '33-S-20 ST NO 2 Sunny View Park Ramgarh Mughalpura Lahore'}
                  </p>
                  <a
                    href={clinicInfo?.googleMapsUrl || 'https://maps.google.com/?q=33-S-20+ST+NO+2+Sunny+View+Park+Ramgarh+Mughalpura+Lahore'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5B8C5A] hover:text-[#4A7349] mt-1 cursor-pointer"
                  >
                    <span>View Location on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
