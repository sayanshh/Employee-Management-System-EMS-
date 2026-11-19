'use client';

import React from 'react';
import {
  X,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Building2,
  Shield,
  Clock,
  Lock,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Employee, AttendanceRecord, UserRole } from '@/types';
import { formatCurrencyINR, formatDate, cn } from '@/lib/utils';

interface EmployeeProfileDrawerProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
  userRole: UserRole;
  attendanceToday?: AttendanceRecord | null;
}

export function EmployeeProfileDrawer({
  employee,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  userRole,
  attendanceToday,
}: EmployeeProfileDrawerProps) {
  if (!isOpen || !employee) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'on_leave':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'remote':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'terminated':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Staff Profile
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-indigo-600 font-mono font-bold">{employee.employeeCode}</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-90 transition-all duration-150"
              title="Close drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Profile Hero Card */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={employee.avatarUrl}
                  alt={employee.fullName}
                  className="h-20 w-20 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-md"
                />
                <span
                  className={cn(
                    'absolute -bottom-1 -right-1 h-5 w-5 rounded-full ring-2 ring-white',
                    employee.status === 'active' && 'bg-emerald-500',
                    employee.status === 'on_leave' && 'bg-amber-500',
                    employee.status === 'remote' && 'bg-sky-500',
                    employee.status === 'terminated' && 'bg-rose-500'
                  )}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight truncate">
                    {employee.fullName}
                  </h2>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border capitalize',
                      getStatusBadge(employee.status)
                    )}
                  >
                    {employee.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  {employee.designation}
                </p>
                <p className="text-xs text-indigo-600 font-medium flex items-center gap-1.5 mt-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {employee.departmentName} Division
                </p>
              </div>
            </div>

            {/* Quick Contact Information */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Contact & Details
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-indigo-500" /> Work Email
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-slate-900 font-medium">
                    <span>{employee.email}</span>
                    <button
                      onClick={() => copyToClipboard(employee.email)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Copy email"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-indigo-500" /> Phone Number
                  </span>
                  <span className="font-mono text-slate-900 font-medium">{employee.phone}</span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-indigo-500" /> Base Location
                  </span>
                  <span className="text-slate-900 font-medium">{employee.location}, India</span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-indigo-500" /> Joined Date
                  </span>
                  <span className="text-slate-900 font-medium">{formatDate(employee.joiningDate)}</span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-indigo-500" /> Platform Role
                  </span>
                  <span className="capitalize font-bold text-slate-900">
                    {employee.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Compensation Details (RBAC Protected) */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Compensation & Financials
                </h3>
                {userRole === 'admin' ? (
                  <span className="rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 border border-indigo-200">
                    Admin Visible
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 border border-slate-200 flex items-center gap-1">
                    <Lock className="h-2.5 w-2.5" /> Restricted
                  </span>
                )}
              </div>

              {userRole === 'admin' ? (
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-500 font-medium">Annual CTC (Gross)</span>
                      <div className="text-xl font-bold font-mono text-slate-900">
                        {formatCurrencyINR(employee.salary)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 font-medium">Monthly Payout</span>
                      <div className="text-sm font-bold font-mono text-indigo-600">
                        {formatCurrencyINR(Math.round(employee.salary / 12))}
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Tax Regime: Indian New Tax Standard</span>
                    <span>Direct HDFC Transfer</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center bg-slate-50/50">
                  <Lock className="h-5 w-5 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-900">Compensation Confidential</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Salary figures are visible strictly to Human Resource Administrators.
                  </p>
                </div>
              )}
            </div>

            {/* Leave Balance Quota */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Paid Leave Quotas (2026 Cycle)
              </h3>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-rose-700">Sick</span>
                  <div className="text-lg font-bold text-rose-900 font-mono mt-0.5">
                    {employee.leaveBalance.sick}
                  </div>
                  <span className="text-[10px] font-medium text-rose-600">Days Left</span>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-700">Casual</span>
                  <div className="text-lg font-bold text-amber-900 font-mono mt-0.5">
                    {employee.leaveBalance.casual}
                  </div>
                  <span className="text-[10px] font-medium text-amber-600">Days Left</span>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-700">Earned</span>
                  <div className="text-lg font-bold text-emerald-900 font-mono mt-0.5">
                    {employee.leaveBalance.earned}
                  </div>
                  <span className="text-[10px] font-medium text-emerald-600">Days Left</span>
                </div>
              </div>
            </div>

            {/* Attendance Status Widget */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Today&apos;s Attendance Status
              </h3>
              {attendanceToday ? (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Punch: {attendanceToday.checkIn || '--:--'} &rarr; {attendanceToday.checkOut || 'Active'}</span>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border',
                      getStatusBadge(attendanceToday.status)
                    )}
                  >
                    {attendanceToday.status}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No punch log registered for today yet.</p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-all duration-150 shadow-xs"
            >
              Close
            </button>

            {userRole === 'admin' && (
              <div className="flex items-center gap-2">
                {onEdit && (
                  <button
                    onClick={() => {
                      onClose();
                      onEdit(employee);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/25 px-3.5 py-2 text-xs font-bold transition-all duration-150 active:scale-[0.98]"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Profile</span>
                  </button>
                )}

                {onDelete && (
                  <button
                    onClick={() => {
                      onClose();
                      onDelete(employee);
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3.5 py-2 text-xs font-bold active:scale-[0.98] transition-all duration-150 shadow-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Manage / Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

