'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Building,
  Laptop,
  LogOut,
  Sparkles,
  CheckCircle2,
  Calendar,
  Hourglass,
} from 'lucide-react';
import { AttendanceRecord, Employee } from '@/types';
import { DataService } from '@/lib/data-service';
import { cn } from '@/lib/utils';

interface LiveClockBannerProps {
  currentEmployee: Employee | null;
  attendanceToday: AttendanceRecord | null;
  onRefresh: () => void;
}

export function LiveClockBanner({
  currentEmployee,
  attendanceToday,
  onRefresh,
}: LiveClockBannerProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>('');
  const [elapsedTimer, setElapsedTimer] = useState<string>('00:00:00');
  const [processing, setProcessing] = useState(false);

  // Live Digital Clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentDateFormatted(
        now.toLocaleDateString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Elapsed Shift Timer
  useEffect(() => {
    if (!attendanceToday?.checkIn || attendanceToday.checkOut) {
      if (attendanceToday?.checkOut && attendanceToday.workHours) {
        const h = Math.floor(attendanceToday.workHours);
        const m = Math.round((attendanceToday.workHours - h) * 60);
        setElapsedTimer(`${h}h ${m}m 00s (Final)`);
      } else {
        setElapsedTimer('00:00:00');
      }
      return;
    }

    const updateTimer = () => {
      try {
        const now = new Date();
        const [timePart, modifier] = attendanceToday.checkIn!.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        const checkInDate = new Date();
        checkInDate.setHours(hours, minutes, 0, 0);

        let diffMs = now.getTime() - checkInDate.getTime();
        if (diffMs < 0) diffMs = 0;

        const diffSecs = Math.floor(diffMs / 1000);
        const h = Math.floor(diffSecs / 3600);
        const m = Math.floor((diffSecs % 3600) / 60);
        const s = diffSecs % 60;

        const pad = (n: number) => n.toString().padStart(2, '0');
        setElapsedTimer(`${pad(h)}:${pad(m)}:${pad(s)}`);
      } catch {
        setElapsedTimer('07:30:00');
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [attendanceToday]);

  const handleClockAction = async (action: 'office' | 'remote' | 'checkout') => {
    if (!currentEmployee) return;
    setProcessing(true);
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

      if (action === 'checkout') {
        await DataService.markAttendance({
          employeeId: currentEmployee.id,
          checkOut: timeStr,
        });
      } else {
        await DataService.markAttendance({
          employeeId: currentEmployee.id,
          checkIn: timeStr,
          status: action === 'office' ? 'present' : 'remote',
        });
      }
      onRefresh();
    } finally {
      setProcessing(false);
    }
  };

  // Determine current status label & pill
  const getStatusPill = () => {
    if (!attendanceToday?.checkIn) {
      return {
        label: 'Not Checked In',
        color: 'bg-slate-100 text-slate-600 border-slate-200',
        dot: 'bg-slate-400',
      };
    }
    if (attendanceToday.checkOut) {
      return {
        label: 'Shift Completed',
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dot: 'bg-indigo-600',
      };
    }
    if (attendanceToday.status === 'remote') {
      return {
        label: 'Working - Remote',
        color: 'bg-sky-50 text-sky-700 border-sky-200',
        dot: 'bg-sky-500 animate-pulse',
      };
    }
    return {
      label: 'Working - Office',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500 animate-pulse',
    };
  };

  const statusPill = getStatusPill();

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
        {/* Left Side: Clock, Date, and User Identification */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-violet-50/50 px-5 py-3 text-center sm:text-left min-w-[180px] shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-wider text-slate-900">
              {currentTime || '--:--:--'}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1 flex items-center justify-center sm:justify-start gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-indigo-500" />
              <span>{currentDateFormatted || 'Loading date...'}</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border shadow-xs',
                  statusPill.color
                )}
              >
                <span className={cn('h-2 w-2 rounded-full', statusPill.dot)} />
                {statusPill.label}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Logged as <strong className="text-slate-900 font-bold">{currentEmployee?.fullName}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium pt-1">
              <span>
                Punch In: <strong className="text-slate-900 font-mono font-bold">{attendanceToday?.checkIn || '--:--'}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span>
                Punch Out: <strong className="text-slate-900 font-mono font-bold">{attendanceToday?.checkOut || '--:--'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Active Shift Timer & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Active Shift Duration counter */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-center sm:text-right shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center sm:justify-end gap-1.5 tracking-wider">
              <Hourglass className="h-3 w-3 text-indigo-600" />
              Shift Duration
            </span>
            <div className="text-lg font-extrabold font-mono text-slate-900 tracking-wide mt-0.5">
              {elapsedTimer}
            </div>
          </div>

          {/* Action Punch Buttons */}
          <div className="flex items-center gap-2.5">
            {!attendanceToday?.checkIn ? (
              <>
                <button
                  onClick={() => handleClockAction('office')}
                  disabled={processing}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/25 px-4.5 py-2.5 text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Building className="h-4 w-4" />
                  <span>Clock In (Office)</span>
                </button>
                <button
                  onClick={() => handleClockAction('remote')}
                  disabled={processing}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white shadow-md shadow-sky-500/25 px-4.5 py-2.5 text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Laptop className="h-4 w-4" />
                  <span>Clock In (Remote)</span>
                </button>
              </>
            ) : !attendanceToday?.checkOut ? (
              <button
                onClick={() => handleClockAction('checkout')}
                disabled={processing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-md shadow-rose-500/25 px-5 py-2.5 text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Clock Out (End Shift)</span>
              </button>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Shift complete for today!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

