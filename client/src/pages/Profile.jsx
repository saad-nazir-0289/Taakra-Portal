import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { users as api } from '../lib/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const data = await api.updateMe({ name, avatarUrl });
      updateUser(data.user);
      setMessage('Profile updated.');
    } catch (err) {
      setMessage(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setMessage('Password changed.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setMessage(err.message || 'Change failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-slate-100 mb-4">Profile</h1>
      {message && <p className="text-sm mb-4 text-slate-400">{message}</p>}
      <div className="card p-6 space-y-6">
        <form onSubmit={handleSaveProfile}>
          <h2 className="font-medium text-slate-300 mb-2">Profile</h2>
          <div className="space-y-2">
            <label className="block text-sm text-slate-400">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-blue-800 rounded-lg" />
          </div>
          <div className="space-y-2 mt-2">
            <label className="block text-sm text-slate-400">Avatar URL</label>
            <input type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="w-full px-3 py-2 border border-blue-800 rounded-lg" placeholder="https://..." />
          </div>
          <button type="submit" className="btn-primary mt-4" disabled={loading}>Save profile</button>
        </form>
        <form onSubmit={handleChangePassword}>
          <h2 className="font-medium text-slate-300 mb-2">Change password</h2>
          <div className="space-y-2">
            <label className="block text-sm text-slate-400">Current password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border border-blue-800 rounded-lg" />
          </div>
          <div className="space-y-2 mt-2">
            <label className="block text-sm text-slate-400">New password (min 6)</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-blue-800 rounded-lg" minLength={6} />
          </div>
          <button type="submit" className="btn-secondary mt-4" disabled={loading}>Change password</button>
        </form>
      </div>
    </div>
  );
}
