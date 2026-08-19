import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, 
  ShieldCheck, 
  ArrowRight, 
  Calendar, 
  Home, 
  Building2, 
  MessageSquare, 
  CheckCircle2, 
  ChevronRight,
  Filter,
  Layers,
  FileText,
  AlertCircle
} from 'lucide-react';

interface ClinicalSpecialtyProtocol {
  id: string;
  title: string;
  category: string;
  department: string;
  commonSymptoms: string[];
  diagnosticApproach: string;
  clinicalCare: string;
  recommendedFor: string;
}

const detailedSpecialties: ClinicalSpecialtyProtocol[] = [
  {
    id: 'srv_neuro',
    title: 'Neurological Disorders',
    category: 'Neurology',
    department: 'Neurology & Neuro-Medicine',
    commonSymptoms: ['Seizures & involuntary movements', 'Post-stroke motor weakness & paralysis', 'Severe recurrent migraines', 'Numbness and neuropathy'],
    diagnosticApproach: 'Comprehensive neurological examination, motor reflex assessment, stroke risk scoring, and neuro-imaging review.',
    clinicalCare: 'Antiepileptic medication titration, post-stroke recovery regimens, headache preventative therapy, and neuro-rehabilitation oversight.',
    recommendedFor: 'Epilepsy, Stroke Survivors, Paralysis, Facial Palsy, Neuropathy'
  },
  {
    id: 'srv_muscle',
    title: 'Muscle Diseases & Myopathies',
    category: 'Musculoskeletal',
    department: 'Neuromuscular Medicine',
    commonSymptoms: ['Progressive muscular weakness', 'Difficulty rising from chairs or stairs', 'Muscle stiffness and cramping', 'Chronic generalized fatigue'],
    diagnosticApproach: 'Serum CPK enzyme evaluation, strength grading, neuromuscular testing guidance, and systemic auto-immune review.',
    clinicalCare: 'Specialized pharmacological treatment for inflammatory myopathies, electrolyte balancing, and physical mobility maintenance plans.',
    recommendedFor: 'Myopathies, Muscular Dystrophies, Polymyositis, Muscle Spasms'
  },
  {
    id: 'srv_respiratory',
    title: 'Respiratory & Lung Diseases',
    category: 'Pulmonology',
    department: 'Pulmonary & Chest Medicine',
    commonSymptoms: ['Shortness of breath on exertion', 'Chronic cough with phlegm', 'Wheezing and chest tightness', 'Low-grade fever with night sweats'],
    diagnosticApproach: 'Chest auscultation, Spirometry / Peak flow evaluation, Sputum examination interpretation, and CXR / HRCT assessment.',
    clinicalCare: 'Asthma inhaler optimization, Tuberculosis (TB) standard DOTS treatment supervision, COPD management, and pneumonia treatment.',
    recommendedFor: 'Bronchial Asthma, Pulmonary TB, Chronic Bronchitis, COPD'
  },
  {
    id: 'srv_renal',
    title: 'Kidney & Renal Diseases',
    category: 'Nephrology',
    department: 'Renal & Urinary Care',
    commonSymptoms: ['Bilateral pedal edema (swelling of feet)', 'Foamy or bloody urine', 'Elevated blood urea & creatinine', 'Flank pain or urinary burning'],
    diagnosticApproach: 'Urine routine examination, 24-hr urinary protein check, renal function tests (RFTs), and ultrasound KUB interpretation.',
    clinicalCare: 'Chronic kidney disease staging & preservation, nephro-protective medication, blood pressure targets, and proteinuria reduction.',
    recommendedFor: 'Early CKD, Proteinuria, Urinary Tract Infections, Renal Impairment'
  },
  {
    id: 'srv_diabetes',
    title: 'Diabetes & Metabolic Disorders',
    category: 'Endocrinology',
    department: 'Metabolic Medicine',
    commonSymptoms: ['Frequent urination & extreme thirst', 'Unexplained weight loss or gain', 'High fasting / post-prandial glucose', 'Slow healing wounds'],
    diagnosticApproach: 'HbA1c quarterly monitoring, lipid panel analysis, microalbuminuria testing, and diabetic neuropathy screening.',
    clinicalCare: 'Personalized insulin and oral anti-diabetic regimens, dietary meal planning, hypoglycemic prevention, and vascular protection.',
    recommendedFor: 'Type 2 Diabetes, Prediabetes, Dyslipidemia, Metabolic Syndrome'
  },
  {
    id: 'srv_psychiatric',
    title: 'Psychiatric & Mental Health Support',
    category: 'Behavioral Health',
    department: 'Psychosomatic & Mental Health',
    commonSymptoms: ['Chronic anxiety and palpitations', 'Persistent low mood or sadness', 'Insomnia and sleep cycle disruptions', 'Stress-induced bodily aches'],
    diagnosticApproach: 'Structured psychiatric symptom assessment, differential diagnosis against physical metabolic/thyroid disorders.',
    clinicalCare: 'Evidence-based pharmacotherapy for mood and anxiety disorders, sleep hygiene counseling, and stress mitigation therapy.',
    recommendedFor: 'Generalized Anxiety, Major Depression, Panic Episodes, Insomnia'
  },
  {
    id: 'srv_liver',
    title: 'Jaundice & Liver Diseases',
    category: 'Hepatology',
    department: 'Hepatic & Biliary Health',
    commonSymptoms: ['Yellowing of eyes and skin (Jaundice)', 'Dark colored urine and pale stools', 'Elevated ALT/AST/Bilirubin', 'Right upper abdominal discomfort'],
    diagnosticApproach: 'Liver Function Tests (LFTs), Viral Hepatitis serology (Anti-HCV, HBsAg), and liver ultrasound evaluation.',
    clinicalCare: 'Antiviral therapy oversight, fatty liver (NAFLD) reversal protocols, hepatic diet counseling, and jaundice resolution.',
    recommendedFor: 'Acute & Chronic Hepatitis B/C, Jaundice, Fatty Liver Disease'
  },
  {
    id: 'srv_gi',
    title: 'Gastrointestinal & Stomach Disorders',
    category: 'Gastroenterology',
    department: 'Digestive Health',
    commonSymptoms: ['Persistent heartburn and acid reflux (GERD)', 'Epigastric pain and burning', 'Bloating, gas, and irregular bowels', 'Nausea and loss of appetite'],
    diagnosticApproach: 'H. pylori diagnostic evaluation, clinical gastrointestinal examination, and targeted endoscopy recommendations.',
    clinicalCare: 'H. pylori eradication triple therapy, mucosal protectants, irritable bowel syndrome (IBS) dietary protocols, and ulcer healing.',
    recommendedFor: 'Peptic Ulcers, Acid Reflux/GERD, IBS, H. Pylori Gastritis'
  },
  {
    id: 'srv_hypertension',
    title: 'Hypertension & General Internal Medicine',
    category: 'Internal Medicine',
    department: 'General & Preventative Medicine',
    commonSymptoms: ['High blood pressure readings', 'Throbbing headaches and dizziness', 'Persistent unexplained fever', 'Generalized body weakness'],
    diagnosticApproach: 'Ambulatory BP log analysis, complete blood counts, electrolyte analysis, and cardiovascular risk assessment.',
    clinicalCare: 'Multi-drug antihypertensive optimization, sodium intake counseling, fever workup, and adult vaccination schedules.',
    recommendedFor: 'Essential Hypertension, Typhoid/Malaria workup, General Illness'
  }
];

