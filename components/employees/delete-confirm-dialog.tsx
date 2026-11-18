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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-[16px] border border-[#eceae4] bg-[#f7f4ed] p-6 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between border-b border-[#eceae4] pb-4">
          <div className="flex items-center gap-2.5 text-rose-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-rose-50 border border-rose-200">
              <AlertTriangle className="h-4 w-4 text-rose-700" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1c1c1c]">Manage Status / Removal</h3>
              <p className="text-[11px] text-[#5f5f5d]">Administrative Action</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-[6px] p-1.5 text-[#5f5f5d] hover:text-[#1c1c1c] hover:bg-[#eceae4]/60 active:scale-90 transition-all duration-150"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          {isSelf ? (
            <div className="rounded-[12px] border border-amber-200 bg-amber-50 p-3.5 text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 text-amber-700" />
              <div>
                <p className="font-semibold">Action Prevented</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  You are currently logged in as {employee.fullName}. You cannot terminate or delete your own active administrator account.
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[#5f5f5d]">
                You are about to modify the organizational status of:
              </p>

              {/* Target info card */}
              <div className="rounded-[12px] border border-[#eceae4] bg-[#f7f4ed] p-3 flex items-center gap-3">
                <img
                  src={employee.avatarUrl}
                  alt={employee.fullName}
                  className="h-10 w-10 rounded-[8px] object-cover ring-1 ring-[#eceae4]"
                />
                <div>
                  <div className="font-semibold text-[#1c1c1c]">{employee.fullName}</div>
                  <div className="text-[11px] text-[#5f5f5d]">
                    {employee.employeeCode} • {employee.designation} ({employee.departmentName})
                  </div>
                </div>
              </div>

              {/* Options selection */}
              <div className="space-y-2 pt-1">
                <label
                  onClick={() => setActionType('terminate')}
                  className={`flex items-start gap-3 rounded-[12px] border p-3 cursor-pointer transition-all ${
                    actionType === 'terminate'
                      ? 'border-amber-300 bg-amber-50/70 text-amber-900'
                      : 'border-[#eceae4] bg-[#f7f4ed] text-[#5f5f5d] hover:text-[#1c1c1c]'
                  }`}
                >
                  <input
                    type="radio"
                    name="actionType"
                    checked={actionType === 'terminate'}
                    onChange={() => setActionType('terminate')}
                    className="mt-0.5 accent-[#1c1c1c]"
                  />
                  <div>
                    <div className="font-medium text-[#1c1c1c] flex items-center gap-1.5">
                      <UserX className="h-3.5 w-3.5 text-amber-700" />
                      Mark as Terminated (Recommended)
                    </div>
                    <p className="text-[11px] text-[#5f5f5d] mt-0.5">
                      Sets employment status to Terminated. Retains historic attendance and payroll records for compliance.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setActionType('permanent')}
                  className={`flex items-start gap-3 rounded-[12px] border p-3 cursor-pointer transition-all ${
                    actionType === 'permanent'
                      ? 'border-rose-300 bg-rose-50/70 text-rose-900'
                      : 'border-[#eceae4] bg-[#f7f4ed] text-[#5f5f5d] hover:text-[#1c1c1c]'
                  }`}
                >
                  <input
                    type="radio"
                    name="actionType"
                    checked={actionType === 'permanent'}
                    onChange={() => setActionType('permanent')}
                    className="mt-0.5 accent-[#1c1c1c]"
                  />
                  <div>
                    <div className="font-medium text-[#1c1c1c] flex items-center gap-1.5">
                      <Trash2 className="h-3.5 w-3.5 text-rose-700" />
                      Permanently Delete Record
                    </div>
                    <p className="text-[11px] text-[#5f5f5d] mt-0.5">
                      Completely purges this employee from the directory and database. This action cannot be undone.
                    </p>
                  </div>
                </label>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-[#eceae4]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-4 py-2 text-xs font-medium text-[#1c1c1c] hover:bg-[#eceae4]/50 transition-colors"
          >
            Cancel
          </button>
          {!isSelf && (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={`rounded-[6px] px-4 py-2 text-xs font-semibold text-[#fcfbf8] transition-all shadow-button-inset disabled:opacity-50 active:scale-[0.98] ${
                actionType === 'terminate'
                  ? 'bg-amber-700 hover:bg-amber-800'
                  : 'bg-rose-700 hover:bg-rose-800'
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

