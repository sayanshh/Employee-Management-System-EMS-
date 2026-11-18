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
import { formatDate } from '@/lib/utils';

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
      <div className="rounded-[16px] border border-[#eceae4] bg-[#f7f4ed] p-6 shadow-warm-focus relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative">
              <img
                src={currentEmployee?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'}
                alt={currentEmployee?.fullName || 'Employee Avatar'}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-[8px] object-cover border border-[#eceae4]"
              />
              <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-[#1c1c1c] ring-2 ring-[#f7f4ed]" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.6px] text-[#1c1c1c]">
                  {currentEmployee?.fullName || 'Sayansh Kulshreshtha'}
                </h2>
                <span className="rounded-full border border-[#eceae4] bg-[#eceae4] px-2.5 py-0.5 text-xs font-mono text-[#1c1c1c]">
                  {currentEmployee?.employeeCode || 'EMP-1003'}
                </span>
              </div>
              <p className="text-sm text-[#5f5f5d]">
                {currentEmployee?.designation || 'Senior Software Engineer'} • {currentEmployee?.departmentName || 'Engineering'}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#5f5f5d] mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {currentEmployee?.location || 'Bengaluru, India'}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {currentEmployee?.email || 'sayansh.kulshreshtha@company.com'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
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
        <div className="rounded-[12px] border border-[#eceae4] bg-[#f7f4ed] p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#1c1c1c]" />
                <h3 className="text-sm font-semibold text-[#1c1c1c]">Daily Shift Check-In</h3>
              </div>
              <span className="rounded-full border border-[#eceae4] bg-[#eceae4] text-[#1c1c1c] px-2 py-0.5 text-[11px] font-mono">
                Today
              </span>
            </div>

            {/* Digital Clock Display */}
            <div className="rounded-[8px] border border-[#eceae4] bg-[#f7f4ed] p-4 text-center my-3">
              <div className="text-2xl font-semibold font-mono tracking-wider text-[#1c1c1c]">
                {clockTime || '--:--:--'}
              </div>
              <p className="text-[11px] text-[#5f5f5d] mt-1">
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
              <div className="flex items-center justify-between py-1 border-b border-[#eceae4]">
                <span className="text-[#5f5f5d]">Shift Status</span>
                <span className="font-medium capitalize px-2 py-0.5 rounded-full text-[11px] border border-[#eceae4] bg-[#eceae4] text-[#1c1c1c]">
                  {attendanceToday ? attendanceToday.status : 'Not Checked In'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#eceae4]">
                <span className="text-[#5f5f5d]">Punch In</span>
                <span className="text-[#1c1c1c] font-mono">{attendanceToday?.checkIn || '--:--'}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#5f5f5d]">Punch Out</span>
                <span className="text-[#1c1c1c] font-mono">{attendanceToday?.checkOut || '--:--'}</span>
              </div>
            </div>
          </div>

          {/* Punch Button Actions */}
          <div className="mt-5 pt-4 border-t border-[#eceae4] space-y-2">
            {!attendanceToday?.checkIn ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAttendanceToggle('present')}
                  disabled={checkingIn}
                  className="lovable-button-primary text-xs py-2"
                >
                  <Building className="h-3.5 w-3.5" />
                  <span>Office In</span>
                </button>
                <button
                  onClick={() => handleAttendanceToggle('remote')}
                  disabled={checkingIn}
                  className="lovable-button-ghost text-xs py-2"
                >
                  <Laptop className="h-3.5 w-3.5" />
                  <span>Remote In</span>
                </button>
              </div>
            ) : !attendanceToday?.checkOut ? (
              <button
                onClick={() => handleAttendanceToggle()}
                disabled={checkingIn}
                className="lovable-button-primary w-full text-xs py-2"
              >
                <Clock className="h-4 w-4" />
                <span>Clock Out (End Shift)</span>
              </button>
            ) : (
              <div className="text-center p-2 rounded-[6px] border border-[#eceae4] bg-[#eceae4]/40 text-[#1c1c1c] text-xs">
                Attendance logged for today.
              </div>
            )}
          </div>
        </div>

        {/* Remaining Leave Balance Cards (2 Cols) */}
        <div className="lg:col-span-2 rounded-[12px] border border-[#eceae4] bg-[#f7f4ed] p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#1c1c1c]">Leave Balances</h3>
                <p className="text-xs text-[#5f5f5d] mt-0.5">Annual paid time-off allocations</p>
              </div>
              <span className="text-xs text-[#5f5f5d]">Cycle: 2026</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Sick Leave Card */}
              <div className="rounded-[8px] border border-[#eceae4] bg-[#f7f4ed] p-4 transition-all duration-200 hover:border-[rgba(28,28,28,0.25)] hover:-translate-y-0.5 hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#1c1c1c]">Sick Leave</span>
                  <span className="rounded-full border border-[#eceae4] text-[#1c1c1c] text-[10px] px-2 py-0.5">
                    Medical
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold text-[#1c1c1c] font-mono">{leaveBalance.sick}</span>
                    <span className="text-xs text-[#5f5f5d]">/ 12 days</span>
                  </div>
                  <div className="mt-2.5 h-1.5 w-full rounded-full bg-[#eceae4] overflow-hidden">
                    <div
                      className="h-full bg-[#1c1c1c] rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{ width: `${(leaveBalance.sick / 12) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Casual Leave Card */}
              <div className="rounded-[8px] border border-[#eceae4] bg-[#f7f4ed] p-4 transition-all duration-200 hover:border-[rgba(28,28,28,0.25)] hover:-translate-y-0.5 hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#1c1c1c]">Casual Leave</span>
                  <span className="rounded-full border border-[#eceae4] text-[#1c1c1c] text-[10px] px-2 py-0.5">
                    Personal
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold text-[#1c1c1c] font-mono">{leaveBalance.casual}</span>
                    <span className="text-xs text-[#5f5f5d]">/ 10 days</span>
                  </div>
                  <div className="mt-2.5 h-1.5 w-full rounded-full bg-[#eceae4] overflow-hidden">
                    <div
                      className="h-full bg-[#1c1c1c] rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{ width: `${(leaveBalance.casual / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Earned Leave Card */}
              <div className="rounded-[8px] border border-[#eceae4] bg-[#f7f4ed] p-4 transition-all duration-200 hover:border-[rgba(28,28,28,0.25)] hover:-translate-y-0.5 hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#1c1c1c]">Earned Leave</span>
                  <span className="rounded-full border border-[#eceae4] text-[#1c1c1c] text-[10px] px-2 py-0.5">
                    Privilege
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold text-[#1c1c1c] font-mono">{leaveBalance.earned}</span>
                    <span className="text-xs text-[#5f5f5d]">/ 18 days</span>
                  </div>
                  <div className="mt-2.5 h-1.5 w-full rounded-full bg-[#eceae4] overflow-hidden">
                    <div
                      className="h-full bg-[#1c1c1c] rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{ width: `${(leaveBalance.earned / 18) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[8px] border border-[#eceae4] bg-[#f7f4ed] p-3 text-xs text-[#5f5f5d] flex items-center justify-between">
            <span className="text-[#1c1c1c]">Upcoming Company Holiday</span>
            <span className="font-medium text-[#1c1c1c]">Guru Nanak Jayanti • Nov 25</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: My Recent Leave Requests History */}
      <div className="rounded-[12px] border border-[#eceae4] bg-[#f7f4ed] p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#1c1c1c]">My Leave Requests</h3>
            <p className="text-xs text-[#5f5f5d] mt-0.5">Status of recently submitted time-off requests</p>
          </div>
          <span className="text-xs text-[#5f5f5d]">{myLeaves.length} record(s)</span>
        </div>

        {myLeaves.length === 0 ? (
          <div className="rounded-[8px] border border-[#eceae4] bg-[#f7f4ed] p-8 text-center text-[#5f5f5d]">
            <Calendar className="h-8 w-8 text-[#5f5f5d] opacity-50 mx-auto mb-2" />
            <p className="text-xs font-medium text-[#1c1c1c]">No leave requests filed yet</p>
            <p className="text-[11px] text-[#5f5f5d] mt-0.5">
              Click &quot;Apply for Leave&quot; above to submit your first request.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#eceae4] text-[#5f5f5d] font-medium">
                  <th className="pb-3 pl-2">Category</th>
                  <th className="pb-3">Period</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Reason</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Applied On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eceae4]">
                {myLeaves.map((req) => (
                  <tr key={req.id} className="hover:bg-[rgba(28,28,28,0.02)] transition-colors">
                    <td className="py-3 pl-2 font-medium capitalize text-[#1c1c1c]">
                      {req.leaveType} Leave
                    </td>
                    <td className="py-3 text-[#1c1c1c] font-mono">
                      {req.startDate} to {req.endDate}
                    </td>
                    <td className="py-3 text-[#5f5f5d]">{req.days} day(s)</td>
                    <td className="py-3 text-[#5f5f5d] max-w-xs truncate">{req.reason}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border border-[#eceae4] bg-[#eceae4] text-[#1c1c1c] capitalize">
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-right text-[#5f5f5d] font-mono">
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
