'use client';

import { useAuth } from '@/context/AuthContext';
import { Stethoscope } from 'lucide-react';

export default function Home() {
  const { loading } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <div className="text-center space-y-4">
        <Stethoscope className="mx-auto h-12 w-12 text-cyan-400 animate-spin" />
        <p className="text-sm font-semibold tracking-wide text-slate-400 uppercase">
          Loading Medicflow System...
        </p>
      </div>
    </div>
  );
}
