import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Mail, Phone, Loader2 } from 'lucide-react';

export const ContactInfoCard: React.FC = () => {
  const { user, updateCurrentUser } = useAuth();
  const { addToast } = useApp();

  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentPassword) {
      setErrorMsg('Please enter your current password to confirm this change.');
      return;
    }
    if (email === user?.email && phone === user?.phone) {
      setErrorMsg('Change the email or phone number before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.updateMyContactInfo({
        email: email !== user?.email ? email : undefined,
        phone: phone !== user?.phone ? phone : undefined,
        currentPassword
      });
      if (res.success && res.user) {
        updateCurrentUser(res.user);
        setCurrentPassword('');
        addToast({ type: 'success', title: 'Contact Info Updated', message: 'Your email and/or phone number have been updated.' });
      } else {
        setErrorMsg(res.message || 'Could not update contact info.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not reach the server.');
    }
    setIsSaving(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Email & Phone Number</h3>
          <p className="text-[11px] text-slate-500">Update the email and phone number on your account.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {errorMsg && (
          <div className="p-3 text-xs bg-rose-50 text-rose-700 rounded-lg border border-rose-200 font-medium">
            {errorMsg}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Current Password</label>
          <input
            type="password"
            required
            placeholder="Required to confirm this change"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
          />
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer disabled:opacity-50"
        >
          {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>{isSaving ? 'Saving...' : 'Update Contact Info'}</span>
        </button>
      </form>
    </div>
  );
};