'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Stethoscope, Lock, User, AlertCircle, Key } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      return setError('Please enter both username and password.');
    }
    setError('');
    setLoading(true);
    const success = await login(username, password);
    setLoading(false);
    if (!success) {
      setError('Invalid username or password. Please try again.');
    }
  };

  const handleQuickFill = (roleUser: string, rolePass: string) => {
    setUsername(roleUser);
    setPassword(rolePass);
    setError('');
  };

  const quickRoles = [
    { name: 'Admin Portal', user: 'admin', pass: 'admin123', color: 'border-rose-500/20 text-rose-400 bg-rose-950/10 hover:bg-rose-500/10' },
    { name: 'Receptionist', user: 'reception', pass: 'reception123', color: 'border-cyan-500/20 text-cyan-400 bg-cyan-950/10 hover:bg-cyan-500/10' },
    { name: 'Medical Officer', user: 'mo', pass: 'mo123', color: 'border-indigo-500/20 text-indigo-400 bg-indigo-950/10 hover:bg-indigo-500/10' },
    { name: 'Doctor Panel', user: 'doctor', pass: 'doctor123', color: 'border-emerald-500/20 text-emerald-400 bg-emerald-950/10 hover:bg-emerald-500/10' },
    { name: 'Laboratory', user: 'lab', pass: 'lab123', color: 'border-amber-500/20 text-amber-400 bg-amber-950/10 hover:bg-amber-500/10' },
    { name: 'Ultrasound', user: 'ultrasound', pass: 'ultrasound123', color: 'border-purple-500/20 text-purple-400 bg-purple-950/10 hover:bg-purple-500/10' },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background aesthetic decoratives */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg space-y-8 z-10">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 shadow-lg shadow-cyan-500/20">
            <Stethoscope className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            MEDICFLOW PORTAL
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Secure Role-Based access to Hospital Management modules
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-8 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-500/15 border border-rose-500/20 px-4 py-3 text-sm text-rose-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <User className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2.5 pl-10 pr-3 text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 sm:text-sm transition-all"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2.5 pl-10 pr-3 text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 sm:text-sm transition-all"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 py-3 px-4 text-sm font-semibold text-white hover:from-cyan-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Quick-fill section */}
          <div className="mt-8 border-t border-slate-800/60 pt-6">
            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Key className="h-4 w-4" />
              <span>Quick Test Access Logins</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {quickRoles.map((role) => (
                <button
                  key={role.name}
                  type="button"
                  onClick={() => handleQuickFill(role.user, role.pass)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center ${role.color}`}
                >
                  <span className="text-xs font-bold">{role.name}</span>
                  <span className="text-[10px] opacity-70 mt-1">User: {role.user}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
