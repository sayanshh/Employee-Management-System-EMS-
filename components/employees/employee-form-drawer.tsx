'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  IndianRupee,
  Shield,
  Sparkles,
} from 'lucide-react';
import { Employee, Department, EmployeeStatus, UserRole } from '@/types';
import { DataService } from '@/lib/data-service';

interface EmployeeFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedEmployee: Employee) => void;
  initialEmployee?: Employee | null;
  departments: Department[];
  adminName: string;
}

const INDIAN_LOCATIONS = [
  'Bengaluru',
  'Mumbai',
  'Pune',
  'Gurugram',
  'Hyderabad',
  'Noida',
  'Chennai',
  'Remote',
];

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
];

export function EmployeeFormDrawer({
  isOpen,
  onClose,
  onSuccess,
  initialEmployee,
  departments,
  adminName,
}: EmployeeFormDrawerProps) {
  const isEditMode = Boolean(initialEmployee);

  const [employeeCode, setEmployeeCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [departmentId, setDepartmentId] = useState('');
  const [designation, setDesignation] = useState('');
  const [location, setLocation] = useState('Bengaluru');
  const [joiningDate, setJoiningDate] = useState('');
  const [status, setStatus] = useState<EmployeeStatus>('active');
  const [role, setRole] = useState<UserRole>('employee');
  const [salary, setSalary] = useState<number>(1200000);
  const [sickLeave, setSickLeave] = useState<number>(12);
  const [casualLeave, setCasualLeave] = useState<number>(10);
  const [earnedLeave, setEarnedLeave] = useState<number>(18);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (initialEmployee) {
      setEmployeeCode(initialEmployee.employeeCode);
      setFullName(initialEmployee.fullName);
      setEmail(initialEmployee.email);
      setPhone(initialEmployee.phone);
      setDepartmentId(initialEmployee.departmentId);
      setDesignation(initialEmployee.designation);
      setLocation(initialEmployee.location);
      setJoiningDate(initialEmployee.joiningDate);
      setStatus(initialEmployee.status);
      setRole(initialEmployee.role);
      setSalary(initialEmployee.salary);
      setSickLeave(initialEmployee.leaveBalance?.sick ?? 12);
      setCasualLeave(initialEmployee.leaveBalance?.casual ?? 10);
      setEarnedLeave(initialEmployee.leaveBalance?.earned ?? 18);
      setAvatarUrl(initialEmployee.avatarUrl);
      setError('');
    } else {
      // Create mode: fetch next employee code
      DataService.getNextEmployeeCode().then((code) => setEmployeeCode(code));
      setFullName('');
      setEmail('');
      setPhone('+91 ');
      setDepartmentId(departments[0]?.id || 'dept-1');
      setDesignation('');
      setLocation('Bengaluru');
      setJoiningDate(new Date().toISOString().split('T')[0]);
      setStatus('active');
      setRole('employee');
      setSalary(1200000);
      setSickLeave(12);
      setCasualLeave(10);
      setEarnedLeave(18);
      const randomAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
      setAvatarUrl(randomAvatar);
      setError('');
    }
  }, [isOpen, initialEmployee, departments]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !designation.trim() || !departmentId) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid work email address.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const selectedDept = departments.find((d) => d.id === departmentId);
      const deptName = selectedDept ? selectedDept.name : 'Engineering';
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || firstName;

      const employeePayload: Employee = {
        id: initialEmployee ? initialEmployee.id : `emp-${Date.now()}`,
        userId: initialEmployee?.userId,
        employeeCode: employeeCode || `EMP-${Date.now().toString().slice(-4)}`,
        firstName,
        lastName,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        departmentId,
        departmentName: deptName,
        designation: designation.trim(),
        role,
        joiningDate: joiningDate || new Date().toISOString().split('T')[0],
        status,
        salary: Number(salary) || 0,
        location,
        avatarUrl: avatarUrl || DEFAULT_AVATARS[0],
        leaveBalance: {
          sick: Number(sickLeave) || 0,
          casual: Number(casualLeave) || 0,
          earned: Number(earnedLeave) || 0,
        },
      };

      await DataService.saveEmployee(employeePayload, adminName);
      onSuccess(employeePayload);
      onClose();
    } catch (err) {
      console.error('Error saving employee:', err);
      setError('Failed to save employee record. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-[#f7f4ed] border-l border-[#eceae4] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
          {/* Header */}
          <div className="p-6 border-b border-[#eceae4] flex items-center justify-between bg-[#f7f4ed]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#eceae4] text-[#1c1c1c]">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1c1c1c] -tracking-tight">
                  {isEditMode ? 'Edit Employee Record' : 'Onboard New Employee'}
                </h2>
                <p className="text-xs text-[#5f5f5d]">
                  {isEditMode
                    ? `Updating credentials for ${initialEmployee?.fullName}`
                    : 'Add a new member to the organization roster'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-[6px] p-1.5 text-[#5f5f5d] hover:text-[#1c1c1c] hover:bg-[#eceae4]/60 active:scale-90 transition-all duration-150"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Body */}
          <form id="employee-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {error && (
              <div className="rounded-[8px] border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                {error}
              </div>
            )}

            {/* Primary Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1c1c1c] flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-[#5f5f5d]" /> Basic Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#1c1c1c] mb-1">
                    Employee Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    placeholder="EMP-1015"
                    className="w-full rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-3 py-2 text-xs text-[#1c1c1c] placeholder:text-[#5f5f5d]/60 focus:border-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1c1c1c] mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ishaan Deshmukh"
                    className="w-full rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-3 py-2 text-xs text-[#1c1c1c] placeholder:text-[#5f5f5d]/60 focus:border-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#1c1c1c] mb-1">
                    Work Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-3 py-2 text-xs text-[#1c1c1c] placeholder:text-[#5f5f5d]/60 focus:border-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1c1c1c] mb-1">
                    Phone (+91 Indian Standard)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98201 55432"
                    className="w-full rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-3 py-2 text-xs text-[#1c1c1c] placeholder:text-[#5f5f5d]/60 focus:border-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Department & Role */}
            <div className="space-y-4 pt-3 border-t border-[#eceae4]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1c1c1c] flex items-center gap-1.5">
                <Briefcase className="h-3 w-3 text-[#5f5f5d]" /> Organization & Position
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#1c1c1c] mb-1">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-3 py-2 text-xs text-[#1c1c1c] focus:border-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1c1c1c] mb-1">
                    Designation / Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer"
                    className="w-full rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-3 py-2 text-xs text-[#1c1c1c] placeholder:text-[#5f5f5d]/60 focus:border-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#1c1c1c] mb-1">
                    Office Location
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-3 py-2 text-xs text-[#1c1c1c] focus:border-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]"
                  >
                    {INDIAN_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1c1c1c] mb-1">
                    Date of Joining
                  </label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-3 py-2 text-xs text-[#1c1c1c] focus:border-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#1c1c1c] mb-1">
                    Employment Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
                    className="w-full rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-3 py-2 text-xs text-[#1c1c1c] focus:border-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c] capitalize"
                  >
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="remote">Remote</option>
                    <option value="terminated">Terminated</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1c1c1c] mb-1">
                    Portal Access Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-3 py-2 text-xs text-[#1c1c1c] focus:border-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]"
                  >
                    <option value="employee">Employee (Standard Portal)</option>
                    <option value="admin">Admin (HR Manager Privileges)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Compensation & Leaves */}
            <div className="space-y-4 pt-3 border-t border-[#eceae4]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1c1c1c] flex items-center gap-1.5">
                <IndianRupee className="h-3 w-3 text-[#5f5f5d]" /> Compensation & Leave Quotas
              </h3>

              <div>
                <label className="block text-xs font-medium text-[#1c1c1c] mb-1">
                  Annual CTC (Gross INR ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#5f5f5d] font-mono">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="100000"
                    step="50000"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] pl-7 pr-3 py-2 text-xs text-[#1c1c1c] focus:border-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-rose-800 mb-1">
                    Sick Leave
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={sickLeave}
                    onChange={(e) => setSickLeave(Number(e.target.value))}
                    className="w-full rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-3 py-2 text-xs text-[#1c1c1c] focus:border-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c] font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-amber-800 mb-1">
                    Casual Leave
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={casualLeave}
                    onChange={(e) => setCasualLeave(Number(e.target.value))}
                    className="w-full rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-3 py-2 text-xs text-[#1c1c1c] focus:border-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c] font-mono text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-emerald-800 mb-1">
                    Earned Leave
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={earnedLeave}
                    onChange={(e) => setEarnedLeave(Number(e.target.value))}
                    className="w-full rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-3 py-2 text-xs text-[#1c1c1c] focus:border-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c] font-mono text-center"
                  />
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t border-[#eceae4] bg-[#f7f4ed] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-4 py-2 text-xs font-medium text-[#1c1c1c] hover:bg-[#eceae4]/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="employee-form"
              disabled={submitting}
              className="rounded-[6px] bg-[#1c1c1c] hover:bg-[#2b2b2b] text-[#fcfbf8] shadow-button-inset px-5 py-2 text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {submitting
                ? 'Saving Record...'
                : isEditMode
                ? 'Save Changes'
                : 'Confirm & Onboard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

