'use client';

import React, { useState } from 'react';
import { LeaveType } from '@/types';
import { X } from 'lucide-react';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
  }) => Promise<void>;
  employeeName: string;
}

export function LeaveRequestModal({
  isOpen,
  onClose,
  onSubmit,
  employeeName,
}: LeaveRequestModalProps) {
  const [leaveType, setLeaveType] = useState<LeaveType>('casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState(1);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) return;
    setSubmitting(true);
    try {
      await onSubmit({
        leaveType,
        startDate,
        endDate,
        days: Number(days),
        reason,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-[16px] border border-[#eceae4] bg-[#f7f4ed] p-6 shadow-warm-focus">
        <div className="flex items-center justify-between border-b border-[#eceae4] pb-4">
          <div>
            <h3 className="text-base font-semibold text-[#1c1c1c] tracking-tight">Apply for Leave</h3>
            <p className="text-xs text-[#5f5f5d]">Applying as {employeeName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-[6px] p-1.5 text-[#5f5f5d] hover:text-[#1c1c1c] hover:bg-[rgba(28,28,28,0.04)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#1c1c1c] mb-1.5">
              Leave Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['casual', 'sick', 'earned'] as LeaveType[]).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setLeaveType(type)}
                  className={`rounded-[6px] border py-2 px-3 text-xs font-medium capitalize transition-all ${
                    leaveType === type
                      ? 'border-[#1c1c1c] bg-[#1c1c1c] text-[#fcfbf8] shadow-button-inset'
                      : 'border-[#eceae4] bg-[#f7f4ed] text-[#5f5f5d] hover:text-[#1c1c1c] hover:border-[rgba(28,28,28,0.4)]'
                  }`}
                >
                  {type} Leave
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#1c1c1c] mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="lovable-input w-full px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1c1c1c] mb-1.5">
                End Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="lovable-input w-full px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1c1c1c] mb-1.5">
              Number of Working Days
            </label>
            <input
              type="number"
              min="1"
              max="30"
              required
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="lovable-input w-full px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1c1c1c] mb-1.5">
              Reason / Remarks
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide the purpose of your leave request..."
              className="lovable-input w-full px-3 py-2 text-xs resize-none"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#eceae4]">
            <button
              type="button"
              onClick={onClose}
              className="lovable-button-ghost text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="lovable-button-primary text-xs disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
