import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Shield, Bell, Moon, Languages, CreditCard, ChevronRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';

const Settings: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    try {
      setSaving(true);
      const response = await api.put('/auth/profile', {
        name,
        password: password || undefined,
      });
      
      updateUser(response.data.user);
      setSuccessMsg('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to update profile details.');
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { title: 'Security & Privacy', desc: 'Update passwords and 2FA settings', icon: Shield },
    { title: 'Notifications', desc: 'Configure email and push alerts', icon: Bell },
    { title: 'Theme & Appearance', desc: 'Dark mode and UI customizations', icon: Moon },
    { title: 'Language', desc: 'Select your preferred language', icon: Languages },
    { title: 'Billing & Plans', desc: 'Manage subscriptions and invoices', icon: CreditCard },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight italic flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary" /> App Settings
          </h2>
          <p className="text-slate-500 mt-1 uppercase font-bold text-xs tracking-widest opacity-60 italic">Manage your preferences and environment.</p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="dashboard-card">
        <div className="p-1 border-b border-slate-100 flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Profile Settings
          </h3>
        </div>
        
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-xs font-semibold">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="input-field"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                className="input-field bg-slate-50 cursor-not-allowed opacity-70"
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                className="input-field"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="input-field"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sections.map((section, i) => (
          <div key={i} className="premium-card flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-secondary flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors border border-white/5 shadow-inner">
                <section.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg italic tracking-tight transition-colors group-hover:text-primary leading-none mb-1">{section.title}</h3>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter italic">{section.desc}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
          </div>
        ))}
      </div>

      <div className="premium-card bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 flex items-center justify-between p-8 mt-12">
        <div>
          <h4 className="text-accent-red font-bold italic uppercase tracking-widest text-sm mb-1">Danger Zone</h4>
          <p className="text-xs text-red-500/70 font-medium italic">Permanently delete your account and all associated data.</p>
        </div>
        <button className="px-6 py-2.5 bg-accent-red text-white rounded-xl font-bold italic uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 hover:scale-105 transition-transform">
          Delete Account
        </button>
      </div>
    </motion.div>
  );
};

export default Settings;
