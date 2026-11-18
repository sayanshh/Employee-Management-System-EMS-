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
          'fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-[#eceae4] bg-[#f7f4ed] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          collapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#eceae4] px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 overflow-hidden transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-[#1c1c1c] text-[#fcfbf8] shadow-button-inset transition-transform duration-200 hover:scale-105">
              <Building2 className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-semibold tracking-[-0.5px] text-[#1c1c1c] text-base leading-none">
                  EMS Core
                </span>
                <span className="text-[11px] text-[#5f5f5d] flex items-center gap-1.5 mt-1 font-normal">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1c1c1c] opacity-80 animate-pulse" />
                  Enterprise Workspace
                </span>
              </div>
            )}
          </Link>

          {/* Collapse toggle (desktop only) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] text-[#5f5f5d] hover:text-[#1c1c1c] hover:bg-[rgba(28,28,28,0.04)] transition-all duration-200 hover:scale-105 active:scale-95"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Current Role Banner */}
        <div className="p-3">
          <div
            className={cn(
              'rounded-[8px] border border-[#eceae4] bg-[#f7f4ed] px-3 py-2.5 transition-all duration-200 hover:border-[rgba(28,28,28,0.2)]',
              collapsed && 'px-2 flex justify-center'
            )}
          >
            <div className="flex items-center gap-2.5">
              {role === 'admin' ? (
                <ShieldCheck className="h-4 w-4 text-[#1c1c1c] shrink-0" />
              ) : (
                <UserCheck className="h-4 w-4 text-[#1c1c1c] shrink-0" />
              )}
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#1c1c1c] tracking-tight">
                    {role === 'admin' ? 'Administrator' : 'Employee Portal'}
                  </p>
                  <p className="text-[11px] text-[#5f5f5d] truncate">
                    {user?.name || (role === 'admin' ? 'Priya Iyer' : 'Sayansh Kulshreshtha')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
          {!collapsed && (
            <p className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-[#5f5f5d]">
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
                  'group flex items-center gap-3 rounded-[6px] px-3 py-2 text-sm transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]',
                  isActive
                    ? 'bg-[#eceae4] text-[#1c1c1c] font-medium border border-[#eceae4] shadow-sm'
                    : 'text-[#5f5f5d] hover:bg-[rgba(28,28,28,0.04)] hover:text-[#1c1c1c] hover:translate-x-0.5',
                  collapsed && 'justify-center px-2 hover:translate-x-0'
                )}
                title={collapsed ? item.title : undefined}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-all duration-200 group-hover:scale-110',
                    isActive ? 'text-[#1c1c1c]' : 'text-[#5f5f5d] group-hover:text-[#1c1c1c]'
                  )}
                />
                {!collapsed && (
                  <span className="flex-1 truncate">{item.title}</span>
                )}
                {!collapsed && item.badge && (
                  <span className="ml-auto rounded-full px-2 py-0.5 text-[11px] font-medium border border-[#eceae4] bg-[#f7f4ed] text-[#1c1c1c] transition-transform duration-200 group-hover:scale-105">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Data Layer Status Indicator */}
        <div className="border-t border-[#eceae4] p-3">
          <div
            className={cn(
              'flex items-center gap-2 rounded-[8px] bg-[#f7f4ed] border border-[#eceae4] px-3 py-2 text-xs text-[#5f5f5d]',
              collapsed && 'justify-center px-2'
            )}
          >
            <Database className="h-3.5 w-3.5 text-[#1c1c1c] shrink-0" />
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-[11px] font-medium text-[#1c1c1c]">
                  {isSupabaseConfigured ? 'Supabase Database' : 'Local State Engine'}
                </span>
                <span className="text-[10px] text-[#5f5f5d]">
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
