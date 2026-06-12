import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, ShieldCheck, HeartPulse, Car } from 'lucide-react';
import { getAll, addItem, updateItem, deleteItem } from '../utils/demoStorage';

interface InsurancePolicy {
  id: string;
  policyName: string;
  policyNumber: string;
  provider: string;
  insuranceType: string;
  coverageAmount: number;
  premiumAmount: number;
  startDate: string;
  endDate: string;
  renewalDate: string;
  nomineeDetails?: string;
  notes?: string;
}

const Insurance: React.FC = () => {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Expiring Soon' | 'Expired'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [policyName, setPolicyName] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [provider, setProvider] = useState('');
  const [insuranceType, setInsuranceType] = useState('Health');
  const [coverageAmount, setCoverageAmount] = useState('');
  const [premiumAmount, setPremiumAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [nomineeDetails, setNomineeDetails] = useState('');
  const [notes, setNotes] = useState('');

  const load = () => setPolicies(getAll<InsurancePolicy>('insurance'));
  useEffect(() => { load(); }, []);

  const handleOpenAdd = () => {
    setModalMode('add'); setEditingId(null);
    setPolicyName(''); setPolicyNumber(''); setProvider(''); setInsuranceType('Health');
    setCoverageAmount(''); setPremiumAmount(''); setStartDate(''); setEndDate('');
    setRenewalDate(''); setNomineeDetails(''); setNotes(''); setShowModal(true);
  };

  const handleOpenEdit = (p: InsurancePolicy) => {
    setModalMode('edit'); setEditingId(p.id);
    setPolicyName(p.policyName); setPolicyNumber(p.policyNumber); setProvider(p.provider);
    setInsuranceType(p.insuranceType); setCoverageAmount(p.coverageAmount.toString());
    setPremiumAmount(p.premiumAmount.toString());
    setStartDate(new Date(p.startDate).toISOString().split('T')[0]);
    setEndDate(new Date(p.endDate).toISOString().split('T')[0]);
    setRenewalDate(new Date(p.renewalDate).toISOString().split('T')[0]);
    setNomineeDetails(p.nomineeDetails || ''); setNotes(p.notes || ''); setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { policyName, policyNumber, provider, insuranceType,
      coverageAmount: parseFloat(coverageAmount), premiumAmount: parseFloat(premiumAmount),
      startDate, endDate, renewalDate, nomineeDetails, notes };
    if (modalMode === 'add') addItem<any>('insurance', payload);
    else if (editingId) updateItem<any>('insurance', editingId, payload);
    setShowModal(false); load();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this insurance policy?')) { deleteItem('insurance', id); load(); }
  };

  const getDaysInfo = (renewalDateStr: string) => {
    const diffDays = Math.ceil((new Date(renewalDateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: 'Expired', color: 'bg-red-50 text-red-600 border-red-100', isExpired: true, expiresSoon: false };
    if (diffDays <= 30) return { text: `${diffDays} days left`, color: 'bg-orange-50 text-orange-600 border-orange-100', isExpired: false, expiresSoon: true };
    return { text: `${diffDays} days left`, color: 'bg-green-50 text-green-600 border-green-100', isExpired: false, expiresSoon: false };
  };

  const filteredPolicies = policies.filter((p) => {
    const matchesSearch = p.policyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.policyNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const daysInfo = getDaysInfo(p.renewalDate);
    if (activeTab === 'All') return matchesSearch;
    if (activeTab === 'Active') return matchesSearch && !daysInfo.isExpired;
    if (activeTab === 'Expiring Soon') return matchesSearch && daysInfo.expiresSoon;
    if (activeTab === 'Expired') return matchesSearch && daysInfo.isExpired;
    return matchesSearch;
  });

  const getIcon = (type: string) => {
    if (type.toLowerCase().includes('health')) return HeartPulse;
    if (type.toLowerCase().includes('vehicle') || type.toLowerCase().includes('car')) return Car;
    return ShieldCheck;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Insurance</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">Track your active coverage, premiums, and renewals.</p>
        </div>
        <button onClick={handleOpenAdd} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm cursor-pointer transition-all">
          <Plus size={18} /> Add Policy
        </button>
      </div>

      <div className="dashboard-card !p-0">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
          <div className="flex gap-8 w-full md:w-auto overflow-x-auto no-scrollbar">
            {['All', 'Active', 'Expiring Soon', 'Expired'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)}
                className={`text-sm font-bold pb-2 border-b-2 cursor-pointer transition-all ${activeTab === tab ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search policy name or provider..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary outline-none transition-all" />
          </div>
        </div>

        <div className="p-5 space-y-4">
          {filteredPolicies.length > 0 ? filteredPolicies.map((policy) => {
            const PolicyIcon = getIcon(policy.insuranceType);
            const daysInfo = getDaysInfo(policy.renewalDate);
            return (
              <div key={policy.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-all gap-4">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-slate-50 text-primary"><PolicyIcon size={28} /></div>
                  <div>
                    <h4 className="font-bold text-slate-800 leading-tight">{policy.policyName}</h4>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase mt-1">{policy.provider}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Policy No: {policy.policyNumber}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between md:justify-end gap-6 md:gap-12">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Coverage / Premium</p>
                    <p className="text-sm font-black text-slate-800">₹ {policy.coverageAmount.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">Premium: ₹ {policy.premiumAmount.toLocaleString()}</p>
                  </div>
                  <div className="text-left md:text-right min-w-[120px]">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Renewal Date</p>
                    <p className="text-xs font-bold text-slate-700">{new Date(policy.renewalDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border inline-block mt-1 ${daysInfo.color}`}>{daysInfo.text}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenEdit(policy)} className="p-1.5 hover:bg-slate-100 text-slate-500 rounded transition-all cursor-pointer" title="Edit"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(policy.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-all cursor-pointer" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="p-12 text-center text-slate-400 italic text-sm">No insurance policies. Click "Add Policy" to start tracking.</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden relative z-10">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">{modalMode === 'add' ? 'Add Insurance Policy' : 'Edit Policy Details'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Policy Name</label>
                  <input type="text" value={policyName} onChange={(e) => setPolicyName(e.target.value)} placeholder="Health Insurance" className="input-field" required /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Policy Number</label>
                  <input type="text" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} placeholder="SHI123456" className="input-field" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Provider</label>
                  <input type="text" value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Star Health" className="input-field" required /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Policy Type</label>
                  <select value={insuranceType} onChange={(e) => setInsuranceType(e.target.value)} className="input-field bg-white">
                    {['Health', 'Life', 'Vehicle', 'Home', 'Others'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Coverage Amount (₹)</label>
                  <input type="number" value={coverageAmount} onChange={(e) => setCoverageAmount(e.target.value)} placeholder="500000" className="input-field" required /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Premium Amount (₹)</label>
                  <input type="number" value={premiumAmount} onChange={(e) => setPremiumAmount(e.target.value)} placeholder="15000" className="input-field" required /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" required /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" required /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Renewal Date</label>
                  <input type="date" value={renewalDate} onChange={(e) => setRenewalDate(e.target.value)} className="input-field" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nominee Details</label>
                  <input type="text" value={nomineeDetails} onChange={(e) => setNomineeDetails(e.target.value)} placeholder="Spouse Name" className="input-field" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Notes</label>
                  <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Co-pay: 10%" className="input-field" /></div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex gap-4 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 text-sm font-semibold cursor-pointer">Cancel</button>
                <button type="submit" className="btn-primary cursor-pointer">{modalMode === 'add' ? 'Add Policy' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insurance;
