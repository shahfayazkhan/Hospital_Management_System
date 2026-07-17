'use client';

import React, { useState, useEffect } from 'react';
import { PortalLayout } from '@/components/PortalLayout';
import api from '@/utils/api';
import { 
  Activity, 
  User, 
  Check, 
  ShieldAlert, 
  Clipboard, 
  Search, 
  Thermometer, 
  Heart,
  Droplet
} from 'lucide-react';

export default function MOPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Vitals Form States
  const [systolicBP, setSystolicBP] = useState('');
  const [diastolicBP, setDiastolicBP] = useState('');
  const [pulse, setPulse] = useState('');
  const [temperature, setTemperature] = useState('');
  const [respiratoryRate, setRespiratoryRate] = useState('');
  const [spo2, setSpo2] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointments?status=CHECKED_IN');
      setQueue(res.data);
      if (res.data.length > 0 && !selectedAppt) {
        // Auto select first patient if none selected
        loadPatient(res.data[0]);
      } else if (res.data.length === 0) {
        setSelectedAppt(null);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch triage queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const loadPatient = (appt: any) => {
    setSelectedAppt(appt);
    setSystolicBP('');
    setDiastolicBP('');
    setPulse('');
    setTemperature('');
    setRespiratoryRate('');
    setSpo2('');
    setWeight('');
    setHeight('');
    setError('');
    setSuccess('');
  };

  const handleSubmitVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;
    try {
      setError('');
      setSuccess('');
      await api.post('/vitals', {
        appointmentId: selectedAppt.id,
        systolicBP: systolicBP ? parseInt(systolicBP) : null,
        diastolicBP: diastolicBP ? parseInt(diastolicBP) : null,
        pulse: pulse ? parseInt(pulse) : null,
        temperature: temperature ? parseFloat(temperature) : null,
        respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : null,
        spo2: spo2 ? parseInt(spo2) : null,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
      });

      setSuccess('Vitals recorded successfully. Patient routed to Doctor Queue.');
      setSelectedAppt(null);
      fetchQueue();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit vitals');
    }
  };

  const sidebarItems = [
    { name: 'Vitals & Triage', href: '/mo', icon: Activity },
  ];

  return (
    <PortalLayout title="Medical Officer Triage Desk" sidebarItems={sidebarItems}>
      {/* Alert Banner */}
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

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Waiting Triage Queue (Left Sidebar) */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col h-[calc(100vh-180px)] overflow-hidden">
          <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Clipboard className="w-5 h-5 text-cyan-400" />
            Triage Queue
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 font-bold">
              {queue.length} waiting
            </span>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {loading && queue.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-400 text-xs mt-3">Refreshing queue...</p>
              </div>
            ) : queue.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                <User className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-slate-400 text-xs mt-3">Triage queue empty. No checked-in patients.</p>
              </div>
            ) : (
              queue.map((appt) => (
                <button
                  key={appt.id}
                  onClick={() => loadPatient(appt)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedAppt?.id === appt.id 
                      ? 'bg-cyan-500/10 border-cyan-400/50 shadow-lg shadow-cyan-500/5' 
                      : 'bg-slate-900 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700/50'
                  }`}
                >
                  <div className="font-semibold text-slate-200 truncate">{appt.patient?.fullName}</div>
                  <div className="flex items-center justify-between text-xs mt-1.5">
                    <span className="font-mono text-cyan-400 font-bold">{appt.patient?.mrn}</span>
                    <span className="text-slate-400">Assigned: {appt.doctor?.fullName}</span>
                  </div>
                  {appt.notes && (
                    <div className="text-[11px] text-slate-500 italic mt-2 line-clamp-1 border-t border-slate-800/60 pt-1.5">
                      Notes: {appt.notes}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Vitals Form Entry Panel (Right Main Panel) */}
        <div className="lg:col-span-2">
          {selectedAppt ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-6">
              {/* Selected Patient Banner */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-200 text-lg">{selectedAppt.patient?.fullName}</h4>
                  <div className="flex gap-4 text-xs mt-1.5 text-slate-400 font-medium">
                    <span>MRN: <span className="font-mono font-bold text-cyan-400">{selectedAppt.patient?.mrn}</span></span>
                    <span>Gender: <span className="text-slate-300">{selectedAppt.patient?.gender}</span></span>
                    <span>DOB: <span className="text-slate-300">{selectedAppt.patient?.dateOfBirth}</span></span>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-400">Target Doctor:</span>
                  <div className="font-bold text-emerald-400 mt-0.5">{selectedAppt.doctor?.fullName}</div>
                </div>
              </div>

              {/* Vitals Inputs */}
              <form onSubmit={handleSubmitVitals} className="space-y-6">
                <h3 className="text-base font-bold text-slate-300 border-b border-slate-800 pb-2 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                  Clinical Metrics Log
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* BP Systolic */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">BP - Systolic (mmHg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 120"
                      value={systolicBP}
                      onChange={(e) => setSystolicBP(e.target.value)}
                      className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2.5 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* BP Diastolic */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">BP - Diastolic (mmHg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 80"
                      value={diastolicBP}
                      onChange={(e) => setDiastolicBP(e.target.value)}
                      className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2.5 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* Heart Rate / Pulse */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-500" /> Pulse (bpm)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 72"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2.5 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* Temperature */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Temperature (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 36.8"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2.5 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* Respiratory Rate */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Respiratory Rate (bpm)</label>
                    <input
                      type="number"
                      placeholder="e.g. 16"
                      value={respiratoryRate}
                      onChange={(e) => setRespiratoryRate(e.target.value)}
                      className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2.5 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* SpO2 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                      <Droplet className="w-3.5 h-3.5 text-cyan-400" /> SpO2 (%)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 98"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value)}
                      className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2.5 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 70.5"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2.5 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Height (cm)</label>
                    <input
                      type="number"
                      placeholder="e.g. 175"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2.5 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 font-semibold text-sm text-white hover:from-cyan-400 hover:to-indigo-400 transition shadow-lg shadow-cyan-500/20"
                  >
                    Submit Vitals & Forward to Doctor
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
              <Clipboard className="w-12 h-12 text-slate-700 mx-auto" />
              <h4 className="text-slate-300 font-bold text-lg mt-4">No Patient Selected</h4>
              <p className="text-slate-500 text-sm mt-1.5 max-w-sm mx-auto">
                Please select a patient from the triage queue on the left side to log their vitals metrics.
              </p>
            </div>
          )}
        </div>

      </div>
    </PortalLayout>
  );
}
