import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Award, 
  Building2, 
  HeartPulse, 
  Users, 
  CheckCircle2, 
  Microscope,
  Calendar,
  MapPin,
  Clock,
  Home,
  Video,
  ExternalLink
} from 'lucide-react';

export const AboutClinic: React.FC = () => {
  const { clinicInfo, startBookingWithDoctor } = useApp();

  const facilities = [
    {
      title: 'Zahid Clinic - Mughalpura Lahore',
      description: 'Well-equipped clinical assessment rooms operating daily from 4:00 PM to 12:00 AM with complete physical diagnostic facilities.'
    },
    {
      title: '24/7 Online Chat Consultations',
      description: 'Dedicated secure chat portal for remote consultations, electronic prescription delivery, and international patients.'
    },
    {
      title: 'Dedicated Home Visit Service',
      description: 'Comprehensive at-home medical examinations for acute patients, stroke recovery, and elderly individuals across Lahore.'
    }
  ];

  const specializedAreas = [
    ' Neurological Disorders (Epilepsy, Stroke, Paralysis)',
    ' Muscle Diseases (Myopathies & Muscular Disorders)',
    ' Respiratory & Lung Diseases (Asthma, Tuberculosis / TB)',
    ' Kidney & Renal Diseases (Urinary Tract & Renal Care)',
    ' Diabetes & Metabolic Disorders (Insulin & Glucose Control)',
    ' Psychiatric & Mental Health Disorders',
    ' Jaundice & Liver Diseases (Hepatitis & Hepatic Care)',
    ' Gastrointestinal & Stomach Disorders (Digestive Health)',
    ' Hypertension & General Medical Conditions'
  ];

  return (
    <div className="py-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Mission Banner */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            About Zahid Clinic & Dr. Zahid Hussain
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Professional Medical Consultation, Diagnosis & Treatment
          </h1>
          <p className="text-sm text-slate-600 mt-4 leading-relaxed">
            {clinicInfo?.mission || 'Comprehensive medical assessment, diagnosis, treatment, and follow-up care are provided for a wide range of medical conditions.'}
          </p>
        </div>

        {/* Doctor Spotlight Banner */}
        <div className="bg-[#39393A] rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center gap-8">
          <img
            src="/blank-pfp.svg"
            alt="Dr. Zahid Hussain"
            className="w-36 h-36 rounded-2xl object-cover border border-[#D6D6D6] shrink-0 shadow-md bg-stone-800"
          />
          <div className="space-y-3 flex-1 text-center md:text-left">
            <span className="text-xs font-bold text-[#5B8C5A] uppercase tracking-wider">Lead Consultant Physician</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Dr. Zahid Hussain</h2>
            <p className="text-xs text-[#5B8C5A] font-semibold">MBBS, FCPS Internal Medicine • Consultant Physician</p>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Dr. Zahid Hussain brings over 16 years of dedicated clinical practice in internal medicine. He is committed to clinical excellence, patient education, evidence-based pharmacology, and compassionate multi-modal care through clinic visits, 24/7 online video sessions, and home visits.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-stone-400">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#5B8C5A]" /> Clinic: 4:00 PM – 12:00 AM</span>
              <span className="flex items-center gap-1.5"><Video className="w-4 h-4 text-[#5B8C5A]" /> Online: 24/7 Available</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#5B8C5A]" /> Mughalpura Lahore</span>
            </div>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {facilities.map((fac, idx) => (
            <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{fac.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{fac.description}</p>
            </div>
          ))}
        </div>

        {/* Specialized Care Checklist */}
        <div className="bg-teal-50/60 rounded-3xl p-8 border border-teal-200/80">
          <div className="max-w-2xl mx-auto text-center mb-6">
            <h3 className="text-xl font-bold text-slate-900">Comprehensive Clinical Scope</h3>
            <p className="text-xs text-slate-600 mt-1">Specialized evaluation and treatment for vital conditions:</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">
            {specializedAreas.map((area, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-2xs flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{area}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-[#39393A] rounded-3xl p-8 sm:p-10 text-white shadow-xl">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Schedule Your Medical Consultation</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto mb-6">
            Book a Clinic Visit in Mughalpura Lahore, an Online Chat Consultation, or a Home Visit in under 2 minutes.
          </p>
          <button
            onClick={() => startBookingWithDoctor()}
className="bg-[#5B8C5A] hover:bg-[#4A7349] text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-md transition-colors cursor-pointer inline-flex items-center gap-2"          >
            <Calendar className="w-4 h-4" />
            <span>Book Appointment with Dr. Zahid Hussain</span>
          </button>
        </div>

      </div>
    </div>
  );
};
