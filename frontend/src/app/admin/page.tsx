'use client';

import React, { useState, useEffect } from 'react';
import { PortalLayout } from '@/components/PortalLayout';
import api from '@/utils/api';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  ShieldAlert, 
  Activity,
  UserCheck
} from 'lucide-react';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('DOCTOR');
  const [isActive, setIsActive] = useState(true);
  
  // Editing State
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
      setError('');
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !fullName) {
      return setError('Please fill all required fields.');
    }
    try {
      setError('');
      setSuccess('');
      await api.post('/users', { username, password, fullName, role, isActive });
      setSuccess('User created successfully.');
      setUsername('');
      setPassword('');
      setFullName('');
      setRole('DOCTOR');
      setIsActive(true);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      await api.put(`/users/${editingUser.id}`, {
        fullName: editingUser.fullName,
        role: editingUser.role,
        isActive: editingUser.isActive,
        password: editingUser.password || undefined // Only update if typed
      });
      setSuccess('User updated successfully.');
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      setError('');
      await api.delete(`/users/${id}`);
      setSuccess('User deleted successfully.');
      fetchUsers();
    } catch (err: any) {
      setError('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const sidebarItems = [
    { name: 'User Management', href: '/admin', icon: Users },
  ];

  // Calculated Stats
  const totalStaff = users.length;
  const activeDoctors = users.filter(u => u.role === 'DOCTOR' && u.isActive).length;
  const activeCount = users.filter(u => u.isActive).length;

  return (
    <PortalLayout title="Hospital Administration Panel" sidebarItems={sidebarItems}>
      {/* Top Banner stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Total Registered Staff</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-100">{totalStaff}</p>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Active Doctors</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-400">{activeDoctors}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Activity className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Active Sessions</p>
            <p className="mt-2 text-3xl font-extrabold text-indigo-400">{activeCount}</p>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main split display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Create Form or Edit Form */}
        <div className="lg:col-span-1">
          {editingUser ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-cyan-400" />
                  Edit User Account
                </h3>
                <button onClick={() => setEditingUser(null)} className="text-slate-500 hover:text-slate-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Username (Unchangeable)</label>
                  <input
                    type="text"
                    disabled
                    value={editingUser.username}
                    className="block w-full rounded-xl border border-slate-700 bg-slate-800/20 py-2 px-3 text-slate-400 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingUser.fullName}
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Password (Leave blank to keep same)</label>
                  <input
                    type="password"
                    placeholder="New password"
                    value={editingUser.password || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Hospital Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="RECEPTIONIST">RECEPTIONIST</option>
                    <option value="MEDICAL_OFFICER">MEDICAL OFFICER (MO)</option>
                    <option value="DOCTOR">DOCTOR (MD)</option>
                    <option value="LAB_TECHNICIAN">LAB TECHNICIAN</option>
                    <option value="ULTRASOUND_TECHNICIAN">ULTRASOUND TECHNICIAN</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="edit-active"
                    checked={editingUser.isActive}
                    onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                    className="rounded text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-700"
                  />
                  <label htmlFor="edit-active" className="text-sm font-semibold text-slate-300">Account Active</label>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 py-2.5 px-4 text-sm font-semibold text-white hover:from-cyan-400 hover:to-indigo-400 shadow-md shadow-cyan-500/20"
                >
                  Save Account Updates
                </button>
              </form>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-6">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                Register Staff Account
              </h3>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Samuel Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="samuelsmith"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Hospital Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 sm:text-sm focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="RECEPTIONIST">RECEPTIONIST</option>
                    <option value="MEDICAL_OFFICER">MEDICAL OFFICER (MO)</option>
                    <option value="DOCTOR">DOCTOR (MD)</option>
                    <option value="LAB_TECHNICIAN">LAB TECHNICIAN</option>
                    <option value="ULTRASOUND_TECHNICIAN">ULTRASOUND TECHNICIAN</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="new-active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-cyan-500 focus:ring-cyan-500 bg-slate-800 border-slate-700"
                  />
                  <label htmlFor="new-active" className="text-sm font-semibold text-slate-300">Account Active</label>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 py-2.5 px-4 text-sm font-semibold text-white hover:from-cyan-400 hover:to-indigo-400 shadow-md shadow-cyan-500/20"
                >
                  Create User
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Users Table / Search list */}
        <div className="lg:col-span-2 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
              <Check className="w-5 h-5" />
              <span>{success}</span>
            </div>
          )}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
              <h3 className="text-lg font-bold text-slate-200">Registered Accounts</h3>
              <input
                type="text"
                placeholder="Search staff by name, user or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full sm:max-w-xs rounded-xl border border-slate-700 bg-slate-800/40 py-2 px-3 text-slate-100 placeholder-slate-500 sm:text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-400 text-sm mt-3">Loading users list...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                <Users className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-slate-400 text-sm mt-3">No matching accounts found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Full Name</th>
                      <th className="py-3 px-4">Username</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/20 transition">
                        <td className="py-3.5 px-4 font-medium text-slate-200">{u.fullName}</td>
                        <td className="py-3.5 px-4 text-slate-400">{u.username}</td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {u.isActive ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => setEditingUser({ ...u, password: '' })}
                            className="inline-flex p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="inline-flex p-1.5 bg-slate-800 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
    </PortalLayout>
  );
}
