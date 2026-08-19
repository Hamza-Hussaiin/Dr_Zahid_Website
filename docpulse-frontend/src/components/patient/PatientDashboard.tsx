import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Appointment } from '../../types';
import { 
  Calendar, 
  Clock, 
  User, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  CalendarClock, 
  XCircle, 
  FileText, 
  ArrowRight,
  Plus,
  ShieldCheck,
  Activity,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    appointments, 
    openChat, 
    startBookingWithDoctor, 
    setCurrentView,
    handleAcceptReschedule,
    handleCancelAppointment,
    setSelectedAppointment
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'action_needed' | 'past'>('all');
  const [cancelModalApt, setCancelModalApt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const patientAppointments = appointments.filter(a => !user || a.patientId === user.id);

  const upcomingApts = patientAppointments.filter(a => a.status === 'accepted' || a.status === 'pending');
  const actionNeededApts = patientAppointments.filter(a => a.status === 'reschedule_proposed');
  const pastApts = patientAppointments.filter(a => a.status === 'completed' || a.status === 'rejected' || a.status === 'cancelled');

  const filteredList = activeTab === 'upcoming' 
    ? upcomingApts 
    : activeTab === 'action_needed' 
    ? actionNeededApts 
    : activeTab === 'past' 
    ? pastApts 
    : patientAppointments;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5B8C5A] bg-[#5B8C5A]/15 px-2.5 py-0.5 rounded-full border border-[#5B8C5A]/30">
            <CheckCircle2 className="w-3 h-3 text-[#5B8C5A]" />
            Accepted • Consultation Ready
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#A37774] bg-[#A37774]/15 px-2.5 py-0.5 rounded-full border border-[#A37774]/30">
            <Clock className="w-3 h-3 text-[#A37774]" />
            Waiting for Confirmation
          </span>
        );
      case 'reschedule_proposed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#39393A] bg-[#E6E6E6] px-2.5 py-0.5 rounded-full border border-stone-400 animate-pulse">
            <CalendarClock className="w-3 h-3 text-[#39393A]" />
            Reschedule Proposed by Doctor
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#39393A] bg-[#E6E6E6] px-2.5 py-0.5 rounded-full border border-[#D6D6D6]">
            <CheckCircle2 className="w-3 h-3 text-stone-600" />
            Completed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#A37774] bg-[#A37774]/15 px-2.5 py-0.5 rounded-full border border-[#A37774]/30">
            <XCircle className="w-3 h-3 text-[#A37774]" />
            Declined
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-500 bg-[#E6E6E6] px-2.5 py-0.5 rounded-full border border-[#D6D6D6]">
            <XCircle className="w-3 h-3 text-stone-400" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalApt) return;
    await handleCancelAppointment(cancelModalApt.id, cancelReason || 'Cancelled by patient');
    setCancelModalApt(null);
    setCancelReason('');
  };

  return (
    <div className="py-8 bg-[#E6E6E6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Patient Welcome Header */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 sm:p-8 border border-[#D6D6D6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#39393A] text-white flex items-center justify-center font-extrabold text-xl shadow-2xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'PT'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#39393A]">
                  Welcome, {user?.name || 'Patient'}
                </h1>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#5B8C5A]/15 text-[#5B8C5A] border border-[#5B8C5A]/30">
                  Patient Portal
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Manage your consultations with Dr. Zahid Hussain at Zahid Clinic Lahore or online.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('profile-settings')}
              className="px-4 py-2 text-xs font-semibold text-[#39393A] bg-[#E6E6E6] hover:bg-[#D6D6D6] rounded-lg transition-colors cursor-pointer"
            >
              Medical Profile
            </button>
            <button
              onClick={() => startBookingWithDoctor()}
              className="bg-[#39393A] hover:bg-[#2A2A2B] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#5B8C5A]" />
              <span>Book Consultation</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#D6D6D6] shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-bold uppercase">Total Bookings</span>
              <Calendar className="w-4 h-4 text-[#39393A]" />
            </div>
            <div className="text-2xl font-black text-[#39393A]">{patientAppointments.length}</div>
          </div>

          <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#D6D6D6] shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-bold uppercase">Upcoming / Active</span>
              <Activity className="w-4 h-4 text-[#5B8C5A]" />
            </div>
            <div className="text-2xl font-black text-[#5B8C5A]">{upcomingApts.length}</div>
          </div>

          <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#D6D6D6] shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-bold uppercase">Action Needed</span>
              <CalendarClock className="w-4 h-4 text-[#A37774]" />
            </div>
            <div className="text-2xl font-black text-[#A37774]">{actionNeededApts.length}</div>
          </div>

          <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#D6D6D6] shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-bold uppercase">Completed Visits</span>
              <ShieldCheck className="w-4 h-4 text-[#39393A]" />
            </div>
            <div className="text-2xl font-black text-[#39393A]">{pastApts.filter(a => a.status === 'completed').length}</div>
          </div>
        </div>

        {/* Action Needed Highlight Alert Banner */}
        {actionNeededApts.length > 0 && (
          <div className="bg-[#FFFFFF] rounded-xl p-4 border border-[#A37774] flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#A37774] mt-0.5 shrink-0" />
            <div className="flex-1 text-xs">
              <h4 className="font-bold text-[#39393A]">Reschedule Time Proposed by Doctor</h4>
              <p className="text-stone-600 mt-0.5">
                You have {actionNeededApts.length} appointment where the doctor suggested an alternate time slot. Please review below and confirm.
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation for Appointments */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#D6D6D6] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E6E6] pb-4">
            <h2 className="text-base font-bold text-[#39393A]">My Appointments & Care History</h2>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'all' ? 'bg-[#39393A] text-white' : 'bg-[#E6E6E6] text-[#39393A] hover:bg-[#D6D6D6]'
                }`}
              >
                All ({patientAppointments.length})
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'upcoming' ? 'bg-[#39393A] text-white' : 'bg-[#E6E6E6] text-[#39393A] hover:bg-[#D6D6D6]'
                }`}
              >
                Upcoming ({upcomingApts.length})
              </button>
              {actionNeededApts.length > 0 && (
                <button
                  onClick={() => setActiveTab('action_needed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'action_needed' ? 'bg-[#A37774] text-white' : 'bg-[#A37774]/15 text-[#A37774] hover:bg-[#A37774]/25'
                  }`}
                >
                  Action Required ({actionNeededApts.length})
                </button>
              )}
              <button
                onClick={() => setActiveTab('past')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'past' ? 'bg-[#39393A] text-white' : 'bg-[#E6E6E6] text-[#39393A] hover:bg-[#D6D6D6]'
                }`}
              >
                Past & History ({pastApts.length})
              </button>
            </div>
          </div>

          {/* Appointments List */}
          {filteredList.length === 0 ? (
            <div className="text-center py-12 bg-[#E6E6E6]/40 rounded-xl border border-[#D6D6D6]">
              <Calendar className="w-12 h-12 text-stone-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#39393A]">No appointments in this view</h3>
              <p className="text-xs text-stone-500 mt-1">Book your next consultation with Dr. Zahid Hussain.</p>
              <button
                onClick={() => startBookingWithDoctor()}
                className="mt-4 bg-[#39393A] hover:bg-[#2A2A2B] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-[#5B8C5A]" />
                <span>Book Consultation</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredList.map(apt => (
                <div
                  key={apt.id}
                  className={`p-5 rounded-xl border transition-all ${
                    apt.status === 'reschedule_proposed'
                      ? 'bg-[#FFFFFF] border-[#A37774]'
                      : apt.status === 'accepted'
                      ? 'bg-[#FFFFFF] border-[#5B8C5A]/50 shadow-2xs'
                      : 'bg-[#FFFFFF] border-[#D6D6D6]'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Doctor and appointment timing */}
                    <div className="flex items-start gap-4">
                      <img
                        src={apt.doctorAvatar || '/blank-pfp.svg'}
                        alt={apt.doctorName}
                        className="w-14 h-14 rounded-xl object-cover border border-[#D6D6D6] shrink-0 bg-stone-800"
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-[#39393A]">{apt.doctorName}</h3>
                          {getStatusBadge(apt.status)}
                        </div>
                        <p className="text-xs text-[#5B8C5A] font-semibold">{apt.doctorSpecialization}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 pt-0.5">
                          <span className="flex items-center gap-1 font-bold text-[#39393A]">
                            <Calendar className="w-3.5 h-3.5 text-[#5B8C5A]" />
                            <span>{apt.date}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-medium text-[#39393A]">
                            <Clock className="w-3.5 h-3.5 text-[#5B8C5A]" />
                            <span>{apt.time}</span>
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-[#5B8C5A]">Rs. {apt.fee?.toLocaleString()} PKR</span>
                          {apt.paymentMethod && (
                            <>
                              <span>•</span>
                              <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#E6E6E6] text-[#39393A] border border-[#D6D6D6]">
                                {apt.paymentMethod} {apt.paymentDetails?.transactionId ? `(${apt.paymentDetails.transactionId})` : ''}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons based on status */}
                    <div className="flex flex-wrap items-center gap-2">
                      
                      {/* Accepted: Direct Doctor Chat */}
                      {apt.status === 'accepted' && (
                        <button
                          onClick={() => openChat(apt.id)}
                          className="bg-[#5B8C5A] hover:bg-[#4A7349] text-white font-bold text-xs px-4 py-2 rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Open Direct Doctor Chat</span>
                        </button>
                      )}

                      {/* Reschedule Proposed: Accept or Decline */}
                      {apt.status === 'reschedule_proposed' && apt.proposedSlot && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAcceptReschedule(apt.id)}
                            className="bg-[#5B8C5A] hover:bg-[#4A7349] text-white font-bold text-xs px-4 py-2 rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept New Time ({apt.proposedSlot.time})</span>
                          </button>

                          <button
                            onClick={() => setCancelModalApt(apt)}
                            className="bg-[#A37774]/15 hover:bg-[#A37774]/25 text-[#A37774] font-bold text-xs px-3 py-2 rounded-lg border border-[#A37774]/30 transition-colors cursor-pointer"
                          >
                            <span>Decline</span>
                          </button>
                        </div>
                      )}

                      {/* Pending: Cancel Request button */}
                      {apt.status === 'pending' && (
                        <button
                          onClick={() => setCancelModalApt(apt)}
                          className="text-xs font-semibold text-[#A37774] hover:bg-[#A37774]/15 px-3 py-1.5 rounded-lg border border-[#A37774]/30 transition-colors cursor-pointer"
                        >
                          Cancel Request
                        </button>
                      )}

                      {/* Audit Details */}
                      <button
                        onClick={() => setSelectedAppointment(apt)}
                        className="p-2 text-stone-400 hover:text-[#39393A] rounded-lg hover:bg-[#E6E6E6] transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                    </div>

                  </div>

                  {/* Proposed Reschedule Message Box */}
                  {apt.status === 'reschedule_proposed' && apt.proposedSlot && (
                    <div className="mt-3 p-3.5 rounded-lg bg-[#E6E6E6]/60 border border-[#D6D6D6] text-xs text-[#39393A] space-y-1">
                      <div className="flex items-center gap-2 font-bold text-[#39393A]">
                        <CalendarClock className="w-4 h-4 text-[#5B8C5A]" />
                        <span>Doctor's Proposed Reschedule: {apt.proposedSlot.date} at {apt.proposedSlot.time}</span>
                      </div>
                      {apt.proposedSlot.note && (
                        <p className="text-stone-600 italic">"{apt.proposedSlot.note}"</p>
                      )}
                    </div>
                  )}

                  {/* Completed Doctor Notes and Rx */}
                  {apt.status === 'completed' && (apt.consultationNotes || apt.prescription) && (
                    <div className="mt-3 p-3.5 rounded-lg bg-[#E6E6E6]/60 border border-[#D6D6D6] text-xs space-y-1.5">
                      {apt.consultationNotes && (
                        <div>
                          <strong className="text-[#39393A]">Doctor's Clinical Notes:</strong> {apt.consultationNotes}
                        </div>
                      )}
                      {apt.prescription && (
                        <div className="text-[#5B8C5A] font-medium bg-white p-2 rounded-md border border-[#D6D6D6]">
                          <strong>Prescription:</strong> {apt.prescription}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rejection / Cancellation Notes */}
                  {(apt.rejectionReason || apt.cancellationReason) && (
                    <div className="mt-2 text-xs text-[#A37774] bg-[#A37774]/10 p-2.5 rounded-lg border border-[#A37774]/30">
                      <strong>Reason:</strong> {apt.rejectionReason || apt.cancellationReason}
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Cancellation Modal */}
      {cancelModalApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#39393A]/60 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] rounded-2xl p-6 max-w-md w-full border border-[#D6D6D6] shadow-xl space-y-4">
            <h3 className="text-base font-bold text-[#39393A]">Cancel Appointment Request</h3>
            <p className="text-xs text-stone-600">
              Are you sure you want to cancel this appointment with {cancelModalApt.doctorName} for {cancelModalApt.date}?
            </p>
            <div>
              <label className="block text-xs font-semibold text-[#39393A] mb-1">Reason for cancellation (optional)</label>
              <textarea
                rows={3}
                placeholder="e.g. Schedule conflict..."
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                className="w-full p-2.5 text-xs rounded-lg border border-[#D6D6D6] bg-[#E6E6E6]/30 focus:outline-hidden focus:ring-2 focus:ring-[#A37774]/30 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalApt(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-[#E6E6E6] rounded-lg cursor-pointer"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-xs font-bold text-white bg-[#A37774] hover:bg-[#8F6663] rounded-lg cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
