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
        color: 'bg-[#eceae4]/70 text-[#5f5f5d] border-[#eceae4]',
        dot: 'bg-[#5f5f5d]',
      };
    }
    if (attendanceToday.checkOut) {
      return {
        label: 'Shift Completed',
        color: 'bg-[#eceae4] text-[#1c1c1c] border-[#eceae4]',
        dot: 'bg-[#1c1c1c]',
      };
    }
    if (attendanceToday.status === 'remote') {
      return {
        label: 'Working - Remote',
        color: 'bg-sky-50 text-sky-800 border-sky-200/80',
        dot: 'bg-sky-600 animate-pulse',
      };
    }
    return {
      label: 'Working - Office',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      dot: 'bg-emerald-600 animate-pulse',
    };
  };

  const statusPill = getStatusPill();

  return (
    <div className="rounded-[16px] border border-[#eceae4] bg-[#f7f4ed] p-5 sm:p-6 shadow-sm relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
        {/* Left Side: Clock, Date, and User Identification */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="rounded-[12px] border border-[#eceae4] bg-[#f7f4ed] px-4 py-3 text-center sm:text-left min-w-[170px]">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-wider text-[#1c1c1c]">
              {currentTime || '--:--:--'}
            </div>
            <p className="text-[11px] text-[#5f5f5d] mt-1 flex items-center justify-center sm:justify-start gap-1">
              <Calendar className="h-3 w-3 text-[#5f5f5d]" />
              <span>{currentDateFormatted || 'Loading date...'}</span>
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border',
                  statusPill.color
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', statusPill.dot)} />
                {statusPill.label}
              </span>
              <span className="text-xs text-[#5f5f5d]">
                Logged as <strong className="text-[#1c1c1c]">{currentEmployee?.fullName}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#5f5f5d] pt-1">
              <span>
                Punch In: <strong className="text-[#1c1c1c] font-mono">{attendanceToday?.checkIn || '--:--'}</strong>
              </span>
              <span>•</span>
              <span>
                Punch Out: <strong className="text-[#1c1c1c] font-mono">{attendanceToday?.checkOut || '--:--'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Active Shift Timer & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Active Shift Duration counter */}
          <div className="rounded-[12px] border border-[#eceae4] bg-[#f7f4ed] px-4 py-2.5 text-center sm:text-right">
            <span className="text-[10px] uppercase font-semibold text-[#5f5f5d] flex items-center justify-center sm:justify-end gap-1">
              <Hourglass className="h-3 w-3 text-[#1c1c1c]" />
              Shift Duration
            </span>
            <div className="text-lg font-bold font-mono text-[#1c1c1c] tracking-wide mt-0.5">
              {elapsedTimer}
            </div>
          </div>

          {/* Action Punch Buttons */}
          <div className="flex items-center gap-2">
            {!attendanceToday?.checkIn ? (
              <>
                <button
                  onClick={() => handleClockAction('office')}
                  disabled={processing}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-[6px] bg-[#1c1c1c] hover:bg-[#2b2b2b] text-[#fcfbf8] shadow-button-inset px-4 py-2.5 text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Building className="h-4 w-4" />
                  <span>Clock In (Office)</span>
                </button>
                <button
                  onClick={() => handleClockAction('remote')}
                  disabled={processing}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-[6px] border border-[rgba(28,28,28,0.2)] bg-transparent hover:bg-[#1c1c1c]/[0.05] text-[#1c1c1c] px-4 py-2.5 text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Laptop className="h-4 w-4" />
                  <span>Clock In (Remote)</span>
                </button>
              </>
            ) : !attendanceToday?.checkOut ? (
              <button
                onClick={() => handleClockAction('checkout')}
                disabled={processing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-[6px] border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 px-5 py-2.5 text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Clock Out (End Shift)</span>
              </button>
            ) : (
              <div className="rounded-[6px] border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-800 flex items-center gap-2">
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

