import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Building,
  ExternalLink,
  Video,
  Calendar
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { clinicInfo, startBookingWithDoctor } = useApp();

  const clinicAddress = clinicInfo?.address || '33-S-20 ST NO 2 Sunny View Park Ramgarh Mughalpura Lahore';
  const mapsUrl = clinicInfo?.googleMapsUrl || 'https://maps.google.com/?q=33-S-20+ST+NO+2+Sunny+View+Park+Ramgarh+Mughalpura+Lahore';

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4A7349] bg-[#5B8C5A]/15 px-3 py-1 rounded-full border border-[#5B8C5A]/30">
            Contact & Location Details
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Zahid Clinic — Mughalpura Lahore
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Visit Dr. Zahid Hussain in-person, request a home visit, or connect via 24/7 online consultation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Contact Info & Google Maps Card */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-[#5B8C5A]/10 text-[#4A7349] flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone / WhatsApp</h4>
                <p className="text-xs font-bold text-slate-900">{clinicInfo?.phone || '+92 300 1234567'}</p>
                <p className="text-[11px] text-slate-500">Direct clinic desk</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-[#5B8C5A]/10 text-[#4A7349] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Opening Hours</h4>
                <p className="text-xs font-bold text-slate-900">Clinic: 4:00 PM – 12:00 AM</p>
                <p className="text-[11px] text-emerald-600 font-semibold">Online: 24/7 Worldwide</p>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#5B8C5A] mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Clinic Address</h4>
                  <p className="text-xs text-slate-700 font-semibold mt-0.5 leading-relaxed">
                    {clinicAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-slate-100">
                <Building className="w-5 h-5 text-[#5B8C5A] mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Doctor In-Charge</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    <strong>Dr. Zahid Hussain</strong> (MBBS, FCPS Internal Medicine) — Consultant Physician
                  </p>
                </div>
              </div>
            </div>

            {/* Google Maps Location Preview Card */}
            <div className="bg-[#39393A] rounded-3xl p-6 text-white border border-slate-800 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#5B8C5A]" />
                  <span className="text-xs font-bold text-white">Google Maps Location</span>
                </div>
                <span className="text-[10px] text-[#5B8C5A]/50 font-semibold bg-[#2A2A2B] px-2 py-0.5 rounded border border-[#3E5D3D]">
                  Open 4pm - 12am Daily
                </span>
              </div>

              <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
                <div className="w-12 h-12 rounded-full bg-[#5B8C5A]/20 text-[#5B8C5A] flex items-center justify-center mb-2 animate-bounce">
                  <MapPin className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-100">Zahid Clinic</p>
                <p className="text-[11px] text-slate-300 max-w-sm mt-0.5">
                  33-S-20 ST NO 2 Sunny View Park Ramgarh Mughalpura Lahore
                </p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 bg-[#5B8C5A] hover:bg-[#4A7349] text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>

          {/* Right: Direct booking CTA, replacing the old fake inquiry form */}
          <div className="lg:col-span-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#5B8C5A]/10 text-[#4A7349] flex items-center justify-center">
                <Video className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Ready to Book?</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Choose a Clinic Visit, an Online Chat Consultation, or a Home Visit — pick a real available time slot in under 2 minutes.
              </p>
              <button
                onClick={() => startBookingWithDoctor()}
                className="bg-[#5B8C5A] hover:bg-[#4A7349] text-white font-bold text-xs py-3 px-6 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book an Appointment</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};