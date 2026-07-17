'use client';

import React, { useState, useEffect } from 'react';
import { PortalLayout } from '@/components/PortalLayout';
import api from '@/utils/api';
import { 
  FlaskConical, 
  Search, 
  Clipboard, 
  Check, 
  ShieldAlert, 
  Clock, 
  CheckCircle,
  FileText
} from 'lucide-react';

export default function LaboratoryPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [queue, setQueue] = useState<any[]>([]);
  const [completedList, setCompletedList] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [findings, setFindings] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [pendingRes, completedRes] = await Promise.all([
        api.get('/lab?status=PENDING'),
        api.get('/lab?status=COMPLETED')
      ]);
      setQueue(pendingRes.data);
      setCompletedList(completedRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch laboratory requests');
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
    setError('');
    setSuccess('');
  };

  const handleSubmitResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    if (!findings) {
      return setError('Findings details cannot be blank.');
    }
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await api.put(`/lab/${selectedRequest.id}/results`, { findings });
      setSuccess(`Lab results for ${selectedRequest.testName} submitted successfully.`);
      setSelectedRequest(null);
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit lab results');
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { name: 'Laboratory Desk', href: '/laboratory', icon: FlaskConical },
  ];

  return (
    <PortalLayout title="Hospital Pathology Laboratory" sidebarItems={sidebarItems}>
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
          Pending Tests ({queue.length})
        </button>
        <button
          onClick={() => { setActiveTab('completed'); setSelectedRequest(null); }}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'completed' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Completed Records ({completedList.length})
        </button>
      </div>

      {/* Main Split Interface */}
      {activeTab === 'pending' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Pending Queue List */}
          <div className="lg:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col h-[calc(100vh-220px)] overflow-hidden">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-cyan-400" />
              Pending Queue
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
                    {req.testName}
                  </div>
                </button>
              ))}

              {queue.length === 0 && (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                  <FlaskConical className="w-8 h-8 text-slate-700 mx-auto" />
                  <p className="text-slate-400 text-xs mt-3">No pending lab tests.</p>
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
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Ordered Test:</span>
                    <div className="font-bold text-cyan-400 text-sm mt-0.5">{selectedRequest.testName}</div>
                  </div>
                </div>

                <form onSubmit={handleSubmitResults} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Lab Test Results & Findings</label>
                    <textarea
                      required
                      rows={8}
                      placeholder="Enter pathology observations, count levels, parameters, references..."
                      value={findings}
                      onChange={(e) => setFindings(e.target.value)}
                      className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2.5 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 font-semibold text-sm text-white hover:from-cyan-400 hover:to-indigo-400 transition shadow-lg shadow-cyan-500/20"
                  >
                    {loading ? 'Submitting...' : 'Complete & Submit Lab Report'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
                <FlaskConical className="w-12 h-12 text-slate-700 mx-auto" />
                <h4 className="text-slate-300 font-bold text-lg mt-4">Laboratory Worksheet</h4>
                <p className="text-slate-500 text-sm mt-1.5 max-w-sm mx-auto">
                  Select a pending test request from the queue sidebar to enter pathology results and release the report.
                </p>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Completed list */
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            Completed Diagnostic Pathology Releases
          </h3>

          {completedList.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-850 rounded-xl">
              <FlaskConical className="w-8 h-8 text-slate-800 mx-auto" />
              <p className="text-slate-400 text-sm mt-2">No completed lab records found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedList.map((req) => (
                <div key={req.id} className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between border-b border-slate-850 pb-2">
                    <div>
                      <h4 className="font-bold text-slate-200">{req.patient?.fullName}</h4>
                      <span className="text-xs text-cyan-400 font-mono">{req.patient?.mrn}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-medium">Test: <span className="font-bold text-slate-200">{req.testName}</span></span>
                      <div className="text-[10px] text-slate-500 mt-0.5">Completed At: {new Date(req.completedAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <h5 className="text-xs font-semibold text-slate-400 mb-1">Laboratory Findings:</h5>
                    <p className="text-slate-300 whitespace-pre-line bg-slate-950/20 p-3 rounded-lg border border-slate-800/40 font-mono text-xs">{req.findings}</p>
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
