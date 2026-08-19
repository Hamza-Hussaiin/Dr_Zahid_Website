import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  FileText, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  CreditCard,
  Building2,
  Video,
  Home
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const clinicFaqs: FaqItem[] = [
  {
    question: 'How do I book a Home Visit in Lahore?',
    answer: 'Select "Home Visit" during the booking flow, input your residence address in Lahore and symptoms. You will proceed to payment (Rs. 5,000 PKR) via Easypaisa, JazzCash, UPaisa, or Debit Card. Once submitted, Dr. Zahid Hussain verifies the transaction and confirms the home visit schedule.',
    category: 'Home Visits'
  },
  {
    question: 'How does 24/7 Online Chat Consultation work?',
    answer: 'Online chat consultations are available 24 hours a day. After selecting your slot and completing the Rs. 1,200 PKR payment, you will receive access to the secure chat consultation where Dr. Zahid conducts the clinical review and uploads your digital prescription.',
    category: 'Online Chat Consultation'
  },
  {
    question: 'What are the clinic hours for in-person visits?',
    answer: 'Zahid Clinic in Ramgarh Mughalpura Lahore is open daily from 4:00 PM to 12:00 AM for in-person evaluations. Fee is Rs. 1,200 PKR.',
    category: 'Clinic Visits'
  },
  {
    question: 'What payment methods are supported for Pakistani patients?',
    answer: 'We support all major Pakistani digital payment channels'
  }
];

export const TestimonialsSection: React.FC = () => {
  const { startBookingWithDoctor } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const consultationSteps = [
    {
      step: '01',
      title: 'Select Consultation Mode',
      desc: 'Choose between Clinic In-Person (4pm-12am), 24/7 Online Video, or Home Medical Visit in Lahore.'
    },
    {
      step: '02',
      title: 'Submit Symptoms & History',
      desc: 'Provide your primary medical complaint, duration of symptoms, and upload previous lab reports.'
    },
    {
      step: '03',
      title: 'Pakistani Payment Verification',
      desc: 'Transfer the exact fee via Easypaisa, JazzCash, UPaisa, or Card and input your Transaction ID (TID).'
    },
    {
      step: '04',
      title: 'Consultation & Digital Rx',
      desc: 'Receive comprehensive diagnosis, tailored clinical medication, and downloadable e-prescription.'
    }
  ];

  return (
    <section className="py-14 lg:py-20 bg-[#E6E6E6] border-b border-[#D6D6D6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B8C5A]/15 text-[#5B8C5A] border border-[#5B8C5A]/30 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>Structured Clinical Workflow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#39393A] tracking-tight">
            How Your Consultation Works at Zahid Clinic
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            A seamless medical consultation experience designed for clarity, punctuality, and compassionate internal medicine care.
          </p>
        </div>

        {/* 4-Step Consultation Process Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {consultationSteps.map((s, idx) => (
            <div
              key={idx}
              className="bg-[#FFFFFF] p-5 rounded-xl border border-[#D6D6D6] shadow-xs flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-extrabold text-[#A37774] bg-[#E6E6E6] px-2.5 py-1 rounded-md inline-block mb-3">
                  Step {s.step}
                </span>
                <h3 className="text-sm font-bold text-[#39393A] mb-2">{s.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{s.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E6E6E6] flex items-center gap-1.5 text-[11px] text-[#5B8C5A] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Standardized Care</span>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive FAQ Matrix */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#D6D6D6] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E6E6] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#5B8C5A]" />
                <h3 className="text-base font-bold text-[#39393A]">Frequently Asked Clinical Questions</h3>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">Everything you need to know regarding booking, timings, and payments.</p>
            </div>
            <button
              onClick={() => startBookingWithDoctor()}
              className="bg-[#39393A] hover:bg-[#2A2A2B] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
            >
              Book Now
            </button>
          </div>

          <div className="space-y-3">
            {clinicFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-[#D6D6D6] overflow-hidden bg-[#E6E6E6]/30 transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-[#E6E6E6]/60 transition-colors cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-[#39393A]">{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#5B8C5A] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-stone-700 leading-relaxed border-t border-[#D6D6D6]/60 bg-white">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
