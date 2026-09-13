import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Lock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const { passwordResetToken, setCurrentView, addToast, openAuthModal } = useApp() as any;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDone, setIsDone] = useState(false);

  const missingToken = !passwordResetToken;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.resetPassword(passwordResetToken as string, newPassword);
      if (res.success) {
        setIsDone(true);
        addToast({ type: 'success', title: 'Password Updated', message: 'You can now sign in with your new password.' });
      } else {
        setErrorMsg(res.message || 'This reset link is invalid or has expired.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    }
    setIsSubmitting(false);
  };

  const goToLogin = () => {
    setCurrentView('home');
    if (openAuthModal) {
      openAuthModal('login', 'patient');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 w-full max-w-md p-8">

        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#5B8C5A] flex items-center justify-center text-white font-bold text-sm">
            ZC
          </div>
          <span className="font-bold text-lg text-[#39393A]">Zahid's Clinic</span>
        </div>

        {missingToken ? (
          <div className="text-center py-4">
            <XCircle className="w-10 h-10 text-[#A37774] mx-auto mb-3" />
            <h1 className="text-lg font-bold text-[#39393A]">Invalid Reset Link</h1>
            <p className="text-xs text-slate-500 mt-2">
              This page needs a valid password reset link to work. Please use the link from your email, or request a new one.
            </p>
            <button
              onClick={goToLogin}
              className="mt-5 inline-flex items-center gap-2 bg-[#39393A] hover:bg-[#2A2A2B] text-white font-bold text-xs px-4 py-2.5 rounded-lg cursor-pointer"
            >
              <span>Back to Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : isDone ? (
          <div className="text-center py-4">
            <CheckCircle2 className="w-10 h-10 text-[#5B8C5A] mx-auto mb-3" />
            <h1 className="text-lg font-bold text-[#39393A]">Password Updated</h1>
            <p className="text-xs text-slate-500 mt-2">
              Your password has been changed successfully. You can now sign in with your new password.
            </p>
            <button
              onClick={goToLogin}
              className="mt-5 inline-flex items-center gap-2 bg-[#5B8C5A] hover:bg-[#4A7349] text-white font-bold text-xs px-4 py-2.5 rounded-lg cursor-pointer"
            >
              <span>Sign In Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-lg font-bold text-[#39393A]">Set a New Password</h1>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Choose a new password for your account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {errorMsg && (
                <div className="p-3 text-xs bg-[#A37774]/15 text-[#A37774] rounded-lg border border-[#A37774]/30 font-medium">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#39393A] mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#D6D6D6] focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/20 focus:border-[#5B8C5A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#39393A] mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#D6D6D6] focus:outline-hidden focus:ring-2 focus:ring-[#5B8C5A]/20 focus:border-[#5B8C5A]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-[#39393A] hover:bg-[#2A2A2B] text-white font-bold text-xs py-2.5 rounded-lg shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Updating...' : 'Update Password'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};