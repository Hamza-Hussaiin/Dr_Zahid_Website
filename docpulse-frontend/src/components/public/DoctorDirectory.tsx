import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight,
  Stethoscope,
  Globe,
  Home,
  Building2,
  CheckCircle2,
  Activity,
  Award
} from 'lucide-react';

export const DoctorDirectory: React.FC = () => {
  const { doctors, navigateToDoctorDetail, startBookingWithDoctor, clinicInfo } = useApp();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.bio.toLowerCase().includes(searchTerm.toLowerCase());
    return doc.isActive && matchesSearch;
  });

  return (
    <div className="py-10 bg-[#E6E6E6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5B8C5A]/15 text-[#5B8C5A] border border-[#5B8C5A]/30 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>Consultant Clinical Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#39393A] tracking-tight">
            Consultant Physician & Specialist
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
            Dr. Zahid Hussain (MBBS, FCPS Internal Medicine). Offering comprehensive clinical evaluations, 24/7 online chat consultations, and Lahore home visits.
          </p>
        </div>

        {/* Doctor Card */}
        {filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#D6D6D6] max-w-lg mx-auto">
            <Stethoscope className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#39393A]">No doctors match your search</h3>
            <p className="text-xs text-stone-500 mt-1">Try searching for "Zahid" or "Internal Medicine".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
            {filteredDoctors.map(doctor => (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D6D6D6] shadow-sm hover:border-[#5B8C5A] transition-all space-y-6"
              >
                {/* Doctor Top Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <img
                    src={doctor.avatar}
                    alt={doctor.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-[#D6D6D6] shadow-xs shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-bold text-[#39393A]">{doctor.name}</h2>
                      {doctor.isVerified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5B8C5A] bg-[#5B8C5A]/15 px-2.5 py-0.5 rounded-full border border-[#5B8C5A]/30">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Verified Consultant
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-[#5B8C5A] font-bold">{doctor.specialization}</p>
                    <p className="text-xs text-stone-600 font-medium">{doctor.title}</p>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#5B8C5A] shrink-0" />
                      <span>{doctor.clinicAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Bio Summary */}
                <div className="bg-[#E6E6E6]/50 p-4 rounded-xl border border-[#D6D6D6] text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {doctor.bio}
                </div>

                {/* 3 Consultation Channels Available */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#39393A] mb-3">
                    Consultation Channels Available
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-[#E6E6E6]/30 p-3 rounded-lg border border-[#D6D6D6] flex items-start gap-2.5">
                      <Building2 className="w-4 h-4 text-[#39393A] shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-[#39393A]">Clinic Consultation</h5>
                        <p className="text-[11px] text-stone-500">4:00 PM – 12:00 AM Daily</p>
                      </div>
                    </div>
                    <div className="bg-[#E6E6E6]/30 p-3 rounded-lg border border-[#D6D6D6] flex items-start gap-2.5">
                      <Globe className="w-4 h-4 text-[#5B8C5A] shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-[#39393A]">Online Consultation</h5>
                        <p className="text-[11px] text-stone-500">24/7 Available Worldwide</p>
                      </div>
                    </div>
                    <div className="bg-[#E6E6E6]/30 p-3 rounded-lg border border-[#D6D6D6] flex items-start gap-2.5">
                      <Home className="w-4 h-4 text-[#A37774] shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-[#39393A]">Home Medical Visit</h5>
                        <p className="text-[11px] text-stone-500">Lahore Residence Service</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Specialized Care Areas */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#39393A] mb-2">
                    Clinical Specializations
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {doctor.servicesOffered.map((svc, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium bg-[#E6E6E6]/60 text-[#39393A] px-2.5 py-1 rounded-md border border-[#D6D6D6]"
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Row */}
                <div className="pt-4 border-t border-[#E6E6E6] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-stone-600">
                    <Clock className="w-4 h-4 text-[#5B8C5A]" />
                    <span>Clinic: 4pm - 12am | Online Consultation: 24/7</span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => navigateToDoctorDetail(doctor.id)}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-[#E6E6E6] hover:bg-[#D6D6D6] text-[#39393A] font-bold text-xs transition-colors cursor-pointer text-center"
                    >
                      View Detailed Credentials
                    </button>
                    <button
                      onClick={() => startBookingWithDoctor(doctor.id)}
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-[#5B8C5A] hover:bg-[#4A7349] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Book Consultation</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
