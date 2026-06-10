import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, ShieldCheck, RefreshCw, Bell, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../utils/api';

const Analytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/analytics');
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Calculate critical items count (due in <= 3 days or overdue)
  const urgentCount = data?.dueDates?.filter((item: any) => item.daysLeft <= 3).length || 0;

  const stats = [
    { 
      label: 'Projected Expenses', 
      value: data?.summary?.totalMonthlySpent !== undefined ? `₹ ${data.summary.totalMonthlySpent.toLocaleString()}` : '₹ 0', 
      info: 'Total Monthly Projected', 
      color: 'text-blue-600', 
      icon: Wallet 
    },
    { 
      label: 'Upcoming Bills', 
      value: data?.summary?.upcomingBillsCount !== undefined ? data.summary.upcomingBillsCount.toString() : '0', 
      info: data?.summary?.upcomingBillsSum !== undefined ? `Total: ₹ ${data.summary.upcomingBillsSum.toLocaleString()}` : 'Due next 7 days', 
      color: 'text-green-600', 
      icon: Wallet 
    },
    { 
      label: 'Upcoming Renewals', 
      value: data?.summary?.upcomingInsuranceCount !== undefined ? data.summary.upcomingInsuranceCount.toString() : '0', 
      info: 'In Next 30 Days', 
      color: 'text-orange-600', 
      icon: ShieldCheck 
    },
    { 
      label: 'Active Subscriptions', 
      value: data?.summary?.activeSubscriptionsCount !== undefined ? data.summary.activeSubscriptionsCount.toString() : '0', 
      info: 'Total', 
      color: 'text-indigo-600', 
      icon: RefreshCw 
    },
  ];

  // If there's no chartData or all values are 0, use placeholder or defaults so the chart doesn't look empty
  const hasData = data?.chartData?.some((d: any) => d.value > 0);
  const chartData = hasData 
    ? data.chartData.filter((d: any) => d.value > 0) 
    : [
        { name: 'Bills', value: 0, color: '#2563EB' },
        { name: 'Subscriptions', value: 0, color: '#10B981' },
        { name: 'Insurance', value: 0, color: '#F59E0B' },
        { name: 'Others', value: 100, color: '#e2e8f0' } // grey color if completely empty
      ];

  const totalSpent = data?.summary?.totalMonthlySpent || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Reports & Summary</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Viewing data for:</span>
          <select className="bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold uppercase outline-none focus:ring-1 focus:ring-primary shadow-sm">
            <option>This Month</option>
            <option>Last Month</option>
            <option>Last 3 Months</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="dashboard-card">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <stat.icon size={16} className={stat.color} />
            </div>
            <h3 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">{stat.info}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Overview Chart */}
        <div className="lg:col-span-2 dashboard-card !p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <h3 className="font-bold text-slate-800 text-sm">Spending Overview</h3>
          </div>
          <div className="p-8 flex flex-col md:flex-row items-center justify-center gap-12 min-h-[350px]">
            <div className="w-full h-full max-w-[250px] relative">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                    {chartData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <p className="text-xl font-black text-slate-800">₹{totalSpent.toLocaleString()}</p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase">Projected</p>
              </div>
            </div>
            <div className="space-y-4 w-full max-w-[200px]">
              {chartData.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-800 transition-colors uppercase tracking-widest">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Status List */}
        <div className="dashboard-card !p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <h3 className="font-bold text-slate-800 text-sm">Upcoming Overview</h3>
          </div>
          <div className="p-6 space-y-8 mt-4">
            {[
              { label: 'Bills', value: data?.summary?.upcomingBillsCount || 0, icon: Wallet, color: 'text-red-500', bg: 'bg-red-50' },
              { label: 'Insurance Renewals', value: data?.summary?.upcomingInsuranceCount || 0, icon: ShieldCheck, color: 'text-orange-500', bg: 'bg-orange-50' },
              { label: 'Reminders', value: data?.summary?.upcomingRemindersCount || 0, icon: Bell, color: 'text-indigo-500', bg: 'bg-indigo-50' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                    <item.icon size={24} />
                  </div>
                  <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{item.label}</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900 leading-none">{item.value}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Pending</p>
                </div>
              </div>
            ))}
          </div>
          <div className="m-6 p-4 rounded-xl bg-slate-900 flex items-center gap-4 text-white shadow-xl">
             <AlertTriangle className="text-warning shrink-0" size={24} />
             <div>
                <p className="text-[10px] font-black uppercase tracking-tighter">Action Required</p>
                <p className="text-[9px] text-slate-400 font-bold">{urgentCount} items expire/due within 3 days.</p>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default Analytics;
