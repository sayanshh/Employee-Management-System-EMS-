'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Database,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { isSupabaseConfigured } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { role, user } = useAuth();

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'employee'],
      badge: null,
    },
    {
      title: 'Employees',
      href: '/employees',
      icon: Users,
      roles: ['admin', 'employee'],
      badge: role === 'admin' ? '14' : null,
    },
    {
      title: 'Attendance & Leaves',
      href: '/attendance',
      icon: CalendarCheck,
      roles: ['admin', 'employee'],
      badge: role === 'admin' ? '3 Pending' : null,
    },
    {
      title: 'Payroll',
      href: '/payroll',
      icon: CreditCard,
      roles: ['admin', 'employee'],
      badge: role === 'admin' ? 'Q4' : null,
    },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-slate-200/90 bg-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm',
          collapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4 bg-slate-50/50">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 overflow-hidden transition-all duration-200 hover:opacity-95 active:scale-[0.98]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 transition-transform duration-200 hover:scale-105">
              <Building2 className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-slate-900 text-base leading-none">
                  EMS Core
                </span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Enterprise Workspace
                </span>
              </div>
            )}
          </Link>

          {/* Collapse toggle (desktop only) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-[6px] border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Current Role Banner */}
        <div className="p-3">
          <div
            className={cn(
              'rounded-[10px] border border-slate-200/80 bg-gradient-to-br from-slate-50 to-indigo-50/30 p-2.5 transition-all duration-200 hover:border-indigo-200',
              collapsed && 'px-2 flex justify-center'
            )}
          >
            <div className="flex items-center gap-2.5">
              {role === 'admin' ? (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-violet-100 text-violet-700 border border-violet-200/80 font-bold">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              ) : (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-emerald-100 text-emerald-700 border border-emerald-200/80 font-bold">
                  <UserCheck className="h-4 w-4" />
                </div>
              )}
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                    {role === 'admin' ? 'Administrator' : 'Employee Portal'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate font-medium">
                    {user?.name || (role === 'admin' ? 'Priya Iyer' : 'Sayansh Kulshreshtha')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 space-y-1.5 px-3 py-2 overflow-y-auto">
          {!collapsed && (
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </p>
          )}
          {filteredNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  'group flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-xs font-semibold transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]',
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 border border-indigo-500/30'
                    : 'text-slate-600 hover:bg-indigo-50/70 hover:text-indigo-600 hover:translate-x-0.5 border border-transparent',
                  collapsed && 'justify-center px-2 hover:translate-x-0'
                )}
                title={collapsed ? item.title : undefined}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-all duration-200 group-hover:scale-110',
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-600'
                  )}
                />
                {!collapsed && (
                  <span className="flex-1 truncate">{item.title}</span>
                )}
                {!collapsed && item.badge && (
                  <span
                    className={cn(
                      'ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold transition-transform duration-200 group-hover:scale-105',
                      isActive
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Data Layer Status Indicator */}
        <div className="border-t border-slate-200/80 p-3 bg-slate-50/50">
          <div
            className={cn(
              'flex items-center gap-2 rounded-[8px] bg-white border border-slate-200/80 px-3 py-2 text-xs shadow-sm',
              collapsed && 'justify-center px-2'
            )}
          >
            <div className="relative">
              <Database className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-[11px] font-semibold text-slate-800">
                  {isSupabaseConfigured ? 'Supabase Database' : 'Local State Engine'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {isSupabaseConfigured ? 'Live Cloud Connected' : 'Persistent Storage Active'}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
