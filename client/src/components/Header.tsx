import React, { useState, useEffect } from 'react';
import { Bell, Search, ChevronDown, CheckCheck, Clock, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { getAll } from '../utils/demoStorage';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const user = useAuthStore((state) => state.user);
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  useEffect(() => {
    const now = new Date();
    const next7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const next30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const bills = getAll<any>('bills');
    const insurance = getAll<any>('insurance');
    const reminders = getAll<any>('reminders');

    const builtAlerts: any[] = [];

    bills.filter((b: any) => b.status === 'PENDING' && new Date(b.dueDate) <= next7).forEach((b: any) => {
      const daysLeft = Math.ceil((new Date(b.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      builtAlerts.push({ title: `${b.name} bill due in ${daysLeft} day(s)`, time: new Date(b.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), type: daysLeft <= 2 ? 'urgent' : 'warning' });
    });

    insurance.filter((i: any) => { const rd = new Date(i.renewalDate); return rd >= now && rd <= next30; }).forEach((i: any) => {
      const daysLeft = Math.ceil((new Date(i.renewalDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      builtAlerts.push({ title: `${i.policyName} renews in ${daysLeft} day(s)`, time: new Date(i.renewalDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), type: 'warning' });
    });

    reminders.filter((r: any) => { const rd = new Date(r.date); return rd >= now && rd <= next7; }).forEach((r: any) => {
      builtAlerts.push({ title: r.title, time: new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), type: 'info' });
    });

    if (builtAlerts.length === 0) builtAlerts.push({ title: 'All accounts up to date. No upcoming alerts.', time: 'Now', type: 'success' });
    setAlerts(builtAlerts);
  }, [user]);

  const hasUrgent = alerts.length > 0 && alerts[0].title !== 'All accounts up to date. No upcoming alerts.';

  return (
    <header className="h-14 md:h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 shrink-0 gap-3">
      
      {/* Left: Hamburger (mobile) + Search (desktop) */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Search bar — hidden on mobile by default, full on desktop */}
        <div className={`relative group flex-1 max-w-xl ${showSearch ? 'flex' : 'hidden md:flex'}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search dashboard, bills, or documents..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
            onBlur={() => setShowSearch(false)}
          />
        </div>

        {/* Mobile search toggle button */}
        {!showSearch && (
          <button
            onClick={() => setShowSearch(true)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        )}
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-lg transition-all relative ${showNotifications ? 'bg-slate-100 text-primary' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
          >
            <Bell size={18} />
            {hasUrgent && (
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>
 
          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-[calc(100vw-2rem)] md:w-96 max-w-sm bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-40"
                >
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                    <button className="text-[10px] font-bold text-primary uppercase hover:underline flex items-center gap-1">
                      <CheckCheck size={12} /> Mark all as read
                    </button>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto no-scrollbar py-2">
                    {alerts.map((notif, i) => (
                      <div key={i} className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-50 last:border-0 group">
                        <div className="flex gap-4">
                          <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                            notif.type === 'urgent' ? 'bg-red-500' :
                            notif.type === 'warning' ? 'bg-orange-500' :
                            notif.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />
                          <div>
                            <p className="text-xs font-semibold text-slate-800 leading-relaxed group-hover:text-primary transition-colors">{notif.title}</p>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                              <Clock size={10} /><span>{notif.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-slate-50/80 border-t border-slate-100 text-center">
                    <button className="text-[11px] font-bold text-slate-500 uppercase tracking-widest hover:text-primary transition-colors">View All Notifications</button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden md:block h-6 w-[1px] bg-slate-200 mx-1" />

        {/* User Info */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0 uppercase transition-all group-hover:border-primary">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-slate-800 leading-none">{user?.name || 'Demo User'}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">Demo Mode</p>
          </div>
          <ChevronDown size={14} className="hidden sm:block text-slate-400 group-hover:text-primary transition-colors" />
        </div>
      </div>
    </header>
  );
};
