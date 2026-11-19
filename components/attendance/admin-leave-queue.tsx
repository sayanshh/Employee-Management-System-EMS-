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
      <div className="rounded-2xl border border-slate-200/90 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 mb-3 shadow-xs">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">All Caught Up!</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          There are zero pending leave requests requiring administrative review. New requests from staff will appear here immediately.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-600 shadow-xs">
            <Clock className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Leave Approval Queue
            </h3>
            <p className="text-xs text-slate-500">
              Review and act on pending staff time-off applications
            </p>
          </div>
        </div>

        <span className="rounded-full bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 text-xs font-bold shadow-xs">
          {pendingLeaves.length} Pending
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {pendingLeaves.map((req) => (
          <div
            key={req.id}
            className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4.5 flex flex-col justify-between space-y-3.5 hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{req.employeeName}</h4>
                  <p className="text-xs text-slate-500 font-medium">{req.departmentName} Department</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border capitalize',
                      req.leaveType === 'sick' && 'bg-rose-50 text-rose-700 border-rose-200',
                      req.leaveType === 'casual' && 'bg-amber-50 text-amber-700 border-amber-200',
                      req.leaveType === 'earned' && 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    )}
                  >
                    {req.leaveType}
                  </span>
                  <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 text-[10px] font-mono font-bold">
                    {req.days} Day(s)
                  </span>
                </div>
              </div>

              {/* Date & Reason */}
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-slate-800 font-mono font-medium">
                  <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                  <span>
                    {req.startDate} &rarr; {req.endDate}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    (Applied {req.appliedOn})
                  </span>
                </div>

                <div className="rounded-lg bg-white border border-slate-200 p-2.5 text-xs text-slate-700 italic shadow-xs">
                  &quot;{req.reason}&quot;
                </div>
              </div>
            </div>

            {/* Admin Remark Input & Action Buttons */}
            <div className="pt-3 border-t border-slate-200/60 space-y-2.5">
              <div className="relative">
                <MessageSquare className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Optional review note / handover remark..."
                  value={remarksState[req.id] || ''}
                  onChange={(e) => handleRemarkChange(req.id, e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDecision(req.id, 'approved')}
                  disabled={processingId === req.id}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 py-2 px-3 text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{processingId === req.id ? 'Saving...' : 'Approve Leave'}</span>
                </button>

                <button
                  onClick={() => handleDecision(req.id, 'rejected')}
                  disabled={processingId === req.id}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 py-2 px-3 text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-50 shadow-xs"
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

