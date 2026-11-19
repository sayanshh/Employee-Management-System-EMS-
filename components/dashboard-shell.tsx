'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  requiredRole?: 'admin' | 'employee';
}

export function DashboardShell({
  children,
  title = 'Dashboard',
  requiredRole,
}: DashboardShellProps) {
  const { user, role, isLoading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
          <p className="text-xs font-medium text-slate-500">Loading EMS Core...</p>
        </div>
      </div>
    );
  }

  // RBAC Access Guard
  if (requiredRole === 'admin' && role !== 'admin') {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar
          isMobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
          <Topbar
            title="Access Restricted"
            onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="max-w-md w-full rounded-[16px] border border-slate-200 bg-white p-8 text-center shadow-lg">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[12px] bg-rose-50 border border-rose-200 text-rose-600 mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Administrator Access Required
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                This management section is reserved for HR Managers and Company Administrators. Use the Topbar role switcher to switch to the Admin persona.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="lovable-button-primary text-xs"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex relative selection:bg-indigo-500 selection:text-white">
      {/* Subtle ambient decorative gradient glows */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-indigo-500/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-1/3 w-96 h-96 bg-violet-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      {/* Sidebar */}
      <Sidebar
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64 transition-all duration-300">
        <Topbar
          title={title}
          onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
