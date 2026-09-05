import React, { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Camera, Loader2 } from 'lucide-react';

interface AvatarUploaderProps {
  currentAvatarUrl?: string;
  displayName?: string;
  size?: number; // px
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatarUrl,
  displayName,
  size = 88
}) => {
  const { user, doctorProfile, updateCurrentUser, updateDoctorProfile } = useAuth();
  const { addToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast({ type: 'error', title: 'Invalid File', message: 'Please choose an image file (JPG, PNG, WEBP).' });
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      addToast({ type: 'error', title: 'File Too Large', message: 'Profile pictures must be under 3 MB.' });
      return;
    }

    setIsUploading(true);
    try {
      const uploadRes = await api.uploadAvatar(file);
      if (!uploadRes.success || !uploadRes.url) {
        throw new Error(uploadRes.message || 'Upload failed');
      }

      const saveRes = await api.updateMyAvatar(uploadRes.url);
      if (!saveRes.success) {
        throw new Error(saveRes.message || 'Could not save profile picture');
      }

      updateCurrentUser({ avatar: uploadRes.url });
      if (doctorProfile) {
        updateDoctorProfile({ ...doctorProfile, avatar: uploadRes.url });
      }

      addToast({ type: 'success', title: 'Profile Picture Updated', message: 'Your new photo is now live.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Upload Failed', message: err.message || 'Please try again.' });
    }
    setIsUploading(false);
  };

  const avatarSrc = currentAvatarUrl || user?.avatar || '/blank-pfp.svg';

  return (
    <div className="flex items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <img
          src={avatarSrc}
          alt={displayName || user?.name || 'Profile picture'}
          className="w-full h-full rounded-2xl object-cover border border-slate-200 bg-slate-100"
        />
        {isUploading && (
          <div className="absolute inset-0 rounded-2xl bg-slate-900/50 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer transition-colors disabled:opacity-50"
          title="Change profile picture"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelected}
          className="hidden"
        />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-900">Profile Picture</p>
        <p className="text-[11px] text-slate-500 mt-0.5">JPG, PNG or WEBP. Max 3 MB.</p>
      </div>
    </div>
  );
};