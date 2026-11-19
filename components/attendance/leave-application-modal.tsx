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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Apply for Leave</h3>
              <p className="text-xs text-slate-500">
                Filing as {employee.fullName} ({employee.employeeCode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-90 transition-all duration-150"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {validationError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 flex items-start gap-2.5 font-medium">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Leave Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Leave Category
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['casual', 'sick', 'earned'] as LeaveType[]).map((type) => {
                const balance = employee.leaveBalance?.[type] ?? 0;
                const isSelected = leaveType === type;
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setLeaveType(type)}
                    className={`rounded-xl border-2 p-3 text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/70 text-indigo-950 shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold capitalize text-slate-900">{type}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                          balance > 0 ? 'text-emerald-700 bg-emerald-100/80 border border-emerald-300' : 'text-rose-700 bg-rose-100/80 border border-rose-300'
                        }`}
                      >
                        {balance}d
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                      {type === 'sick' ? 'Medical' : type === 'casual' ? 'Personal' : 'Privilege'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs font-medium"
              />
            </div>
          </div>

          {/* Auto-computed Days Pill */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Total Working Days Requested:</span>
            <div className="flex items-center gap-1.5 font-bold font-mono text-slate-900">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span>{calculatedDays} day(s)</span>
            </div>
          </div>

          {/* Reason Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason / Purpose <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please describe the reason for your time-off request..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || Boolean(validationError) || calculatedDays === 0}
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/25 px-5 py-2 text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

