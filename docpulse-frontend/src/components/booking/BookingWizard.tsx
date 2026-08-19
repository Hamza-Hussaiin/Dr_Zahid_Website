import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { DoctorProfile, TimeSlot, AppointmentAttachment, PaymentMethod, PaymentDetails } from '../../types';
import confetti from 'canvas-confetti';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ChevronRight, 
  ArrowLeft, 
  Paperclip, 
  X, 
  Video, 
  Info, 
  CreditCard, 
  Smartphone, 
  Copy, 
  Check, 
  Building2, 
  Lock, 
  Hourglass,
  Activity,
  Home
} from 'lucide-react';

export const BookingWizard: React.FC = () => {
  const { user, patientProfile } = useAuth();
  const { 
    selectedDoctorId, 
    setSelectedDoctorId, 
    doctors, 
    setCurrentView, 
    addToast, 
    refreshAllData 
  } = useApp();

  // 1 = Select Doctor & Slot, 2 = Intake Form, 3 = Proceed to Payment, 4 = Waiting for Confirmation
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [currentDoctor, setCurrentDoctor] = useState<DoctorProfile | null>(null);
  const [doctorSlots, setDoctorSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '0300-1234567');
  const [dob, setDob] = useState(patientProfile?.dob || '1995-06-14');
  const [age, setAge] = useState<number>(patientProfile?.age || 29);
  const [gender, setGender] = useState(patientProfile?.gender || 'female');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [symptomsDescription, setSymptomsDescription] = useState('');
  const [durationOfSymptoms, setDurationOfSymptoms] = useState('1 to 2 weeks');
  const [medicalHistory, setMedicalHistory] = useState(patientProfile?.allergies ? `Allergies: ${patientProfile.allergies}. Conditions: ${patientProfile.chronicConditions || 'None'}` : '');
  const [currentMedications, setCurrentMedications] = useState(patientProfile?.currentMedications || '');
  const [preferredCommunicationNote, setPreferredCommunicationNote] = useState('Consultation at Zahid Clinic or via online chat.');
  const [attachments, setAttachments] = useState<AppointmentAttachment[]>([]);
  const [hasConsent, setHasConsent] = useState(true);

  // Payment State (Easypaisa, JazzCash, Mastercard, Upaisa)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('easypaisa');
  const [senderAccount, setSenderAccount] = useState('');
  const [senderName, setSenderName] = useState(user?.name || '');
  const [transactionId, setTransactionId] = useState('');
  const [paymentReceiptNote, setPaymentReceiptNote] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<any>(null);

  // Initialize doctor and fetch slots
  useEffect(() => {
    const doc = doctors.find(d => d.id === selectedDoctorId) || doctors[0];
    if (doc) {
      setCurrentDoctor(doc);
      loadSlots(doc.id);
    }
  }, [selectedDoctorId, doctors]);

  // Set default sender account when user changes
  useEffect(() => {
    if (user?.phone && !senderAccount) {
      setSenderAccount(user.phone);
    }
    if (user?.name && !senderName) {
      setSenderName(user.name);
    }
  }, [user]);

  const loadSlots = async (docId: string) => {
    const res = await api.getSlots(docId);
    if (res.success) {
      setDoctorSlots(res.slots || []);
      if (res.slots && res.slots.length > 0) {
        setSelectedDate(res.slots[0].date);
      }
    }
  };

  const handleDoctorChange = (docId: string) => {
    setSelectedDoctorId(docId);
    const doc = doctors.find(d => d.id === docId);
    if (doc) {
      setCurrentDoctor(doc);
      setSelectedSlot(null);
      loadSlots(doc.id);
    }
  };

  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);

  const handleRealFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        addToast({
          type: 'error',
          title: 'File Too Large',
          message: 'Attachment exceeds 15MB limit.'
        });
        return;
      }

      setIsUploadingAttachment(true);
      try {
        const res = await api.uploadAttachment(file);
        if (res.success && res.url) {
          const newAtt: AppointmentAttachment = {
            id: `att_${Date.now()}`,
            name: res.name || file.name,
            size: res.size || `${(file.size / 1024).toFixed(1)} KB`,
            type: file.type.includes('pdf') ? 'pdf' : file.type.includes('image') ? 'image' : 'doc',
            url: res.url
          };
          setAttachments(prev => [...prev, newAtt]);
          addToast({
            type: 'success',
            title: 'Diagnostic File Uploaded',
            message: `${file.name} securely attached to medical record.`
          });
        } else {
          addToast({
            type: 'error',
            title: 'Upload Failed',
            message: res.message || 'Could not upload file.'
          });
        }
      } catch (err: any) {
        addToast({
          type: 'error',
          title: 'Upload Error',
          message: err.message || 'Failed to upload diagnostic file.'
        });
      } finally {
        setIsUploadingAttachment(false);
      }
    }
  };

  const removeAttachment = (attId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attId));
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.status !== 'available') return;
    setSelectedSlot(slot);
  };

  const proceedToIntake = () => {
    if (!selectedSlot) {
      addToast({
        type: 'warning',
        title: 'Slot Required',
        message: 'Please select an open calendar slot to proceed.'
      });
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const proceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonForVisit.trim() || !symptomsDescription.trim()) {
      addToast({
        type: 'error',
        title: 'Required Information Missing',
        message: 'Please provide the reason for visit and description of symptoms.'
      });
      return;
    }

    if (!hasConsent) {
      addToast({
        type: 'warning',
        title: 'Consent Required',
        message: 'Please accept the privacy policy & medical consent to proceed.'
      });
      return;
    }

    // Move to payment step
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyAccount = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast({
      type: 'success',
      title: 'Copied to Clipboard',
      message: `${text} copied.`
    });
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleFinalPaymentSubmit = async () => {
    if (!currentDoctor || !selectedSlot || !user) return;

    if (!senderAccount.trim()) {
      addToast({
        type: 'warning',
        title: 'Sender Detail Required',
        message: 'Please enter your sender mobile/account number.'
      });
      return;
    }

    if (!transactionId.trim()) {
      addToast({
        type: 'warning',
        title: 'Transaction ID Required',
        message: 'Please enter the transaction reference ID (TID/TRX) provided by your payment app.'
      });
      return;
    }

    const doctorAccount = currentDoctor.paymentAccounts?.[selectedPaymentMethod];

    const paymentDetails: PaymentDetails = {
      method: selectedPaymentMethod,
      recipientTitle: doctorAccount?.accountTitle || currentDoctor.name,
      recipientNumber: doctorAccount?.accountNumber || '0345-5551234',
      bankName: doctorAccount?.bankName,
      branchCode: doctorAccount?.branchCode,
      senderAccount: senderAccount.trim(),
      senderName: senderName.trim(),
      transactionId: transactionId.trim(),
      paidAmount: currentDoctor.consultationFee,
      currency: 'PKR',
      submittedAt: new Date().toISOString(),
      depositReceiptNote: paymentReceiptNote.trim() || undefined
    };

    setIsSubmitting(true);
    try {
      const res = await api.createAppointment({
        patientId: user.id,
        patientName: fullName,
        patientEmail: email,
        patientPhone: phone,
        patientAge: age,
        patientGender: gender,
        doctorId: currentDoctor.id,
        slotId: selectedSlot.id,
        reasonForVisit,
        symptomsDescription,
        durationOfSymptoms,
        medicalHistory,
        currentMedications,
        attachments,
        preferredCommunicationNote,
        fee: currentDoctor.consultationFee,
        currency: 'PKR',
        paymentMethod: selectedPaymentMethod,
        paymentDetails
      });

      if (res.success && res.appointment) {
        setCreatedAppointment(res.appointment);
        setStep(4);
        await refreshAllData();
        
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore
        }

        addToast({
          type: 'success',
          title: 'Payment Details Submitted',
          message: `Your booking and transaction details have been submitted. Waiting for confirmation.`
        });
      } else {
        addToast({
          type: 'error',
          title: 'Booking Error',
          message: res.message || 'Unable to complete appointment request.'
        });
      }
    } catch (err) {
      console.error(err);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'An unexpected error occurred during submission.'
      });
    }
    setIsSubmitting(false);
  };

  const availableDates = Array.from(new Set(doctorSlots.map(s => s.date))).sort();
  const slotsForSelectedDate = doctorSlots.filter(s => s.date === (selectedDate || availableDates[0]));

  const currentDoctorAccount = currentDoctor?.paymentAccounts?.[selectedPaymentMethod];

  return (
    <div className="py-10 bg-[#E6E6E6] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Wizard Stepper Header */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#D6D6D6] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6E6E6]">
            <div>
              <span className="text-xs font-bold text-[#5B8C5A] uppercase tracking-wider">Patient Booking Portal</span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#39393A] mt-0.5">
                {step === 1 && 'Step 1: Select Specialist & Calendar Slot'}
                {step === 2 && 'Step 2: Complete Clinical Intake Form'}
                {step === 3 && 'Step 3: Proceed to Payment'}
                {step === 4 && 'Waiting for Confirmation'}
              </h1>
            </div>

            {/* Stepper indicators */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${
                step >= 1 ? 'bg-[#39393A] text-white' : 'bg-[#E6E6E6] text-stone-500'
              }`}>
                <span>1</span>
                <span className="hidden sm:inline">Slot</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${
                step >= 2 ? 'bg-[#39393A] text-white' : 'bg-[#E6E6E6] text-stone-500'
              }`}>
                <span>2</span>
                <span className="hidden sm:inline">Intake</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${
                step >= 3 ? 'bg-[#5B8C5A] text-white' : 'bg-[#E6E6E6] text-stone-500'
              }`}>
                <span>3</span>
                <span className="hidden sm:inline">Payment</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${
                step === 4 ? 'bg-[#A37774] text-white animate-pulse' : 'bg-[#E6E6E6] text-stone-500'
              }`}>
                <span>4</span>
                <span className="hidden sm:inline">Confirm</span>
              </div>
            </div>
          </div>

          {/* Quick Doctor Summary Bar */}
          {currentDoctor && step < 4 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs bg-[#E6E6E6]/60 p-3.5 rounded-xl border border-[#D6D6D6]">
              <div className="flex items-center gap-3">
                <img
                  src={currentDoctor.avatar}
                  alt={currentDoctor.name}
                  className="w-10 h-10 rounded-lg object-cover border border-[#D6D6D6]"
                />
                <div>
                  <h4 className="font-bold text-[#39393A]">{currentDoctor.name}</h4>
                  <p className="text-[11px] text-[#5B8C5A] font-medium">{currentDoctor.specialization}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[#39393A]">
                {selectedSlot && (
                  <span className="text-[#5B8C5A] font-bold bg-white px-2.5 py-1 rounded-md border border-[#D6D6D6]">
                    {selectedSlot.date} @ {selectedSlot.startTime}
                  </span>
                )}
                {step >= 3 && (
                  <span className="font-bold bg-[#5B8C5A]/15 text-[#5B8C5A] px-2.5 py-1 rounded-md border border-[#5B8C5A]/30">
                    Fee: Rs. {currentDoctor.consultationFee.toLocaleString()} PKR
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* STEP 1: Select Doctor & Slot */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Doctor Picker */}
            <div className="lg:col-span-5 bg-[#FFFFFF] rounded-2xl p-6 border border-[#D6D6D6] shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#39393A] flex items-center gap-2">
                <User className="w-4 h-4 text-[#5B8C5A]" />
                <span>1. Specialist Doctor</span>
              </h3>

              <div className="space-y-2.5">
                {doctors.filter(d => d.isActive).map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => handleDoctorChange(doc.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      currentDoctor?.id === doc.id
                        ? 'border-[#39393A] bg-[#E6E6E6]/70 shadow-xs'
                        : 'border-[#D6D6D6] hover:border-stone-400 hover:bg-[#E6E6E6]/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        className="w-12 h-12 rounded-lg object-cover border border-[#D6D6D6] shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-[#39393A]">{doc.name}</h4>
                        <p className="text-[11px] text-[#5B8C5A] font-medium">{doc.specialization}</p>
                        <p className="text-[10px] text-stone-500 mt-0.5">{doc.experienceYears}+ yrs exp • Verified Consultant</p>
                      </div>
                    </div>
                    {currentDoctor?.id === doc.id && (
                      <CheckCircle2 className="w-5 h-5 text-[#5B8C5A] shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar & Available Slots */}
            <div className="lg:col-span-7 bg-[#FFFFFF] rounded-2xl p-6 border border-[#D6D6D6] shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#39393A] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#5B8C5A]" />
                  <span>2. Pick Available Date & Time</span>
                </h3>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="flex items-center gap-1 text-[#39393A]"><span className="w-2 h-2 rounded-full bg-[#5B8C5A]" /> Available</span>
                  <span className="flex items-center gap-1 text-stone-400"><span className="w-2 h-2 rounded-full bg-stone-300" /> Booked</span>
                </div>
              </div>

              {/* Date Selector Tabs */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-2">Available Consultation Dates</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {availableDates.map(dateStr => (
                    <button
                      key={dateStr}
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setSelectedSlot(null);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer text-center ${
                        (selectedDate || availableDates[0]) === dateStr
                          ? 'bg-[#39393A] text-white shadow-xs'
                          : 'bg-[#E6E6E6] text-[#39393A] hover:bg-[#D6D6D6]'
                      }`}
                    >
                      <div>{new Date(dateStr + 'T00:00:00').toLocaleDateString([], { weekday: 'short' })}</div>
                      <div className="text-[11px] font-normal">{new Date(dateStr + 'T00:00:00').toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slot Grid */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-2">
                  Time Slots for {selectedDate || availableDates[0]}
                </label>

                {slotsForSelectedDate.length === 0 ? (
                  <div className="p-8 text-center bg-[#E6E6E6]/40 rounded-xl border border-[#D6D6D6]">
                    <Clock className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                    <p className="text-xs text-stone-500 font-medium">No open slots on this date. Please select another date.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {slotsForSelectedDate.map(slot => {
                      const isAvailable = slot.status === 'available';
                      const isSelected = selectedSlot?.id === slot.id;

                      return (
                        <button
                          key={slot.id}
                          disabled={!isAvailable}
                          onClick={() => handleSlotSelect(slot)}
                          className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#5B8C5A] text-white border-[#5B8C5A] shadow-xs'
                              : isAvailable
                              ? 'bg-[#E6E6E6]/50 border-[#D6D6D6] text-[#39393A] hover:bg-[#E6E6E6] hover:border-[#5B8C5A]'
                              : 'bg-[#E6E6E6]/20 border-[#D6D6D6] text-stone-400 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{slot.startTime} - {slot.endTime}</span>
                          </div>
                          <span className="text-[10px] font-normal block mt-0.5">
                            {slot.status === 'available' ? 'Available' : slot.status === 'booked' ? 'Reserved' : 'Blocked'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 1 Next Button */}
              <div className="pt-4 border-t border-[#E6E6E6] flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  {selectedSlot ? `Selected: ${selectedSlot.date} at ${selectedSlot.startTime}` : 'Please pick a slot to continue'}
                </span>
                <button
                  disabled={!selectedSlot}
                  onClick={proceedToIntake}
                  className="bg-[#39393A] hover:bg-[#2A2A2B] disabled:opacity-40 text-white font-bold text-xs py-2.5 px-6 rounded-lg shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Continue to Intake Form</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* STEP 2: Clinical Intake Form */}
        {step === 2 && (
          <div className="bg-[#FFFFFF] rounded-2xl p-6 sm:p-8 border border-[#D6D6D6] shadow-sm">
            <form onSubmit={proceedToPayment} className="space-y-6">
              
              {/* Back to Step 1 */}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#39393A] hover:text-[#5B8C5A] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Change Specialist or Slot</span>
              </button>

              <div className="border-b border-[#E6E6E6] pb-4">
                <h3 className="text-base font-bold text-[#39393A]">Patient Details & Clinical Intake Information</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  This confidential intake data is shared directly with {currentDoctor?.name} for diagnosis and clinical review.
                </p>
              </div>

              {/* 1. Patient Demographics */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#39393A]">1. Patient Profile Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#39393A] mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#D6D6D6] bg-[#E6E6E6]/30 focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/30 focus:border-[#5B8C5A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#39393A] mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#D6D6D6] bg-[#E6E6E6]/30 focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/30 focus:border-[#5B8C5A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#39393A] mb-1">Phone / Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0300-1234567"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#D6D6D6] bg-[#E6E6E6]/30 focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/30 focus:border-[#5B8C5A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#39393A] mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={e => setDob(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#D6D6D6] bg-[#E6E6E6]/30 focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/30 focus:border-[#5B8C5A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#39393A] mb-1">Age (Years)</label>
                    <input
                      type="number"
                      value={age}
                      onChange={e => setAge(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#D6D6D6] bg-[#E6E6E6]/30 focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/30 focus:border-[#5B8C5A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#39393A] mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#D6D6D6] bg-[#E6E6E6]/30 focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/30 focus:border-[#5B8C5A]"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Chief Complaint & Symptoms */}
              <div className="space-y-3 pt-2 border-t border-[#E6E6E6]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#39393A]">2. Medical Reason & Symptoms</h4>
                
                <div>
                  <label className="block text-xs font-semibold text-[#39393A] mb-1">
                    Chief Complaint / Primary Reason for Visit *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Epilepsy checkup, Diabetes management, Asthma, High BP, Fever"
                    value={reasonForVisit}
                    onChange={e => setReasonForVisit(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D6D6D6] bg-[#E6E6E6]/30 focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/30 focus:border-[#5B8C5A]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#39393A] mb-1">
                      Detailed Description of Symptoms & Frequency *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe what you are experiencing, symptom severity, what triggers or relieves it..."
                      value={symptomsDescription}
                      onChange={e => setSymptomsDescription(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#D6D6D6] bg-[#E6E6E6]/30 focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/30 focus:border-[#5B8C5A] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#39393A] mb-1">Duration of Symptoms</label>
                    <select
                      value={durationOfSymptoms}
                      onChange={e => setDurationOfSymptoms(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#D6D6D6] bg-[#E6E6E6]/30 focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/30 focus:border-[#5B8C5A]"
                    >
                      <option value="Less than 24 hours">Less than 24 hours (Acute)</option>
                      <option value="2 to 6 days">2 to 6 days</option>
                      <option value="1 to 2 weeks">1 to 2 weeks</option>
                      <option value="1 to 3 months">1 to 3 months</option>
                      <option value="Chronic (6+ months)">Chronic (6+ months)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. History & Current Meds */}
              <div className="space-y-3 pt-2 border-t border-[#E6E6E6]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#39393A]">3. Background History & Medications</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#39393A] mb-1">
                      Previous Medical History & Known Allergies
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Allergy history, asthma, hypertension, diabetes..."
                      value={medicalHistory}
                      onChange={e => setMedicalHistory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#D6D6D6] bg-[#E6E6E6]/30 focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/30 focus:border-[#5B8C5A] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#39393A] mb-1">
                      Current Medications & Supplements
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Metformin 500mg, Panadol, Inhaler..."
                      value={currentMedications}
                      onChange={e => setCurrentMedications(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#D6D6D6] bg-[#E6E6E6]/30 focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/30 focus:border-[#5B8C5A] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Diagnostic Attachments */}
              <div className="space-y-3 pt-2 border-t border-[#E6E6E6]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#39393A]">4. Diagnostic Attachments (Optional)</h4>
                
                <div className="border-2 border-dashed border-[#D6D6D6] hover:border-[#5B8C5A] rounded-xl p-4 text-center bg-[#E6E6E6]/30 transition-colors">
                  <Upload className="w-6 h-6 text-[#5B8C5A] mx-auto mb-1" />
                  <p className="text-xs font-semibold text-[#39393A]">
                    Upload Previous Lab Reports, Prescriptions, or Photos (PDF/PNG/JPG)
                  </p>
                  <p className="text-[11px] text-stone-500 mb-2">Max 10MB per file. Encrypted secure clinical storage.</p>
                  
                  <label className="inline-block bg-white hover:bg-stone-50 text-[#39393A] font-semibold text-xs py-1.5 px-4 rounded-lg border border-[#D6D6D6] shadow-2xs cursor-pointer">
                    <span>{isUploadingAttachment ? 'Uploading...' : 'Browse File'}</span>
                    <input
                      type="file"
                      className="hidden"
                      disabled={isUploadingAttachment}
                      onChange={handleRealFileUpload}
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    />
                  </label>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map(att => (
                      <div key={att.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[#5B8C5A]/10 border border-[#5B8C5A]/30 text-xs">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-[#5B8C5A]" />
                          <span className="font-semibold text-[#39393A]">{att.name}</span>
                          <span className="text-stone-500 text-[11px]">({att.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(att.id)}
                          className="text-stone-400 hover:text-[#A37774] p-1 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Communication Note & Consent */}
              <div className="space-y-3 pt-2 border-t border-[#E6E6E6]">
                <div>
                  <label className="block text-xs font-semibold text-[#39393A] mb-1">
                    Special Note for Doctor
                  </label>
                  <input
                    type="text"
                    value={preferredCommunicationNote}
                    onChange={e => setPreferredCommunicationNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D6D6D6] bg-[#E6E6E6]/30 focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/30 focus:border-[#5B8C5A]"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-[#E6E6E6]/50 border border-[#D6D6D6] flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="booking-consent"
                    checked={hasConsent}
                    onChange={e => setHasConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#5B8C5A] rounded border-stone-400 accent-[#5B8C5A] cursor-pointer"
                  />
                  <label htmlFor="booking-consent" className="text-xs text-stone-700 cursor-pointer">
                    I confirm that the clinical description provided is accurate, and agree to clinical consultation standards.
                  </label>
                </div>
              </div>

              {/* Next to Payment Button */}
              <div className="pt-4 border-t border-[#E6E6E6] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-stone-600 hover:text-[#39393A] cursor-pointer"
                >
                  Back to Slot Selection
                </button>

                <button
                  type="submit"
                  className="bg-[#39393A] hover:bg-[#2A2A2B] text-white font-bold text-xs py-3 px-8 rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Proceed to Payment</span>
                  <ChevronRight className="w-4 h-4 text-[#5B8C5A]" />
                </button>
              </div>

            </form>
          </div>
        )}

        {/* STEP 3: PROCEED TO PAYMENT (Fee & Pakistani Payment Gateways) */}
        {step === 3 && currentDoctor && (
          <div className="bg-[#FFFFFF] rounded-2xl p-6 sm:p-8 border border-[#D6D6D6] shadow-sm space-y-6">
            
            {/* Header & Back */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E6E6E6]">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#39393A] hover:text-[#5B8C5A] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Intake Form</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs text-[#5B8C5A] font-semibold bg-[#5B8C5A]/15 px-3 py-1 rounded-full border border-[#5B8C5A]/30">
                <Lock className="w-3.5 h-3.5" />
                <span>Direct Doctor Payment Verification</span>
              </div>
            </div>

            {/* Consultation Fee Summary Card */}
            <div className="bg-[#39393A] rounded-xl p-6 text-white shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-[#5B8C5A] uppercase tracking-wider block">
                    Consultation Summary & Fee
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-1">
                    {currentDoctor.name}
                  </h3>
                  <p className="text-xs text-stone-300 mt-0.5">
                    {currentDoctor.specialization} • {selectedSlot?.date} ({selectedSlot?.startTime} - {selectedSlot?.endTime})
                  </p>
                </div>

                <div className="text-left sm:text-right bg-white/10 p-4 rounded-lg border border-white/15">
                  <span className="text-[11px] text-stone-300 uppercase tracking-wider block font-semibold">Total Payable Fee</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#5B8C5A]">
                    Rs. {currentDoctor.consultationFee.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-stone-300 block font-medium">PKR (Pakistani Rupees)</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#39393A]">
                1. Select Payment Method
              </h4>
              <p className="text-xs text-stone-600">
                Please transfer the consultation fee of <strong>Rs. {currentDoctor.consultationFee.toLocaleString()} PKR</strong> to the designated account of {currentDoctor.name} using any of the available options below:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                
                {/* Easypaisa */}
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('easypaisa')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedPaymentMethod === 'easypaisa'
                      ? 'border-[#5B8C5A] bg-[#5B8C5A]/15 ring-2 ring-[#5B8C5A]/30 shadow-xs'
                      : 'border-[#D6D6D6] hover:border-stone-400 bg-[#E6E6E6]/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-md bg-[#5B8C5A] text-white flex items-center justify-center font-bold text-xs">
                      EP
                    </div>
                    {selectedPaymentMethod === 'easypaisa' && (
                      <CheckCircle2 className="w-4 h-4 text-[#5B8C5A]" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-[#39393A]">Easypaisa</h5>
                    <p className="text-[10px] text-stone-500">Mobile Wallet</p>
                  </div>
                </button>

                {/* JazzCash */}
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('jazzcash')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedPaymentMethod === 'jazzcash'
                      ? 'border-[#A37774] bg-[#A37774]/15 ring-2 ring-[#A37774]/30 shadow-xs'
                      : 'border-[#D6D6D6] hover:border-stone-400 bg-[#E6E6E6]/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-md bg-[#A37774] text-white flex items-center justify-center font-bold text-xs">
                      JC
                    </div>
                    {selectedPaymentMethod === 'jazzcash' && (
                      <CheckCircle2 className="w-4 h-4 text-[#A37774]" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-[#39393A]">JazzCash</h5>
                    <p className="text-[10px] text-stone-500">Mobile Account</p>
                  </div>
                </button>

                {/* Mastercard / Bank */}
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('mastercard')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedPaymentMethod === 'mastercard'
                      ? 'border-[#39393A] bg-[#39393A]/10 ring-2 ring-[#39393A]/30 shadow-xs'
                      : 'border-[#D6D6D6] hover:border-stone-400 bg-[#E6E6E6]/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-md bg-[#39393A] text-white flex items-center justify-center font-bold text-xs">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    {selectedPaymentMethod === 'mastercard' && (
                      <CheckCircle2 className="w-4 h-4 text-[#39393A]" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-[#39393A]">Mastercard</h5>
                    <p className="text-[10px] text-stone-500">Bank Transfer / IBAN</p>
                  </div>
                </button>

                {/* UPaisa */}
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('upaisa')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedPaymentMethod === 'upaisa'
                      ? 'border-[#5B8C5A] bg-[#5B8C5A]/15 ring-2 ring-[#5B8C5A]/30 shadow-xs'
                      : 'border-[#D6D6D6] hover:border-stone-400 bg-[#E6E6E6]/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-md bg-stone-700 text-white flex items-center justify-center font-bold text-xs">
                      UP
                    </div>
                    {selectedPaymentMethod === 'upaisa' && (
                      <CheckCircle2 className="w-4 h-4 text-[#5B8C5A]" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-[#39393A]">Upaisa</h5>
                    <p className="text-[10px] text-stone-500">Ufone Wallet</p>
                  </div>
                </button>

              </div>
            </div>

            {/* Recipient Account Details for Selected Method */}
            <div className="bg-[#E6E6E6]/60 rounded-xl p-5 border border-[#D6D6D6] space-y-4">
              <div className="flex items-center justify-between border-b border-[#D6D6D6] pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#5B8C5A]" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#39393A]">
                    2. Doctor Recipient Account Details
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-[#5B8C5A] bg-white px-2.5 py-0.5 rounded border border-[#D6D6D6] uppercase">
                  {selectedPaymentMethod}
                </span>
              </div>

              {currentDoctorAccount ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  
                  {/* Recipient Title */}
                  <div className="bg-white p-3.5 rounded-lg border border-[#D6D6D6] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-500 font-bold uppercase block">Recipient Account Title</span>
                      <span className="text-xs font-bold text-[#39393A]">{currentDoctorAccount.accountTitle}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyAccount(currentDoctorAccount.accountTitle, 'title')}
                      className="p-1.5 rounded-md bg-[#E6E6E6] hover:bg-[#D6D6D6] text-stone-700 transition-colors cursor-pointer"
                      title="Copy Title"
                    >
                      {copiedKey === 'title' ? <Check className="w-3.5 h-3.5 text-[#5B8C5A]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Recipient Number / IBAN */}
                  <div className="bg-white p-3.5 rounded-lg border border-[#D6D6D6] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-500 font-bold uppercase block">
                        {selectedPaymentMethod === 'mastercard' ? 'Account Number / IBAN' : 'Mobile Account Number'}
                      </span>
                      <span className="text-xs font-bold text-[#39393A] font-mono">{currentDoctorAccount.accountNumber}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyAccount(currentDoctorAccount.accountNumber, 'number')}
                      className="p-1.5 rounded-md bg-[#E6E6E6] hover:bg-[#D6D6D6] text-stone-700 transition-colors cursor-pointer"
                      title="Copy Number"
                    >
                      {copiedKey === 'number' ? <Check className="w-3.5 h-3.5 text-[#5B8C5A]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Bank info if Mastercard */}
                  {currentDoctorAccount.bankName && (
                    <div className="bg-white p-3.5 rounded-lg border border-[#D6D6D6] col-span-1 sm:col-span-2 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-500 font-bold uppercase block">Bank / Institution</span>
                        <span className="text-xs font-bold text-[#39393A]">{currentDoctorAccount.bankName}</span>
                      </div>
                      {currentDoctorAccount.branchCode && (
                        <span className="text-[11px] text-stone-500 font-medium">Branch Code: {currentDoctorAccount.branchCode}</span>
                      )}
                    </div>
                  )}

                  {/* Instructions */}
                  {currentDoctorAccount.instructions && (
                    <div className="col-span-1 sm:col-span-2 text-[11px] text-stone-700 bg-white p-3 rounded-lg border border-[#D6D6D6]">
                      <strong>Instructions:</strong> {currentDoctorAccount.instructions}
                    </div>
                  )}

                </div>
              ) : (
                <div className="text-xs text-stone-600">
                  Doctor payment details will be provided during verification.
                </div>
              )}
            </div>

            {/* Patient Payment Submission Inputs */}
            <div className="space-y-4 pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#39393A]">
                3. Enter Your Payment Confirmation Details
              </h4>
              <p className="text-xs text-stone-600">
                Once you have transferred <strong>Rs. {currentDoctor.consultationFee.toLocaleString()} PKR</strong> to {currentDoctor.name}, enter your transaction details below to verify:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                <div>
                  <label className="block text-xs font-semibold text-[#39393A] mb-1">
                    Your Sender Mobile / Account Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0301-9988771"
                    value={senderAccount}
                    onChange={e => setSenderAccount(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D6D6D6] bg-[#E6E6E6]/30 focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/30 focus:border-[#5B8C5A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#39393A] mb-1">
                    Sender Account Holder Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Khan"
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D6D6D6] bg-[#E6E6E6]/30 focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/30 focus:border-[#5B8C5A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#39393A] mb-1">
                    Transaction ID / Reference Number (TID/TRX) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EP-982410884 or TID #..."
                    value={transactionId}
                    onChange={e => setTransactionId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D6D6D6] bg-[#E6E6E6]/30 focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/30 focus:border-[#5B8C5A] font-mono uppercase"
                  />
                </div>

              </div>

              <div>
                <label className="block text-xs font-semibold text-[#39393A] mb-1">
                  Payment Note / Remarks (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fee sent from my mobile app with transaction SMS received"
                  value={paymentReceiptNote}
                  onChange={e => setPaymentReceiptNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D6D6D6] bg-[#E6E6E6]/30 focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/30 focus:border-[#5B8C5A]"
                />
              </div>

            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#E6E6E6] flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-bold text-stone-600 hover:text-[#39393A] cursor-pointer"
              >
                Back to Intake
              </button>

              <button
                type="button"
                onClick={handleFinalPaymentSubmit}
                disabled={isSubmitting || !senderAccount.trim() || !transactionId.trim()}
                className="w-full sm:w-auto bg-[#5B8C5A] hover:bg-[#4A7349] disabled:opacity-50 text-white font-extrabold text-xs py-3 px-8 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Verifying & Submitting...' : 'Done — Submit for Confirmation'}</span>
              </button>
            </div>

          </div>
        )}

        {/* STEP 4: WAITING FOR CONFIRMATION SCREEN */}
        {step === 4 && (
          <div className="bg-[#FFFFFF] rounded-2xl p-8 sm:p-12 border border-[#D6D6D6] shadow-sm text-center max-w-2xl mx-auto space-y-6">
            
            {/* Status Icon */}
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#E6E6E6] text-[#39393A] flex items-center justify-center border border-[#D6D6D6]">
                <Hourglass className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#5B8C5A] text-white flex items-center justify-center border-2 border-white shadow-xs">
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#A37774] bg-[#A37774]/15 px-3.5 py-1 rounded-full border border-[#A37774]/30">
                <span className="w-2 h-2 rounded-full bg-[#A37774] animate-ping"></span>
                Waiting for Confirmation
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#39393A]">
                Payment & Appointment Submitted
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
                Your payment of <strong>Rs. {currentDoctor?.consultationFee.toLocaleString()} PKR</strong> via <strong>{selectedPaymentMethod.toUpperCase()}</strong> has been recorded and submitted to <strong>{currentDoctor?.name}</strong>.
              </p>
            </div>

            {/* Detailed Confirmation Card */}
            <div className="bg-[#E6E6E6]/60 p-5 rounded-xl border border-[#D6D6D6] text-left space-y-2.5 text-xs">
              <div className="flex justify-between pb-2 border-b border-[#D6D6D6]">
                <span className="text-stone-500 font-semibold">Appointment Status:</span>
                <span className="font-bold text-[#A37774] bg-white px-2 py-0.5 rounded border border-[#D6D6D6]">
                  Waiting for Confirmation
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-500">Doctor:</span>
                <span className="font-bold text-[#39393A]">{currentDoctor?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Specialty:</span>
                <span className="font-semibold text-[#5B8C5A]">{currentDoctor?.specialization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Scheduled Slot:</span>
                <span className="font-bold text-[#39393A]">{selectedSlot?.date} @ {selectedSlot?.startTime} - {selectedSlot?.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Consultation Fee:</span>
                <span className="font-bold text-[#5B8C5A]">Rs. {currentDoctor?.consultationFee.toLocaleString()} PKR</span>
              </div>
              
              <div className="pt-2 border-t border-[#D6D6D6] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-500">Payment Gateway:</span>
                  <span className="font-bold text-[#39393A] uppercase">{selectedPaymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Recipient Account:</span>
                  <span className="font-mono text-[#39393A]">{currentDoctorAccount?.accountNumber} ({currentDoctorAccount?.accountTitle})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Sender Account:</span>
                  <span className="font-mono text-[#39393A]">{senderAccount} ({senderName})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Transaction ID (TID):</span>
                  <span className="font-mono font-bold text-[#5B8C5A] bg-white px-2 py-0.5 rounded border border-[#D6D6D6]">{transactionId}</span>
                </div>
              </div>
            </div>

            {/* Workflow Guidance */}
            <div className="bg-white p-4 rounded-xl border border-[#D6D6D6] text-left text-xs space-y-2">
              <h4 className="font-bold text-[#39393A] flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#5B8C5A]" />
                <span>Next steps:</span>
              </h4>
              <ul className="list-disc list-inside text-stone-600 text-[11px] space-y-1">
                <li>{currentDoctor?.name} will review your payment details and clinical intake.</li>
                <li>Upon confirmation, status changes to <strong>Accepted</strong>, and the chat / clinic slot is confirmed.</li>
                <li>Track live updates from your <strong>Patient Dashboard</strong>.</li>
              </ul>
            </div>

            {/* Dashboard and Home Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setCurrentView('patient-dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-[#39393A] hover:bg-[#2A2A2B] text-white font-bold text-xs py-3 px-6 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Go to Patient Dashboard
              </button>
              <button
                onClick={() => {
                  setCurrentView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto text-[#39393A] hover:bg-[#E6E6E6] font-semibold text-xs py-3 px-5 rounded-lg transition-colors cursor-pointer border border-[#D6D6D6]"
              >
                Return to Home
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
