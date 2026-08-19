import React from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, Phone, Mail, MapPin, Clock, ShieldCheck, Calendar, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { clinicInfo, setCurrentView, startBookingWithDoctor } = useApp();

  return (
    <footer className="bg-[#39393A] text-[#E6E6E6] pt-14 pb-8 border-t border-[#2A2A2B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-700">
          
          {/* Clinic Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#5B8C5A] flex items-center justify-center text-white font-bold shadow-xs">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-white tracking-tight block">Zahid Clinic</span>
                <span className="text-[11px] text-[#5B8C5A] font-semibold">Dr. Zahid Hussain (MBBS, FCPS)</span>
              </div>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Professional Medical Consultation, Diagnosis & Treatment. Internal medicine clinic, 24/7 online consultations, and Lahore home visits.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#5B8C5A] bg-[#2A2A2B] p-2.5 rounded-lg border border-stone-700">
              <ShieldCheck className="w-4 h-4 text-[#5B8C5A] shrink-0" />
              <span>Certified Internal Medicine Practice</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Clinic Navigation</h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li>
                <button
                  onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#5B8C5A] transition-colors cursor-pointer"
                >
                  Home Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setCurrentView('doctors'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#5B8C5A] transition-colors cursor-pointer"
                >
                  Specialist Doctor Profile
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setCurrentView('services'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#5B8C5A] transition-colors cursor-pointer"
                >
                  Specialized Care Areas
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setCurrentView('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#5B8C5A] transition-colors cursor-pointer"
                >
                  About Zahid Clinic Lahore
                </button>
              </li>
              <li>
                <button
                  onClick={() => { startBookingWithDoctor(); }}
                  className="hover:text-[#5B8C5A] transition-colors cursor-pointer font-medium text-[#5B8C5A]"
                >
                  Book Appointment & Pay
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Clinic Contact & Hours</h4>
            <ul className="space-y-3 text-xs text-stone-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#5B8C5A] shrink-0 mt-0.5" />
                <span>{clinicInfo?.address || '33-S-20 ST NO 2 Sunny View Park Ramgarh Mughalpura Lahore'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#5B8C5A] shrink-0" />
                <span>{clinicInfo?.phone || '+92 300 1234567'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#5B8C5A] shrink-0" />
                <span>{clinicInfo?.email || 'zahidclinic.lahore@gmail.com'}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#5B8C5A] shrink-0 mt-0.5" />
                <div>
                  <p>Clinic Visits: 4:00 PM – 12:00 AM</p>
                  <p className="text-[#5B8C5A] font-semibold">Online Consultation: 24/7 Digital</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Location & Google Maps */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5B8C5A] mb-4">Location & Map</h4>
            <div className="bg-[#2A2A2B] border border-stone-700 p-3.5 rounded-lg text-xs space-y-2.5">
              <p className="text-stone-200 font-medium">
                Zahid Clinic, Ramgarh Mughalpura Lahore
              </p>
              <a
                href={clinicInfo?.googleMapsUrl || 'https://maps.google.com/?q=33-S-20+ST+NO+2+Sunny+View+Park+Ramgarh+Mughalpura+Lahore'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#5B8C5A] hover:text-[#4A7349] font-bold underline cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <button
              onClick={() => startBookingWithDoctor()}
              className="mt-3 w-full bg-[#5B8C5A] hover:bg-[#4A7349] text-white font-bold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Consultation Now</span>
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-3">
          <p>© {new Date().getFullYear()} Zahid Clinic Lahore • Dr. Zahid Hussain (MBBS, FCPS). All rights reserved.</p>
          <div className="flex items-center gap-4 text-stone-400">
            <span className="hover:text-stone-200 cursor-pointer">Patient Guidelines</span>
            <span>•</span>
            <span className="hover:text-stone-200 cursor-pointer">Pakistani Payment Channels</span>
            <span>•</span>
            <span className="hover:text-stone-200 cursor-pointer">Emergency Protocols</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
