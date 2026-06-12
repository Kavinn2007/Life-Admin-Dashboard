import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Check, X } from 'lucide-react';
import { getAll, addItem, updateItem, deleteItem } from '../utils/demoStorage';

interface Bill {
  id: string;
  name: string;
  category: string;
  provider: string;
  amount: number;
  dueDate: string;
  status: string;
  paymentMethod?: string;
  notes?: string;
}

const Bills: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Upcoming' | 'Paid' | 'Overdue'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electricity');
  const [provider, setProvider] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [notes, setNotes] = useState('');

  const load = () => setBills(getAll<Bill>('bills'));

  useEffect(() => { load(); }, []);

  const handleOpenAdd = () => {
    setModalMode('add'); setEditingId(null);
    setName(''); setCategory('Electricity'); setProvider(''); setAmount('');
    setDueDate(''); setStatus('PENDING'); setPaymentMethod('Credit Card'); setNotes('');
    setShowModal(true);
  };

  const handleOpenEdit = (bill: Bill) => {
    setModalMode('edit'); setEditingId(bill.id);
    setName(bill.name); setCategory(bill.category); setProvider(bill.provider);
    setAmount(bill.amount.toString());
    setDueDate(new Date(bill.dueDate).toISOString().split('T')[0]);
    setStatus(bill.status); setPaymentMethod(bill.paymentMethod || 'Credit Card');
    setNotes(bill.notes || ''); setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, category, provider, amount: parseFloat(amount), dueDate, status, paymentMethod, notes };
    if (modalMode === 'add') {
      addItem<any>('bills', payload);
    } else if (editingId) {
      updateItem<any>('bills', editingId, payload);
    }
    setShowModal(false);
    load();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this bill?')) {
      deleteItem('bills', id);
      load();
    }
  };

  const handleMarkAsPaid = (bill: Bill) => {
    updateItem('bills', bill.id, { status: 'PAID' });
    load();
  };

  const filteredBills = bills.filter((bill) => {
    const matchesSearch = bill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bill.provider.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'All') return matchesSearch;
    if (activeTab === 'Paid') return matchesSearch && bill.status === 'PAID';
    if (activeTab === 'Upcoming') return matchesSearch && bill.status === 'PENDING';
    if (activeTab === 'Overdue') return matchesSearch && bill.status === 'OVERDUE';
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Bills</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">Manage, filter, and settle your accounts.</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary cursor-pointer">
          <Plus size={18} /> Add Bill
        </button>
      </div>

      <div className="dashboard-card !p-0">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
          <div className="flex gap-6 w-full md:w-auto overflow-x-auto no-scrollbar">
            {['All', 'Upcoming', 'Paid', 'Overdue'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)}
                className={`text-sm font-bold pb-2 border-b-2 cursor-pointer transition-all ${activeTab === tab ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search bill or provider..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary outline-none transition-all" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Bill Name</th>
                <th className="px-6 py-4">Provider / Category</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBills.length > 0 ? (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4"><p className="text-sm font-bold text-slate-800">{bill.name}</p></td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-700">{bill.provider}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{bill.category}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">₹ {bill.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(bill.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${
                        bill.status === 'PAID' ? 'bg-green-50 text-green-600 border-green-100' :
                        bill.status === 'OVERDUE' ? 'bg-red-50 text-red-600 border-red-100' :
                        'bg-blue-50 text-primary border-blue-100'}`}>{bill.status}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        {bill.status !== 'PAID' && (
                          <button onClick={() => handleMarkAsPaid(bill)} title="Mark as Paid"
                            className="p-1 hover:bg-green-50 text-green-600 rounded transition-all cursor-pointer">
                            <Check size={16} />
                          </button>
                        )}
                        <button onClick={() => handleOpenEdit(bill)} title="Edit"
                          className="p-1 hover:bg-slate-100 text-slate-500 rounded transition-all cursor-pointer">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(bill.id)} title="Delete"
                          className="p-1 hover:bg-red-50 text-red-500 rounded transition-all cursor-pointer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic text-sm">No bills found. Click "Add Bill" to get started.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden relative z-10">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">{modalMode === 'add' ? 'Add New Bill' : 'Edit Bill Details'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Bill Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Electricity Bill" className="input-field" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Provider</label>
                  <input type="text" value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="TNEB" className="input-field" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field bg-white">
                    {['Electricity', 'Water', 'Internet', 'Gas', 'Mobile', 'Others'].map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Amount (₹)</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="2500" className="input-field" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Due Date</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input-field" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field bg-white">
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="OVERDUE">Overdue</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Payment Method</label>
                  <input type="text" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} placeholder="Credit Card" className="input-field" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Notes</label>
                  <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Auto-pay enabled" className="input-field" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex gap-4 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 text-sm font-semibold cursor-pointer">Cancel</button>
                <button type="submit" className="btn-primary cursor-pointer">{modalMode === 'add' ? 'Add Bill' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bills;