export const ServicesSection: React.FC = () => {
  const { startBookingWithDoctor } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeExpandedId, setActiveExpandedId] = useState<string>('srv_neuro');

  const categories = ['All', 'Neurology', 'Pulmonology', 'Endocrinology', 'Nephrology', 'Gastroenterology', 'Hepatology'];

  const filteredSpecialties = selectedCategory === 'All'
    ? detailedSpecialties
    : detailedSpecialties.filter(s => s.category === selectedCategory);

  return (
    <section className="py-14 lg:py-20 bg-[#FFFFFF] border-b border-[#D6D6D6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B8C5A]/15 text-[#5B8C5A] border border-[#5B8C5A]/30 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>Consultant Clinical Specializations</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#39393A] tracking-tight">
            Specialized Care & Medical Treatment Protocols
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Led by Dr. Zahid Hussain (MBBS, FCPS Internal Medicine). Explore diagnostic workups, key symptom indications, and comprehensive management plans.
          </p>
        </div>

        {/* 3 Consultation Channels Quick Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#E6E6E6]/60 p-5 rounded-xl border border-[#D6D6D6] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#39393A] text-[#5B8C5A] flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#39393A]">Clinic Consultation</h3>
              <p className="text-xs text-[#5B8C5A] font-semibold mt-0.5">4:00 PM – 12:00 AM Daily</p>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                In-person consultation and comprehensive medical evaluation at Zahid Clinic, Sunny View Park Ramgarh Mughalpura Lahore.
              </p>
            </div>
            <button
              onClick={() => startBookingWithDoctor()}
              className="mt-4 w-full py-2 bg-[#39393A] hover:bg-[#2A2A2B] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
            >
              Book Clinic Visit
            </button>
          </div>

          <div className="bg-[#E6E6E6]/60 p-5 rounded-xl border border-[#D6D6D6] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#5B8C5A] text-white flex items-center justify-center mb-3">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#39393A]">Online Chat Consultation</h3>
              <p className="text-xs text-[#5B8C5A] font-semibold mt-0.5">24/7 Online Chat Active</p>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Convenient remote consultation via secure chat, lab report review, and digital e-prescriptions accessible worldwide.
              </p>
            </div>
            <button
              onClick={() => startBookingWithDoctor()}
              className="mt-4 w-full py-2 bg-[#5B8C5A] hover:bg-[#4A7349] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
            >
              Book Online Chat
            </button>
          </div>

          <div className="bg-[#E6E6E6]/60 p-5 rounded-xl border border-[#D6D6D6] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#A37774] text-white flex items-center justify-center mb-3">
                <Home className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#39393A]">Home Medical Visits</h3>
              <p className="text-xs text-[#A37774] font-semibold mt-0.5">Lahore Residence Service</p>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Dedicated doctor home assessment for post-stroke recovery, elderly care, and patients with mobility challenges in Lahore.
              </p>
            </div>
            <button
              onClick={() => startBookingWithDoctor()}
              className="mt-4 w-full py-2 bg-[#39393A] hover:bg-[#2A2A2B] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
            >
              Book Home Visit
            </button>
          </div>
        </div>

        {/* Dynamic Category Filter */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D6D6D6] pb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#39393A]">
              <Filter className="w-4 h-4 text-[#5B8C5A]" />
              <span>Filter by Medical Category:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#39393A] text-white font-bold shadow-2xs'
                      : 'bg-[#E6E6E6] text-[#39393A] hover:bg-[#D6D6D6]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Specialty Detail Accordion / Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filteredSpecialties.map((item) => {
              const isExpanded = activeExpandedId === item.id;
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all flex flex-col justify-between p-5 ${
                    isExpanded
                      ? 'bg-[#E6E6E6]/80 border-[#39393A] shadow-md ring-1 ring-[#39393A]'
                      : 'bg-[#E6E6E6]/40 border-[#D6D6D6] hover:border-[#5B8C5A] hover:bg-[#E6E6E6]/70'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-[#A37774] bg-[#FFFFFF] px-2.5 py-0.5 rounded border border-[#D6D6D6]">
                        {item.department}
                      </span>
                      <button
                        onClick={() => setActiveExpandedId(isExpanded ? '' : item.id)}
                        className="text-xs text-[#5B8C5A] hover:text-[#4A7349] font-bold cursor-pointer"
                      >
                        {isExpanded ? 'Collapse' : 'View Protocol'}
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-[#39393A]">{item.title}</h3>
                    
                    <p className="text-xs text-stone-600 font-medium">
                      Key Conditions: <span className="text-[#39393A]">{item.recommendedFor}</span>
                    </p>

                    {/* Common Symptoms Checklist */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-[#39393A] block">Common Indicators:</span>
                      {item.commonSymptoms.map((sym, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-stone-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#5B8C5A] mt-0.5 shrink-0" />
                          <span>{sym}</span>
                        </div>
                      ))}
                    </div>

                    {/* Expanded Clinical Protocol Details */}
                    {isExpanded && (
                      <div className="pt-3 mt-3 border-t border-[#D6D6D6] space-y-2.5 text-xs">
                        <div>
                          <span className="font-bold text-[#39393A] block">Diagnostic Approach:</span>
                          <p className="text-stone-700 leading-relaxed mt-0.5">{item.diagnosticApproach}</p>
                        </div>
                        <div>
                          <span className="font-bold text-[#39393A] block">Treatment Protocol:</span>
                          <p className="text-stone-700 leading-relaxed mt-0.5">{item.clinicalCare}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Booking CTA Button */}
                  <div className="mt-5 pt-3 border-t border-[#D6D6D6] flex items-center justify-between gap-2">
                    <button
                      onClick={() => startBookingWithDoctor()}
                      className="w-full bg-[#5B8C5A] hover:bg-[#4A7349] text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book for {item.title.split(' ')[0]}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Consultation Banner */}
        <div className="bg-[#39393A] rounded-2xl p-6 sm:p-8 text-[#E6E6E6] flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-[#5B8C5A] text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Zahid Clinic Lahore • Dr. Zahid Hussain</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Ready to schedule your medical consultation?
            </h3>
            <p className="text-xs text-stone-300 max-w-xl">
              Select home visit, 24/7 online chat consultation, or clinic in-person visit with direct Pakistani payment verification (Easypaisa, JazzCash, Debit Card, UPaisa).
            </p>
          </div>
          <button
            onClick={() => startBookingWithDoctor()}
            className="bg-[#5B8C5A] hover:bg-[#4A7349] text-white font-bold text-xs px-6 py-3 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Consultation Now</span>
          </button>
        </div>

      </div>
    </section>
  );
};
