import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { TimeSlot } from '../../types';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  MapPin, 
  Award, 
  GraduationCap, 
  CheckCircle2, 
  MessageSquare,
  Home,
  Building2,
  ExternalLink,
  Activity
} from 'lucide-react';

export const DoctorDetailPage: React.FC = () => {
  const { selectedDoctorId, doctors, setCurrentView, startBookingWithDoctor, clinicInfo } = useApp();
  const [doctorSlots, setDoctorSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const doctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

  useEffect(() => {
    async function loadDoctorDetails() {
      if (!doctor) return;
      setIsLoading(true);
      try {
        const res = await api.getDoctorById(doctor.id);
        if (res.success) {
          setDoctorSlots(res.slots || []);
          if (res.slots && res.slots.length > 0) {
            setSelectedDate(res.slots[0].date);
          }
        }
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    }
    loadDoctorDetails();
  }, [doctor?.id]);

  if (!doctor) {
    return (
      <div className="p-12 text-center bg-[#E6E6E6]">
        <p className="text-[#39393A] font-bold">Doctor record not found.</p>
        <button onClick={() => setCurrentView('doctors')} className="mt-2 text-[#5B8C5A] font-bold cursor-pointer">
          Return to directory
        </button>
      </div>
    );
  }

  const availableDates = Array.from(new Set(doctorSlots.map(s => s.date))).sort();
  const slotsForSelectedDate = doctorSlots.filter(s => s.date === (selectedDate || availableDates[0]));

  return (
    <div className="py-8 bg-[#E6E6E6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Back Button */}
        <button
          onClick={() => setCurrentView('doctors')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#39393A] hover:text-[#5B8C5A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Doctor Directory</span>
        </button>

        {/* Doctor Header Banner Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D6D6D6] shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <img
              src={doctor.avatar}
              alt={doctor.name}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover border border-[#D6D6D6] shadow-xs"
            />
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#39393A]">{doctor.name}</h1>
                {doctor.isVerified && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#5B8C5A] bg-[#5B8C5A]/15 px-2.5 py-1 rounded-full border border-[#5B8C5A]/30">
                    <ShieldCheck className="w-4 h-4 text-[#5B8C5A]" />
                    Verified Consultant
                  </span>
                )}
              </div>

              <p className="text-sm font-bold text-[#5B8C5A]">{doctor.specialization}</p>
              <p className="text-xs text-stone-600">{doctor.title} • Zahid Clinic</p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 pt-1">
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-[#5B8C5A]" />
                  <span>{doctor.experienceYears}+ Years Clinical Experience</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-[#5B8C5A]" />
                  <span>Clinic: 4pm - 12am | Online: 24/7</span>
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs text-stone-500 pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#5B8C5A] shrink-0" />
                <span>{doctor.clinicAddress}</span>
              </div>
            </div>

            {/* Quick Action */}
            <div className="w-full md:w-auto p-5 rounded-xl bg-[#E6E6E6]/60 border border-[#D6D6D6] text-center md:text-right space-y-3 shrink-0">
              <div>
                <span className="text-[11px] uppercase font-bold text-[#A37774] block">Consultation Availability</span>
                <span className="text-sm font-extrabold text-[#39393A] block mt-1">Live Online Slots Open</span>
                <span className="text-[11px] text-stone-500 block">Home Visits • Online Chat • Clinic</span>
              </div>
              <button
                onClick={() => startBookingWithDoctor(doctor.id)}
                className="w-full bg-[#5B8C5A] hover:bg-[#4A7349] text-white font-semibold text-xs py-2.5 px-5 rounded-lg shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Consultation</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Consultation Modes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#D6D6D6] shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#E6E6E6] text-[#39393A] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#39393A]">Clinic Consultation</h4>
            <p className="text-xs text-stone-500">
              In-person consultation and comprehensive medical evaluation (4:00 PM – 12:00 AM daily).
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#D6D6D6] shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#5B8C5A]/15 text-[#5B8C5A] flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#39393A]">Online Chat Consultation</h4>
            <p className="text-xs text-stone-500">
              24/7 convenient consultation from anywhere via secure chat, with digital prescriptions.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#D6D6D6] shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#A37774]/15 text-[#A37774] flex items-center justify-center font-bold">
              <Home className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#39393A]">Home Medical Visits</h4>
            <p className="text-xs text-stone-500">
              Medical assessment, physical diagnosis & consultation in your home for acute or elderly patients in Lahore.
            </p>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Bio, Credentials, Services */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Bio */}
            <div className="bg-white rounded-xl p-6 border border-[#D6D6D6] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#39393A] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#5B8C5A]" />
                <span>Professional Medical Profile</span>
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                {doctor.bio}
              </p>
            </div>

            {/* Qualifications & Education */}
            <div className="bg-white rounded-xl p-6 border border-[#D6D6D6] shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#39393A] flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#5B8C5A]" />
                <span>Education & Board Certifications</span>
              </h3>

              <div className="space-y-2.5">
                {doctor.education?.map((edu, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#E6E6E6]/40 border border-[#D6D6D6]">
                    <div className="w-2 h-2 rounded-full bg-[#5B8C5A] mt-1.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-[#39393A]">{edu.degree}</h4>
                      <p className="text-[11px] text-stone-600">{edu.institution} • Class of {edu.year}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-bold text-[#39393A] mb-2">Qualifications & Fellowships</h4>
                <div className="flex flex-wrap gap-2">
                  {doctor.qualifications?.map((q, i) => (
                    <span key={i} className="text-xs font-medium text-[#39393A] bg-[#E6E6E6] border border-[#D6D6D6] px-3 py-1 rounded-md">
                      {q}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Services & Specialized Care Scope */}
            <div className="bg-white rounded-xl p-6 border border-[#D6D6D6] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#39393A] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#5B8C5A]" />
                <span>Specialized Care Areas</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {doctor.servicesOffered?.map((srv, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#E6E6E6]/40 border border-[#D6D6D6] text-xs font-semibold text-[#39393A] flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#5B8C5A] shrink-0" />
                    <span>{srv}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location & Map Card */}
            <div className="bg-white rounded-xl p-6 border border-[#D6D6D6] shadow-xs space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#39393A] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#5B8C5A]" />
                <span>Clinic Location & Google Maps</span>
              </h3>
              <p className="text-xs text-stone-600">
                {doctor.clinicAddress}
              </p>
              <a
                href={clinicInfo?.googleMapsUrl || 'https://maps.google.com/?q=33-S-20+ST+NO+2+Sunny+View+Park+Ramgarh+Mughalpura+Lahore'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5B8C5A] bg-[#5B8C5A]/15 hover:bg-[#5B8C5A]/25 px-3 py-2 rounded-lg border border-[#5B8C5A]/30 transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-[#5B8C5A]" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>

          {/* Right Column: Live Calendar Slot Availability Widget */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#D6D6D6] shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-[#5B8C5A]" />
                <h3 className="text-sm font-bold text-[#39393A] uppercase tracking-wider">
                  Live Available Slots
                </h3>
              </div>

              <p className="text-xs text-stone-500 mb-4">
                Select a date below to view open consultation windows:
              </p>

              {/* Date Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4">
                {availableDates.map(dateStr => (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      (selectedDate || availableDates[0]) === dateStr
                        ? 'bg-[#39393A] text-white shadow-xs'
                        : 'bg-[#E6E6E6] text-[#39393A] hover:bg-[#D6D6D6]'
                    }`}
                  >
                    {new Date(dateStr + 'T00:00:00').toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' })}
                  </button>
                ))}
              </div>

              {/* Slots List */}
              <div className="space-y-2 mb-5 max-h-60 overflow-y-auto">
                {slotsForSelectedDate.length === 0 ? (
                  <p className="text-xs text-stone-400 py-3 text-center">No slots listed for this date.</p>
                ) : (
                  slotsForSelectedDate.map(slot => {
                    const isAvailable = slot.status === 'available';
                    return (
                      <div
                        key={slot.id}
                        className={`p-3 rounded-lg border flex items-center justify-between text-xs transition-all ${
                          isAvailable
                            ? 'bg-[#5B8C5A]/10 border-[#5B8C5A]/40 hover:bg-[#5B8C5A]/20 cursor-pointer'
                            : 'bg-[#E6E6E6]/60 border-[#D6D6D6] opacity-60'
                        }`}
                        onClick={() => {
                          if (isAvailable) startBookingWithDoctor(doctor.id);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#5B8C5A]" />
                          <span className="font-bold text-[#39393A]">{slot.startTime} - {slot.endTime}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isAvailable ? 'bg-[#5B8C5A] text-white' : 'bg-stone-300 text-stone-700'
                        }`}>
                          {slot.status === 'available' ? 'Available' : slot.status === 'booked' ? 'Booked' : 'Unavailable'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <button
                onClick={() => startBookingWithDoctor(doctor.id)}
                className="w-full bg-[#5B8C5A] hover:bg-[#4A7349] text-white font-bold text-xs py-3 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Reserve Appointment Slot</span>
              </button>

              <div className="mt-4 pt-3 border-t border-[#E6E6E6] text-[11px] text-stone-500 space-y-1">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#5B8C5A]" />
                  <span>Includes secure online chat consultation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#5B8C5A]" />
                  <span>Pre & post visit chat unlocked upon doctor acceptance</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
