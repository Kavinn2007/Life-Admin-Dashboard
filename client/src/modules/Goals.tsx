import React from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, Compass, GraduationCap, Plane, HeartPulse } from 'lucide-react';

const Goals: React.FC = () => {
  const goals = [
    { id: 1, title: 'Europe Vacation', category: 'Travel', current: 4500, target: 8000, deadline: '2026-12-20', icon: Plane, color: 'text-blue-500' },
    { id: 2, title: 'Emergency Fund', category: 'Savings', current: 12000, target: 20000, deadline: '2027-06-01', icon: TrendingUp, color: 'text-accent-teal' },
    { id: 3, title: 'Masters Degree', category: 'Education', current: 2000, target: 15000, deadline: '2028-09-15', icon: GraduationCap, color: 'text-primary' },
    { id: 4, title: 'Marathon Training', category: 'Health', current: 80, target: 100, deadline: '2026-10-10', icon: HeartPulse, color: 'text-accent-red' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight italic flex items-center gap-3">
            <Compass className="w-8 h-8 text-primary" /> Goals & Life Planning
          </h2>
          <p className="text-slate-500 mt-1 uppercase font-bold text-xs tracking-widest opacity-60 italic">Define your future and track your progress.</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          return (
            <div key={goal.id} className="premium-card group">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 bg-slate-50 dark:bg-secondary rounded-2xl flex items-center justify-center border border-white/5 shadow-inner transition-transform group-hover:scale-110`}>
                    <goal.icon className={`w-7 h-7 ${goal.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold italic">{goal.title}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">{goal.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase italic tracking-widest leading-none">Deadline</p>
                  <p className="text-xs font-bold text-slate-700 mt-1">{goal.deadline}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <p className="text-2xl font-black italic text-primary">
                    ${goal.current.toLocaleString()} <span className="text-xs font-bold text-slate-400">/ ${goal.target.toLocaleString()}</span>
                  </p>
                  <p className="text-sm font-black italic text-primary">{Math.round(progress)}%</p>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[pulse_2s_linear_infinite]" />
                  </motion.div>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase italic tracking-widest hover:bg-primary hover:text-white transition-all">Add Milestone</button>
                <button className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-bold uppercase italic tracking-widest hover:border-primary hover:text-primary transition-all">Update Value</button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Milestone Timeline Placeholder */}
      <div className="premium-card">
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] italic text-slate-400 mb-8 text-center">Life Roadmap</h3>
        <div className="relative h-20 flex items-center justify-between px-10">
          <div className="absolute left-10 right-10 h-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
          {[2026, 2027, 2028, 2029, 2030].map((year) => (
            <div key={year} className="relative z-10 flex flex-col items-center">
              <div className={`w-4 h-4 rounded-full border-4 border-white dark:border-secondary shadow-md ${year === 2026 ? 'bg-primary' : 'bg-slate-300'}`} />
              <p className="text-[10px] font-black italic mt-2 text-slate-500">{year}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Goals;
