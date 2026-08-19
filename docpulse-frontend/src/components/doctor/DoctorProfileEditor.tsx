import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { 
  User, 
  Stethoscope, 
  GraduationCap, 
  MapPin, 
  Languages, 
  DollarSign, 
  Save, 
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2
} from 'lucide-react';

export const DoctorProfileEditor: React.FC = () => {
  const { user, doctorProfile, updateDoctorProfile } = useAuth();
  const { setCurrentView, addToast, refreshAllData } = useApp();

  const [formData, setFormData] = useState({
    name: doctorProfile?.name || user?.name || '',
    title: doctorProfile?.title || 'Senior Consultant Physician',
    specialization: doctorProfile?.specialization || 'Internal Medicine',
    bio: doctorProfile?.bio || '',
    consultationFee: doctorProfile?.consultationFee || 1200,
    experienceYears: doctorProfile?.experienceYears || 16,
    languages: doctorProfile?.languages.join(', ') || 'Urdu, English, Punjabi',
    clinicAddress: doctorProfile?.clinicAddress || '33-S-20 ST NO 2 Sunny View Park Ramgarh Mughalpura Lahore',
    qualifications: doctorProfile?.qualifications.join(', ') || 'MBBS, FCPS Internal Medicine',
    servicesOffered: doctorProfile?.servicesOffered?.join(', ') || 'Medical Consultation, Chat Consultation, Home Visit'
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorProfile) return;
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        title: formData.title,
        specialization: formData.specialization,
        bio: formData.bio,
        consultationFee: Number(formData.consultationFee),
        experienceYears: Number(formData.experienceYears),
        languages: formData.languages.split(',').map(s => s.trim()).filter(Boolean),
        clinicAddress: formData.clinicAddress,
        qualifications: formData.qualifications.split(',').map(s => s.trim()).filter(Boolean),
        servicesOffered: formData.servicesOffered.split(',').map(s => s.trim()).filter(Boolean)
      };

      const res = await api.updateDoctorProfile(doctorProfile.id, payload);
      if (res.success && res.doctor) {
        updateDoctorProfile(res.doctor);
        await refreshAllData();
        addToast({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your public doctor profile & consultation settings have been saved.'
        });
      }
    } catch (err) {
      console.error(err);
      addToast({
        type: 'error',
        title: 'Update Error',
        message: 'Unable to save doctor profile changes.'
      });
    }
    setIsSaving(false);
  };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <button
          onClick={() => setCurrentView('doctor-dashboard')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Public Doctor Profile & Credentials</h1>
              <p className="text-xs text-slate-500">
                Patients will see this information when searching specialists and booking consultation slots.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Primary Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Medical Specialty</label>
                <input
                  type="text"
                  required
                  value={formData.specialization}
                  onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Fee (PKR - Rs.)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.consultationFee}
                  onChange={e => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Experience (Years)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.experienceYears}
                  onChange={e => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Biography</label>
              <textarea
                rows={4}
                required
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-slate-50 resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Spoken Languages (comma separated)</label>
                <input
                  type="text"
                  value={formData.languages}
                  onChange={e => setFormData({ ...formData, languages: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Qualifications / Degrees (comma separated)</label>
                <input
                  type="text"
                  value={formData.qualifications}
                  onChange={e => setFormData({ ...formData, qualifications: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clinic Suite Address</label>
              <input
                type="text"
                value={formData.clinicAddress}
                onChange={e => setFormData({ ...formData, clinicAddress: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Services & Clinical Protocols (comma separated)</label>
              <input
                type="text"
                value={formData.servicesOffered}
                onChange={e => setFormData({ ...formData, servicesOffered: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Profile...' : 'Save Public Profile'}</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
