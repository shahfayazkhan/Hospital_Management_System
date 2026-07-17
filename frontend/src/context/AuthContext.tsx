'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '../utils/api';

interface User {
  id: number;
  username: string;
  fullName: string;
  role: 'ADMIN' | 'RECEPTIONIST' | 'MEDICAL_OFFICER' | 'DOCTOR' | 'LAB_TECHNICIAN' | 'ULTRASOUND_TECHNICIAN';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedToken = localStorage.getItem('hms_token');
    const storedUser = localStorage.getItem('hms_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Handle route guards based on roles
  useEffect(() => {
    if (loading) return;

    if (!token) {
      if (pathname !== '/login') {
        router.push('/login');
      }
      return;
    }

    if (pathname === '/login' || pathname === '/') {
      // Redirect to appropriate dashboard based on user role
      redirectBasedOnRole(user?.role);
    } else {
      // Basic route validation
      const role = user?.role;
      const matchPrefix = pathname.split('/')[1]; // 'admin', 'reception', 'mo', 'doctor', 'laboratory', 'ultrasound'
      
      const rolePathMap: Record<string, string> = {
        ADMIN: 'admin',
        RECEPTIONIST: 'reception',
        MEDICAL_OFFICER: 'mo',
        DOCTOR: 'doctor',
        LAB_TECHNICIAN: 'laboratory',
        ULTRASOUND_TECHNICIAN: 'ultrasound',
      };

      if (role && rolePathMap[role] !== matchPrefix) {
        // Mismatch role routing, redirect back to their portal
        redirectBasedOnRole(role);
      }
    }
  }, [token, user, pathname, loading]);

  const redirectBasedOnRole = (role?: string) => {
    if (!role) return router.push('/login');
    switch (role) {
      case 'ADMIN':
        router.push('/admin');
        break;
      case 'RECEPTIONIST':
        router.push('/reception');
        break;
      case 'MEDICAL_OFFICER':
        router.push('/mo');
        break;
      case 'DOCTOR':
        router.push('/doctor');
        break;
      case 'LAB_TECHNICIAN':
        router.push('/laboratory');
        break;
      case 'ULTRASOUND_TECHNICIAN':
        router.push('/ultrasound');
        break;
      default:
        router.push('/login');
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login', { username, password });
      
      if (response.data.access_token) {
        const { access_token, user } = response.data;
        localStorage.setItem('hms_token', access_token);
        localStorage.setItem('hms_user', JSON.stringify(user));
        setToken(access_token);
        setUser(user);
        redirectBasedOnRole(user.role);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
