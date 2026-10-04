import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Lock, Loader2 } from 'lucide-react';

export const ChangePasswordCard: React.FC = () => {
  const { addToast } = useApp();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.changeMyPassword(currentPassword, newPassword);
      if (res.success) {
        addToast({ type: 'success', title: 'Password Changed', message: 'Your password has been updated.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMsg(res.message || 'Could not change password.');
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
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Change Password</h3>
          <p className="text-[11px] text-slate-500">Update the password you use to sign in.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {errorMsg && (
          <div className="p-3 text-xs bg-rose-50 text-rose-700 rounded-lg border border-rose-200 font-medium">
            {errorMsg}
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer disabled:opacity-50"
        >
          {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>{isSaving ? 'Saving...' : 'Update Password'}</span>
        </button>
      </form>
    </div>
  );
};