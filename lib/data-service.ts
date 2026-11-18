import {
  Department,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  PayrollRecord,
  ActivityItem,
  LeaveStatus,
} from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_PAYROLL,
  INITIAL_ACTIVITIES,
} from './mock-data';

const STORAGE_KEYS = {
  EMPLOYEES: 'emq_employees_v3',
  DEPARTMENTS: 'emq_departments_v3',
  ATTENDANCE: 'emq_attendance_v3',
  LEAVES: 'emq_leaves_v3',
  PAYROLL: 'emq_payroll_v3',
  ACTIVITIES: 'emq_activities_v3',
};

// Helper for safe localStorage access
function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = window.localStorage.getItem(key);
    if (!item) {
      window.localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Failed reading ${key} from localStorage, using fallback:`, err);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed saving ${key} to localStorage:`, err);
  }
}

export const DataService = {
  // ---- DEPARTMENTS ----
  async getDepartments(): Promise<Department[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('departments').select('*');
        if (!error && data && data.length > 0) {
          return data as Department[];
        }
      } catch (err) {
        console.warn('Supabase getDepartments error, falling back to local state:', err);
      }
    }
    return getFromStorage<Department[]>(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  },

  // ---- EMPLOYEES ----
  async getEmployees(): Promise<Employee[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('employees').select('*');
        if (!error && data && data.length > 0) {
          return data as Employee[];
        }
      } catch (err) {
        console.warn('Supabase getEmployees error, falling back to local state:', err);
      }
    }
    return getFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  },

  async getEmployeeById(id: string): Promise<Employee | null> {
    const employees = await this.getEmployees();
    return employees.find((emp) => emp.id === id || emp.userId === id) || null;
  },

  async getNextEmployeeCode(): Promise<string> {
    const employees = await this.getEmployees();
    let maxNumber = 1000;
    employees.forEach((emp) => {
      const match = emp.employeeCode.match(/EMP-(\d+)/i);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });
    return `EMP-${maxNumber + 1}`;
  },

  async saveEmployee(employee: Employee, actorName: string = 'HR Admin'): Promise<Employee> {
    const employees = await this.getEmployees();
    const index = employees.findIndex((e) => e.id === employee.id);
    let updatedEmployees: Employee[];
    const isNew = index === -1;

    if (!isNew) {
      updatedEmployees = [...employees];
      updatedEmployees[index] = employee;
    } else {
      updatedEmployees = [employee, ...employees];
    }

    saveToStorage(STORAGE_KEYS.EMPLOYEES, updatedEmployees);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('employees').upsert(employee);
      } catch (err) {
        console.warn('Supabase upsert employee error:', err);
      }
    }

    // Log Activity
    if (isNew) {
      await this.addActivity({
        type: 'onboarding',
        title: 'New Employee Onboarded',
        description: `${employee.fullName} (${employee.employeeCode}) joined as ${employee.designation} in ${employee.departmentName}`,
        actorName,
      });
    } else {
      await this.addActivity({
        type: 'onboarding',
        title: 'Employee Details Updated',
        description: `${actorName} updated records for ${employee.fullName} (${employee.employeeCode})`,
        actorName,
      });
    }

    return employee;
  },

  async terminateEmployee(id: string, actorName: string = 'HR Admin'): Promise<Employee | null> {
    const employees = await this.getEmployees();
    const index = employees.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const target = employees[index];
    const updated: Employee = {
      ...target,
      status: 'terminated',
    };
    employees[index] = updated;
    saveToStorage(STORAGE_KEYS.EMPLOYEES, employees);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('employees').upsert(updated);
      } catch (err) {
        console.warn('Supabase update employee status error:', err);
      }
    }

    await this.addActivity({
      type: 'onboarding',
      title: 'Employee Status: Terminated',
      description: `${target.fullName} (${target.employeeCode}) marked as Terminated by ${actorName}`,
      actorName,
    });

    return updated;
  },

  async deleteEmployee(id: string, actorName: string = 'HR Admin'): Promise<boolean> {
    const employees = await this.getEmployees();
    const target = employees.find((e) => e.id === id);
    const updatedEmployees = employees.filter((e) => e.id !== id);
    saveToStorage(STORAGE_KEYS.EMPLOYEES, updatedEmployees);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('employees').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete employee error:', err);
      }
    }

    if (target) {
      await this.addActivity({
        type: 'onboarding',
        title: 'Employee Record Deleted',
        description: `${target.fullName} (${target.employeeCode}) was deleted from employee directory`,
        actorName,
      });
    }

    return true;
  },

  // ---- ATTENDANCE ----
  async getAttendance(date?: string): Promise<AttendanceRecord[]> {
    const records = getFromStorage<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    if (date) {
      return records.filter((r) => r.date === date);
    }
    return records;
  },

  async getAttendanceForEmployee(employeeId: string): Promise<AttendanceRecord[]> {
    const records = await this.getAttendance();
    return records.filter((r) => r.employeeId === employeeId);
  },

  async markAttendance(record: Partial<AttendanceRecord> & { employeeId: string }): Promise<AttendanceRecord> {
    const records = await this.getAttendance();
    const today = new Date().toISOString().split('T')[0];
    const targetDate = record.date || today;

    const existingIndex = records.findIndex(
      (r) => r.employeeId === record.employeeId && r.date === targetDate
    );

    let updatedRecord: AttendanceRecord;

    if (existingIndex >= 0) {
      const prev = records[existingIndex];
      let computedHours = record.workHours !== undefined ? record.workHours : prev.workHours;

      // If checking out and workHours wasn't explicitly supplied, compute based on checkIn
      if (record.checkOut && !record.workHours && prev.checkIn) {
        try {
          // Parse check-in time (e.g. "09:30 AM")
          const now = new Date();
          const [timePart, modifier] = prev.checkIn.split(' ');
          let [hours, minutes] = timePart.split(':').map(Number);
          if (modifier === 'PM' && hours < 12) hours += 12;
          if (modifier === 'AM' && hours === 12) hours = 0;
          const checkInDate = new Date();
          checkInDate.setHours(hours, minutes, 0, 0);

          const diffMs = Math.max(0, now.getTime() - checkInDate.getTime());
          const diffHours = diffMs / (1000 * 60 * 60);
          computedHours = Math.round(diffHours * 10) / 10;
          if (computedHours < 0.1) computedHours = 8.0; // Realistic demo fallback
        } catch {
          computedHours = 8.0;
        }
      }

      updatedRecord = {
        ...prev,
        ...record,
        workHours: computedHours,
      };
      records[existingIndex] = updatedRecord;

      saveToStorage(STORAGE_KEYS.ATTENDANCE, records);

      if (record.checkOut) {
        await this.addActivity({
          type: 'attendance',
          title: 'Shift Completed',
          description: `${updatedRecord.employeeName} clocked out (${updatedRecord.workHours} hrs logged)`,
          actorName: updatedRecord.employeeName,
        });
      }

      return updatedRecord;
    } else {
      const employees = await this.getEmployees();
      const emp = employees.find((e) => e.id === record.employeeId);
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      updatedRecord = {
        id: `att-${Date.now()}`,
        employeeId: record.employeeId,
        employeeName: emp ? emp.fullName : 'Employee',
        date: targetDate,
        checkIn: record.checkIn || currentTime,
        checkOut: record.checkOut || null,
        status: record.status || 'present',
        workHours: record.workHours || 0,
      };
      records.unshift(updatedRecord);

      saveToStorage(STORAGE_KEYS.ATTENDANCE, records);

      await this.addActivity({
        type: 'attendance',
        title: 'Attendance Clocked In',
        description: `${updatedRecord.employeeName} clocked in as ${updatedRecord.status.toUpperCase()}`,
        actorName: updatedRecord.employeeName,
      });

      return updatedRecord;
    }
  },

  // ---- LEAVES ----
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('leave_requests').select('*');
        if (!error && data && data.length > 0) {
          return data as LeaveRequest[];
        }
      } catch (err) {
        console.warn('Supabase getLeaveRequests error, falling back to local state:', err);
      }
    }
    return getFromStorage<LeaveRequest[]>(STORAGE_KEYS.LEAVES, INITIAL_LEAVE_REQUESTS);
  },

  async createLeaveRequest(
    request: Omit<LeaveRequest, 'id' | 'appliedOn' | 'status'>
  ): Promise<LeaveRequest> {
    const leaves = await this.getLeaveRequests();
    const newLeave: LeaveRequest = {
      ...request,
      id: `leave-${Date.now()}`,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };

    const updatedLeaves = [newLeave, ...leaves];
    saveToStorage(STORAGE_KEYS.LEAVES, updatedLeaves);

    await this.addActivity({
      type: 'leave',
      title: 'Leave Request Submitted',
      description: `${newLeave.employeeName} requested ${newLeave.days} day(s) of ${newLeave.leaveType} leave`,
      actorName: newLeave.employeeName,
    });

    return newLeave;
  },

  async updateLeaveStatus(
    id: string,
    status: LeaveStatus,
    reviewerName: string,
    adminRemarks?: string
  ): Promise<LeaveRequest | null> {
    const leaves = await this.getLeaveRequests();
    const index = leaves.findIndex((l) => l.id === id);
    if (index === -1) return null;

    const targetLeave = leaves[index];
    const today = new Date().toISOString().split('T')[0];
    const updatedLeave: LeaveRequest = {
      ...targetLeave,
      status,
      reviewedBy: reviewerName,
      reviewedAt: today,
      adminRemarks: adminRemarks || targetLeave.adminRemarks,
    };

    leaves[index] = updatedLeave;
    saveToStorage(STORAGE_KEYS.LEAVES, leaves);

    // If approved:
    // 1. Deduct approved days from matching leave balance
    // 2. If today is within approved date range, mark employee as 'on_leave'
    // 3. Sync today's attendance record to 'on_leave'
    if (status === 'approved') {
      const isTodayInRange = today >= targetLeave.startDate && today <= targetLeave.endDate;
      const employees = await this.getEmployees();
      const empIndex = employees.findIndex((e) => e.id === targetLeave.employeeId);

      if (empIndex >= 0) {
        const emp = employees[empIndex];
        const type = targetLeave.leaveType;
        const currentBalance = emp.leaveBalance[type] || 0;
        emp.leaveBalance[type] = Math.max(0, currentBalance - targetLeave.days);
        if (isTodayInRange) {
          emp.status = 'on_leave';
        }
        employees[empIndex] = emp;
        saveToStorage(STORAGE_KEYS.EMPLOYEES, employees);
      }

      if (isTodayInRange) {
        const attendance = await this.getAttendance();
        const attIndex = attendance.findIndex(
          (a) => a.employeeId === targetLeave.employeeId && a.date === today
        );
        if (attIndex >= 0) {
          attendance[attIndex] = {
            ...attendance[attIndex],
            status: 'on_leave',
            checkIn: null,
            checkOut: null,
            workHours: 0,
          };
        } else {
          attendance.unshift({
            id: `att-${Date.now()}`,
            employeeId: targetLeave.employeeId,
            employeeName: targetLeave.employeeName,
            date: today,
            checkIn: null,
            checkOut: null,
            status: 'on_leave',
            workHours: 0,
          });
        }
        saveToStorage(STORAGE_KEYS.ATTENDANCE, attendance);
      }
    }

    await this.addActivity({
      type: 'leave',
      title: `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      description: `${reviewerName} ${status} ${targetLeave.employeeName}'s ${targetLeave.leaveType} leave (${targetLeave.days}d)${
        adminRemarks ? ` • Remark: "${adminRemarks}"` : ''
      }`,
      actorName: reviewerName,
    });

    return updatedLeave;
  },

  // ---- PAYROLL ----
  async getPayrollRecords(): Promise<PayrollRecord[]> {
    return getFromStorage<PayrollRecord[]>(STORAGE_KEYS.PAYROLL, INITIAL_PAYROLL);
  },

  async runMonthlyPayroll(month: string, actorName: string = 'HR Admin'): Promise<PayrollRecord[]> {
    const existing = await this.getPayrollRecords();
    const employees = await this.getEmployees();
    const activeStaff = employees.filter((e) => e.status !== 'terminated');
    const today = new Date().toISOString().split('T')[0];

    const newRecords: PayrollRecord[] = activeStaff.map((emp) => {
      const gross = Math.round(emp.salary / 12);
      const basic = Math.round(gross * 0.5);
      const hra = Math.round(gross * 0.2);
      const special = gross - basic - hra;
      const pf = Math.round(basic * 0.12);
      const pt = 200;
      const deductions = pf + pt;
      const net = gross - deductions;

      return {
        id: `pay-${month.toLowerCase().replace(/\s+/g, '-')}-${emp.id}`,
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName,
        designation: emp.designation,
        departmentName: emp.departmentName,
        month,
        grossSalary: gross,
        basicSalary: basic,
        hra,
        specialAllowance: special,
        allowances: hra + special,
        pf,
        professionalTax: pt,
        leaveDeductions: 0,
        deductions,
        netSalary: net,
        status: 'pending' as const,
        paymentDate: today,
      };
    });

    // Remove existing records for that month if re-running, then prepend new
    const filtered = existing.filter((p) => p.month !== month);
    const updatedPayroll = [...newRecords, ...filtered];
    saveToStorage(STORAGE_KEYS.PAYROLL, updatedPayroll);

    await this.addActivity({
      type: 'payroll',
      title: 'Monthly Payroll Processed',
      description: `${actorName} executed payroll run for ${month} (${newRecords.length} employees calculated)`,
      actorName,
    });

    return updatedPayroll;
  },

  async updatePayrollStatus(id: string, status: PayrollRecord['status'], actorName: string = 'HR Admin'): Promise<PayrollRecord | null> {
    const records = await this.getPayrollRecords();
    const index = records.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const today = new Date().toISOString().split('T')[0];
    const updated: PayrollRecord = {
      ...records[index],
      status,
      paymentDate: status === 'paid' ? today : records[index].paymentDate,
    };
    records[index] = updated;
    saveToStorage(STORAGE_KEYS.PAYROLL, records);

    if (status === 'paid') {
      await this.addActivity({
        type: 'payroll',
        title: 'Salary Disbursed',
        description: `Salary for ${updated.employeeName} (${updated.month}) marked as PAID via direct deposit`,
        actorName,
      });
    }

    return updated;
  },

  async markBulkPayrollPaid(month: string, actorName: string = 'HR Admin'): Promise<number> {
    const records = await this.getPayrollRecords();
    const today = new Date().toISOString().split('T')[0];
    let count = 0;

    const updated = records.map((p) => {
      if (p.month === month && p.status !== 'paid') {
        count++;
        return {
          ...p,
          status: 'paid' as const,
          paymentDate: today,
        };
      }
      return p;
    });

    saveToStorage(STORAGE_KEYS.PAYROLL, updated);

    if (count > 0) {
      await this.addActivity({
        type: 'payroll',
        title: 'Bulk Payroll Settlement',
        description: `${actorName} marked ${count} payslip(s) as PAID for ${month}`,
        actorName,
      });
    }

    return count;
  },

  // ---- ACTIVITIES ----
  async getActivities(): Promise<ActivityItem[]> {
    return getFromStorage<ActivityItem[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  },

  async addActivity(item: Omit<ActivityItem, 'id' | 'timestamp'>): Promise<ActivityItem> {
    const activities = await this.getActivities();
    const newActivity: ActivityItem = {
      ...item,
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
    };
    const updated = [newActivity, ...activities.slice(0, 19)]; // keep latest 20
    saveToStorage(STORAGE_KEYS.ACTIVITIES, updated);
    return newActivity;
  },

  // ---- SYSTEM RESET ----
  resetToDefaultData(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
    window.localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
    window.localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
    window.localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(INITIAL_LEAVE_REQUESTS));
    window.localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(INITIAL_PAYROLL));
    window.localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
  },
};

