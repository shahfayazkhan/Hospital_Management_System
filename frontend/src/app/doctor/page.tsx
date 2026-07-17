'use client';

import React, { useState, useEffect } from 'react';
import { PortalLayout } from '@/components/PortalLayout';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { 
  ClipboardList, 
  Stethoscope, 
  History, 
  Plus, 
  Minus, 
  FlaskConical, 
  Radio, 
  Check, 
  ShieldAlert, 
  FileText,
  Activity
} from 'lucide-react';

interface PrescriptionItemInput {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export default function DoctorPage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'consult' | 'history'>('consult');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Consultation Form States
  const [chiefComplaints, setChiefComplaints] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Prescription Items States
  const [prescNotes, setPrescNotes] = useState('');
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItemInput[]>([
    { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);

  // Diagnostics Checkbox States
  const [labOrders, setLabOrders] = useState<string[]>([]);
  const [ultrasoundOrders, setUltrasoundOrders] = useState<string[]>([]);

  const fetchQueue = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get(`/appointments?status=IN_PROGRESS&doctorId=${user.id}`);
      setQueue(res.data);
      if (res.data.length > 0 && !selectedAppt) {
        loadAppointment(res.data[0]);
      } else if (res.data.length === 0) {
        setSelectedAppt(null);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch patient queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [user]);

  const loadAppointment = async (appt: any) => {
    setSelectedAppt(appt);
    setChiefComplaints(appt.notes || '');
    setDiagnosis('');
    setClinicalNotes('');
    setPrescNotes('');
    setPrescriptionItems([{ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    setLabOrders([]);
    setUltrasoundOrders([]);
    setError('');
    setSuccess('');
    setActiveSubTab('consult');

    // Fetch patient's checkup history
    try {
      const res = await api.get(`/consultations/patient/${appt.patientId}`);
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to load history', err);
    }
  };

  // Add prescription line
  const addPrescriptionItem = () => {
    setPrescriptionItems([...prescriptionItems, { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  // Remove prescription line
  const removePrescriptionItem = (index: number) => {
    if (prescriptionItems.length === 1) return;
    const items = [...prescriptionItems];
    items.splice(index, 1);
    setPrescriptionItems(items);
  };

  // Handle item change
  const handleItemChange = (index: number, field: keyof PrescriptionItemInput, value: string) => {
    const items = [...prescriptionItems];
    items[index][field] = value;
    setPrescriptionItems(items);
  };

  // Toggle Labs
  const handleLabToggle = (test: string) => {
    if (labOrders.includes(test)) {
      setLabOrders(labOrders.filter(t => t !== test));
    } else {
      setLabOrders([...labOrders, test]);
    }
  };

  // Toggle Ultrasound
  const handleUltrasoundToggle = (scan: string) => {
    if (ultrasoundOrders.includes(scan)) {
      setUltrasoundOrders(ultrasoundOrders.filter(s => s !== scan));
    } else {
      setUltrasoundOrders([...ultrasoundOrders, scan]);
    }
  };

  // Submit Consultation
  const handleSubmitConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;
    if (!chiefComplaints || !diagnosis) {
      return setError('Chief Complaints and Diagnosis are required.');
    }

    // Filter out empty prescription items
    const validItems = prescriptionItems.filter(item => item.medicineName);

    try {
      setError('');
      setSuccess('');
      setLoading(true);

      const payload = {
        appointmentId: selectedAppt.id,
        chiefComplaints,
        diagnosis,
        clinicalNotes,
        prescription: validItems.length > 0 ? {
          notes: prescNotes,
          items: validItems
        } : null,
        labOrders: labOrders,
        ultrasoundOrders: ultrasoundOrders
      };

      await api.post('/consultations', payload);
      
      setSuccess('Consultation submitted and saved successfully.');
      setSelectedAppt(null);
      fetchQueue();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit consultation');
    } finally {
      setLoading(false);
    }
  };

  const standardLabs = ['Complete Blood Count (CBC)', 'Random Blood Sugar (RBS)', 'Serum Creatinine', 'Lipid Profile', 'Liver Function Test (LFT)'];
  const standardUltrasounds = ['US Abdomen & Pelvis', 'US Thyroid', 'US KUB (Kidneys & Bladder)', 'US Obstetric Scan'];

  const sidebarItems = [
    { name: 'Consultation Desk', href: '/doctor', icon: Stethoscope },
  ];

  return (
    <PortalLayout title="Doctor Consultation Workspace" sidebarItems={sidebarItems}>
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

      {/* Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Patient Queue Panel */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col h-[calc(100vh-180px)] overflow-hidden">
          <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-cyan-400" />
            Patient Queue
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 font-bold">
              {queue.length} left
            </span>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {queue.map((appt) => (
              <button
                key={appt.id}
                onClick={() => loadAppointment(appt)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedAppt?.id === appt.id 
                    ? 'bg-cyan-500/10 border-cyan-400/50 shadow-lg shadow-cyan-500/5' 
                    : 'bg-slate-900 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700/50'
                }`}
              >
                <div className="font-semibold text-slate-200 truncate">{appt.patient?.fullName}</div>
                <div className="flex items-center justify-between text-xs mt-1.5">
                  <span className="font-mono text-cyan-400 font-bold">{appt.patient?.mrn}</span>
                  <span className="text-slate-500 font-medium">Checked-in: {new Date(appt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </button>
            ))}

            {queue.length === 0 && (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                <ClipboardList className="w-8 h-8 text-slate-700 mx-auto" />
                <p className="text-slate-400 text-xs mt-3">Consultation queue is empty.</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Work Area */}
        <div className="lg:col-span-3">
          {selectedAppt ? (
            <div className="space-y-6">
              {/* Selected Patient banner */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col md:flex-row gap-4 justify-between md:items-center">
                <div>
                  <h4 className="font-bold text-slate-100 text-xl">{selectedAppt.patient?.fullName}</h4>
                  <div className="flex flex-wrap gap-4 text-xs mt-2 text-slate-400 font-semibold uppercase">
                    <span>MRN: <span className="font-mono text-cyan-400">{selectedAppt.patient?.mrn}</span></span>
                    <span>Gender: <span className="text-slate-200">{selectedAppt.patient?.gender}</span></span>
                    <span>DOB: <span className="text-slate-200">{selectedAppt.patient?.dateOfBirth}</span></span>
                    <span>Phone: <span className="text-slate-200">{selectedAppt.patient?.phone}</span></span>
                  </div>
                </div>

                {/* Vitals summary preview */}
                {selectedAppt.vitals && (
                  <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-xs grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 md:w-auto">
                    <div>BP: <span className="font-bold text-slate-200">{selectedAppt.vitals.systolicBP}/{selectedAppt.vitals.diastolicBP}</span></div>
                    <div>Pulse: <span className="font-bold text-slate-200">{selectedAppt.vitals.pulse} bpm</span></div>
                    <div>Temp: <span className="font-bold text-slate-200">{selectedAppt.vitals.temperature} °C</span></div>
                    <div>SpO2: <span className="font-bold text-slate-200">{selectedAppt.vitals.spo2}%</span></div>
                  </div>
                )}
              </div>

              {/* Consultation and History subtabs */}
              <div className="flex border-b border-slate-800 gap-4">
                <button
                  onClick={() => setActiveSubTab('consult')}
                  className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                    activeSubTab === 'consult' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  Active Checkup
                </button>
                <button
                  onClick={() => setActiveSubTab('history')}
                  className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                    activeSubTab === 'history' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Clinical History ({history.length})
                </button>
              </div>

              {activeSubTab === 'consult' ? (
                <form onSubmit={handleSubmitConsultation} className="space-y-6">
                  {/* Consultation section */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
                    <h3 className="text-base font-bold text-slate-200 border-b border-slate-850 pb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      Consultation Records
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Chief Complaints</label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Patient complains of acute chest pain, persistent coughing..."
                          value={chiefComplaints}
                          onChange={(e) => setChiefComplaints(e.target.value)}
                          className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Clinical Examination Notes</label>
                        <textarea
                          rows={3}
                          placeholder="Chest clear on auscultation, regular rhythm..."
                          value={clinicalNotes}
                          onChange={(e) => setClinicalNotes(e.target.value)}
                          className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Clinical Diagnosis</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Acute Bronchitis, Hypertension"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Prescription pad */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
                    <h3 className="text-base font-bold text-slate-200 border-b border-slate-850 pb-2 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-emerald-400 animate-pulse" />
                      Prescription Pad
                    </h3>

                    <div className="space-y-4">
                      {prescriptionItems.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end p-4 rounded-xl border border-slate-800 bg-slate-850/30">
                          <div className="sm:col-span-1.5">
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Drug Name</label>
                            <input
                              type="text"
                              placeholder="Paracetamol"
                              value={item.medicineName}
                              onChange={(e) => handleItemChange(idx, 'medicineName', e.target.value)}
                              className="block w-full rounded-lg border border-slate-700 bg-slate-800/40 py-1.5 px-2 text-slate-100 text-xs focus:border-cyan-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Dose / Strength</label>
                            <input
                              type="text"
                              placeholder="500 mg"
                              value={item.dosage}
                              onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                              className="block w-full rounded-lg border border-slate-700 bg-slate-800/40 py-1.5 px-2 text-slate-100 text-xs focus:border-cyan-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Frequency</label>
                            <input
                              type="text"
                              placeholder="1-0-1 (BID)"
                              value={item.frequency}
                              onChange={(e) => handleItemChange(idx, 'frequency', e.target.value)}
                              className="block w-full rounded-lg border border-slate-700 bg-slate-800/40 py-1.5 px-2 text-slate-100 text-xs focus:border-cyan-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Duration</label>
                            <input
                              type="text"
                              placeholder="5 days"
                              value={item.duration}
                              onChange={(e) => handleItemChange(idx, 'duration', e.target.value)}
                              className="block w-full rounded-lg border border-slate-700 bg-slate-800/40 py-1.5 px-2 text-slate-100 text-xs focus:border-cyan-500 focus:outline-none"
                            />
                          </div>

                          <div className="flex gap-2 items-center">
                            <div className="flex-grow">
                              <label className="block text-[10px] font-semibold text-slate-400 mb-1">Instructions</label>
                              <input
                                type="text"
                                placeholder="After food"
                                value={item.instructions}
                                onChange={(e) => handleItemChange(idx, 'instructions', e.target.value)}
                                className="block w-full rounded-lg border border-slate-700 bg-slate-800/40 py-1.5 px-2 text-slate-100 text-xs focus:border-cyan-500 focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removePrescriptionItem(idx)}
                              disabled={prescriptionItems.length === 1}
                              className="mt-5 p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg disabled:opacity-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addPrescriptionItem}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                      >
                        <Plus className="w-4 h-4" /> Add Medication
                      </button>

                      <div className="pt-2">
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Additional Pharmacist Notes</label>
                        <input
                          type="text"
                          placeholder="Drink plenty of fluids..."
                          value={prescNotes}
                          onChange={(e) => setPrescNotes(e.target.value)}
                          className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Diagnostics test orders */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Lab requests */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
                      <h3 className="text-base font-bold text-slate-200 border-b border-slate-850 pb-2 flex items-center gap-2">
                        <FlaskConical className="w-5 h-5 text-amber-400" />
                        Order Laboratory Tests
                      </h3>
                      <div className="space-y-2">
                        {standardLabs.map((lab) => (
                          <label key={lab} className="flex items-center gap-2.5 text-sm font-medium text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={labOrders.includes(lab)}
                              onChange={() => handleLabToggle(lab)}
                              className="rounded text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-700"
                            />
                            <span>{lab}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Ultrasound requests */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
                      <h3 className="text-base font-bold text-slate-200 border-b border-slate-850 pb-2 flex items-center gap-2">
                        <Radio className="w-5 h-5 text-purple-400" />
                        Order Ultrasound Scans
                      </h3>
                      <div className="space-y-2">
                        {standardUltrasounds.map((us) => (
                          <label key={us} className="flex items-center gap-2.5 text-sm font-medium text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={ultrasoundOrders.includes(us)}
                              onChange={() => handleUltrasoundToggle(us)}
                              className="rounded text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-700"
                            />
                            <span>{us}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 font-semibold text-sm text-white hover:from-cyan-400 hover:to-indigo-400 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                    >
                      {loading ? 'Submitting Checkup...' : 'Finalize Checkup & Submit'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Patient History Timeline list */
                <div className="space-y-6">
                  {history.length === 0 ? (
                    <div className="rounded-2xl border border-slate-850 bg-slate-900/50 p-12 text-center">
                      <History className="w-10 h-10 text-slate-700 mx-auto" />
                      <h4 className="text-slate-300 font-bold text-base mt-4">No Past Records</h4>
                      <p className="text-slate-500 text-xs mt-1">This patient does not have previous recorded consult entries.</p>
                    </div>
                  ) : (
                    history.map((h) => (
                      <div key={h.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between border-b border-slate-850 pb-3 items-start sm:items-center">
                          <div>
                            <span className="text-xs text-slate-400">Diagnosis Date: {new Date(h.createdAt).toLocaleDateString()}</span>
                            <h4 className="text-base font-bold text-slate-200 mt-0.5">Diagnosed: <span className="text-cyan-400">{h.diagnosis}</span></h4>
                          </div>
                          <span className="text-xs bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full text-slate-400">
                            Dr. ID #{h.doctorId}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h5 className="font-semibold text-slate-400 mb-1">Chief Complaints:</h5>
                            <p className="text-slate-300">{h.chiefComplaints}</p>
                          </div>
                          {h.clinicalNotes && (
                            <div>
                              <h5 className="font-semibold text-slate-400 mb-1">Clinical Notes:</h5>
                              <p className="text-slate-300">{h.clinicalNotes}</p>
                            </div>
                          )}
                        </div>

                        {/* Prescription Items */}
                        {h.prescription && h.prescription.items && h.prescription.items.length > 0 && (
                          <div className="pt-2 border-t border-slate-850">
                            <h5 className="font-semibold text-slate-400 mb-2 text-xs">Prescribed Drugs:</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {h.prescription.items.map((pi: any) => (
                                <div key={pi.id} className="p-3 rounded-lg bg-slate-850/40 border border-slate-800/80 text-xs">
                                  <div className="font-bold text-slate-200">{pi.medicineName} ({pi.dosage})</div>
                                  <div className="text-slate-400 mt-1">Dose: {pi.frequency} for {pi.duration}</div>
                                  {pi.instructions && <div className="text-slate-500 mt-0.5">Note: {pi.instructions}</div>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
              <Stethoscope className="w-12 h-12 text-slate-700 mx-auto" />
              <h4 className="text-slate-300 font-bold text-lg mt-4">Active Consultation Desk</h4>
              <p className="text-slate-500 text-sm mt-1.5 max-w-sm mx-auto">
                Please select a patient from the queue on the left side to begin clinical assessment and write prescriptions.
              </p>
            </div>
          )}
        </div>

      </div>
    </PortalLayout>
  );
}
