'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Employee, LeaveType } from '@/types';
import { DataService } from '@/lib/data-service';

interface LeaveApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employee: Employee | null;
}

export function LeaveApplicationModal({
  isOpen,
  onClose,
  onSuccess,
  employee,
}: LeaveApplicationModalProps) {
  const [leaveType, setLeaveType] = useState<LeaveType>('casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [calculatedDays, setCalculatedDays] = useState(1);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Default dates to tomorrow on open
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      setStartDate(tomorrowStr);
      setEndDate(tomorrowStr);
      setCalculatedDays(1);
      setReason('');
      setValidationError('');
    }
  }, [isOpen]);

  // Auto-calculate inclusive working days and validate
  useEffect(() => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      setValidationError('End date cannot precede start date.');
      setCalculatedDays(0);
      return;
    }

    // Calculate business/calendar days (excluding Sundays for Indian workweek)
    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const dayOfWeek = cur.getDay(); // 0 is Sunday
      if (dayOfWeek !== 0) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    const totalDays = Math.max(1, count);
    setCalculatedDays(totalDays);

    // Validate against leave quota
    const quota = employee?.leaveBalance?.[leaveType] ?? 0;
    if (totalDays > quota) {
      setValidationError(
        `Requested duration (${totalDays} days) exceeds your remaining ${leaveType} balance (${quota} days).`
      );
    } else {
      setValidationError('');
    }
  }, [startDate, endDate, leaveType, employee]);

  if (!isOpen || !employee) return null;

  const currentQuota = employee.leaveBalance?.[leaveType] ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      setValidationError('Please provide all mandatory fields.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setValidationError('End date cannot precede start date.');
      return;
    }

    if (calculatedDays > currentQuota) {
      setValidationError(`Exceeds available ${leaveType} leave balance.`);
      return;
    }

    setSubmitting(true);
    try {
      await DataService.createLeaveRequest({
        employeeId: employee.id,
        employeeName: employee.fullName,
        departmentName: employee.departmentName,
        leaveType,
        startDate,
        endDate,
        days: calculatedDays,
        reason: reason.trim(),
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to submit leave request:', err);
      setValidationError('Failed to submit leave request. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-[16px] border border-[#eceae4] bg-[#f7f4ed] p-6 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eceae4] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#eceae4] text-[#1c1c1c]">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1c1c1c] -tracking-tight">Apply for Leave</h3>
              <p className="text-xs text-[#5f5f5d]">
                Filing as {employee.fullName} ({employee.employeeCode})
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {validationError && (
            <div className="rounded-[8px] border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-700" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Leave Category Selector */}
          <div>
            <label className="block text-xs font-medium text-[#1c1c1c] mb-1.5">
              Select Leave Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['casual', 'sick', 'earned'] as LeaveType[]).map((type) => {
                const balance = employee.leaveBalance?.[type] ?? 0;
                const isSelected = leaveType === type;
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setLeaveType(type)}
                    className={`rounded-[8px] border p-2.5 text-left transition-all ${
                      isSelected
                        ? 'border-[#1c1c1c] bg-[#eceae4] text-[#1c1c1c]'
                        : 'border-[#eceae4] bg-[#f7f4ed] text-[#5f5f5d] hover:text-[#1c1c1c]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold capitalize text-[#1c1c1c]">{type}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          balance > 0 ? 'text-emerald-800 bg-emerald-50' : 'text-rose-800 bg-rose-50'
                        }`}
                      >
                        {balance}d
                      </span>
                    </div>
                    <span className="text-[10px] text-[#5f5f5d] mt-1 block">
                      {type === 'sick' ? 'Medical' : type === 'casual' ? 'Personal' : 'Privilege'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#1c1c1c] mb-1">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-3 py-2 text-xs text-[#1c1c1c] focus:border-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1c1c1c] mb-1">
                End Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-3 py-2 text-xs text-[#1c1c1c] focus:border-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]"
              />
            </div>
          </div>

          {/* Auto-computed Days Pill */}
          <div className="rounded-[8px] border border-[#eceae4] bg-[#eceae4]/40 p-3 flex items-center justify-between text-xs">
            <span className="text-[#5f5f5d]">Total Working Days Requested:</span>
            <div className="flex items-center gap-1.5 font-bold font-mono text-[#1c1c1c]">
              <Clock className="h-3.5 w-3.5 text-[#5f5f5d]" />
              <span>{calculatedDays} day(s)</span>
            </div>
          </div>

          {/* Reason Field */}
          <div>
            <label className="block text-xs font-medium text-[#1c1c1c] mb-1">
              Reason / Purpose <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please describe the reason for your time-off request..."
              className="w-full rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-3 py-2 text-xs text-[#1c1c1c] placeholder:text-[#5f5f5d]/60 focus:border-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c] resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#eceae4]">
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
              disabled={submitting || Boolean(validationError) || calculatedDays === 0}
              className="rounded-[6px] bg-[#1c1c1c] hover:bg-[#2b2b2b] text-[#fcfbf8] shadow-button-inset px-5 py-2 text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

