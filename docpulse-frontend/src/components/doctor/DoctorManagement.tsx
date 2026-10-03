import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { DoctorProfile } from '../../types';
import { api } from '../../services/api';
import { 
  UserPlus, 
  Stethoscope, 
  ShieldCheck, 
  Star, 
  Power, 
  Plus, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle,
  Mail,
  MapPin,
  Calendar
} from 'lucide-react';

export const DoctorManagement: React.FC = () => {
  const { isAdminDoctor, isSuperAdmin, user } = useAuth();
  const { doctors, appointments, setCurrentView, addToast, refreshAllData } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [createdDoctorCredentials, setCreatedDoctorCredentials] = useState<{ email: string; password: string } | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<DoctorProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteDoctor(deleteTarget.id);
      if (res.success) {
        addToast({ type: 'success', title: 'Doctor Removed', message: `${deleteTarget.name} and all associated data have been permanently deleted.` });
        setDeleteTarget(null);
        await refreshAllData();
      } else {
        addToast({ type: 'error', title: 'Could Not Delete', message: (res as any).message || 'Unknown error.' });
      }
    } catch (e: any) {
      addToast({ type: 'error', title: 'Request Failed', message: e.message || 'Could not reach the server.' });
    }
    setIsDeleting(false);
  };
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    title: 'Consultant Physician',
    specialization: 'Internal Medicine',
    bio: '',
    consultationFee: 1200,
    experienceYears: 10,
    languages: 'Urdu, English, Punjabi',
    clinicAddress: '33-S-20 ST NO 2 Sunny View Park Ramgarh Mughalpura Lahore'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleDoctorStatus = async (doc: DoctorProfile) => {
    try {
      const res = await api.updateDoctorProfile(doc.id, { isActive: !doc.isActive });
      if (res.success) {
        addToast({
          type: 'info',
          title: 'Doctor Status Updated',
          message: `${doc.name} is now ${!doc.isActive ? 'Active & Listed' : 'Deactivated'}.`
        });
        await refreshAllData();
      } else {
        addToast({ type: 'error', title: 'Could Not Update Status', message: (res as any).message || 'Unknown error.' });
      }
    } catch (e: any) {
      console.error(e);
      addToast({ type: 'error', title: 'Request Failed', message: e.message || 'Could not reach the server.' });
    }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.createDoctor({
        name: newDoctor.name,
        email: newDoctor.email,
        title: newDoctor.title,
        specialization: newDoctor.specialization,
        bio: newDoctor.bio || 'Dedicated specialist committed to evidence-based healthcare delivery.',
        consultationFee: Number(newDoctor.consultationFee),
        experienceYears: Number(newDoctor.experienceYears),
        languages: newDoctor.languages.split(',').map(s => s.trim()),
        clinicAddress: newDoctor.clinicAddress,
        qualifications: ['MD', 'Board Certified'],
        servicesOffered: ['General Consultation', 'Chat Consultation']
      });

      if (res.success) {
        setShowAddModal(false);
        if ((res as any).temporaryPassword) {
          setCreatedDoctorCredentials({
            email: newDoctor.email,
            password: (res as any).temporaryPassword
          });
        } else {
          addToast({
            type: 'success',
            title: 'Doctor Onboarded',
            message: `${newDoctor.name} has been added to the clinic staff directory.`
          });
        }
        setNewDoctor({
          name: '',
          email: '',
          title: 'Consultant Physician',
          specialization: 'Internal Medicine',
          bio: '',
          consultationFee: 1200,
          experienceYears: 10,
          languages: 'Urdu, English, Punjabi',
          clinicAddress: '33-S-20 ST NO 2 Sunny View Park Ramgarh Mughalpura Lahore'
        });
        await refreshAllData();
      } else {
        addToast({ type: 'error', title: 'Could Not Add Doctor', message: (res as any).message || 'Unknown error.' });
      }
    } catch (e: any) {
      console.error(e);
      addToast({ type: 'error', title: 'Request Failed', message: e.message || 'Could not reach the server.' });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-teal-600" />
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Clinic Doctors & Specialists Directory
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Onboard new physicians, configure clinical permissions, and monitor caseload distribution.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard New Doctor</span>
          </button>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map(doc => {
            const docApts = appointments.filter(a => a.doctorId === doc.id);
            const pendingCount = docApts.filter(a => a.status === 'pending').length;

            return (
              <div
                key={doc.id}
                className={`bg-white rounded-3xl p-6 border shadow-xs transition-all flex flex-col justify-between ${
                  doc.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                    />
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      doc.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-300'
                    }`}>
                      {doc.isActive ? 'Active & Listed' : 'Inactive'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{doc.name}</h3>
                  <p className="text-xs text-teal-700 font-semibold">{doc.title} • {doc.specialization}</p>

                  <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Consultation Fee:</span>
                      <strong className="text-slate-900">Rs. {doc.consultationFee?.toLocaleString()} PKR</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Experience:</span>
                      <span>{doc.experienceYears}+ years</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Total Consultations:</span>
                      <strong className="text-slate-900">{docApts.length}</strong>
                    </div>
                    {pendingCount > 0 && (
                      <div className="flex justify-between text-amber-700 font-bold">
                        <span>Pending Review:</span>
                        <span>{pendingCount}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  {doc.userId === user?.id ? (
                    <span className="text-xs font-semibold text-slate-400 italic">
                      This is your own admin account
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleDoctorStatus(doc)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                          doc.isActive
                            ? 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100'
                            : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {doc.isActive ? 'Deactivate Doctor' : 'Activate Doctor'}
                      </button>

                      <button
                        onClick={() => setDeleteTarget(doc)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 bg-white hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        Remove Permanently
                      </button>
                    </div>
                  )}

                  <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{doc.rating}</span>
                  </span>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Onboard New Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">Onboard New Medical Doctor</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Emily Thorne, MD"
                    value={newDoctor.name}
                    onChange={e => setNewDoctor({ ...newDoctor, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@zahidclinic.com"
                    value={newDoctor.email}
                    onChange={e => setNewDoctor({ ...newDoctor, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Specialty</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ophthalmology, Oncology"
                    value={newDoctor.specialization}
                    onChange={e => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Associate Professor & Surgeon"
                    value={newDoctor.title}
                    onChange={e => setNewDoctor({ ...newDoctor, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Fee (PKR - Rs.)</label>
                  <input
                    type="number"
                    required
                    value={newDoctor.consultationFee}
                    onChange={e => setNewDoctor({ ...newDoctor, consultationFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    required
                    value={newDoctor.experienceYears}
                    onChange={e => setNewDoctor({ ...newDoctor, experienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Bio</label>
                <textarea
                  rows={3}
                  placeholder="Clinical background, clinical passions, patient care approach..."
                  value={newDoctor.bio}
                  onChange={e => setNewDoctor({ ...newDoctor, bio: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Onboarding...' : 'Confirm & Add Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Permanently Remove Doctor?</h3>
            <p className="text-xs text-slate-600">
              This will permanently delete <strong>{deleteTarget.name}</strong>'s account, profile, time slots, reviews, and appointment history. This cannot be undone. Use "Deactivate" instead if you just want to hide them temporarily.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {createdDoctorCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Doctor Account Created</h3>
            <p className="text-xs text-slate-600">
              Share these login details with the doctor securely (they won't be shown again). The welcome email may not arrive if your Resend sender isn't verified for this address yet.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1 text-xs">
              <div><span className="font-semibold text-slate-500">Email:</span> <span className="font-bold text-slate-900">{createdDoctorCredentials.email}</span></div>
              <div><span className="font-semibold text-slate-500">Temporary Password:</span> <span className="font-bold text-slate-900">{createdDoctorCredentials.password}</span></div>
            </div>
            <button
              onClick={() => setCreatedDoctorCredentials(null)}
              className="w-full px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
