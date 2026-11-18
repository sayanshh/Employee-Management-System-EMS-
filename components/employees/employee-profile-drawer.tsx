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
        return 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
      case 'on_leave':
        return 'bg-amber-50 text-amber-800 border-amber-200/80';
      case 'remote':
        return 'bg-sky-50 text-sky-800 border-sky-200/80';
      case 'terminated':
        return 'bg-rose-50 text-rose-800 border-rose-200/80';
      default:
        return 'bg-[#eceae4]/60 text-[#5f5f5d] border-[#eceae4]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-[#f7f4ed] border-l border-[#eceae4] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
          {/* Header */}
          <div className="p-6 border-b border-[#eceae4] flex items-center justify-between bg-[#f7f4ed]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1c1c1c]">
                Staff Profile
              </span>
              <span className="text-[#5f5f5d]">•</span>
              <span className="text-xs text-[#5f5f5d] font-mono">{employee.employeeCode}</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-[6px] p-1.5 text-[#5f5f5d] hover:text-[#1c1c1c] hover:bg-[#eceae4]/60 active:scale-90 transition-all duration-150"
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
                  className="h-20 w-20 rounded-[16px] object-cover ring-2 ring-[#eceae4] shadow-sm"
                />
                <span
                  className={cn(
                    'absolute bottom-0 right-0 h-4 w-4 rounded-full ring-2 ring-[#f7f4ed]',
                    employee.status === 'active' && 'bg-emerald-500',
                    employee.status === 'on_leave' && 'bg-amber-500',
                    employee.status === 'remote' && 'bg-sky-500',
                    employee.status === 'terminated' && 'bg-rose-500'
                  )}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-[#1c1c1c] -tracking-tight truncate">
                    {employee.fullName}
                  </h2>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border capitalize',
                      getStatusBadge(employee.status)
                    )}
                  >
                    {employee.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-[#5f5f5d] font-medium mt-0.5">
                  {employee.designation}
                </p>
                <p className="text-xs text-[#5f5f5d] flex items-center gap-1.5 mt-1">
                  <Building2 className="h-3.5 w-3.5 text-[#5f5f5d]" />
                  {employee.departmentName} Division
                </p>
              </div>
            </div>

            {/* Quick Contact Information */}
            <div className="rounded-[12px] border border-[#eceae4] bg-[#f7f4ed] p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5f5f5d]">
                Contact & Details
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#1c1c1c]">
                  <span className="text-[#5f5f5d] flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Work Email
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[#1c1c1c]">
                    <span>{employee.email}</span>
                    <button
                      onClick={() => copyToClipboard(employee.email)}
                      className="text-[#5f5f5d] hover:text-[#1c1c1c]"
                      title="Copy email"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[#1c1c1c]">
                  <span className="text-[#5f5f5d] flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Phone Number
                  </span>
                  <span className="font-mono text-[#1c1c1c]">{employee.phone}</span>
                </div>

                <div className="flex items-center justify-between text-[#1c1c1c]">
                  <span className="text-[#5f5f5d] flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Base Location
                  </span>
                  <span className="text-[#1c1c1c]">{employee.location}, India</span>
                </div>

                <div className="flex items-center justify-between text-[#1c1c1c]">
                  <span className="text-[#5f5f5d] flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Joined Date
                  </span>
                  <span className="text-[#1c1c1c]">{formatDate(employee.joiningDate)}</span>
                </div>

                <div className="flex items-center justify-between text-[#1c1c1c]">
                  <span className="text-[#5f5f5d] flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" /> Platform Role
                  </span>
                  <span className="capitalize font-semibold text-[#1c1c1c]">
                    {employee.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Compensation Details (RBAC Protected) */}
            <div className="rounded-[12px] border border-[#eceae4] bg-[#f7f4ed] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5f5f5d]">
                  Compensation & Financials
                </h3>
                {userRole === 'admin' ? (
                  <span className="rounded-full bg-[#eceae4] text-[#1c1c1c] text-[10px] px-2 py-0.5 border border-[#eceae4]">
                    Admin Visible
                  </span>
                ) : (
                  <span className="rounded-full bg-[#eceae4] text-[#5f5f5d] text-[10px] px-2 py-0.5 border border-[#eceae4] flex items-center gap-1">
                    <Lock className="h-2.5 w-2.5" /> Restricted
                  </span>
                )}
              </div>

              {userRole === 'admin' ? (
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-[#5f5f5d]">Annual CTC (Gross)</span>
                      <div className="text-xl font-bold font-mono text-[#1c1c1c]">
                        {formatCurrencyINR(employee.salary)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#5f5f5d]">Monthly Payout</span>
                      <div className="text-sm font-semibold font-mono text-[#1c1c1c]">
                        {formatCurrencyINR(Math.round(employee.salary / 12))}
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#eceae4] text-[11px] text-[#5f5f5d] flex items-center justify-between">
                    <span>Tax Regime: Indian New Tax Standard</span>
                    <span>Direct HDFC Transfer</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-[8px] border border-dashed border-[#eceae4] p-4 text-center">
                  <Lock className="h-5 w-5 text-[#5f5f5d] mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-[#1c1c1c]">Compensation Confidential</p>
                  <p className="text-[11px] text-[#5f5f5d] mt-0.5">
                    Salary figures are visible strictly to Human Resource Administrators.
                  </p>
                </div>
              )}
            </div>

            {/* Leave Balance Quota */}
            <div className="rounded-[12px] border border-[#eceae4] bg-[#f7f4ed] p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5f5f5d] mb-3">
                Paid Leave Quotas (2026 Cycle)
              </h3>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-[8px] border border-[#eceae4] bg-[#f7f4ed] p-2.5 text-center">
                  <span className="text-[10px] uppercase font-medium text-rose-800">Sick</span>
                  <div className="text-base font-bold text-[#1c1c1c] font-mono mt-0.5">
                    {employee.leaveBalance.sick}
                  </div>
                  <span className="text-[10px] text-[#5f5f5d]">Days Left</span>
                </div>

                <div className="rounded-[8px] border border-[#eceae4] bg-[#f7f4ed] p-2.5 text-center">
                  <span className="text-[10px] uppercase font-medium text-amber-800">Casual</span>
                  <div className="text-base font-bold text-[#1c1c1c] font-mono mt-0.5">
                    {employee.leaveBalance.casual}
                  </div>
                  <span className="text-[10px] text-[#5f5f5d]">Days Left</span>
                </div>

                <div className="rounded-[8px] border border-[#eceae4] bg-[#f7f4ed] p-2.5 text-center">
                  <span className="text-[10px] uppercase font-medium text-emerald-800">Earned</span>
                  <div className="text-base font-bold text-[#1c1c1c] font-mono mt-0.5">
                    {employee.leaveBalance.earned}
                  </div>
                  <span className="text-[10px] text-[#5f5f5d]">Days Left</span>
                </div>
              </div>
            </div>

            {/* Attendance Status Widget */}
            <div className="rounded-[12px] border border-[#eceae4] bg-[#f7f4ed] p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5f5f5d] mb-2">
                Today&apos;s Attendance Status
              </h3>
              {attendanceToday ? (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#5f5f5d]">Punch: {attendanceToday.checkIn || '--:--'} &rarr; {attendanceToday.checkOut || 'Active'}</span>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase border',
                      getStatusBadge(attendanceToday.status)
                    )}
                  >
                    {attendanceToday.status}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-[#5f5f5d]">No punch log registered for today yet.</p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 border-t border-[#eceae4] bg-[#f7f4ed] flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-4 py-2 text-xs font-medium text-[#1c1c1c] hover:bg-[#eceae4]/50 active:scale-95 transition-all duration-150"
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
                    className="flex items-center gap-1.5 rounded-[6px] bg-[#1c1c1c] hover:bg-[#2b2b2b] text-[#fcfbf8] shadow-button-inset px-3.5 py-2 text-xs font-semibold transition-all duration-150 active:scale-[0.98]"
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
                    className="flex items-center gap-1.5 rounded-[6px] border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 px-3.5 py-2 text-xs font-semibold active:scale-[0.98] transition-all duration-150"
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

