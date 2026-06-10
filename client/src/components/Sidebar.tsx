import React from 'react';
import { 
  LayoutDashboard, Wallet, ShieldCheck, FileText, RefreshCw, Bell, 
  BarChart3, Settings, LogOut 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'bills', label: 'Bills', icon: Wallet, path: '/bills' },
  { id: 'insurance', label: 'Insurance', icon: ShieldCheck, path: '/insurance' },
  { id: 'documents', label: 'Documents', icon: FileText, path: '/documents' },
  { id: 'subscriptions', label: 'Subscriptions', icon: RefreshCw, path: '/subscriptions' },
  { id: 'reminders', label: 'Reminders', icon: Bell, path: '/reminders' },
  { id: 'reports', label: 'Reports', icon: BarChart3, path: '/analytics' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

interface SidebarProps {
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  // Extract initials
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="w-64 h-full bg-sidebar-bg flex flex-col pt-6 border-r border-slate-900 shrink-0">
      {/* Brand Logo */}
      <div className="px-6 mb-5 flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/30">
          <ShieldCheck size={20} />
        </div>
        <span className="font-bold text-lg text-white tracking-tight">Life Admin</span>
      </div>

      {/* Glassmorphism User Profile Card */}
      <div className="mx-4 mb-6 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-sm shrink-0 uppercase">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white leading-tight">{user?.name || 'Guest User'}</p>
          <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email || 'guest@lifeadmin.ai'}</p>
          <span className="inline-block text-[8px] font-black tracking-widest text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full mt-1.5 uppercase">
            {user?.role === 'ADMIN' ? 'Admin Plan' : 'Premium Plan'}
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
            >
              <item.icon size={20} className={`${isActive ? 'text-sky-blue' : 'text-slate-400'}`} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-slate-900">
        <button 
          onClick={onLogout}
          className="sidebar-item w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer group"
        >
          <LogOut size={20} className="group-hover:text-red-400" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};
