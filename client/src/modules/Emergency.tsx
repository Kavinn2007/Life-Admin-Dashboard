import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Phone, Activity, Heart, User, MapPin, Download, ShieldAlert } from 'lucide-react';

const Emergency: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight italic text-accent-red flex items-center gap-3">
            <AlertTriangle className="w-8 h-8" /> Emergency Information
          </h2>
          <p className="text-slate-500 mt-1 uppercase font-bold text-xs tracking-widest opacity-60 italic">Quick access to life-saving data in critical moments.</p>
        </div>
        <button className="flex items-center gap-2 bg-accent-red hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold italic uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-red-500/20 active:scale-95">
          <Download className="w-4 h-4" />
          <span>Export Emergency Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personal Health Info */}
        <div className="premium-card border-t-4 border-accent-red">
          <h3 className="flex items-center gap-2 font-bold text-lg italic uppercase tracking-tighter mb-6">
            <Activity className="w-5 h-5 text-accent-red" /> Health Profile
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-[10px] font-bold uppercase italic text-slate-500">Blood Group</span>
              <span className="text-sm font-black italic text-accent-red">O Positive (O+)</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-[10px] font-bold uppercase italic text-slate-500">Allergies</span>
              <span className="text-sm font-bold italic">Penicillin, Peanuts</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-[10px] font-bold uppercase italic text-slate-500">Medications</span>
              <span className="text-sm font-bold italic">Aspirin (Daily)</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <span className="text-[10px] font-bold uppercase italic text-slate-500">Medical History</span>
              <span className="text-sm font-bold italic text-right">Hypertension (2020)</span>
            </div>
          </div>
        </div>

        {/* Primary Contacts */}
        <div className="lg:col-span-2 premium-card">
          <h3 className="flex items-center gap-2 font-bold text-lg italic uppercase tracking-tighter mb-6">
            <User className="w-5 h-5 text-primary" /> Emergency Contacts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Anjali Padmanaban', relation: 'Spouse', phone: '+91 98765 43210', icon: Heart },
              { name: 'Dr. Sameer Khan', relation: 'General Physician', phone: '+91 91234 56789', icon: Phone },
              { name: 'City Hospital', relation: 'Nearest Emergency', phone: '022 2654 3322', icon: MapPin },
              { name: 'HDFC Insurance', relation: 'Health Provider', phone: '1800 209 0122', icon: ShieldAlert },
            ].map((contact, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-secondary-light/30 border border-white/5 hover:border-primary/30 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                    <contact.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[8px] font-bold uppercase italic tracking-widest bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                    {contact.relation}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100">{contact.name}</h4>
                <p className="text-sm font-bold text-primary mt-1 italic tracking-widest">{contact.phone}</p>
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 py-2 rounded-lg bg-primary text-white text-[10px] font-bold uppercase italic tracking-widest active:scale-95 transition-transform">Call Now</button>
                  <button className="flex-1 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-[10px] font-bold uppercase italic tracking-widest">Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="premium-card bg-slate-900 border-none relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-red/20 to-transparent pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 p-4">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-accent-red/20 rounded-2xl flex items-center justify-center text-accent-red animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white italic">Emergency SOS Feature</h4>
              <p className="text-slate-400 text-sm italic font-medium uppercase tracking-tighter">Broadcast your location to all emergency contacts instantly.</p>
            </div>
          </div>
          <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black italic uppercase tracking-[0.2em] transform transition-all hover:scale-105 active:scale-95 shadow-xl">
            Activate SOS
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Emergency;
