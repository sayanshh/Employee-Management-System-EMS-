'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  CalendarOff,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Activity,
  FileCheck2,
  ChevronRight,
  Briefcase,
} from 'lucide-react';
import { Employee, Department, AttendanceRecord, LeaveRequest, ActivityItem } from '@/types';
import { DataService } from '@/lib/data-service';

interface AdminOverviewProps {
  employees: Employee[];
  departments: Department[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  activities: ActivityItem[];
  onDataRefresh: () => void;
  currentAdminName: string;
}

export function AdminOverview({
  employees,
  departments,
  attendance,
  leaves,
  activities,
  onDataRefresh,
  currentAdminName,
}: AdminOverviewProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Computed metrics
  const activeEmployees = employees.filter((e) => e.status !== 'terminated');
  const totalEmployees = activeEmployees.length;
  const activeDepartments = departments.length;
  const onLeaveToday = attendance.filter((a) => a.status === 'on_leave').length;
  const pendingLeaves = leaves.filter((l) => l.status === 'pending');

  // Department distribution
  const deptCounts = departments.map((dept) => {
    const count = activeEmployees.filter((e) => e.departmentId === dept.id).length;
    const percentage = totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0;
    return {
      ...dept,
      count,
      percentage,
    };
  });

  const handleLeaveDecision = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      await DataService.updateLeaveStatus(id, status, currentAdminName);
      onDataRefresh();
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="rounded-[16px] border border-slate-200/90 bg-gradient-to-r from-white via-indigo-50/20 to-purple-50/30 p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-indigo-500/[0.06] to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                HR Operations Console
              </span>
              <span className="text-xs text-slate-500 font-medium">Live Workspace</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, {currentAdminName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              <strong className="text-indigo-600 font-semibold">{pendingLeaves.length} leave requests</strong> await your review. All 4 department divisions reporting nominal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/attendance"
              className="lovable-button-primary text-xs"
            >
              <FileCheck2 className="h-4 w-4" />
              <span>Review Requests ({pendingLeaves.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Employees */}
        <div className="group rounded-[14px] border-2 border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Headcount</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25 transition-transform duration-200 group-hover:scale-110">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">{totalEmployees}</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px]">
                <TrendingUp className="h-3 w-3 text-emerald-600" />
                <span>+2 this quarter</span>
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Active Departments */}
        <div className="group rounded-[14px] border-2 border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-teal-400 hover:shadow-lg hover:shadow-teal-500/10 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Divisions</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 transition-transform duration-200 group-hover:scale-110">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">{activeDepartments}</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-teal-700 font-semibold">
              <span className="inline-flex items-center rounded-full bg-teal-50 border border-teal-200 px-2 py-0.5 text-[11px]">
                ENG • HR • FIN • OPS
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: On Leave Today */}
        <div className="group rounded-[14px] border-2 border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">On Leave Today</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 transition-transform duration-200 group-hover:scale-110">
              <CalendarOff className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold tracking-tight text-amber-900 font-mono">{onLeaveToday}</div>
            <div className="mt-1 text-xs text-amber-700 font-semibold truncate">
              <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px]">
                {onLeaveToday > 0 ? 'Approved Absence' : 'Full Team Present'}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Pending Leave Requests */}
        <div className="group rounded-[14px] border-2 border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-rose-400 hover:shadow-lg hover:shadow-rose-500/10 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Approvals</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/25 transition-transform duration-200 group-hover:scale-110">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold tracking-tight text-rose-700 font-mono">{pendingLeaves.length}</div>
            <div className="mt-1 text-xs text-rose-700 font-semibold">
              <span className="inline-flex items-center rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] animate-pulse">
                Action required in queue
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Department Breakdown Chart & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Headcount Breakdown (2 Cols) */}
        <div className="lg:col-span-2 rounded-[16px] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Headcount Distribution</h3>
              <p className="text-xs text-slate-500 mt-0.5">Staff breakdown across functional divisions</p>
            </div>
            <span className="text-xs font-bold text-indigo-700 font-mono bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
              14 Total Staff
            </span>
          </div>

          <div className="space-y-4">
            {deptCounts.map((dept, index) => {
              const gradients = [
                'from-blue-500 to-indigo-600',
                'from-rose-500 to-pink-600',
                'from-emerald-500 to-teal-600',
                'from-amber-500 to-orange-500',
              ];
              const dotColors = [
                'bg-indigo-500',
                'bg-rose-500',
                'bg-emerald-500',
                'bg-amber-500',
              ];
              const gradient = gradients[index % gradients.length];
              const dot = dotColors[index % dotColors.length];

              return (
                <div key={dept.id} className="space-y-1.5 p-2 rounded-[10px] hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${dot} shadow-sm`} />
                      <span className="font-semibold text-slate-800">{dept.name}</span>
                      <span className="text-slate-400 text-[11px]">({dept.code})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900 font-mono">{dept.count} members</span>
                      <span className="text-slate-500 font-mono font-medium w-10 text-right">{dept.percentage}%</span>
                    </div>
                  </div>

                  {/* Visual bar */}
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500 ease-out`}
                      style={{ width: `${dept.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Department Summary Cards */}
          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {departments.map((dept, i) => {
              const borderColors = [
                'border-blue-200 hover:border-blue-400 bg-blue-50/30',
                'border-rose-200 hover:border-rose-400 bg-rose-50/30',
                'border-emerald-200 hover:border-emerald-400 bg-emerald-50/30',
                'border-amber-200 hover:border-amber-400 bg-amber-50/30',
              ];
              return (
                <div
                  key={dept.id}
                  className={`rounded-[10px] border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${borderColors[i % borderColors.length]}`}
                >
                  <div className="text-[11px] text-slate-500 font-medium truncate">{dept.name} Lead</div>
                  <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
                    {dept.managerName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Leave Requests Action Widget (1 Col) */}
        <div className="rounded-[16px] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm flex flex-col hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Pending Requests</h3>
              <p className="text-xs text-slate-500 mt-0.5">Quick review & approval</p>
            </div>
            <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700">
              {pendingLeaves.length} New
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[340px] pr-1">
            {pendingLeaves.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                <p className="text-xs font-bold text-slate-800">All caught up!</p>
                <p className="text-[11px] text-slate-500">No pending leave requests in queue</p>
              </div>
            ) : (
              pendingLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="rounded-[12px] border border-slate-200 bg-slate-50/60 p-3.5 text-xs space-y-2 hover:border-indigo-300 hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{leave.employeeName}</div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {leave.departmentName} • <span className="capitalize font-semibold text-indigo-700">{leave.leaveType}</span> ({leave.days}d)
                      </div>
                    </div>
                    <span className="rounded-full bg-white text-slate-700 px-2.5 py-0.5 text-[10px] font-semibold border border-slate-200 shadow-2xs font-mono">
                      {leave.startDate}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 italic line-clamp-1 bg-white/70 p-1.5 rounded border border-slate-100">
                    &quot;{leave.reason}&quot;
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleLeaveDecision(leave.id, 'approved')}
                      disabled={processingId === leave.id}
                      className="flex-1 flex items-center justify-center gap-1 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 text-[11px] font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleLeaveDecision(leave.id, 'rejected')}
                      disabled={processingId === leave.id}
                      className="flex-1 flex items-center justify-center gap-1 rounded-[6px] border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 py-1.5 text-[11px] font-bold transition-all active:scale-95 disabled:opacity-50"
                    >
                      <XCircle className="h-3 w-3" />
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Activity Feed & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed (2 Cols) */}
        <div className="lg:col-span-2 rounded-[16px] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-indigo-50 text-indigo-600 border border-indigo-200/80">
                <Activity className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent System Activity</h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">Live Audit Log</span>
          </div>

          <div className="space-y-2.5">
            {activities.slice(0, 5).map((act, i) => {
              const iconColors = [
                'bg-blue-50 text-blue-600 border-blue-200',
                'bg-emerald-50 text-emerald-600 border-emerald-200',
                'bg-violet-50 text-violet-600 border-violet-200',
                'bg-amber-50 text-amber-600 border-amber-200',
              ];
              const colorClass = iconColors[i % iconColors.length];

              return (
                <div
                  key={act.id}
                  className="flex items-start gap-3 rounded-[10px] border border-slate-100 bg-slate-50/50 p-3 hover:bg-indigo-50/30 hover:border-indigo-200 transition-all duration-150"
                >
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] border font-bold mt-0.5 ${colorClass}`}>
                    <Activity className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">{act.title}</p>
                      <span className="text-[11px] text-slate-400 font-mono">{act.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{act.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Operations Summary (1 Col) */}
        <div className="rounded-[16px] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-slate-100 text-slate-700 border border-slate-200">
                <Briefcase className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Quick Shortcuts</h3>
            </div>
            <div className="space-y-2">
              <Link
                href="/employees"
                className="w-full flex items-center justify-between rounded-[10px] border border-slate-200/80 bg-white p-3 text-xs font-semibold text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/40 hover:text-indigo-700 transition-all duration-150 shadow-2xs group"
              >
                <span>Browse Staff Directory</span>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
              <Link
                href="/attendance"
                className="w-full flex items-center justify-between rounded-[10px] border border-slate-200/80 bg-white p-3 text-xs font-semibold text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/40 hover:text-indigo-700 transition-all duration-150 shadow-2xs group"
              >
                <span>Daily Attendance Roster</span>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
              <Link
                href="/payroll"
                className="w-full flex items-center justify-between rounded-[10px] border border-slate-200/80 bg-white p-3 text-xs font-semibold text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/40 hover:text-indigo-700 transition-all duration-150 shadow-2xs group"
              >
                <span>Monthly Payroll Ledger</span>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          <div className="mt-5 rounded-[10px] border border-emerald-200/80 bg-emerald-50/60 p-3 text-xs text-emerald-800 flex items-center gap-2.5 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[11px]">System operating with local state fallback.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
