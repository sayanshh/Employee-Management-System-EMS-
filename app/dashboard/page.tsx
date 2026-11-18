'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { DataService } from '@/lib/data-service';
import { DashboardShell } from '@/components/dashboard-shell';
import { AdminOverview } from '@/components/dashboard/admin-overview';
import { EmployeeOverview } from '@/components/dashboard/employee-overview';
import { Employee, Department, AttendanceRecord, LeaveRequest, ActivityItem } from '@/types';

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [empData, deptData, attData, leaveData, actData] = await Promise.all([
        DataService.getEmployees(),
        DataService.getDepartments(),
        DataService.getAttendance(),
        DataService.getLeaveRequests(),
        DataService.getActivities(),
      ]);
      setEmployees(empData);
      setDepartments(deptData);
      setAttendance(attData);
      setLeaves(leaveData);
      setActivities(actData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived current employee record
  const currentEmployee = employees.find(
    (e) => e.id === user?.employeeId || e.email.toLowerCase() === user?.email.toLowerCase()
  ) || (employees.length > 0 ? employees[2] : null);

  const todayStr = new Date().toISOString().split('T')[0];
  const attendanceToday = currentEmployee
    ? attendance.find((a) => a.employeeId === currentEmployee.id && a.date === todayStr) || null
    : null;

  const myLeaves = currentEmployee
    ? leaves.filter((l) => l.employeeId === currentEmployee.id)
    : [];

  return (
    <DashboardShell title={role === 'admin' ? 'Executive Dashboard' : 'Employee Workspace'}>
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#1c1c1c] border-t-transparent" />
            <span className="text-xs text-[#5f5f5d]">Loading metrics...</span>
          </div>
        </div>
      ) : role === 'admin' ? (
        <AdminOverview
          employees={employees}
          departments={departments}
          attendance={attendance}
          leaves={leaves}
          activities={activities}
          onDataRefresh={loadData}
          currentAdminName={user?.name || 'HR Manager'}
        />
      ) : (
        <EmployeeOverview
          currentEmployee={currentEmployee}
          attendanceToday={attendanceToday}
          myLeaves={myLeaves}
          onDataRefresh={loadData}
        />
      )}
    </DashboardShell>
  );
}

