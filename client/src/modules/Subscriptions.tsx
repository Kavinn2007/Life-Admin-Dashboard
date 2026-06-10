import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Tv, ShoppingBag, Music, Play, Loader2 } from 'lucide-react';
import api from '../utils/api';

interface Subscription {
  id: string;
  serviceName: string;
  category: string;
  provider?: string;
  cost: number;
  billingCycle: string;
  startDate?: string;
  renewalDate: string;
  paymentMethod?: string;
  notes?: string;
}

const Subscriptions: React.FC = () => {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Expiring Soon' | 'Cancelled'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'renewalDate' | 'cost' | 'serviceName'>('renewalDate');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState('Entertainment');
  const [provider, setProvider] = useState('');
  const [cost, setCost] = useState('');
  const [billingCycle, setBillingCycle] = useState('Monthly');
  const [startDate, setStartDate] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [notes, setNotes] = useState('');

  // Alerts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchSubs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subscriptions');
      setSubs(response.data);
    } catch (error: any) {
      console.error('Failed to load subscriptions:', error);
      setErrorMsg('Failed to load subscriptions from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setEditingId(null);
    setServiceName('');
    setCategory('Entertainment');
    setProvider('');
    setCost('');
    setBillingCycle('Monthly');
    setStartDate('');
    setRenewalDate('');
    setPaymentMethod('Credit Card');
    setNotes('');
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleOpenEdit = (sub: Subscription) => {
    setModalMode('edit');
    setEditingId(sub.id);
    setServiceName(sub.serviceName);
    setCategory(sub.category);
    setProvider(sub.provider || '');
    setCost(sub.cost.toString());
    setBillingCycle(sub.billingCycle);
    setStartDate(sub.startDate ? new Date(sub.startDate).toISOString().split('T')[0] : '');
    setRenewalDate(new Date(sub.renewalDate).toISOString().split('T')[0]);
    setPaymentMethod(sub.paymentMethod || 'Credit Card');
    setNotes(sub.notes || '');
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsedCost = parseFloat(cost);
    if (isNaN(parsedCost) || parsedCost <= 0) {
      setErrorMsg('Cost must be a valid positive number');
      return;
    }

    const payload = {
      serviceName,
      category,
      provider: provider || null,
      cost: parsedCost,
      billingCycle,
      startDate: startDate || null,
      renewalDate,
      paymentMethod: paymentMethod || null,
      notes: notes || null,
    };

    try {
      if (modalMode === 'add') {
        await api.post('/subscriptions', payload);
        showSuccess('Subscription successfully tracked!');
      } else {
        await api.put(`/subscriptions/${editingId}`, payload);
        showSuccess('Subscription details updated!');
      }
      setShowModal(false);
      fetchSubs();
    } catch (error: any) {
      console.error('Failed to save subscription:', error);
      const backendErr = error.response?.data?.error || error.message || 'Error saving subscription details';
      setErrorMsg(`Failed to save: ${backendErr}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        await api.delete(`/subscriptions/${id}`);
        showSuccess('Subscription tracker deleted');
        fetchSubs();
      } catch (error: any) {
        console.error('Failed to delete subscription:', error);
        setErrorMsg('Failed to delete subscription.');
      }
    }
  };

  const getDaysLeft = (dateStr: string) => {
    const diffTime = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredSubs = subs.filter((sub) => {
    const matchesSearch = sub.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (sub.provider && sub.provider.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          sub.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const daysLeft = getDaysLeft(sub.renewalDate);

    if (activeTab === 'All') return matchesSearch;
    if (activeTab === 'Active') return matchesSearch && daysLeft >= 0;
    if (activeTab === 'Expiring Soon') return matchesSearch && daysLeft >= 0 && daysLeft <= 7;
    if (activeTab === 'Cancelled') return matchesSearch && daysLeft < 0; // Expired
    return matchesSearch;
  });

  const sortedSubs = [...filteredSubs].sort((a, b) => {
    if (sortBy === 'renewalDate') {
      return new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime();
    }
    if (sortBy === 'cost') {
      return b.cost - a.cost;
    }
    if (sortBy === 'serviceName') {
      return a.serviceName.localeCompare(b.serviceName);
    }
    return 0;
  });

  // Calculate calculations
  const activeSubs = subs.filter(sub => getDaysLeft(sub.renewalDate) >= 0);

  const totalMonthlySpending = activeSubs.reduce((sum, sub) => {
    const costVal = sub.cost;
    if (sub.billingCycle === 'Yearly') return sum + (costVal / 12);
    if (sub.billingCycle === 'Weekly') return sum + (costVal * 52 / 12);
    return sum + costVal;
  }, 0);

  const totalYearlySpending = totalMonthlySpending * 12;

  const activeUpcomingSubs = activeSubs
    .map(sub => ({ ...sub, daysLeft: getDaysLeft(sub.renewalDate) }))
    .filter(sub => sub.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);
  
  const nextPaymentSub = activeUpcomingSubs.length > 0 ? activeUpcomingSubs[0] : null;
  const nextPaymentDate = nextPaymentSub ? new Date(nextPaymentSub.renewalDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
  const nextPaymentDaysLeft = nextPaymentSub ? nextPaymentSub.daysLeft : null;

  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('netflix') || n.includes('prime') || n.includes('youtube') || n.includes('disney')) return Tv;
    if (n.includes('spotify') || n.includes('apple music') || n.includes('music')) return Music;
    if (n.includes('amazon') || n.includes('shopping') || n.includes('framer')) return ShoppingBag;
    return Play;
  };

  const getIconColorClass = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('netflix') || n.includes('youtube')) return 'text-red-600';
    if (n.includes('spotify')) return 'text-green-500';
    return 'text-blue-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Subscriptions</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">Track your recurring monthly and annual packages.</p>
        </div>
        <button onClick={handleOpenAdd} className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm cursor-pointer transition-all">
          <Plus size={18} /> Add Subscription
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-600 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && !showModal && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dashboard-card">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Trackers</p>
            <Tv size={16} className="text-green-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-800">{activeSubs.length}</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">Active subscriptions</p>
        </div>

        <div className="dashboard-card">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Monthly Run Rate</p>
            <Music size={16} className="text-blue-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-800">₹ {Math.round(totalMonthlySpending).toLocaleString()}</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">Prorated monthly cost</p>
        </div>

        <div className="dashboard-card">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Yearly run rate</p>
            <ShoppingBag size={16} className="text-indigo-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-800">₹ {Math.round(totalYearlySpending).toLocaleString()}</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">Estimated annual cost</p>
        </div>

        <div className="dashboard-card">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Next Renewal</p>
            <Play size={16} className="text-orange-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-800">
            {nextPaymentSub ? nextPaymentSub.serviceName : 'None'}
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            {nextPaymentSub ? `${nextPaymentDate} (${nextPaymentDaysLeft}d left)` : 'No upcoming renewals'}
          </p>
        </div>
      </div>

      <div className="dashboard-card !p-0">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
          {/* Tabs */}
          <div className="flex gap-8 w-full md:w-auto overflow-x-auto no-scrollbar">
            {['All', 'Active', 'Expiring Soon', 'Cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`text-sm font-bold pb-2 border-b-2 cursor-pointer transition-all ${
                  activeTab === tab ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex gap-4 items-center w-full md:w-auto">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary shadow-sm"
            >
              <option value="renewalDate">Sort by Renewal Date</option>
              <option value="cost">Sort by Cost</option>
              <option value="serviceName">Sort by Name</option>
            </select>

            {/* Search box */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-16 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">Subscription</th>
                  <th className="px-6 py-4">Amount / Cycle</th>
                  <th className="px-6 py-4">Renewal Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sortedSubs.length > 0 ? (
                  sortedSubs.map((sub) => {
                    const SubIcon = getIcon(sub.serviceName);
                    const iconColor = getIconColorClass(sub.serviceName);
                    const daysLeft = getDaysLeft(sub.renewalDate);
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-slate-50 ${iconColor}`}>
                              <SubIcon size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{sub.serviceName}</p>
                              <p className="text-[10px] text-slate-400 font-semibold">
                                {sub.category} {sub.provider ? `• ${sub.provider}` : ''}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-900">₹ {sub.cost.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{sub.billingCycle}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(sub.renewalDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          <span className="block text-[9px] text-slate-400 mt-0.5">
                            {daysLeft < 0 ? 'Renewed recently' : `${daysLeft} days left`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${
                            daysLeft >= 0 
                              ? 'bg-green-50 text-green-600 border-green-100' 
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                            {daysLeft >= 0 ? 'Active' : 'Expired'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button 
                              onClick={() => handleOpenEdit(sub)}
                              className="p-1 hover:bg-slate-100 text-slate-500 rounded transition-all cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(sub.id)}
                              className="p-1 hover:bg-red-50 text-red-500 rounded transition-all cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic text-sm">No subscriptions tracked.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden relative z-10">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">
                {modalMode === 'add' ? 'Track New Subscription' : 'Edit Subscription Details'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Service Name</label>
                  <input 
                    type="text" 
                    value={serviceName} 
                    onChange={(e) => setServiceName(e.target.value)} 
                    placeholder="Spotify" 
                    className="input-field" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Provider / Billing Entity</label>
                  <input 
                    type="text" 
                    value={provider} 
                    onChange={(e) => setProvider(e.target.value)} 
                    placeholder="Spotify India Pvt Ltd" 
                    className="input-field" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    className="input-field bg-white"
                  >
                    {['Entertainment', 'Utilities', 'Software', 'Cloud Storage', 'Education', 'Others'].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Billing Cycle</label>
                  <select 
                    value={billingCycle} 
                    onChange={(e) => setBillingCycle(e.target.value)} 
                    className="input-field bg-white"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Cost (₹)</label>
                  <input 
                    type="number" 
                    value={cost} 
                    onChange={(e) => setCost(e.target.value)} 
                    placeholder="99" 
                    className="input-field" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Payment Method</label>
                  <input 
                    type="text" 
                    value={paymentMethod} 
                    onChange={(e) => setPaymentMethod(e.target.value)} 
                    placeholder="Credit Card" 
                    className="input-field" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Start Date</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    className="input-field" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Renewal Date</label>
                  <input 
                    type="date" 
                    value={renewalDate} 
                    onChange={(e) => setRenewalDate(e.target.value)} 
                    className="input-field" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Notes</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Auto-renew is active on credit card." 
                  className="input-field min-h-[80px]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-4 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary cursor-pointer"
                >
                  {modalMode === 'add' ? 'Add Tracker' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
