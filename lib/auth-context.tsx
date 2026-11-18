'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, UserRole } from '@/types';
import { INITIAL_EMPLOYEES } from './mock-data';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  loginAs: (role: UserRole) => void;
  switchRole: () => void;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'emq_auth_user_v2';

export const DEMO_ADMIN_USER: User = {
  id: 'user-hr',
  email: 'priya.iyer@company.com',
  name: 'Priya Iyer',
  role: 'admin',
  employeeId: 'emp-2',
  department: 'Human Resources',
  designation: 'Head of People & Culture',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
};

export const DEMO_EMPLOYEE_USER: User = {
  id: 'user-emp-3',
  email: 'sayansh.kulshreshtha@company.com',
  name: 'Sayansh Kulshreshtha',
  role: 'employee',
  employeeId: 'emp-3',
  department: 'Engineering',
  designation: 'Senior Software Engineer',
  avatarUrl: '/avatars/sayansh.jpg',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Default to demo admin for frictionless first preview
        setUser(DEMO_ADMIN_USER);
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_ADMIN_USER));
      }
    } catch (e) {
      console.error('Error loading stored user:', e);
      setUser(DEMO_ADMIN_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, _password?: string): Promise<boolean> => {
    setIsLoading(true);
    // Find matching employee or match demo keywords
    const lowerEmail = email.toLowerCase().trim();
    let foundUser: User | null = null;

    if (lowerEmail.includes('admin') || lowerEmail.includes('priya') || lowerEmail.includes('aarav')) {
      foundUser = DEMO_ADMIN_USER;
    } else if (lowerEmail.includes('employee') || lowerEmail.includes('sayansh') || lowerEmail.includes('rohan')) {
      foundUser = DEMO_EMPLOYEE_USER;
    } else {
      const emp = INITIAL_EMPLOYEES.find((e) => e.email.toLowerCase() === lowerEmail);
      if (emp) {
        foundUser = {
          id: emp.userId || `user-${emp.id}`,
          email: emp.email,
          name: emp.fullName,
          role: emp.role,
          employeeId: emp.id,
          department: emp.departmentName,
          designation: emp.designation,
          avatarUrl: emp.avatarUrl,
        };
      } else {
        // Fallback demo user
        foundUser = {
          id: `user-${Date.now()}`,
          email: lowerEmail,
          name: lowerEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          role: 'employee',
          employeeId: 'emp-4',
          department: 'Engineering',
          designation: 'Senior Frontend Developer',
          avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
        };
      }
    }

    setUser(foundUser);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(foundUser));
    setIsLoading(false);
    router.push('/dashboard');
    return true;
  };

  const loginAs = (targetRole: UserRole) => {
    const selected = targetRole === 'admin' ? DEMO_ADMIN_USER : DEMO_EMPLOYEE_USER;
    setUser(selected);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(selected));
    router.push('/dashboard');
  };

  const switchRole = () => {
    const nextRole: UserRole = user?.role === 'admin' ? 'employee' : 'admin';
    const nextUser = nextRole === 'admin' ? DEMO_ADMIN_USER : DEMO_EMPLOYEE_USER;
    setUser(nextUser);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    router.push('/login');
  };

  const role: UserRole = user?.role || 'employee';
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        loginAs,
        switchRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

