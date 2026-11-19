'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Mail,
  Building,
  Plus,
  Laptop,
} from 'lucide-react';
import { Employee, AttendanceRecord, LeaveRequest, LeaveType } from '@/types';
import { DataService } from '@/lib/data-service';
import { LeaveRequestModal } from './leave-request-modal';
import { formatDate, cn } from '@/lib/utils';

interface EmployeeOverviewProps {
  currentEmployee: Employee | null;
  attendanceToday: AttendanceRecord | null;
  myLeaves: LeaveRequest[];
  onDataRefresh: () => void;
}

export function EmployeeOverview({
  currentEmployee,
  attendanceToday,
  myLeaves,
  onDataRefresh,
}: EmployeeOverviewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [clockTime, setClockTime] = useState<string>('');
  const [checkingIn, setCheckingIn] = useState(false);

  // Digital clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClockTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAttendanceToggle = async (mode: 'present' | 'remote' = 'present') => {
    if (!currentEmployee) return;
    setCheckingIn(true);
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

      if (attendanceToday?.checkIn && !attendanceToday.checkOut) {
        await DataService.markAttendance({
          employeeId: currentEmployee.id,
          checkOut: timeStr,
          workHours: 8.0,
        });
      } else {
        await DataService.markAttendance({
          employeeId: currentEmployee.id,
          checkIn: timeStr,
          status: mode,
          workHours: 0,
        });
      }
      onDataRefresh();
    } finally {
      setCheckingIn(false);
    }
  };

  const handleApplyLeave = async (data: {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
  }) => {
    if (!currentEmployee) return;
    await DataService.createLeaveRequest({
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.fullName,
      departmentName: currentEmployee.departmentName,
      ...data,
    });
    onDataRefresh();
  };

  const leaveBalance = currentEmployee?.leaveBalance || { sick: 6, casual: 4, earned: 12 };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Profile Summary Card */}
      <div className="rounded-[16px] border border-slate-200/90 bg-gradient-to-r from-white via-indigo-50/20 to-purple-50/30 p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-indigo-500/[0.05] to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative">
              <img
                src={currentEmployee?.avatarUrl || '/avatars/sayansh.jpg'}
                alt={currentEmployee?.fullName || 'Employee Avatar'}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-[12px] object-cover ring-2 ring-indigo-500/30 shadow-md"
              />
              <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {currentEmployee?.fullName || 'Sayansh Kulshreshtha'}
                </h2>
                <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-bold font-mono text-indigo-700">
                  {currentEmployee?.employeeCode || 'EMP-1003'}
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 capitalize">
                  {currentEmployee?.status || 'Active'}
                </span>
              </div>
              <p className="text-sm text-slate-600 font-medium">
                {currentEmployee?.designation || 'Senior Software Engineer'} • <span className="text-indigo-600 font-semibold">{currentEmployee?.departmentName || 'Engineering'}</span>
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                  {currentEmployee?.location || 'Bengaluru, India'}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-indigo-500" />
                  {currentEmployee?.email || 'sayansh.kulshreshtha@company.com'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                  Joined {currentEmployee ? formatDate(currentEmployee.joiningDate) : 'Jan 2022'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setModalOpen(true)}
              className="lovable-button-primary text-xs w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Apply for Leave</span>
            </button>
          </div>
        </div>
      </div>

      {/* Middle Grid: Today's Attendance Widget & Leave Balance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance Widget (1 Col) */}
        <div className="rounded-[16px] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-indigo-50 text-indigo-600 border border-indigo-200">
                  <Clock className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Daily Shift Check-In</h3>
              </div>
              <span className="rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 px-2 py-0.5 text-[11px] font-bold font-mono">
                Today
              </span>
            </div>

            {/* Digital Clock Display */}
            <div className="rounded-[12px] border border-slate-200 bg-gradient-to-br from-slate-900 to-indigo-950 p-4 text-center my-3 text-white shadow-md relative overflow-hidden">
              <div className="text-3xl font-extrabold font-mono tracking-wider text-white">
                {clockTime || '--:--:--'}
              </div>
              <p className="text-[11px] text-indigo-200/80 mt-1 font-medium">
                {new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Current Status */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Shift Status</span>
                <span className="font-bold capitalize px-2.5 py-0.5 rounded-full text-[11px] border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {attendanceToday ? attendanceToday.status : 'Not Checked In'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Punch In</span>
                <span className="text-slate-900 font-bold font-mono">{attendanceToday?.checkIn || '--:--'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 font-medium">Punch Out</span>
                <span className="text-slate-900 font-bold font-mono">{attendanceToday?.checkOut || '--:--'}</span>
              </div>
            </div>
          </div>

          {/* Punch Button Actions */}
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
            {!attendanceToday?.checkIn ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAttendanceToggle('present')}
                  disabled={checkingIn}
                  className="lovable-button-primary text-xs py-2 w-full"
                >
                  <Building className="h-3.5 w-3.5" />
                  <span>Office In</span>
                </button>
                <button
                  onClick={() => handleAttendanceToggle('remote')}
                  disabled={checkingIn}
                  className="inline-flex items-center justify-center gap-1.5 rounded-[8px] bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white font-semibold text-xs py-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Laptop className="h-3.5 w-3.5" />
                  <span>Remote In</span>
                </button>
              </div>
            ) : !attendanceToday?.checkOut ? (
              <button
                onClick={() => handleAttendanceToggle()}
                disabled={checkingIn}
                className="inline-flex items-center justify-center gap-1.5 rounded-[8px] bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-semibold text-xs py-2 w-full shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Clock className="h-4 w-4" />
                <span>Clock Out (End Shift)</span>
              </button>
            ) : (
              <div className="text-center p-2.5 rounded-[8px] border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold">
                ✓ Shift completed for today!
              </div>
            )}
          </div>
        </div>

        {/* Remaining Leave Balance Cards (2 Cols) */}
        <div className="lg:col-span-2 rounded-[16px] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Annual Leave Quotas</h3>
                <p className="text-xs text-slate-500 mt-0.5">Paid time-off allocations & remaining balance</p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-mono">
                Cycle: 2026
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Sick Leave Card */}
              <div className="rounded-[12px] border-2 border-rose-200/80 bg-gradient-to-br from-rose-50/70 to-pink-50/40 p-4 transition-all duration-200 hover:border-rose-400 hover:shadow-md hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-800">Sick Leave</span>
                  <span className="rounded-full border border-rose-200 bg-white text-rose-700 text-[10px] font-bold px-2 py-0.5">
                    Medical
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-rose-900 font-mono">{leaveBalance.sick}</span>
                    <span className="text-xs text-rose-600 font-semibold">/ 12 days left</span>
                  </div>
                  <div className="mt-2.5 h-2 w-full rounded-full bg-rose-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{ width: `${(leaveBalance.sick / 12) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Casual Leave Card */}
              <div className="rounded-[12px] border-2 border-amber-200/80 bg-gradient-to-br from-amber-50/70 to-yellow-50/40 p-4 transition-all duration-200 hover:border-amber-400 hover:shadow-md hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Casual Leave</span>
                  <span className="rounded-full border border-amber-200 bg-white text-amber-700 text-[10px] font-bold px-2 py-0.5">
                    Personal
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-amber-900 font-mono">{leaveBalance.casual}</span>
                    <span className="text-xs text-amber-600 font-semibold">/ 10 days left</span>
                  </div>
                  <div className="mt-2.5 h-2 w-full rounded-full bg-amber-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{ width: `${(leaveBalance.casual / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Earned Leave Card */}
              <div className="rounded-[12px] border-2 border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 p-4 transition-all duration-200 hover:border-emerald-400 hover:shadow-md hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Earned Leave</span>
                  <span className="rounded-full border border-emerald-200 bg-white text-emerald-700 text-[10px] font-bold px-2 py-0.5">
                    Privilege
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-emerald-900 font-mono">{leaveBalance.earned}</span>
                    <span className="text-xs text-emerald-600 font-semibold">/ 18 days left</span>
                  </div>
                  <div className="mt-2.5 h-2 w-full rounded-full bg-emerald-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{ width: `${(leaveBalance.earned / 18) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[10px] border border-indigo-200 bg-indigo-50/50 p-3 text-xs text-indigo-900 flex items-center justify-between">
            <span className="font-medium flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-indigo-600" />
              Upcoming Company Holiday
            </span>
            <span className="font-bold text-indigo-700">Guru Nanak Jayanti • Nov 25</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: My Recent Leave Requests History */}
      <div className="rounded-[16px] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">My Leave Requests</h3>
            <p className="text-xs text-slate-500 mt-0.5">Status of recently submitted time-off requests</p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full font-mono">
            {myLeaves.length} record(s)
          </span>
        </div>

        {myLeaves.length === 0 ? (
          <div className="rounded-[12px] border border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
            <Calendar className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">No leave requests filed yet</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Click &quot;Apply for Leave&quot; above to submit your first request.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[10px] border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                  <th className="py-3 pl-4">Category</th>
                  <th className="py-3">Period</th>
                  <th className="py-3">Duration</th>
                  <th className="py-3">Reason</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 pr-4 text-right">Applied On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myLeaves.map((req) => (
                  <tr key={req.id} className="hover:bg-indigo-50/40 transition-colors">
                    <td className="py-3 pl-4 font-bold capitalize text-slate-900">
                      <span className="inline-flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        {req.leaveType} Leave
                      </span>
                    </td>
                    <td className="py-3 text-slate-800 font-mono font-medium">
                      {req.startDate} &rarr; {req.endDate}
                    </td>
                    <td className="py-3 text-slate-600 font-bold font-mono">{req.days} day(s)</td>
                    <td className="py-3 text-slate-600 max-w-xs truncate font-medium">{req.reason}</td>
                    <td className="py-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border capitalize',
                          req.status === 'approved' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          req.status === 'pending' && 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse',
                          req.status === 'rejected' && 'bg-rose-50 text-rose-700 border-rose-200'
                        )}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right text-slate-400 font-mono">
                      {req.appliedOn}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      <LeaveRequestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleApplyLeave}
        employeeName={currentEmployee?.fullName || 'Employee'}
      />
    </div>
  );
}
