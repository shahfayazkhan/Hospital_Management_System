'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  FileText, 
  Activity, 
  FlaskConical, 
  Radio, 
  CreditCard, 
  LogOut, 
  Menu, 
  X,
  Stethoscope
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

interface PortalLayoutProps {
  title: string;
  sidebarItems: SidebarItem[];
  children: React.ReactNode;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({ title, sidebarItems, children }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const getRoleColorBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'RECEPTIONIST': return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      case 'MEDICAL_OFFICER': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'DOCTOR': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'LAB_TECHNICIAN': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'ULTRASOUND_TECHNICIAN': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo Section */}
          <div className="flex items-center flex-shrink-0 px-6 gap-3">
            <Stethoscope className="w-8 h-8 text-cyan-400 animate-pulse" />
            <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              MEDICFLOW
            </span>
          </div>

          {/* User Info Card */}
          <div className="mx-4 my-6 p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
            <h4 className="font-semibold text-slate-200 truncate">{user?.fullName}</h4>
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleColorBadge(user?.role)}`}>
              {user?.role?.replace('_', ' ')}
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-3 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 text-cyan-400 border-l-4 border-cyan-400' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="flex-shrink-0 flex border-t border-slate-800 p-4">
          <button
            onClick={logout}
            className="group flex items-center w-full px-4 py-3 text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-all duration-200"
          >
            <LogOut className="mr-3 h-5 w-5 text-slate-400 group-hover:text-rose-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Header & Menu */}
      <div className="flex flex-col md:pl-64 flex-1">
        <header className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 justify-between items-center">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-md text-slate-400 hover:text-slate-200 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>

          <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-100">
            {title}
          </h1>

          {/* Desktop Right Info */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-slate-400 text-sm">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 py-6 px-4 md:px-8">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay Background */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Mobile Sidebar Content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 border-r border-slate-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="flex-grow pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-6 gap-3">
                <Stethoscope className="w-8 h-8 text-cyan-400" />
                <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                  MEDICFLOW
                </span>
              </div>

              <div className="mx-4 my-6 p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
                <h4 className="font-semibold text-slate-200 truncate">{user?.fullName}</h4>
                <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleColorBadge(user?.role)}`}>
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>

              <nav className="px-2 space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 text-cyan-400 border-l-4 border-cyan-400' 
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex-shrink-0 flex border-t border-slate-800 p-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="group flex items-center w-full px-4 py-3 text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-all duration-200"
              >
                <LogOut className="mr-3 h-5 w-5 text-slate-400 group-hover:text-rose-400" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
