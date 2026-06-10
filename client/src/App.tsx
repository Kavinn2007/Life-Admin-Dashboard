import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AIAssistant } from './components/AIAssistant';
import { AnimatePresence, motion } from 'framer-motion';
import Bills from './modules/Bills';
import Insurance from './modules/Insurance';
import Documents from './modules/Documents';
import Subscriptions from './modules/Subscriptions';
import Reminders from './modules/Reminders';
import Analytics from './modules/Analytics';
import Settings from './modules/Settings';
import { Auth } from './modules/Auth';
import { Wallet, ShieldCheck, RefreshCw, MoreVertical, Loader2 } from 'lucide-react';
import api from './utils/api';
import { useAuthStore } from './store/authStore';

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/analytics');
        setData(response.data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const kpis = [
    { label: 'Projected Expenses', value: data?.summary?.totalMonthlySpent !== undefined ? `₹ ${data.summary.totalMonthlySpent.toLocaleString()}` : '₹ 0', subValue: '', info: 'Total Monthly Projected', icon: Wallet, color: 'text-blue-600' },
    { label: 'Upcoming Bills', value: data?.summary?.upcomingBillsCount !== undefined ? data.summary.upcomingBillsCount.toString() : '0', subValue: data?.summary?.upcomingBillsSum !== undefined ? `₹ ${data.summary.upcomingBillsSum.toLocaleString()}` : '', info: 'Due in next 7 days', icon: Wallet, color: 'text-blue-600' },
    { label: 'Insurance Renewals', value: data?.summary?.upcomingInsuranceCount !== undefined ? data.summary.upcomingInsuranceCount.toString() : '0', subValue: '', info: 'Due in next 30 days', icon: ShieldCheck, color: 'text-orange-600' },
    { label: 'Active Subscriptions', value: data?.summary?.activeSubscriptionsCount !== undefined ? data.summary.activeSubscriptionsCount.toString() : '0', subValue: '', info: 'Active Tracker', icon: RefreshCw, color: 'text-green-600' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome Back, {user?.name || 'User'} 👋</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">Here is a quick overview of your personal admin portal.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="dashboard-card hover:translate-y-[-2px] hover:shadow-lg duration-300">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{kpi.label}</h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
                {kpi.subValue && <p className="text-sm font-semibold text-slate-700">{kpi.subValue}</p>}
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{kpi.info}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-slate-50 ${kpi.color}`}>
                <kpi.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-card !p-0">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Upcoming Due Dates</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {data?.dueDates && data.dueDates.length > 0 ? (
            data.dueDates.map((item: any, i: number) => (
              <div key={i} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-slate-50 ${item.color}`}>
                    {item.type === 'bill' ? <Wallet size={18} /> : item.type === 'insurance' ? <ShieldCheck size={18} /> : <RefreshCw size={18} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">{item.name}</h4>
                    <div className="flex gap-4 mt-0.5">
                      <p className="text-xs font-bold text-slate-900">{item.amount}</p>
                      <p className="text-xs text-slate-400">{item.date}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className={`text-[10px] font-black uppercase tracking-widest italic ${item.color}`}>
                    {item.status}
                  </span>
                  <button className="text-slate-300 hover:text-slate-500">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 italic text-sm">No upcoming renewals or payments in the next 30 days.</div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const AppContent = () => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const isAuthPage = location.pathname === '/auth';

  useEffect(() => {
    if (isAuthenticated && !token) {
      logout();
    }
  }, [isAuthenticated, token, logout]);

  if ((!isAuthenticated || !token) && !isAuthPage) {
    return <Navigate to="/auth" replace />;
  }

  if (isAuthenticated && token && isAuthPage) {
    return <Navigate to="/" replace />;
  }

  if (isAuthPage) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar onLogout={logout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/bills" element={<Bills />} />
              <Route path="/insurance" element={<Insurance />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/reminders" element={<Reminders />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<div className="p-12 text-center text-slate-400 italic">Screen coming soon...</div>} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
      <AIAssistant />
    </div>
  );
};

export default App;
