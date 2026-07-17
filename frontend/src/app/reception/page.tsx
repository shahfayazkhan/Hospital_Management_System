'use client';

import React, { useState, useEffect } from 'react';
import { PortalLayout } from '@/components/PortalLayout';
import api from '@/utils/api';
import { 
  UserPlus, 
  Search, 
  Calendar, 
  CreditCard, 
  Check, 
  ShieldAlert, 
  Printer, 
  User, 
  Clock, 
  CheckCircle,
  FileText,
  X
} from 'lucide-react';

export default function ReceptionPage() {
  const [activeTab, setActiveTab] = useState<'patients' | 'appointments' | 'billing'>('patients');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data Lists
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  // Search filters
  const [patientSearch, setPatientSearch] = useState('');
  const [apptSearchDate, setApptSearchDate] = useState('');
  
  // Registration Form States
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('MALE');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Appointment Form States
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [consultationFee, setConsultationFee] = useState('50.00');
  const [apptNotes, setApptNotes] = useState('');

  // Billing Receipt Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const fetchPatients = async (query = '') => {
    try {
      const res = await api.get(`/patients?search=${query}`);
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/users/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await api.get(`/appointments${apptSearchDate ? `?date=${apptSearchDate}` : ''}`);
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/billing');
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
    fetchAppointments();
    fetchInvoices();
  }, [apptSearchDate]);

  // Handle Patient Registration
  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !dob || !phone) {
      return setError('Please fill all required patient details.');
    }
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await api.post('/patients', {
        fullName,
        gender,
        dateOfBirth: dob,
        phone,
        address,
        emergencyContact
      });
      setSuccess('Patient registered successfully.');
      setFullName('');
      setDob('');
      setPhone('');
      setAddress('');
      setEmergencyContact('');
      fetchPatients();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  // Handle Booking Appointment
  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDoctorId || !appointmentDate) {
      return setError('Please fill all booking requirements.');
    }
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await api.post('/appointments', {
        patientId: +selectedPatientId,
        doctorId: +selectedDoctorId,
        appointmentDate: appointmentDate,
        consultationFee: parseFloat(consultationFee),
        notes: apptNotes
      });
      setSuccess('Appointment booked successfully.');
      setSelectedPatientId('');
      setSelectedDoctorId('');
      setAppointmentDate('');
      setApptNotes('');
      fetchAppointments();
      fetchInvoices(); // Billing entry is created automatically
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  // Check-in Patient (Sends patient to MO Vitals Queue)
  const handleCheckIn = async (apptId: number) => {
    try {
      setError('');
      setSuccess('');
      await api.put(`/appointments/${apptId}/status`, { status: 'CHECKED_IN' });
      setSuccess('Patient checked in and sent to MO Queue.');
      fetchAppointments();
    } catch (err) {
      setError('Failed to check-in patient');
    }
  };

  // Pay Invoice
  const handlePayInvoice = async (invoiceId: number, method: string) => {
    try {
      setError('');
      setSuccess('');
      const res = await api.put(`/billing/${invoiceId}/pay`, { paymentMethod: method });
      setSuccess('Invoice paid successfully.');
      fetchInvoices();
      setSelectedInvoice(res.data); // Open invoice details view/receipt
    } catch (err) {
      setError('Payment processing failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      case 'CHECKED_IN': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'IN_PROGRESS': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'CANCELLED': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  const sidebarItems = [
    { name: 'Receptionist Desk', href: '/reception', icon: Calendar },
  ];

  return (
    <PortalLayout title="Hospital Reception Workspace" sidebarItems={sidebarItems}>
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

      {/* Tabs bar */}
      <div className="flex border-b border-slate-800 mb-8 gap-4">
        <button
          onClick={() => { setActiveTab('patients'); setError(''); setSuccess(''); }}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'patients' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Patient Registry
        </button>
        <button
          onClick={() => { setActiveTab('appointments'); setError(''); setSuccess(''); }}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'appointments' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Appointments & Check-in
        </button>
        <button
          onClick={() => { setActiveTab('billing'); setError(''); setSuccess(''); }}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'billing' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Billing & Payments
        </button>
      </div>

      {/* Tab Content 1: PATIENT REGISTRY */}
      {activeTab === 'patients' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Form */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-6">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                Register New Patient
              </h3>

              <form onSubmit={handleRegisterPatient} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 placeholder-slate-600 sm:text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="MALE">MALE</option>
                      <option value="FEMALE">FEMALE</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 placeholder-slate-600 sm:text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Emergency Contact Info</label>
                  <input
                    type="text"
                    placeholder="Jane Doe (Spouse) - 555-0188"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 placeholder-slate-600 sm:text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Home Address</label>
                  <textarea
                    rows={2}
                    placeholder="123 Health Ave, Clinic City"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 placeholder-slate-600 sm:text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 py-2.5 px-4 text-sm font-semibold text-white hover:from-cyan-400 hover:to-indigo-400 shadow-md shadow-cyan-500/20 disabled:opacity-55"
                >
                  {loading ? 'Registering...' : 'Register Patient'}
                </button>
              </form>
            </div>
          </div>

          {/* Patients Search / List */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
                <h3 className="text-lg font-bold text-slate-200">Patient Database</h3>
                <div className="relative w-full sm:max-w-xs">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by Name, MRN or Phone..."
                    value={patientSearch}
                    onChange={(e) => { setPatientSearch(e.target.value); fetchPatients(e.target.value); }}
                    className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 pl-9 pr-3 text-slate-100 placeholder-slate-500 sm:text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {patients.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                  <User className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-slate-400 text-sm mt-3">No patient profiles found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">MRN</th>
                        <th className="py-3 px-4">Full Name</th>
                        <th className="py-3 px-4">DOB (Age)</th>
                        <th className="py-3 px-4">Phone</th>
                        <th className="py-3 px-4 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {patients.map((p) => {
                        const age = new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear();
                        return (
                          <tr key={p.id} className="hover:bg-slate-800/20 transition">
                            <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{p.mrn}</td>
                            <td className="py-3.5 px-4 font-medium text-slate-200">{p.fullName}</td>
                            <td className="py-3.5 px-4 text-slate-400">{p.dateOfBirth} ({age} yrs)</td>
                            <td className="py-3.5 px-4 text-slate-300">{p.phone}</td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => {
                                  setSelectedPatientId(p.id.toString());
                                  setActiveTab('appointments');
                                  setError('');
                                  setSuccess('');
                                }}
                                className="text-xs font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-xl transition"
                              >
                                Book Appt
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: APPOINTMENTS & QUEUE */}
      {activeTab === 'appointments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Schedule Appointment
              </h3>

              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Select Patient</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.fullName} ({p.mrn})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Select Doctor</label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    required
                    className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.fullName}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Appointment Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Consult Fee ($)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                      className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Pre-appointment Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Reason for visit, e.g. headache, routine checkup"
                    value={apptNotes}
                    onChange={(e) => setApptNotes(e.target.value)}
                    className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 py-2.5 px-4 text-sm font-semibold text-white hover:from-cyan-400 hover:to-indigo-400 shadow-md shadow-cyan-500/20 disabled:opacity-55"
                >
                  {loading ? 'Booking...' : 'Book Schedule'}
                </button>
              </form>
            </div>
          </div>

          {/* Daily Schedule List */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
                <h3 className="text-lg font-bold text-slate-200">Appointments Schedule</h3>
                <input
                  type="date"
                  value={apptSearchDate}
                  onChange={(e) => setApptSearchDate(e.target.value)}
                  className="block w-full sm:max-w-xs rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                  <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-slate-400 text-sm mt-3">No appointments scheduled for this date selection.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Time</th>
                        <th className="py-3 px-4">Patient (MRN)</th>
                        <th className="py-3 px-4">Doctor Assigned</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {appointments.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-800/20 transition">
                          <td className="py-3.5 px-4 text-slate-300 font-medium">
                            {new Date(a.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-200">{a.patient?.fullName}</div>
                            <div className="text-xs text-cyan-400 font-mono">{a.patient?.mrn}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">{a.doctor?.fullName}</td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${getStatusColor(a.status)}`}>
                              {a.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {a.status === 'SCHEDULED' && (
                              <button
                                onClick={() => handleCheckIn(a.id)}
                                className="text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-xl transition"
                              >
                                Check In
                              </button>
                            )}
                            {a.status === 'CHECKED_IN' && (
                              <span className="text-xs text-slate-500 font-medium">In MO Queue</span>
                            )}
                            {a.status === 'IN_PROGRESS' && (
                              <span className="text-xs text-amber-400 font-medium">With Doctor</span>
                            )}
                            {a.status === 'COMPLETED' && (
                              <span className="text-xs text-emerald-400 font-semibold flex items-center justify-end gap-1">
                                <CheckCircle className="w-4 h-4" /> Completed
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: BILLING & CASHIER */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cyan-400" />
              Cashier & Billing Registry
            </h3>

            {invoices.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                <CreditCard className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-slate-400 text-sm mt-3">No billing entries found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Invoice ID</th>
                      <th className="py-3 px-4">Patient Name (MRN)</th>
                      <th className="py-3 px-4">Consultation Cost</th>
                      <th className="py-3 px-4">Billing Status</th>
                      <th className="py-3 px-4">Method Used</th>
                      <th className="py-3 px-4 text-right">Receipt Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-800/20 transition">
                        <td className="py-3.5 px-4 font-mono text-slate-400">#INV-00{inv.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-200">{inv.patient?.fullName}</div>
                          <div className="text-xs font-mono text-cyan-400">{inv.patient?.mrn}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-200">${inv.totalAmount}</td>
                        <td className="py-3.5 px-4">
                          {inv.status === 'PAID' ? (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                              PAID
                            </span>
                          ) : (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/25">
                              UNPAID
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">{inv.paymentMethod || '—'}</td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {inv.status === 'UNPAID' ? (
                            <div className="inline-flex gap-1.5">
                              <button
                                onClick={() => handlePayInvoice(inv.id, 'CASH')}
                                className="text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/25 px-2.5 py-1.5 rounded-xl transition"
                              >
                                Pay Cash
                              </button>
                              <button
                                onClick={() => handlePayInvoice(inv.id, 'CARD')}
                                className="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/25 px-2.5 py-1.5 rounded-xl transition"
                              >
                                Pay Card
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setSelectedInvoice(inv)}
                              className="inline-flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 transition"
                            >
                              <Printer className="w-3.5 h-3.5" /> View Receipt
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cashier Receipt Modal View */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h4 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Medical Transaction Receipt
              </h4>
              <button 
                onClick={() => setSelectedInvoice(null)} 
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Invoice Number:</span>
                <span className="font-mono text-slate-200">#INV-00{selectedInvoice.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Patient Full Name:</span>
                <span className="font-semibold text-slate-200">{selectedInvoice.patient?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Medical Record No:</span>
                <span className="font-mono font-bold text-cyan-400">{selectedInvoice.patient?.mrn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Status:</span>
                <span className="text-xs font-bold text-emerald-400 uppercase">Paid</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Settled Method:</span>
                <span className="font-medium text-slate-200">{selectedInvoice.paymentMethod}</span>
              </div>
              <div className="border-t border-slate-800/80 my-4 pt-4 flex justify-between items-center">
                <span className="text-base font-bold text-slate-300">Total Consult Fee:</span>
                <span className="text-xl font-black text-cyan-400">${selectedInvoice.totalAmount}</span>
              </div>
            </div>

            <button
              onClick={() => { alert('Receipt print command triggered'); setSelectedInvoice(null); }}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold text-sm rounded-xl hover:from-cyan-400 hover:to-indigo-400 transition"
            >
              Print Receipt Slip
            </button>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
