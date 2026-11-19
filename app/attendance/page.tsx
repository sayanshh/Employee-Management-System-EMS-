'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useAuth } from '@/lib/auth-context';
import { DataService } from '@/lib/data-service';
import { AttendanceRecord, LeaveRequest, Employee, LeaveStatus } from '@/types';
import { LiveClockBanner } from '@/components/attendance/live-clock-banner';
import { AdminLeaveQueue } from '@/components/attendance/admin-leave-queue';
import { LeaveApplicationModal } from '@/components/attendance/leave-application-modal';
import {
  CalendarCheck,
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Building2,
  MapPin,
  Laptop,
  Building,
  UserCheck,
  TrendingUp,
  Award,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

export default function AttendancePage() {
  const { user, role } = useAuth();

  // Primary Tab state
  const [activeTab, setActiveTab] = useState<'attendance' | 'leaves'>('attendance');

  // Data states
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab 1 Attendance Filter states
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<string>('all');
  const [attendanceSearch, setAttendanceSearch] = useState<string>('');

  // Tab 2 Leaves Filter states
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<string>('all');
  const [leaveSearch, setLeaveSearch] = useState<string>('');
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [attList, leaveList, empList] = await Promise.all([
        DataService.getAttendance(),
        DataService.getLeaveRequests(),
        DataService.getEmployees(),
      ]);
      setAttendance(attList);
      setLeaves(leaveList);
      setEmployees(empList);
    } catch (err) {
      console.error('Failed to load attendance & leaves data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Current active employee profile
  const currentEmployee = useMemo(() => {
    return (
      employees.find(
        (e) => e.id === user?.employeeId || e.email.toLowerCase() === user?.email?.toLowerCase()
      ) || (employees.length > 0 ? employees[0] : null)
    );
  }, [employees, user]);

  // Today's attendance for current active user
  const currentAttendanceToday = useMemo(() => {
    if (!currentEmployee) return null;
    return (
      attendance.find((a) => a.employeeId === currentEmployee.id && a.date === todayStr) || null
    );
  }, [attendance, currentEmployee, todayStr]);

  // Tab 1: Available unique dates in attendance roster (sorted descending)
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(attendance.map((a) => a.date)));
    return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [attendance]);

  // Tab 1: Filtered records for selected date (Admin Roster)
  const dailyRoster = useMemo(() => {
    return attendance.filter((rec) => {
      const matchesDate = rec.date === selectedDate;
      const matchesStatus =
        attendanceStatusFilter === 'all' || rec.status === attendanceStatusFilter;
      const matchesSearch =
        !attendanceSearch ||
        rec.employeeName.toLowerCase().includes(attendanceSearch.toLowerCase());
      return matchesDate && matchesStatus && matchesSearch;
    });
  }, [attendance, selectedDate, attendanceStatusFilter, attendanceSearch]);

  // Attendance summary counts for selected date
  const rosterCounts = useMemo(() => {
    const dateRecords = attendance.filter((r) => r.date === selectedDate);
    const present = dateRecords.filter((r) => r.status === 'present').length;
    const remote = dateRecords.filter((r) => r.status === 'remote').length;
    const onLeave = dateRecords.filter((r) => r.status === 'on_leave').length;
    const halfDay = dateRecords.filter((r) => r.status === 'half_day').length;
    const total = dateRecords.length;
    return { present, remote, onLeave, halfDay, total };
  }, [attendance, selectedDate]);

  // Tab 1: Personal Attendance History (Employee View)
  const personalAttendanceHistory = useMemo(() => {
    if (!currentEmployee) return [];
    return attendance
      .filter((r) => r.employeeId === currentEmployee.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [attendance, currentEmployee]);

  // Employee punctuality metrics
  const personalStats = useMemo(() => {
    const daysLogged = personalAttendanceHistory.length;
    const totalHours = personalAttendanceHistory.reduce((acc, cur) => acc + (cur.workHours || 0), 0);
    const avgHours = daysLogged > 0 ? (totalHours / daysLogged).toFixed(1) : '8.0';
    const presentOrRemote = personalAttendanceHistory.filter(
      (r) => r.status === 'present' || r.status === 'remote'
    ).length;
    const onTimeRate = daysLogged > 0 ? Math.round((presentOrRemote / daysLogged) * 100) : 100;
    return { daysLogged, avgHours, onTimeRate };
  }, [personalAttendanceHistory]);

  // Tab 2: Pending leave requests (for Admin approval queue)
  const pendingLeaves = useMemo(() => {
    return leaves.filter((l) => l.status === 'pending');
  }, [leaves]);

  // Tab 2: Filtered leave history ledger (Admin sees all, Employee sees personal)
  const displayedLeaves = useMemo(() => {
    const baseList =
      role === 'admin'
        ? leaves
        : leaves.filter((l) => l.employeeId === currentEmployee?.id);

    return baseList
      .filter((l) => {
        const matchesStatus = leaveStatusFilter === 'all' || l.status === leaveStatusFilter;
        const matchesSearch =
          !leaveSearch ||
          l.employeeName.toLowerCase().includes(leaveSearch.toLowerCase()) ||
          l.reason.toLowerCase().includes(leaveSearch.toLowerCase()) ||
          l.departmentName.toLowerCase().includes(leaveSearch.toLowerCase());
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime());
  }, [leaves, role, currentEmployee, leaveStatusFilter, leaveSearch]);

  const leaveBalance = currentEmployee?.leaveBalance || { sick: 8, casual: 6, earned: 14 };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'remote':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'half_day':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'on_leave':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <DashboardShell title="Attendance & Leave Workspace">
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Live Clock-In / Clock-Out Banner */}
        <LiveClockBanner
          currentEmployee={currentEmployee}
          attendanceToday={currentAttendanceToday}
          onRefresh={loadData}
        />

        {/* Dual Primary Tabs Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('attendance')}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-150 active:scale-[0.98]',
                activeTab === 'attendance'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 shadow-xs'
              )}
            >
              <CalendarCheck className="h-4 w-4" />
              <span>Daily Attendance Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('leaves')}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-150 active:scale-[0.98]',
                activeTab === 'leaves'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 shadow-xs'
              )}
            >
              <Calendar className="h-4 w-4" />
              <span>Leave Management</span>
              {pendingLeaves.length > 0 && role === 'admin' && (
                <span className="ml-1 rounded-full bg-rose-500 text-white px-2 py-0.5 text-[10px] font-bold shadow-xs">
                  {pendingLeaves.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'leaves' && (
            <button
              onClick={() => setLeaveModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/25 px-4.5 py-2.5 text-xs font-bold transition-all active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              <span>Apply for Leave</span>
            </button>
          )}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: DAILY ATTENDANCE TRACKING */}
        {/* ========================================================================= */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {role === 'admin' ? (
              /* ADMIN VIEW: Filterable Daily Attendance Roster across all staff */
              <div className="space-y-4">
                {/* Control bar: Date Picker, Summary Pills, and Search */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Date Selector */}
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold text-slate-600">Attendance Date:</span>
                      <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono shadow-xs font-medium"
                      >
                        {availableDates.map((date) => (
                          <option key={date} value={date}>
                            {formatDate(date)} {date === todayStr ? '(Today)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Search by Name */}
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search employee name..."
                        value={attendanceSearch}
                        onChange={(e) => setAttendanceSearch(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Summary Pills Filter */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setAttendanceStatusFilter('all')}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-bold border transition-all shadow-xs',
                        attendanceStatusFilter === 'all'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      All Records ({rosterCounts.total})
                    </button>
                    <button
                      onClick={() => setAttendanceStatusFilter('present')}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-bold border transition-all flex items-center gap-1.5 shadow-xs',
                        attendanceStatusFilter === 'present'
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/25'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70'
                      )}
                    >
                      <Building className="h-3 w-3" />
                      <span>Present: {rosterCounts.present}</span>
                    </button>
                    <button
                      onClick={() => setAttendanceStatusFilter('remote')}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-bold border transition-all flex items-center gap-1.5 shadow-xs',
                        attendanceStatusFilter === 'remote'
                          ? 'bg-sky-500 text-white border-sky-600 shadow-sky-500/25'
                          : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100/70'
                      )}
                    >
                      <Laptop className="h-3 w-3" />
                      <span>Remote: {rosterCounts.remote}</span>
                    </button>
                    <button
                      onClick={() => setAttendanceStatusFilter('half_day')}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-bold border transition-all flex items-center gap-1.5 shadow-xs',
                        attendanceStatusFilter === 'half_day'
                          ? 'bg-amber-500 text-white border-amber-600 shadow-amber-500/25'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70'
                      )}
                    >
                      <span>Half Day: {rosterCounts.halfDay}</span>
                    </button>
                    <button
                      onClick={() => setAttendanceStatusFilter('on_leave')}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-bold border transition-all flex items-center gap-1.5 shadow-xs',
                        attendanceStatusFilter === 'on_leave'
                          ? 'bg-rose-500 text-white border-rose-600 shadow-rose-500/25'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/70'
                      )}
                    >
                      <span>On Leave: {rosterCounts.onLeave}</span>
                    </button>
                  </div>
                </div>

                {/* Daily Roster Table */}
                <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-700 font-semibold">
                          <th className="py-3.5 pl-4">Staff Member</th>
                          <th className="py-3.5">Status</th>
                          <th className="py-3.5">Punch In Time</th>
                          <th className="py-3.5">Punch Out Time</th>
                          <th className="py-3.5 pr-4 text-right">Work Hours</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dailyRoster.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-500 font-medium">
                              No attendance entries found matching the filter for {selectedDate}.
                            </td>
                          </tr>
                        ) : (
                          dailyRoster.map((rec) => (
                            <tr key={rec.id} className="hover:bg-indigo-50/40 transition-colors">
                              <td className="py-3.5 pl-4 font-semibold text-slate-900">
                                {rec.employeeName}
                              </td>
                              <td className="py-3.5">
                                <span
                                  className={cn(
                                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border capitalize',
                                    getStatusBadge(rec.status)
                                  )}
                                >
                                  {rec.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-3.5 text-slate-800 font-mono font-medium">
                                {rec.checkIn || '--:--'}
                              </td>
                              <td className="py-3.5 text-slate-800 font-mono font-medium">
                                {rec.checkOut || (rec.checkIn ? <span className="text-indigo-600 font-bold">Active In Shift</span> : '--:--')}
                              </td>
                              <td className="py-3.5 pr-4 text-right font-mono font-bold text-slate-900">
                                {rec.workHours > 0 ? `${rec.workHours} hrs` : '--'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              /* EMPLOYEE VIEW: Personal Attendance History & Punctuality Metrics */
              <div className="space-y-6">
                {/* 3 Personal Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl border-2 border-slate-200/90 bg-white p-5 shadow-sm border-t-4 border-t-indigo-500 hover:shadow-lg transition-all">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Days Logged</span>
                    <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-mono">
                      {personalStats.daysLogged} Days
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Current active monthly period</p>
                  </div>

                  <div className="rounded-2xl border-2 border-slate-200/90 bg-white p-5 shadow-sm border-t-4 border-t-emerald-500 hover:shadow-lg transition-all">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Daily Shift</span>
                    <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-mono">
                      {personalStats.avgHours} Hours
                    </div>
                    <p className="mt-1 text-xs text-emerald-700 font-medium flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Compliant with standard 8h day</span>
                    </p>
                  </div>

                  <div className="rounded-2xl border-2 border-slate-200/90 bg-white p-5 shadow-sm border-t-4 border-t-amber-500 hover:shadow-lg transition-all">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Punctuality Score</span>
                    <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-700 font-mono">
                      {personalStats.onTimeRate}%
                    </div>
                    <p className="mt-1 text-xs text-slate-500">On-time check-in adherence</p>
                  </div>
                </div>

                {/* Personal History Table */}
                <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">My Attendance Ledger</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Your historical check-in and check-out logs
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-700 font-semibold">
                          <th className="py-3.5 pl-4">Date</th>
                          <th className="py-3.5">Mode / Status</th>
                          <th className="py-3.5">Clock In</th>
                          <th className="py-3.5">Clock Out</th>
                          <th className="py-3.5 pr-4 text-right">Hours Logged</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {personalAttendanceHistory.map((rec) => (
                          <tr key={rec.id} className="hover:bg-indigo-50/40 transition-colors">
                            <td className="py-3.5 pl-4 font-mono font-semibold text-slate-900">
                              {formatDate(rec.date)} {rec.date === todayStr ? '(Today)' : ''}
                            </td>
                            <td className="py-3.5">
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border capitalize',
                                  getStatusBadge(rec.status)
                                )}
                              >
                                {rec.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 text-slate-800 font-mono font-medium">
                              {rec.checkIn || '--:--'}
                            </td>
                            <td className="py-3.5 text-slate-800 font-mono font-medium">
                              {rec.checkOut || (rec.checkIn ? <span className="text-indigo-600 font-bold">In Progress</span> : '--:--')}
                            </td>
                            <td className="py-3.5 pr-4 text-right font-mono font-bold text-slate-900">
                              {rec.workHours > 0 ? `${rec.workHours} hrs` : '--'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LEAVE MANAGEMENT & APPROVAL WORKFLOW */}
        {/* ========================================================================= */}
        {activeTab === 'leaves' && (
          <div className="space-y-6">
            {/* Top Row: Personal Leave Quota Balance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Sick Leave Card */}
              <div className="rounded-2xl border-2 border-rose-200/90 bg-gradient-to-br from-rose-50/70 to-pink-50/30 p-5 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                    Sick Leave (Medical)
                  </span>
                  <span className="rounded-full bg-rose-100/80 text-rose-800 text-[10px] font-bold px-2 py-0.5 border border-rose-300">
                    {12 - leaveBalance.sick} Used
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-slate-900">{leaveBalance.sick}</span>
                  <span className="text-xs text-slate-500 font-medium">/ 12 days</span>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-rose-200/60 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${(leaveBalance.sick / 12) * 100}%` }}
                  />
                </div>
              </div>

              {/* Casual Leave Card */}
              <div className="rounded-2xl border-2 border-amber-200/90 bg-gradient-to-br from-amber-50/70 to-yellow-50/30 p-5 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Casual Leave (Personal)
                  </span>
                  <span className="rounded-full bg-amber-100/80 text-amber-800 text-[10px] font-bold px-2 py-0.5 border border-amber-300">
                    {10 - leaveBalance.casual} Used
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-slate-900">{leaveBalance.casual}</span>
                  <span className="text-xs text-slate-500 font-medium">/ 10 days</span>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-amber-200/60 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${(leaveBalance.casual / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Earned Leave Card */}
              <div className="rounded-2xl border-2 border-emerald-200/90 bg-gradient-to-br from-emerald-50/70 to-teal-50/30 p-5 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Earned Leave (Privilege)
                  </span>
                  <span className="rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-emerald-300">
                    {18 - leaveBalance.earned} Used
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-slate-900">{leaveBalance.earned}</span>
                  <span className="text-xs text-slate-500 font-medium">/ 18 days</span>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-emerald-200/60 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${(leaveBalance.earned / 18) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Admin Pending Approvals Queue (Admin Only) */}
            {role === 'admin' && (
              <AdminLeaveQueue
                pendingLeaves={pendingLeaves}
                onDecisionComplete={loadData}
                adminName={user?.name || 'HR Admin'}
              />
            )}

            {/* Leave History Ledger Table */}
            <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    {role === 'admin' ? 'Company Leave Ledger' : 'My Leave Request History'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {role === 'admin'
                      ? 'All submitted employee applications & historical audit records'
                      : 'Records and status updates of your submitted time-off applications'}
                  </p>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex items-center gap-2">
                  <select
                    value={leaveStatusFilter}
                    onChange={(e) => setLeaveStatusFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs font-medium"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search requests..."
                      value={leaveSearch}
                      onChange={(e) => setLeaveSearch(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs w-44"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-700 font-semibold">
                      <th className="py-3.5 pl-4">Staff Member</th>
                      <th className="py-3.5">Category</th>
                      <th className="py-3.5">Period (Dates)</th>
                      <th className="py-3.5">Duration</th>
                      <th className="py-3.5">Reason</th>
                      <th className="py-3.5">Status</th>
                      <th className="py-3.5 pr-4 text-right">Audit & Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedLeaves.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                          No leave applications found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      displayedLeaves.map((l) => (
                        <tr key={l.id} className="hover:bg-indigo-50/40 transition-colors">
                          <td className="py-3.5 pl-4">
                            <div className="font-semibold text-slate-900">{l.employeeName}</div>
                            <div className="text-[11px] text-slate-500">{l.departmentName}</div>
                          </td>
                          <td className="py-3.5 capitalize font-semibold text-slate-800">
                            {l.leaveType} Leave
                          </td>
                          <td className="py-3.5 text-slate-700 font-mono text-[11px]">
                            {l.startDate} &rarr; {l.endDate}
                          </td>
                          <td className="py-3.5 text-slate-900 font-mono font-bold">{l.days} Day(s)</td>
                          <td className="py-3.5 text-slate-600 max-w-xs truncate" title={l.reason}>
                            &quot;{l.reason}&quot;
                          </td>
                          <td className="py-3.5">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border capitalize',
                                getStatusBadge(l.status)
                              )}
                            >
                              {l.status}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4 text-right">
                            {l.reviewedBy ? (
                              <div>
                                <span className="text-[11px] text-slate-900 font-semibold">
                                  {l.status === 'approved' ? 'Approved by' : 'Rejected by'} {l.reviewedBy}
                                </span>
                                {l.adminRemarks && (
                                  <div className="text-[10px] text-slate-500 italic max-w-xs ml-auto truncate" title={l.adminRemarks}>
                                    Note: &quot;{l.adminRemarks}&quot;
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-amber-700 font-mono font-bold">
                                Awaiting Action
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leave Application Modal */}
      <LeaveApplicationModal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        onSuccess={loadData}
        employee={currentEmployee}
      />
    </DashboardShell>
  );
}
