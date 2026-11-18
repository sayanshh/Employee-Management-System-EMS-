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
      <div className="rounded-[16px] border border-[#eceae4] bg-[#f7f4ed] p-6 sm:p-7 shadow-warm-focus relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#eceae4] bg-[#eceae4] px-2.5 py-0.5 text-[11px] font-medium text-[#1c1c1c]">
                HR Operations Console
              </span>
              <span className="text-xs text-[#5f5f5d]">Live Workspace</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.9px] text-[#1c1c1c]">
              Welcome back, {currentAdminName}
            </h2>
            <p className="text-xs sm:text-sm text-[#5f5f5d] mt-1">
              {pendingLeaves.length} leave requests await your review. All 4 department divisions reporting nominal.
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
        <div className="lovable-card-interactive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5f5f5d]">Total Headcount</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#eceae4] text-[#1c1c1c] transition-transform duration-200 group-hover:scale-105">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-semibold tracking-[-1px] text-[#1c1c1c]">{totalEmployees}</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-[#5f5f5d]">
              <TrendingUp className="h-3.5 w-3.5 text-[#1c1c1c]" />
              <span>+2 joined this quarter</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Active Departments */}
        <div className="lovable-card-interactive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5f5f5d]">Active Divisions</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#eceae4] text-[#1c1c1c]">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-semibold tracking-[-1px] text-[#1c1c1c]">{activeDepartments}</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-[#5f5f5d]">
              <span>ENG • HR • FIN • OPS</span>
            </div>
          </div>
        </div>

        {/* KPI 3: On Leave Today */}
        <div className="lovable-card-interactive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5f5f5d]">On Leave Today</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#eceae4] text-[#1c1c1c]">
              <CalendarOff className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-semibold tracking-[-1px] text-[#1c1c1c]">{onLeaveToday}</div>
            <div className="mt-1 text-xs text-[#5f5f5d] truncate">
              <span>Kabir M., Rakesh N.</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Pending Leave Requests */}
        <div className="lovable-card-interactive p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#5f5f5d]">Pending Approvals</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#eceae4] text-[#1c1c1c]">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-semibold tracking-[-1px] text-[#1c1c1c]">{pendingLeaves.length}</div>
            <div className="mt-1 text-xs text-[#5f5f5d]">
              <span>Action required in queue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Department Breakdown Chart & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Headcount Breakdown (2 Cols) */}
        <div className="lg:col-span-2 rounded-[12px] border border-[#eceae4] bg-[#f7f4ed] p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-[#1c1c1c]">Headcount Distribution</h3>
              <p className="text-xs text-[#5f5f5d] mt-0.5">Staff breakdown across functional divisions</p>
            </div>
            <span className="text-xs text-[#5f5f5d] font-mono">14 Total</span>
          </div>

          <div className="space-y-4">
            {deptCounts.map((dept) => (
              <div key={dept.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#1c1c1c]" />
                    <span className="font-medium text-[#1c1c1c]">{dept.name}</span>
                    <span className="text-[#5f5f5d]">({dept.code})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-[#1c1c1c]">{dept.count} members</span>
                    <span className="text-[#5f5f5d] w-10 text-right">{dept.percentage}%</span>
                  </div>
                </div>

                {/* Visual bar */}
                <div className="h-2 w-full rounded-full bg-[#eceae4] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#1c1c1c] transition-all duration-500 ease-out"
                    style={{ width: `${dept.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Department Summary Cards */}
          <div className="mt-6 pt-5 border-t border-[#eceae4] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {departments.map((dept) => (
              <div key={dept.id} className="rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] p-2.5">
                <div className="text-[11px] text-[#5f5f5d] truncate">{dept.name} Lead</div>
                <div className="text-xs font-semibold text-[#1c1c1c] truncate mt-0.5">
                  {dept.managerName}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Leave Requests Action Widget (1 Col) */}
        <div className="rounded-[12px] border border-[#eceae4] bg-[#f7f4ed] p-5 sm:p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#1c1c1c]">Pending Requests</h3>
              <p className="text-xs text-[#5f5f5d] mt-0.5">Quick approval panel</p>
            </div>
            <span className="rounded-full border border-[#eceae4] bg-[#eceae4] px-2 py-0.5 text-[11px] font-medium text-[#1c1c1c]">
              {pendingLeaves.length} New
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[340px] pr-1">
            {pendingLeaves.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-[#5f5f5d]">
                <CheckCircle2 className="h-7 w-7 text-[#1c1c1c] opacity-60 mb-2" />
                <p className="text-xs font-medium text-[#1c1c1c]">All caught up!</p>
                <p className="text-[11px] text-[#5f5f5d]">No pending leave requests</p>
              </div>
            ) : (
              pendingLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="rounded-[8px] border border-[#eceae4] bg-[#f7f4ed] p-3 text-xs space-y-2 hover:border-[rgba(28,28,28,0.4)] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-[#1c1c1c]">{leave.employeeName}</div>
                      <div className="text-[11px] text-[#5f5f5d]">
                        {leave.departmentName} • <span className="capitalize">{leave.leaveType}</span> ({leave.days}d)
                      </div>
                    </div>
                    <span className="rounded-full bg-[#eceae4] text-[#1c1c1c] px-2 py-0.5 text-[10px] font-medium border border-[#eceae4]">
                      {leave.startDate}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#5f5f5d] italic line-clamp-1">
                    &quot;{leave.reason}&quot;
                  </p>

                  <div className="flex items-center gap-2 pt-1 border-t border-[#eceae4]">
                    <button
                      onClick={() => handleLeaveDecision(leave.id, 'approved')}
                      disabled={processingId === leave.id}
                      className="flex-1 flex items-center justify-center gap-1 rounded-[6px] bg-[#1c1c1c] text-[#fcfbf8] py-1.5 text-[11px] font-medium transition-opacity shadow-button-inset hover:opacity-90 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleLeaveDecision(leave.id, 'rejected')}
                      disabled={processingId === leave.id}
                      className="flex-1 flex items-center justify-center gap-1 rounded-[6px] border border-[rgba(28,28,28,0.4)] bg-transparent text-[#1c1c1c] py-1.5 text-[11px] font-medium hover:bg-[rgba(28,28,28,0.04)] transition-colors disabled:opacity-50"
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
        <div className="lg:col-span-2 rounded-[12px] border border-[#eceae4] bg-[#f7f4ed] p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#1c1c1c]" />
              <h3 className="text-sm font-semibold text-[#1c1c1c]">Recent System Activity</h3>
            </div>
            <span className="text-xs text-[#5f5f5d]">Audit Log</span>
          </div>

          <div className="space-y-2.5">
            {activities.slice(0, 5).map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] p-3 hover:bg-[rgba(28,28,28,0.02)] transition-colors"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] border border-[#eceae4] text-[#1c1c1c] mt-0.5">
                  <Activity className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#1c1c1c]">{act.title}</p>
                    <span className="text-[11px] text-[#5f5f5d]">{act.timestamp}</span>
                  </div>
                  <p className="text-xs text-[#5f5f5d] mt-0.5">{act.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Operations Summary (1 Col) */}
        <div className="rounded-[12px] border border-[#eceae4] bg-[#f7f4ed] p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-4 w-4 text-[#1c1c1c]" />
              <h3 className="text-sm font-semibold text-[#1c1c1c]">Quick Actions</h3>
            </div>
            <div className="space-y-2">
              <Link
                href="/employees"
                className="w-full flex items-center justify-between rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] p-2.5 text-xs text-[#1c1c1c] hover:border-[rgba(28,28,28,0.4)] transition-colors"
              >
                <span>Browse Staff Directory</span>
                <ChevronRight className="h-4 w-4 text-[#5f5f5d]" />
              </Link>
              <Link
                href="/attendance"
                className="w-full flex items-center justify-between rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] p-2.5 text-xs text-[#1c1c1c] hover:border-[rgba(28,28,28,0.4)] transition-colors"
              >
                <span>Daily Attendance Roster</span>
                <ChevronRight className="h-4 w-4 text-[#5f5f5d]" />
              </Link>
              <Link
                href="/payroll"
                className="w-full flex items-center justify-between rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] p-2.5 text-xs text-[#1c1c1c] hover:border-[rgba(28,28,28,0.4)] transition-colors"
              >
                <span>Monthly Payroll Ledger</span>
                <ChevronRight className="h-4 w-4 text-[#5f5f5d]" />
              </Link>
            </div>
          </div>

          <div className="mt-5 rounded-[8px] border border-[#eceae4] bg-[#eceae4]/40 p-3 text-xs text-[#5f5f5d] flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-[#1c1c1c] shrink-0" />
            <span className="text-[11px]">System operating with local state fallback.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
