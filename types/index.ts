export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  employeeId?: string;
  department?: string;
  designation?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  managerId: string;
  managerName: string;
  color: string;
  iconName?: string;
}

export type EmployeeStatus = 'active' | 'on_leave' | 'remote' | 'terminated' | 'inactive';

export interface LeaveBalance {
  sick: number;
  casual: number;
  earned: number;
}

export interface Employee {
  id: string;
  userId?: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  designation: string;
  role: UserRole;
  joiningDate: string;
  status: EmployeeStatus;
  salary: number; // in INR
  location: string;
  avatarUrl: string;
  leaveBalance: LeaveBalance;
}

export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'on_leave' | 'remote';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  workHours: number;
}

export type LeaveType = 'sick' | 'casual' | 'earned';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  reviewedBy?: string;
  reviewedAt?: string;
  adminRemarks?: string;
}

export type PayrollStatus = 'paid' | 'processing' | 'pending';

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeCode?: string;
  employeeName: string;
  designation?: string;
  departmentName?: string;
  month: string;
  grossSalary?: number;
  basicSalary: number;
  hra?: number;
  specialAllowance?: number;
  allowances: number;
  pf?: number;
  professionalTax?: number;
  leaveDeductions?: number;
  deductions: number;
  netSalary: number;
  status: PayrollStatus;
  paymentDate: string;
}

export interface ActivityItem {
  id: string;
  type: 'leave' | 'attendance' | 'onboarding' | 'payroll';
  title: string;
  description: string;
  timestamp: string;
  actorName: string;
  actorAvatar?: string;
}

