'use client';

import React, { useState, useEffect } from 'react';
import { PortalLayout } from '@/components/PortalLayout';
import api from '@/utils/api';
import { 
  Radio, 
  Search, 
  Clipboard, 
  Check, 
  ShieldAlert, 
  Clock, 
  CheckCircle,
  Image as ImageIcon
} from 'lucide-react';

export default function UltrasoundPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [queue, setQueue] = useState<any[]>([]);
  const [completedList, setCompletedList] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form States
  const [findings, setFindings] = useState('');
  const [imagePath, setImagePath] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [pendingRes, completedRes] = await Promise.all([
        api.get('/ultrasound?status=PENDING'),
        api.get('/ultrasound?status=COMPLETED')
      ]);
      setQueue(pendingRes.data);
      setCompletedList(completedRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch ultrasound requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const loadRequest = (req: any) => {
    setSelectedRequest(req);
    setFindings('');
    setImagePath('https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800'); // Seed mock ultrasound image URL
    setError('');
    setSuccess('');
  };

  const handleSubmitResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    if (!findings) {
      return setError('Findings / Sonography conclusions cannot be empty.');
    }
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await api.put(`/ultrasound/${selectedRequest.id}/results`, { findings, imagePath });
      setSuccess(`Ultrasound scan report for ${selectedRequest.scanType} submitted successfully.`);
      setSelectedRequest(null);
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit ultrasound report');
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { name: 'Sonography Desk', href: '/ultrasound', icon: Radio },
  ];

  return (
    <PortalLayout title="Hospital Sonography (Ultrasound) Desk" sidebarItems={sidebarItems}>
      {/* Alerts */}
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-400">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
          <Check className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-8 gap-4">
        <button
          onClick={() => { setActiveTab('pending'); setSelectedRequest(null); }}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'pending' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Pending Scans ({queue.length})
        </button>
        <button
          onClick={() => { setActiveTab('completed'); setSelectedRequest(null); }}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'completed' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Completed Scans ({completedList.length})
        </button>
      </div>

      {/* Main Split Interface */}
      {activeTab === 'pending' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Pending Queue List */}
          <div className="lg:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col h-[calc(100vh-220px)] overflow-hidden">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-cyan-400" />
              Scan Queue
            </h3>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {queue.map((req) => (
                <button
                  key={req.id}
                  onClick={() => loadRequest(req)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedRequest?.id === req.id 
                      ? 'bg-cyan-500/10 border-cyan-400/50 shadow-lg shadow-cyan-500/5' 
                      : 'bg-slate-900 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700/50'
                  }`}
                >
                  <div className="font-semibold text-slate-200 truncate">{req.patient?.fullName}</div>
                  <div className="text-xs text-cyan-400 font-mono font-bold mt-1">{req.patient?.mrn}</div>
                  <div className="mt-2 text-xs font-bold text-slate-300 bg-slate-800/60 p-2 rounded-lg border border-slate-700/40 text-center uppercase tracking-wider">
                    {req.scanType}
                  </div>
                </button>
              ))}

              {queue.length === 0 && (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                  <Radio className="w-8 h-8 text-slate-700 mx-auto animate-pulse" />
                  <p className="text-slate-400 text-xs mt-3">No pending ultrasound scans.</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Editor */}
          <div className="lg:col-span-2">
            {selectedRequest ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-6">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200 text-lg">{selectedRequest.patient?.fullName}</h4>
                    <div className="flex gap-4 text-xs mt-1.5 text-slate-400">
                      <span>MRN: <span className="font-mono font-bold text-cyan-400">{selectedRequest.patient?.mrn}</span></span>
                      <span>Gender: <span className="text-slate-300">{selectedRequest.patient?.gender}</span></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Ordered Scan:</span>
                    <div className="font-bold text-cyan-400 text-sm mt-0.5">{selectedRequest.scanType}</div>
                  </div>
                </div>

                <form onSubmit={handleSubmitResults} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Diagnostic Findings & Impression</label>
                    <textarea
                      required
                      rows={6}
                      placeholder="Enter sonographer observations, measurements, organ size, details and overall impression/conclusions..."
                      value={findings}
                      onChange={(e) => setFindings(e.target.value)}
                      className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2.5 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Ultrasound Scan Image Reference URL (Simulation)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <ImageIcon className="h-5 w-5" />
                      </span>
                      <input
                        type="text"
                        placeholder="https://example.com/scan-img.jpg"
                        value={imagePath}
                        onChange={(e) => setImagePath(e.target.value)}
                        className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2.5 pl-10 pr-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {imagePath && (
                    <div className="rounded-xl border border-slate-800 bg-slate-950/20 p-2 overflow-hidden max-w-sm">
                      <img 
                        src={imagePath} 
                        alt="Scanned Ultrasound Mock" 
                        className="rounded-lg object-cover w-full h-40 opacity-80"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 font-semibold text-sm text-white hover:from-cyan-400 hover:to-indigo-400 transition shadow-lg shadow-cyan-500/20"
                  >
                    {loading ? 'Submitting...' : 'Complete & Submit Ultrasound Scan'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
                <Radio className="w-12 h-12 text-slate-700 mx-auto animate-pulse" />
                <h4 className="text-slate-300 font-bold text-lg mt-4">Ultrasound Scan Console</h4>
                <p className="text-slate-500 text-sm mt-1.5 max-w-sm mx-auto">
                  Select a pending ultrasound request from the queue sidebar to record findings, impressions and complete the report.
                </p>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Completed Scans History list */
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            Completed Sonography Diagnostic Releases
          </h3>

          {completedList.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-850 rounded-xl">
              <Radio className="w-8 h-8 text-slate-800 mx-auto" />
              <p className="text-slate-400 text-sm mt-2">No completed ultrasound records found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {completedList.map((req) => (
                <div key={req.id} className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between border-b border-slate-850 pb-2">
                    <div>
                      <h4 className="font-bold text-slate-200">{req.patient?.fullName}</h4>
                      <span className="text-xs text-cyan-400 font-mono">{req.patient?.mrn}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-medium">Scan Type: <span className="font-bold text-slate-200">{req.scanType}</span></span>
                      <div className="text-[10px] text-slate-500 mt-0.5">Completed At: {new Date(req.completedAt).toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 text-sm">
                      <h5 className="text-xs font-semibold text-slate-400 mb-1">Diagnostic Findings & Impressions:</h5>
                      <p className="text-slate-300 whitespace-pre-line bg-slate-950/20 p-3 rounded-lg border border-slate-800/40 font-mono text-xs">{req.findings}</p>
                    </div>

                    {req.imagePath && (
                      <div className="md:col-span-1 border border-slate-800 rounded-xl p-2 bg-slate-950/40 flex items-center justify-center">
                        <img 
                          src={req.imagePath} 
                          alt="Ultrasound Image" 
                          className="rounded-lg object-contain w-full max-h-40 opacity-70"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PortalLayout>
  );
}
