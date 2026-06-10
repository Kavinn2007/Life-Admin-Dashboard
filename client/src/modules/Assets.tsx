import React from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, Home, Car, Landmark, Coins } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const data = [
  { name: 'Jan', value: 45000 },
  { name: 'Feb', value: 47500 },
  { name: 'Mar', value: 46200 },
  { name: 'Apr', value: 49000 },
  { name: 'May', value: 52000 },
  { name: 'Jun', value: 55000 },
];

const Assets: React.FC = () => {
  const assets = [
    { id: 1, name: 'Main Residence', category: 'Property', value: 450000, change: '+5.2%', icon: Home, color: 'text-blue-500 bg-blue-100' },
    { id: 2, name: 'Tesla Model 3', category: 'Vehicle', value: 38000, change: '-12%', icon: Car, color: 'text-red-500 bg-red-100' },
    { id: 3, name: 'Stocks Portfolio', category: 'Investment', value: 85000, change: '+18.5%', icon: Landmark, color: 'text-accent-teal bg-teal-100' },
    { id: 4, name: 'Gold Reserve', category: 'Commodity', value: 12000, change: '+2.1%', icon: Coins, color: 'text-amber-500 bg-amber-100' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight italic">Asset Management</h2>
          <p className="text-slate-500 mt-1 uppercase font-bold text-xs tracking-widest opacity-60 italic">Monitor and grow your net worth.</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          <span>Add Asset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 premium-card !p-0 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic mb-1">Total Portfolio Value</p>
              <h3 className="text-3xl font-black italic">$585,000.00 <span className="text-sm font-bold text-accent-teal ml-2">+8.4%</span></h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold uppercase italic text-slate-400">Live Valuation</span>
            </div>
          </div>
          <div className="h-[300px] w-full p-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
                />
                <YAxis 
                  hide 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 700, fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] italic text-slate-400 mb-6">Asset Distribution</h4>
            <div className="space-y-6">
              {[
                { label: 'Real Estate', value: 75, color: 'bg-primary' },
                { label: 'Investments', value: 15, color: 'bg-accent-teal' },
                { label: 'Others', value: 10, color: 'bg-accent-amber' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase italic tracking-tighter mb-1">
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="w-full btn-primary !bg-slate-100 !text-slate-700 hover:!bg-slate-200 mt-8">
            <TrendingUp className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {assets.map((asset) => (
          <div key={asset.id} className="premium-card group cursor-pointer hover:border-primary/50">
            <div className={`w-10 h-10 ${asset.color} rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
              <asset.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic mb-1">{asset.category}</p>
            <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{asset.name}</h4>
            <div className="flex items-end justify-between mt-4">
              <p className="text-xl font-bold italic">${asset.value.toLocaleString()}</p>
              <p className={`text-[10px] font-black italic ${asset.change.startsWith('+') ? 'text-accent-teal' : 'text-accent-red'}`}>
                {asset.change}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Assets;
