import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, X, Bell } from 'lucide-react';
import { getAll, addItem, deleteItem } from '../utils/demoStorage';

interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: string;
  priority: string;
  recurrence: string;
}

const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Today' | 'This Week' | 'This Month'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [remDate, setRemDate] = useState('');
  const [remTime, setRemTime] = useState('');
  const [type, setType] = useState('Renewal');
  const [priority, setPriority] = useState('MEDIUM');
  const [recurrence, setRecurrence] = useState('NONE');

  const load = () => setReminders(getAll<Reminder>('reminders'));

  useEffect(() => {
    load();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();
      reminders.forEach((rem) => {
        const diffMins = (new Date(rem.date).getTime() - now.getTime()) / (1000 * 60);
        if (diffMins >= 0 && diffMins <= 1 && Notification.permission === 'granted') {
          new Notification(`Life Admin Alert: ${rem.title}`, { body: rem.description || `Your ${rem.type} reminder is due now!`, icon: '/favicon.svg' });
        }
      });
    };
    const interval = setInterval(checkNotifications, 60000);
    return () => clearInterval(interval);
  }, [reminders]);

  const handleOpenAdd = () => {
    setTitle(''); setDescription(''); setRemDate(''); setRemTime('');
    setType('Renewal'); setPriority('MEDIUM'); setRecurrence('NONE'); setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateStr = `${remDate}T${remTime || '00:00'}:00`;
    addItem<any>('reminders', { title, description, date: new Date(dateStr).toISOString(), type, priority, recurrence });
    setShowModal(false); load();
  };

  const handleDelete = (id: string) => {
    deleteItem('reminders', id);
    setCompletedIds(prev => prev.filter(cid => cid !== id));
    load();
  };

  const handleToggleComplete = (id: string) => {
    if (completedIds.includes(id)) {
      setCompletedIds(prev => prev.filter(cid => cid !== id));
    } else {
      setCompletedIds(prev => [...prev, id]);
      setTimeout(() => handleDelete(id), 1500);
    }
  };

  const filteredReminders = reminders.filter((rem) => {
    const matchesSearch = rem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (rem.description && rem.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const remDateObj = new Date(rem.date);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const nextWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(startOfToday.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (activeTab === 'All') return matchesSearch;
    if (activeTab === 'Today') return matchesSearch && remDateObj >= startOfToday && remDateObj < endOfToday;
    if (activeTab === 'This Week') return matchesSearch && remDateObj >= startOfToday && remDateObj < nextWeek;
    if (activeTab === 'This Month') return matchesSearch && remDateObj >= startOfToday && remDateObj < nextMonth;
    return matchesSearch;
  });

  const getPriorityStyles = (p: string) => {
    switch (p.toUpperCase()) {
      case 'HIGH': return 'bg-red-50 text-red-600 border-red-100';
      case 'MEDIUM': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-blue-50 text-primary border-blue-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Reminders</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">Schedule alerts, chores, and events with desktop reminders.</p>
        </div>
        <button onClick={handleOpenAdd} className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm cursor-pointer transition-all w-full md:w-auto">
          <Plus size={18} /> Add Reminder
        </button>
      </div>

      <div className="dashboard-card !p-0">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
          <div className="flex gap-8 w-full md:w-auto overflow-x-auto no-scrollbar">
            {['All', 'Today', 'This Week', 'This Month'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)}
                className={`text-sm font-bold pb-2 border-b-2 cursor-pointer transition-all ${activeTab === tab ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>{tab}</button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search reminder..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary outline-none transition-all" />
          </div>
        </div>

        <div className="p-2 divide-y divide-slate-50">
          {filteredReminders.length > 0 ? filteredReminders.map((rem) => {
            const isCompleted = completedIds.includes(rem.id);
            return (
              <div key={rem.id} className={`flex items-center justify-between p-4 transition-all rounded-lg group ${isCompleted ? 'opacity-40 line-through bg-slate-50/50' : 'hover:bg-slate-50/50'}`}>
                <div className="flex items-center gap-4">
                  <input type="checkbox" checked={isCompleted} onChange={() => handleToggleComplete(rem.id)}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer" />
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-50 text-slate-500"><Bell size={20} /></div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 leading-tight flex items-center gap-2">
                      {rem.title}
                      <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${getPriorityStyles(rem.priority)}`}>{rem.priority}</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">
                      {new Date(rem.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      {rem.recurrence && rem.recurrence !== 'NONE' && (
                        <span className="ml-2 inline-block text-[8px] font-black uppercase tracking-wider px-1 bg-slate-100 text-slate-600 border border-slate-200 rounded">🔄 {rem.recurrence}</span>
                      )}
                    </p>
                    {rem.description && <p className="text-xs text-slate-500 font-medium mt-0.5">{rem.description}</p>}
                  </div>
                </div>
                <button onClick={() => handleDelete(rem.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-all cursor-pointer opacity-0 group-hover:opacity-100" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            );
          }) : (
            <div className="p-12 text-center text-slate-400 italic text-sm">No reminders scheduled. Click "Add Reminder" to start.</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden relative z-10">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">Add New Reminder</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Reminder Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Doctor Appointment" className="input-field" required /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details of the appointment..." className="input-field min-h-[80px]" /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Date</label>
                  <input type="date" value={remDate} onChange={(e) => setRemDate(e.target.value)} className="input-field" required /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Time</label>
                  <input type="time" value={remTime} onChange={(e) => setRemTime(e.target.value)} className="input-field" required /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="input-field bg-white">
                    <option value="Renewal">Renewal</option><option value="Appointment">Appointment</option>
                    <option value="Bill">Bill Payment</option><option value="Task">Task Chore</option><option value="Other">Other Event</option>
                  </select></div>
                <div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input-field bg-white">
                    <option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option>
                  </select></div>
              </div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Recurrence</label>
                <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)} className="input-field bg-white">
                  <option value="NONE">No Recurrence (One-time)</option><option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option><option value="YEARLY">Yearly</option>
                </select></div>
              <div className="pt-4 border-t border-slate-100 flex gap-4 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 text-sm font-semibold cursor-pointer">Cancel</button>
                <button type="submit" className="btn-primary cursor-pointer">Save Reminder</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reminders;
