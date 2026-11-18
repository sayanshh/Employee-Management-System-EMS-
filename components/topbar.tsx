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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#eceae4] bg-[#f7f4ed]/90 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] text-[#1c1c1c] hover:bg-[rgba(28,28,28,0.04)]"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Page title & subtext */}
        <div>
          <h1 className="text-base font-semibold tracking-[-0.3px] text-[#1c1c1c]">{title}</h1>
          <p className="text-xs text-[#5f5f5d] hidden sm:block">
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
            className="flex items-center gap-2 rounded-[6px] border border-[rgba(28,28,28,0.3)] bg-transparent px-3 py-1.5 text-xs text-[#1c1c1c] hover:bg-[rgba(28,28,28,0.05)] hover:border-[rgba(28,28,28,0.6)] active:scale-[0.98] transition-all duration-200"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            <span className="capitalize">{role === 'admin' ? 'Role: Admin' : 'Role: Employee'}</span>
            <ChevronDown className="h-3 w-3 opacity-70 transition-transform duration-200" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-[12px] border border-[#eceae4] bg-[#f7f4ed] p-1.5 shadow-warm-focus z-50 animate-scale-in">
              <div className="px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-[#5f5f5d]">
                Active Persona
              </div>
              <button
                onClick={() => {
                  loginAs('admin');
                  setRoleDropdownOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between rounded-[6px] px-2.5 py-2 text-xs transition-all duration-150 active:scale-[0.99]',
                  role === 'admin'
                    ? 'bg-[#eceae4] text-[#1c1c1c] font-medium'
                    : 'text-[#1c1c1c] hover:bg-[rgba(28,28,28,0.04)]'
                )}
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-[#1c1c1c]" />
                  <div className="text-left">
                    <div>Admin (HR Manager)</div>
                    <div className="text-[10px] text-[#5f5f5d]">Priya Iyer • Full Access</div>
                  </div>
                </div>
                {role === 'admin' && <Check className="h-3.5 w-3.5 text-[#1c1c1c]" />}
              </button>

              <button
                onClick={() => {
                  loginAs('employee');
                  setRoleDropdownOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between rounded-[6px] px-2.5 py-2 text-xs transition-all duration-150 active:scale-[0.99] mt-1',
                  role === 'employee'
                    ? 'bg-[#eceae4] text-[#1c1c1c] font-medium'
                    : 'text-[#1c1c1c] hover:bg-[rgba(28,28,28,0.04)]'
                )}
              >
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-[#1c1c1c]" />
                  <div className="text-left">
                    <div>Employee (Engineer)</div>
                    <div className="text-[10px] text-[#5f5f5d]">Sayansh Kulshreshtha • Personal</div>
                  </div>
                </div>
                {role === 'employee' && <Check className="h-3.5 w-3.5 text-[#1c1c1c]" />}
              </button>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] p-1.5 pr-2.5 hover:border-[rgba(28,28,28,0.3)] active:scale-[0.98] transition-all duration-200"
          >
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
              alt={user?.name || 'User Avatar'}
              className="h-7 w-7 rounded-[4px] object-cover border border-[#eceae4]"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-medium text-[#1c1c1c] truncate max-w-[120px]">
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] text-[#5f5f5d] truncate max-w-[120px]">
                {user?.department || (role === 'admin' ? 'HR Dept' : 'Engineering')}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[#5f5f5d] ml-0.5" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-[12px] border border-[#eceae4] bg-[#f7f4ed] p-2 shadow-warm-focus z-50 animate-scale-in">
              <div className="border-b border-[#eceae4] pb-3 pt-1 px-2">
                <p className="text-sm font-semibold text-[#1c1c1c]">{user?.name}</p>
                <p className="text-xs text-[#5f5f5d] truncate">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-medium border border-[#eceae4] bg-[#eceae4] text-[#1c1c1c] uppercase">
                    {role}
                  </span>
                  <span className="text-[11px] text-[#5f5f5d]">• {user?.designation}</span>
                </div>
              </div>

              {/* Quick actions */}
              <div className="py-1">
                <button
                  onClick={handleResetData}
                  disabled={resetting}
                  className="w-full flex items-center gap-2 rounded-[6px] px-2.5 py-1.5 text-xs text-[#5f5f5d] hover:text-[#1c1c1c] hover:bg-[rgba(28,28,28,0.04)] active:scale-[0.99] transition-all duration-150"
                >
                  <RotateCcw className={cn('h-3.5 w-3.5', resetting && 'animate-spin')} />
                  <span>Reset Mock Data</span>
                </button>
              </div>

              <div className="border-t border-[#eceae4] pt-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 rounded-[6px] px-2.5 py-1.5 text-xs text-rose-700 hover:bg-rose-50 active:scale-[0.99] transition-all duration-150"
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
