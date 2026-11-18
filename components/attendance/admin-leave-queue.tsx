'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Sparkles,
  Calendar,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { LeaveRequest, LeaveStatus } from '@/types';
import { DataService } from '@/lib/data-service';
import { cn } from '@/lib/utils';

interface AdminLeaveQueueProps {
  pendingLeaves: LeaveRequest[];
  onDecisionComplete: () => void;
  adminName: string;
}

export function AdminLeaveQueue({
  pendingLeaves,
  onDecisionComplete,
  adminName,
}: AdminLeaveQueueProps) {
  const [remarksState, setRemarksState] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleRemarkChange = (id: string, text: string) => {
    setRemarksState((prev) => ({
      ...prev,
      [id]: text,
    }));
  };

  const handleDecision = async (id: string, decision: LeaveStatus) => {
    setProcessingId(id);
    try {
      const remark = remarksState[id] || '';
      await DataService.updateLeaveStatus(id, decision, adminName, remark);
      // Clean up local remark state
      setRemarksState((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      onDecisionComplete();
    } catch (err) {
      console.error('Error processing leave decision:', err);
    } finally {
      setProcessingId(null);
    }
  };

  if (pendingLeaves.length === 0) {
    return (
      <div className="rounded-[16px] border border-[#eceae4] bg-[#f7f4ed] p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[12px] bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-[#1c1c1c]">All Caught Up!</h3>
        <p className="text-xs text-[#5f5f5d] mt-1 max-w-sm mx-auto">
          There are zero pending leave requests requiring administrative review. New requests from staff will appear here immediately.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[16px] border border-[#eceae4] bg-[#f7f4ed] p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-[#eceae4] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#eceae4] text-[#1c1c1c]">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1c1c1c] -tracking-tight">
              Leave Approval Queue
            </h3>
            <p className="text-xs text-[#5f5f5d]">
              Review and act on pending staff time-off applications
            </p>
          </div>
        </div>

        <span className="rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 px-2.5 py-0.5 text-xs font-semibold">
          {pendingLeaves.length} Pending
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {pendingLeaves.map((req) => (
          <div
            key={req.id}
            className="rounded-[12px] border border-[#eceae4] bg-[#f7f4ed] p-4 flex flex-col justify-between space-y-3 lovable-card-interactive shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-[#1c1c1c]">{req.employeeName}</h4>
                  <p className="text-xs text-[#5f5f5d]">{req.departmentName} Department</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border capitalize',
                      req.leaveType === 'sick' && 'bg-rose-50 text-rose-800 border-rose-200/80',
                      req.leaveType === 'casual' && 'bg-amber-50 text-amber-800 border-amber-200/80',
                      req.leaveType === 'earned' && 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                    )}
                  >
                    {req.leaveType}
                  </span>
                  <span className="rounded-full bg-[#eceae4] text-[#1c1c1c] border border-[#eceae4] px-2 py-0.5 text-[10px] font-mono font-semibold">
                    {req.days} Day(s)
                  </span>
                </div>
              </div>

              {/* Date & Reason */}
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-[#1c1c1c] font-mono">
                  <Calendar className="h-3.5 w-3.5 text-[#5f5f5d]" />
                  <span>
                    {req.startDate} &rarr; {req.endDate}
                  </span>
                  <span className="text-[#5f5f5d] text-[11px]">
                    (Applied {req.appliedOn})
                  </span>
                </div>

                <div className="rounded-[8px] bg-[#eceae4]/40 border border-[#eceae4] p-2.5 text-xs text-[#1c1c1c] italic">
                  &quot;{req.reason}&quot;
                </div>
              </div>
            </div>

            {/* Admin Remark Input & Action Buttons */}
            <div className="pt-2 border-t border-[#eceae4] space-y-2.5">
              <div className="relative">
                <MessageSquare className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#5f5f5d]" />
                <input
                  type="text"
                  placeholder="Optional review note / handover remark..."
                  value={remarksState[req.id] || ''}
                  onChange={(e) => handleRemarkChange(req.id, e.target.value)}
                  className="w-full rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] pl-8 pr-3 py-1.5 text-xs text-[#1c1c1c] placeholder-[#5f5f5d]/60 focus:border-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDecision(req.id, 'approved')}
                  disabled={processingId === req.id}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-[6px] bg-[#1c1c1c] hover:bg-[#2b2b2b] text-[#fcfbf8] shadow-button-inset py-1.5 px-3 text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{processingId === req.id ? 'Saving...' : 'Approve Leave'}</span>
                </button>

                <button
                  onClick={() => handleDecision(req.id, 'rejected')}
                  disabled={processingId === req.id}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-[6px] border border-[rgba(28,28,28,0.2)] bg-transparent hover:bg-[#1c1c1c]/[0.05] text-[#1c1c1c] py-1.5 px-3 text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>{processingId === req.id ? 'Saving...' : 'Reject Leave'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

