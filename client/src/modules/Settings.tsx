import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Shield, Bell, Moon, Languages, CreditCard, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Settings: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [name, setName] = useState(user?.name || '');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo mode: update name in localStorage only
    if (user) {
      updateUser({ ...user, name });
    }
    setSuccessMsg('Profile updated successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const sections = [
    { title: 'Security & Privacy', desc: 'Update passwords and 2FA settings', icon: Shield },
    { title: 'Notifications', desc: 'Configure email and push alerts', icon: Bell },
    { title: 'Theme & Appearance', desc: 'Dark mode and UI customizations', icon: Moon },
    { title: 'Language', desc: 'Select your preferred language', icon: Languages },
    { title: 'Billing & Plans', desc: 'Manage subscriptions and invoices', icon: CreditCard },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight italic flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary" /> App Settings
          </h2>
          <p className="text-slate-500 mt-1 uppercase font-bold text-xs tracking-widest opacity-60 italic">Manage your preferences and environment.</p>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="p-1 border-b border-slate-100 flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Profile Settings</h3>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-xs font-semibold">{successMsg}</div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" className="input-field" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email Address</label>
              <input type="email" value={user?.email || ''} className="input-field bg-slate-50 cursor-not-allowed opacity-70" disabled />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="btn-primary cursor-pointer">Save Changes</button>
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

      <div className="premium-card bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-8 mt-12 gap-4">
        <div>
          <h4 className="text-accent-red font-bold italic uppercase tracking-widest text-sm mb-1">Danger Zone</h4>
          <p className="text-xs text-red-500/70 font-medium italic">Clear all demo data and reset the application.</p>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Clear all demo data? This cannot be undone.')) {
              ['bills', 'insurance', 'subscriptions', 'reminders', 'documents'].forEach(k => localStorage.removeItem(k));
              window.location.reload();
            }
          }}
          className="px-6 py-2.5 bg-red-500 text-white rounded-xl font-bold italic uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 hover:scale-105 transition-transform w-full md:w-auto text-center cursor-pointer"
        >
          Clear All Data
        </button>
      </div>
    </motion.div>
  );
};

export default Settings;
