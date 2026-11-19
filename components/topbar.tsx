'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { DataService } from '@/lib/data-service';
import {
  Menu,
  ChevronDown,
  ArrowLeftRight,
  LogOut,
  Shield,
  User,
  RotateCcw,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopbarProps {
  onMenuToggle: () => void;
  title?: string;
}

export function Topbar({ onMenuToggle, title = 'Overview' }: TopbarProps) {
  const { user, role, switchRole, loginAs, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResetData = () => {
    if (confirm('Reset all mock employee, attendance, and leave data to initial state?')) {
      setResetting(true);
      DataService.resetToDefaultData();
      setTimeout(() => {
        setResetting(false);
        window.location.reload();
      }, 400);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-4 sm:px-6 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-[6px] border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Page title & subtext */}
        <div>
          <h1 className="text-base font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="text-xs text-slate-500 hidden sm:block font-medium">
            {role === 'admin' ? 'Organizational Roster & Operations' : 'Personal Timecard & Workspace'}
          </p>
        </div>
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Role Switcher */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 rounded-[8px] border-1.5 border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 px-3 py-1.5 text-xs font-semibold text-indigo-900 shadow-sm hover:border-indigo-300 active:scale-[0.98] transition-all duration-200"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-indigo-600" />
            <span className="capitalize">{role === 'admin' ? 'Role: Admin' : 'Role: Employee'}</span>
            <ChevronDown className="h-3 w-3 text-indigo-600/70 transition-transform duration-200" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-[14px] border border-slate-200 bg-white p-1.5 shadow-xl z-50 animate-scale-in">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Switch Persona
              </div>
              <button
                onClick={() => {
                  loginAs('admin');
                  setRoleDropdownOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between rounded-[8px] px-2.5 py-2 text-xs transition-all duration-150 active:scale-[0.99]',
                  role === 'admin'
                    ? 'bg-violet-50 text-violet-900 font-bold border border-violet-200'
                    : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-violet-100 text-violet-700 font-bold">
                    <Shield className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900">HR Manager (Admin)</div>
                    <div className="text-[10px] text-slate-500">Priya Sharma • Full Access</div>
                  </div>
                </div>
                {role === 'admin' && <Check className="h-4 w-4 text-violet-600 font-bold" />}
              </button>

              <button
                onClick={() => {
                  loginAs('employee');
                  setRoleDropdownOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between rounded-[8px] px-2.5 py-2 text-xs transition-all duration-150 active:scale-[0.99] mt-1',
                  role === 'employee'
                    ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                    : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-emerald-100 text-emerald-700 font-bold">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900">Staff Employee</div>
                    <div className="text-[10px] text-slate-500">Sayansh Kulshreshtha</div>
                  </div>
                </div>
                {role === 'employee' && <Check className="h-4 w-4 text-emerald-600 font-bold" />}
              </button>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 rounded-[8px] border border-slate-200 bg-white p-1.5 pr-2.5 hover:border-slate-300 active:scale-[0.98] transition-all duration-200 shadow-sm"
          >
            <div className="relative">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                alt={user?.name || 'User Avatar'}
                className="h-7 w-7 rounded-[6px] object-cover border border-slate-200"
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                {user?.department || (role === 'admin' ? 'HR Dept' : 'Engineering')}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-[14px] border border-slate-200 bg-white p-2.5 shadow-xl z-50 animate-scale-in">
              <div className="border-b border-slate-100 pb-3 pt-1 px-2">
                <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate font-mono">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold border border-indigo-200 bg-indigo-50 text-indigo-700 uppercase">
                    {role}
                  </span>
                  <span className="text-[11px] text-slate-500">• {user?.designation}</span>
                </div>
              </div>

              {/* Quick actions */}
              <div className="py-1">
                <button
                  onClick={handleResetData}
                  disabled={resetting}
                  className="w-full flex items-center gap-2 rounded-[6px] px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 active:scale-[0.99] transition-all duration-150"
                >
                  <RotateCcw className={cn('h-3.5 w-3.5 text-slate-400', resetting && 'animate-spin')} />
                  <span>Reset Mock Data</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 rounded-[6px] px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-medium active:scale-[0.99] transition-all duration-150"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
