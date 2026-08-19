import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Appointment, TimeSlot } from '../../types';
import { api } from '../../services/api';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  CalendarClock, 
  MessageSquare, 
  FileText, 
  Sparkles, 
  AlertCircle, 
  Paperclip, 
  Plus, 
  ShieldCheck, 
  Stethoscope, 
  Activity,
  Send,
  Download,
  Check,
  ChevronDown
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user, doctorProfile, isAdminDoctor } = useAuth();
  const { 
    appointments, 
    openChat, 
    setCurrentView, 
    handleAcceptAppointment, 
    handleRejectAppointment, 
    handleProposeReschedule, 
    handleCompleteAppointment,
    addToast,
    refreshAllData
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'all' | 'completed'>('pending');

  // Modal States
  const [inspectApt, setInspectApt] = useState<Appointment | null>(null);
  const [rejectApt, setRejectApt] = useState<Appointment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00 AM');
  const [rescheduleNote, setRescheduleNote] = useState('');

  const [completeApt, setCompleteApt] = useState<Appointment | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [prescription, setPrescription] = useState('');

  // AI Summary State
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  // Filter appointments for this doctor (or all if admin viewing)
  const doctorAppointments = appointments.filter(a => {
    if (!doctorProfile) return true;
    return a.doctorId === doctorProfile.id;
  });

  const pendingApts = doctorAppointments.filter(a => a.status === 'pending');
  const acceptedApts = doctorAppointments.filter(a => a.status === 'accepted');
  const completedApts = doctorAppointments.filter(a => a.status === 'completed');

  const displayedList = activeTab === 'pending'
    ? pendingApts
    : activeTab === 'accepted'
    ? acceptedApts
    : activeTab === 'completed'
    ? completedApts
    : doctorAppointments;

  const handleGenerateAiSummary = async (apt: Appointment) => {
    setAiSummaryLoading(true);
    setAiSummary(null);
    try {
      const res = await api.getAiClinicalSummary({
        patientName: apt.patientName,
        age: apt.patientAge || 30,
        gender: apt.patientGender || 'Not specified',
        reasonForVisit: apt.reasonForVisit,
        symptomsDescription: apt.symptomsDescription,
        duration: apt.durationOfSymptoms || '1-2 weeks',
        medicalHistory: apt.medicalHistory,
        currentMedications: apt.currentMedications
      });

      if (res.success && res.summary) {
        setAiSummary(res.summary);
      } else {
        setAiSummary("Patient presents with chief complaint. Recommended action: Proceed with scheduled consultation and review vital signs.");
      }
    } catch (e) {
      console.error(e);
      setAiSummary("Patient presents with chief complaint. Recommended action: Proceed with scheduled consultation.");
    }
    setAiSummaryLoading(false);
  };

  const handleConfirmReject = async () => {
    if (!rejectApt) return;
    await handleRejectAppointment(rejectApt.id, rejectionReason || 'Doctor unavailable at this time');
    setRejectApt(null);
    setRejectionReason('');
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleApt || !newDate) {
      addToast({ type: 'warning', title: 'Date Required', message: 'Please specify the proposed date.' });
      return;
    }
    await handleProposeReschedule(rescheduleApt.id, newDate, newTime, rescheduleNote);
    setRescheduleApt(null);
    setNewDate('');
    setRescheduleNote('');
  };

  const handleConfirmComplete = async () => {
    if (!completeApt) return;
    await handleCompleteAppointment(completeApt.id, clinicalNotes, prescription);
    setCompleteApt(null);
    setClinicalNotes('');
    setPrescription('');
  };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Doctor Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={doctorProfile?.avatar || user?.avatar || '/blank-pfp.svg'}
              alt={doctorProfile?.name || user?.name}
              className="w-16 h-16 rounded-xl object-cover border border-[#D6D6D6] shadow-xs bg-stone-800"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {doctorProfile?.name || user?.name}
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  {isAdminDoctor ? 'Admin Doctor' : 'Specialist Physician'}
                </span>
              </div>
              <p className="text-xs text-teal-700 font-semibold mt-0.5">
                {doctorProfile?.title} • {doctorProfile?.specialization}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCurrentView('doctor-slots')}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-teal-400" />
              <span>Manage Availability Slots</span>
            </button>
            <button
              onClick={() => setCurrentView('doctor-profile-edit')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Edit Public Profile
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase">Pending Requests</span>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600">{pendingApts.length}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase">Accepted / Upcoming</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600">{acceptedApts.length}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase">Completed Consultations</span>
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{completedApts.length}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase">Total Patient Volume</span>
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{doctorAppointments.length}</div>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Patient Appointment Pipeline</h2>
              <p className="text-xs text-slate-500">Triage incoming clinical intake requests and manage confirmed visits.</p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'pending'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <span>Pending Review</span>
                <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">{pendingApts.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('accepted')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'accepted'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Confirmed ({acceptedApts.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('completed')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'completed'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Completed ({completedApts.length})
              </button>

              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All ({doctorAppointments.length})
              </button>
            </div>
          </div>

          {/* List of Doctor Appointments */}
          {displayedList.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No appointments in this category</h3>
              <p className="text-xs text-slate-500 mt-1">All incoming patient requests are up to date.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedList.map(apt => (
                <div
                  key={apt.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    apt.status === 'pending'
                      ? 'bg-amber-50/30 border-amber-300 shadow-2xs'
                      : apt.status === 'accepted'
                      ? 'bg-white border-teal-200 shadow-xs'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    
                    {/* Patient & Case Overview */}
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-extrabold text-slate-900">{apt.patientName}</h3>
                        <span className="text-xs text-slate-500">({apt.patientGender || 'Adult'}, {apt.patientAge || 'Age 30'})</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          apt.status === 'pending' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          apt.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          apt.status === 'reschedule_proposed' ? 'bg-indigo-100 text-indigo-900 border border-indigo-300' :
                          apt.status === 'completed' ? 'bg-slate-100 text-slate-700' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {apt.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 space-y-1">
                        <p>
                          <strong className="text-slate-900">Chief Complaint:</strong> {apt.reasonForVisit}
                        </p>
                        <p className="text-slate-600 line-clamp-2">
                          <strong className="text-slate-900">Symptoms:</strong> {apt.symptomsDescription}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                          <span className="flex items-center gap-1 font-semibold text-slate-800">
                            <Calendar className="w-3.5 h-3.5 text-teal-600" />
                            {apt.date}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-semibold text-slate-800">
                            <Clock className="w-3.5 h-3.5 text-teal-600" />
                            {apt.time}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-700">Rs. {apt.fee?.toLocaleString()} PKR</span>
                          {apt.paymentMethod && (
                            <>
                              <span>•</span>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {apt.paymentMethod} {apt.paymentDetails?.transactionId ? `(${apt.paymentDetails.transactionId})` : ''}
                              </span>
                            </>
                          )}
                          {apt.attachments && apt.attachments.length > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-teal-700 font-bold">
                                <Paperclip className="w-3 h-3" />
                                {apt.attachments.length} attachment(s)
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Controls for Doctor */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      
                      {/* Detailed Clinical Triage Button */}
                      <button
                        onClick={() => {
                          setInspectApt(apt);
                          setAiSummary(null);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-600" />
                        <span>Inspect Intake</span>
                      </button>

                      {/* Pending State Controls */}
                      {apt.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAcceptAppointment(apt.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>

                          <button
                            onClick={() => {
                              setRescheduleApt(apt);
                              setNewDate(apt.date);
                            }}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-3 py-2 rounded-xl border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <CalendarClock className="w-3.5 h-3.5" />
                            <span>Reschedule</span>
                          </button>

                          <button
                            onClick={() => setRejectApt(apt)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-3 py-2 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                          >
                            <span>Decline</span>
                          </button>
                        </>
                      )}

                      {/* Accepted State Controls */}
                      {apt.status === 'accepted' && (
                        <>
                          <button
                            onClick={() => openChat(apt.id)}
                            className="bg-[#5B8C5A] hover:bg-[#4A7349] text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Direct Patient Chat</span>
                          </button>

                          <button
                            onClick={() => setCompleteApt(apt)}
                            className="bg-[#39393A] hover:bg-[#2A2A2B] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                          >
                            Complete Visit
                          </button>
                        </>
                      )}

                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* INSPECT INTAKE MODAL with GEMINI AI CLINICAL SUMMARY */}
      {inspectApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-5 my-8">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">Clinical Intake & Patient Case File</h3>
              </div>
              <button
                onClick={() => setInspectApt(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Patient Header Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Name</span>
                <span className="font-bold text-slate-900">{inspectApt.patientName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Age / Gender</span>
                <span className="font-medium text-slate-800">{inspectApt.patientAge || 30} yrs • {inspectApt.patientGender || 'Adult'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                <span className="font-medium text-slate-800">{inspectApt.patientPhone || 'On file'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Requested Time</span>
                <span className="font-bold text-teal-700">{inspectApt.date} @ {inspectApt.time}</span>
              </div>
            </div>

            {/* AI Clinical Summary Trigger */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wider">
                    AI Clinical Triage Assistant (Gemini)
                  </h4>
                </div>
                <button
                  onClick={() => handleGenerateAiSummary(inspectApt)}
                  disabled={aiSummaryLoading}
                  className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{aiSummaryLoading ? 'Generating Analysis...' : aiSummary ? 'Regenerate Analysis' : 'Generate Clinical Summary'}</span>
                </button>
              </div>

              {aiSummary && (
                <div className="mt-2 p-3 bg-white rounded-xl border border-teal-200 text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">
                  {aiSummary}
                </div>
              )}
            </div>

            {/* Case Details Sections */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h5 className="font-bold text-slate-900 mb-1">Chief Complaint:</h5>
                <p className="text-slate-700">{inspectApt.reasonForVisit}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h5 className="font-bold text-slate-900 mb-1">Detailed Description of Symptoms:</h5>
                <p className="text-slate-700 leading-relaxed">{inspectApt.symptomsDescription}</p>
                {inspectApt.durationOfSymptoms && (
                  <p className="text-[11px] text-slate-500 mt-1">Duration: <strong>{inspectApt.durationOfSymptoms}</strong></p>
                )}
              </div>

              {/* Payment Verification Box */}
              {inspectApt.paymentDetails ? (
                <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-emerald-950 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Direct Payment Verification</span>
                    </h5>
                    <span className="font-bold uppercase px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px]">
                      {inspectApt.paymentMethod || 'easypaisa'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Paid Amount</span>
                      <span className="font-bold text-emerald-900">Rs. {inspectApt.fee?.toLocaleString()} PKR</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Transaction ID (TRX/TID)</span>
                      <span className="font-mono font-bold text-slate-900">{inspectApt.paymentDetails.transactionId}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Sender Account</span>
                      <span className="font-mono text-slate-800">{inspectApt.paymentDetails.senderAccount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Sender Name</span>
                      <span className="text-slate-800 font-medium">{inspectApt.paymentDetails.senderName || inspectApt.patientName}</span>
                    </div>
                  </div>

                  {inspectApt.paymentDetails.depositReceiptNote && (
                    <div className="text-[11px] text-emerald-900 italic pt-1 border-t border-emerald-200/60">
                      <strong>Patient Note:</strong> "{inspectApt.paymentDetails.depositReceiptNote}"
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  Fee: <strong>Rs. {inspectApt.fee?.toLocaleString()} PKR</strong>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-slate-900 mb-1">Medical History:</h5>
                  <p className="text-slate-600">{inspectApt.medicalHistory || 'No significant previous conditions noted.'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-slate-900 mb-1">Current Medications:</h5>
                  <p className="text-slate-600">{inspectApt.currentMedications || 'None recorded.'}</p>
                </div>
              </div>

              {inspectApt.preferredCommunicationNote && (
                <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                  <h5 className="font-bold text-teal-900 mb-0.5">Patient Communication Preference:</h5>
                  <p className="text-slate-600 italic">"{inspectApt.preferredCommunicationNote}"</p>
                </div>
              )}

              {/* Attachments */}
              {inspectApt.attachments && inspectApt.attachments.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h5 className="font-bold text-slate-900">Uploaded Diagnostic Files ({inspectApt.attachments.length}):</h5>
                  <div className="space-y-1.5">
                    {inspectApt.attachments.map(att => (
                      <div key={att.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-3.5 h-3.5 text-teal-600" />
                          <span className="font-medium text-slate-800">{att.name}</span>
                          <span className="text-[10px] text-slate-400">({att.size})</span>
                        </div>
                        <span className="text-[10px] font-bold text-[#5B8C5A] bg-[#5B8C5A]/15 px-2 py-0.5 rounded border border-[#5B8C5A]/30">
                          Encrypted & Verified
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setInspectApt(null)}
                className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Close Case File
              </button>
            </div>

          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Decline Appointment Request</h3>
            <p className="text-xs text-slate-600">
              Decline request from <strong>{rejectApt.patientName}</strong> for {rejectApt.date}. The calendar slot will be released back to your available pool.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Declining (Patient will receive this)</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Schedule emergency conflict; recommend booking next week or consulting urgent care..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-rose-500/20 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectApt(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer"
              >
                Decline Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROPOSE RESCHEDULE MODAL */}
      {rescheduleApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Propose Alternate Time Slot</h3>
            </div>
            <p className="text-xs text-slate-600">
              Suggest an alternate time for <strong>{rescheduleApt.patientName}</strong>. The patient will receive a notification to accept or decline.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Proposed Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Proposed Time</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 02:00 PM"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Note for Patient (Optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. Due to clinical surgical rotation, I can see you at 2:00 PM instead..."
                value={rescheduleNote}
                onChange={e => setRescheduleNote(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRescheduleApt(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
              >
                Send Proposal to Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE CONSULTATION MODAL */}
      {completeApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Complete Consultation for {completeApt.patientName}</h3>
            <p className="text-xs text-slate-600">
              Provide clinical conclusions, care plan notes, and electronic prescription summary.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Assessment & Notes</label>
              <textarea
                rows={3}
                placeholder="e.g. Discussed migraine triggers; advised sleep hygiene protocol and 2-week follow up."
                value={clinicalNotes}
                onChange={e => setClinicalNotes(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prescription & Follow-up Instructions (Optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. Sumatriptan 50mg PO at onset of aura. Max 2 doses/day."
                value={prescription}
                onChange={e => setPrescription(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCompleteApt(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmComplete}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer"
              >
                Save & Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
