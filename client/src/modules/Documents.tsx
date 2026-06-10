import React, { useState, useEffect, useRef } from 'react';
import { Plus, Download, FileText, Trash2, Eye, X, Loader2, Search } from 'lucide-react';
import api from '../utils/api';

interface DocumentFile {
  id: string;
  name: string;
  category: string;
  fileUrl: string;
  fileType: string;
  expiryDate?: string;
  createdAt: string;
}

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'All' | 'ID Proof' | 'Financial' | 'Insurance' | 'Others'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Upload States
  const [showModal, setShowModal] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [category, setCategory] = useState('ID Proof');
  const [expiryDate, setExpiryDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!uploadName) {
        setUploadName(file.name.split('.')[0]);
      }
    }
  };

  const handleOpenUpload = () => {
    setUploadName('');
    setCategory('ID Proof');
    setExpiryDate('');
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleTriggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', uploadName);
    formData.append('category', category);
    if (expiryDate) {
      formData.append('expiryDate', expiryDate);
    }

    try {
      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setShowModal(false);
      fetchDocuments();
    } catch (error) {
      console.error('Failed to upload document:', error);
      alert('File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document from the vault?')) {
      try {
        await api.delete(`/documents/${id}`);
        fetchDocuments();
      } catch (error) {
        console.error('Failed to delete document:', error);
      }
    }
  };

  const getFileUrl = (fileUrl: string) => {
    const apiBase = import.meta.env.VITE_API_URL || '';
    if (apiBase) {
      const serverBase = apiBase.replace(/\/api\/?$/, '');
      return `${serverBase.replace(/\/$/, '')}${fileUrl}`;
    }
    if (window.location.hostname === 'localhost') {
      return `http://localhost:5000${fileUrl}`;
    }
    return `${window.location.origin}${fileUrl}`;
  };

  const handlePreview = (doc: DocumentFile) => {
    window.open(getFileUrl(doc.fileUrl), '_blank');
  };

  const handleDownload = (doc: DocumentFile) => {
    const link = document.createElement('a');
    link.href = getFileUrl(doc.fileUrl);
    link.setAttribute('download', doc.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and Search logic
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'All') return matchesSearch;
    return matchesSearch && doc.category === activeTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Documents</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">Securely upload, preview, and categorize your files.</p>
        </div>
        <button onClick={handleOpenUpload} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm cursor-pointer transition-all">
          <Plus size={18} /> Upload Document
        </button>
      </div>

      <div className="dashboard-card !p-0">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
          {/* Tabs */}
          <div className="flex gap-6 w-full md:w-auto overflow-x-auto no-scrollbar">
            {['All', 'ID Proof', 'Financial', 'Insurance', 'Others'].map((tab) => (
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

          {/* Search box */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search document name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary outline-none transition-all"
            />
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
                  <th className="px-6 py-4">Document Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Uploaded On</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDocs.length > 0 ? (
                  filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-red-500 shrink-0">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{doc.name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{doc.fileType.toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">{doc.category}</td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500">
                        {new Date(doc.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {doc.expiryDate && (
                          <span className="block text-[9px] text-red-500 font-medium">Expires: {new Date(doc.expiryDate).toLocaleDateString('en-IN')}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-4">
                          <button onClick={() => handlePreview(doc)} className="text-slate-400 hover:text-primary cursor-pointer" title="Preview"><Eye size={18} /></button>
                          <button onClick={() => handleDownload(doc)} className="text-slate-400 hover:text-primary cursor-pointer" title="Download"><Download size={18} /></button>
                          <button onClick={() => handleDelete(doc.id)} className="text-slate-300 hover:text-red-500 cursor-pointer" title="Delete"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic text-sm">No files uploaded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden relative z-10">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">Upload New Document</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">File Selection</label>
                <div className="flex gap-3">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden" 
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  />
                  <button 
                    type="button" 
                    onClick={handleTriggerFileSelect}
                    className="flex-1 py-3 px-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary text-slate-500 text-xs font-bold hover:text-primary transition-all text-center cursor-pointer"
                  >
                    {selectedFile ? `Selected: ${selectedFile.name}` : 'Click to select PDF, DOCX, JPG, PNG'}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Document Title</label>
                <input 
                  type="text" 
                  value={uploadName} 
                  onChange={(e) => setUploadName(e.target.value)} 
                  placeholder="Aadhaar Card Copy" 
                  className="input-field" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    className="input-field bg-white"
                  >
                    <option value="ID Proof">ID Proof</option>
                    <option value="Financial">Financial</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Expiry Date (Optional)</label>
                  <input 
                    type="date" 
                    value={expiryDate} 
                    onChange={(e) => setExpiryDate(e.target.value)} 
                    className="input-field" 
                  />
                </div>
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
                  disabled={uploading}
                  className="btn-primary cursor-pointer disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
