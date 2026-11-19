'use client';

import React, { useState } from 'react';
import { AlertTriangle, Trash2, UserX, X, ShieldAlert } from 'lucide-react';
import { Employee } from '@/types';
import { DataService } from '@/lib/data-service';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onSuccess: () => void;
  currentUserId?: string;
  adminName: string;
}

export function DeleteConfirmDialog({
  isOpen,
  employee,
  onClose,
  onSuccess,
  currentUserId,
  adminName,
}: DeleteConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<'terminate' | 'permanent'>('terminate');

  if (!isOpen || !employee) return null;

  const isSelf = employee.id === currentUserId || employee.userId === currentUserId;

  const handleConfirm = async () => {
    if (isSelf) return;
    setLoading(true);
    try {
      if (actionType === 'terminate') {
        await DataService.terminateEmployee(employee.id, adminName);
      } else {
        await DataService.deleteEmployee(employee.id, adminName);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to process employee action:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3 text-rose-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 border border-rose-200 text-rose-600 shadow-xs">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Manage Status / Removal</h3>
              <p className="text-[11px] text-slate-500 font-medium">Administrative Action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-90 transition-all duration-150"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          {isSelf ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-bold">Action Prevented</p>
                <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                  You are currently logged in as {employee.fullName}. You cannot terminate or delete your own active administrator account.
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-slate-600 font-medium">
                You are about to modify the organizational status of:
              </p>

              {/* Target info card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex items-center gap-3">
                <img
                  src={employee.avatarUrl}
                  alt={employee.fullName}
                  className="h-10 w-10 rounded-xl object-cover ring-2 ring-indigo-500/20 shadow-xs"
                />
                <div>
                  <div className="font-bold text-slate-900">{employee.fullName}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    <span className="font-mono font-semibold text-indigo-600">{employee.employeeCode}</span> • {employee.designation} ({employee.departmentName})
                  </div>
                </div>
              </div>

              {/* Options selection */}
              <div className="space-y-2.5 pt-1">
                <label
                  onClick={() => setActionType('terminate')}
                  className={`flex items-start gap-3 rounded-xl border-2 p-3.5 cursor-pointer transition-all ${
                    actionType === 'terminate'
                      ? 'border-amber-400 bg-amber-50/60 text-amber-950 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="actionType"
                    checked={actionType === 'terminate'}
                    onChange={() => setActionType('terminate')}
                    className="mt-0.5 accent-amber-600"
                  />
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <UserX className="h-4 w-4 text-amber-600" />
                      Mark as Terminated (Recommended)
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Sets employment status to Terminated. Retains historic attendance and payroll records for compliance.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setActionType('permanent')}
                  className={`flex items-start gap-3 rounded-xl border-2 p-3.5 cursor-pointer transition-all ${
                    actionType === 'permanent'
                      ? 'border-rose-400 bg-rose-50/60 text-rose-950 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="actionType"
                    checked={actionType === 'permanent'}
                    onChange={() => setActionType('permanent')}
                    className="mt-0.5 accent-rose-600"
                  />
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Trash2 className="h-4 w-4 text-rose-600" />
                      Permanently Delete Record
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Completely purges this employee from the directory and database. This action cannot be undone.
                    </p>
                  </div>
                </label>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-xs"
          >
            Cancel
          </button>
          {!isSelf && (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={`rounded-lg px-4.5 py-2 text-xs font-bold text-white transition-all shadow-md disabled:opacity-50 active:scale-[0.98] ${
                actionType === 'terminate'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-500/25'
                  : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-rose-500/25'
              }`}
            >
              {loading
                ? 'Processing...'
                : actionType === 'terminate'
                ? 'Confirm Termination'
                : 'Confirm Deletion'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

