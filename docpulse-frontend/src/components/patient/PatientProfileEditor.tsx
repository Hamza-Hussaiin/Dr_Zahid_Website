import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { 
  User, 
  Heart, 
  ShieldCheck, 
  Phone, 
  FileText, 
  Save, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

export const PatientProfileEditor: React.FC = () => {
  const { user, patientProfile, updatePatientProfile } = useAuth();
  const { setCurrentView, addToast } = useApp();

  const [formData, setFormData] = useState({
    dob: patientProfile?.dob || '1995-06-14',
    age: patientProfile?.age || 29,
    gender: patientProfile?.gender || 'female',
    bloodGroup: patientProfile?.bloodGroup || 'O+',
    allergies: patientProfile?.allergies || 'Penicillin (mild hives)',
    chronicConditions: patientProfile?.chronicConditions || 'Mild exercise-induced asthma',
    currentMedications: patientProfile?.currentMedications || 'Albuterol inhaler PRN, Vitamin D3 2000IU',
    emergencyContactName: patientProfile?.emergencyContactName || 'Michael Green',
    emergencyContactPhone: patientProfile?.emergencyContactPhone || '+1 (510) 555-9002',
    insuranceProvider: patientProfile?.insuranceProvider || 'Blue Cross Blue Shield Gold PPO',
    insurancePolicyNumber: patientProfile?.insurancePolicyNumber || 'BCBS-99418290-CA'
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const res = await api.updatePatientProfile(user.id, formData);
      if (res.success && res.profile) {
        updatePatientProfile(res.profile);
        addToast({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your clinical history & intake records have been saved.'
        });
      }
    } catch (err) {
      console.error(err);
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not update profile information.'
      });
    }
    setIsSaving(false);
  };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Back Button */}
        <button
          onClick={() => setCurrentView('patient-dashboard')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Medical Record & Clinical Intake Profile</h1>
              <p className="text-xs text-slate-500">
                Keep your health metrics, allergies, and emergency contacts up to date for specialist visits.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Demographics & Blood Group */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                1. Demographics & Vitals
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Type</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500/20 font-bold"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Allergies & Conditions */}
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                2. Clinical History & Medications
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Known Allergies</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Sulfa drugs, Peanuts, Latex..."
                    value={formData.allergies}
                    onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Chronic Conditions / Past Surgeries</label>
                  <input
                    type="text"
                    placeholder="e.g. Hypertension, Type 2 Diabetes, Appendectomy (2019)..."
                    value={formData.chronicConditions}
                    onChange={e => setFormData({ ...formData, chronicConditions: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Medications & Dosages</label>
                  <textarea
                    rows={2}
                    placeholder="List all active prescriptions, OTC drugs, and vitamins..."
                    value={formData.currentMedications}
                    onChange={e => setFormData({ ...formData, currentMedications: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500/20 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contacts & Insurance */}
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                3. Emergency Contact & Insurance Coverage
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={e => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Insurance Provider</label>
                  <input
                    type="text"
                    value={formData.insuranceProvider}
                    onChange={e => setFormData({ ...formData, insuranceProvider: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Policy / Member ID</label>
                  <input
                    type="text"
                    value={formData.insurancePolicyNumber}
                    onChange={e => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Profile...' : 'Save Medical Profile'}</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
