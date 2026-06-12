import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, ShieldCheck, RefreshCw, Bell, AlertTriangle } from 'lucide-react';
import { getAll } from '../utils/demoStorage';

const Analytics: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Build analytics from localStorage data — no API needed
    const bills = getAll<any>('bills');
    const insurance = getAll<any>('insurance');
    const subscriptions = getAll<any>('subscriptions');
    const reminders = getAll<any>('reminders');

    const now = new Date();
    const next7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const next30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const upcomingBills = bills.filter((b: any) => b.status === 'PENDING' && new Date(b.dueDate) <= next7);
    const upcomingBillsSum = upcomingBills.reduce((s: number, b: any) => s + (b.amount || 0), 0);

    const upcomingInsurance = insurance.filter((i: any) => {
      const rd = new Date(i.renewalDate);
      return rd >= now && rd <= next30;
    });

    const activeSubs = subscriptions.filter((s: any) => {
      const rd = new Date(s.renewalDate);
      return rd >= now;
    });

    const subsMonthly = activeSubs.reduce((sum: number, sub: any) => {
      if (sub.billingCycle === 'Yearly') return sum + (sub.cost / 12);
      if (sub.billingCycle === 'Weekly') return sum + (sub.cost * 52 / 12);
      return sum + (sub.cost || 0);
    }, 0);

    const billsMonthly = bills.filter((b: any) => b.status !== 'PAID').reduce((s: number, b: any) => s + (b.amount || 0), 0);
    const insuranceMonthly = insurance.reduce((s: number, i: any) => s + ((i.premiumAmount || 0) / 12), 0);
    const totalMonthlySpent = Math.round(billsMonthly + subsMonthly + insuranceMonthly);

    const upcomingReminders = reminders.filter((r: any) => {
      const rd = new Date(r.date);
      return rd >= now && rd <= next30;
    });

    // Due dates list for dashboard
    const dueDates: any[] = [
      ...upcomingBills.slice(0, 3).map((b: any) => ({
        name: b.name, amount: `₹${b.amount?.toLocaleString()}`, type: 'bill',
        date: new Date(b.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        status: 'DUE SOON', color: 'text-blue-600',
        daysLeft: Math.ceil((new Date(b.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      })),
      ...upcomingInsurance.slice(0, 2).map((i: any) => ({
        name: i.policyName, amount: `₹${i.premiumAmount?.toLocaleString()}`, type: 'insurance',
        date: new Date(i.renewalDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        status: 'RENEWING', color: 'text-orange-600',
        daysLeft: Math.ceil((new Date(i.renewalDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      })),
    ];

    const total = totalMonthlySpent || 1;
    const chartData = [
      { name: 'Bills', value: Math.round((billsMonthly / total) * 100), color: '#2563EB' },
      { name: 'Subscriptions', value: Math.round((subsMonthly / total) * 100), color: '#10B981' },
      { name: 'Insurance', value: Math.round((insuranceMonthly / total) * 100), color: '#F59E0B' },
    ].filter(d => d.value > 0);

    if (chartData.length === 0) chartData.push({ name: 'No Data', value: 100, color: '#e2e8f0' });

    setData({
      summary: {
        totalMonthlySpent,
        upcomingBillsCount: upcomingBills.length,
        upcomingBillsSum,
        upcomingInsuranceCount: upcomingInsurance.length,
        activeSubscriptionsCount: activeSubs.length,
        upcomingRemindersCount: upcomingReminders.length,
      },
      dueDates,
      chartData,
      alerts: dueDates.map(d => ({ title: `${d.name} — ${d.status}`, time: d.date, type: d.daysLeft <= 3 ? 'urgent' : 'warning' })),
    });
  }, []);

  if (!data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-slate-400 text-sm font-medium">Loading analytics...</div>
      </div>
    );
  }

  const urgentCount = data?.dueDates?.filter((item: any) => item.daysLeft <= 3).length || 0;
  const stats = [
    { label: 'Projected Expenses', value: `₹ ${data.summary.totalMonthlySpent.toLocaleString()}`, info: 'Total Monthly Projected', color: 'text-blue-600', icon: Wallet },
    { label: 'Upcoming Bills', value: data.summary.upcomingBillsCount.toString(), info: `Total: ₹ ${data.summary.upcomingBillsSum.toLocaleString()}`, color: 'text-green-600', icon: Wallet },
    { label: 'Upcoming Renewals', value: data.summary.upcomingInsuranceCount.toString(), info: 'In Next 30 Days', color: 'text-orange-600', icon: ShieldCheck },
    { label: 'Active Subscriptions', value: data.summary.activeSubscriptionsCount.toString(), info: 'Total', color: 'text-indigo-600', icon: RefreshCw },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-800">Reports & Summary</h2>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Viewing data for:</span>
          <select className="bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold uppercase outline-none focus:ring-1 focus:ring-primary shadow-sm w-full md:w-auto">
            <option>This Month</option><option>Last Month</option><option>Last 3 Months</option>
          </select>
        </div>
      </div>

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
        <div className="lg:col-span-2 dashboard-card !p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <h3 className="font-bold text-slate-800 text-sm">Spending Overview</h3>
          </div>
          <div className="p-8 flex flex-col md:flex-row items-center justify-center gap-12 min-h-[350px]">
            <div className="w-full h-full max-w-[250px] relative">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={data.chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                    {data.chartData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-xl font-black text-slate-800">₹{data.summary.totalMonthlySpent.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Projected</p>
              </div>
            </div>
            <div className="space-y-4 w-full max-w-[200px]">
              {data.chartData.map((item: any, i: number) => (
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

        <div className="dashboard-card !p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <h3 className="font-bold text-slate-800 text-sm">Upcoming Overview</h3>
          </div>
          <div className="p-6 space-y-8 mt-4">
            {[
              { label: 'Bills', value: data.summary.upcomingBillsCount, icon: Wallet, color: 'text-red-500', bg: 'bg-red-50' },
              { label: 'Insurance Renewals', value: data.summary.upcomingInsuranceCount, icon: ShieldCheck, color: 'text-orange-500', bg: 'bg-orange-50' },
              { label: 'Reminders', value: data.summary.upcomingRemindersCount, icon: Bell, color: 'text-indigo-500', bg: 'bg-indigo-50' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}><item.icon size={24} /></div>
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
            <AlertTriangle className="text-yellow-400 shrink-0" size={24} />
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
