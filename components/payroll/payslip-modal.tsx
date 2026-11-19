'use client';

import React from 'react';
import { X, Printer, Download, CheckCircle2, Building2, ShieldCheck } from 'lucide-react';
import { PayrollRecord } from '@/types';
import { formatCurrencyINR, formatDate, numberToWordsINR, cn } from '@/lib/utils';

interface PayslipModalProps {
  record: PayrollRecord | null;
  isOpen: boolean;
  onClose: () => void;
  employeeJoiningDate?: string;
}

export function PayslipModal({
  record,
  isOpen,
  onClose,
  employeeJoiningDate,
}: PayslipModalProps) {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  // Derive itemized breakdown if not explicitly defined
  const gross = record.grossSalary || record.basicSalary + record.allowances;
  const basic = record.basicSalary;
  const hra = record.hra !== undefined ? record.hra : Math.round(gross * 0.2);
  const specialAllowance =
    record.specialAllowance !== undefined ? record.specialAllowance : Math.max(0, gross - basic - hra);
  const pf = record.pf !== undefined ? record.pf : Math.round(basic * 0.12);
  const pt = record.professionalTax !== undefined ? record.professionalTax : 200;
  const leaveDeduction = record.leaveDeductions || 0;
  const totalDeductions = record.deductions || pf + pt + leaveDeduction;
  const netSalary = record.netSalary || gross - totalDeductions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-auto animate-scale-in">
        {/* Modal Top Control Bar (Hidden in Print) */}
        <div className="no-print p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Official Salary Slip
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-indigo-600 font-bold font-mono">{record.month}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/25 px-4 py-2 text-xs font-bold transition-all active:scale-[0.98]"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-90 transition-all duration-150"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Formal Payslip Container */}
        <div id="printable-payslip" className="p-6 sm:p-8 space-y-6 text-slate-900 print:text-black">
          {/* Company Official Letterhead */}
          <div className="border-b border-slate-200 print:border-black pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 print:border-black print:text-black">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 print:text-black">
                    EMS CORE TECHNOLOGIES PVT. LTD.
                  </h1>
                  <p className="text-xs text-slate-500 print:text-gray-600">
                    Outer Ring Road, Bellandur, Bengaluru, Karnataka - 560103, India
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 print:text-gray-500 mt-2 font-medium">
                CIN: U72200KA2021PTC145678 • GSTIN: 29AABCE1234F1Z8 • TAN: BLRE12345F
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 text-xs font-bold font-mono uppercase print:border-black print:text-black shadow-xs">
                {record.month}
              </span>
              <p className="text-xs text-slate-500 print:text-gray-600 mt-1.5 font-medium">
                Disbursement Date: {record.paymentDate || '2026-11-30'}
              </p>
              <div className="mt-1.5">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border capitalize shadow-xs',
                    record.status === 'paid'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 print:border-black print:text-black'
                      : 'bg-amber-50 text-amber-700 border-amber-200 print:border-black print:text-black'
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 print:text-black" />
                  {record.status}
                </span>
              </div>
            </div>
          </div>

          {/* Employee & Bank Particulars Grid */}
          <div className="rounded-xl border border-slate-200 print:border-black bg-slate-50/70 print:bg-gray-50 p-4.5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 print:text-gray-600 block text-[11px] font-medium">Employee Name</span>
              <strong className="text-slate-900 print:text-black mt-0.5 block font-bold">{record.employeeName}</strong>
            </div>
            <div>
              <span className="text-slate-500 print:text-gray-600 block text-[11px] font-medium">Employee ID</span>
              <span className="text-indigo-600 print:text-black font-mono font-bold mt-0.5 block">
                {record.employeeCode || record.employeeId}
              </span>
            </div>
            <div>
              <span className="text-slate-500 print:text-gray-600 block text-[11px] font-medium">Designation</span>
              <span className="text-slate-800 print:text-black mt-0.5 block font-medium">
                {record.designation || 'Staff Member'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 print:text-gray-600 block text-[11px] font-medium">Department</span>
              <span className="text-slate-800 print:text-black mt-0.5 block font-medium">
                {record.departmentName || 'Engineering'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 print:text-gray-600 block text-[11px] font-medium">Payment Mode</span>
              <span className="text-slate-800 print:text-black mt-0.5 block font-medium">Direct Bank Transfer</span>
            </div>
            <div>
              <span className="text-slate-500 print:text-gray-600 block text-[11px] font-medium">Bank Name</span>
              <span className="text-slate-800 print:text-black mt-0.5 block font-medium">HDFC Bank Ltd</span>
            </div>
            <div>
              <span className="text-slate-500 print:text-gray-600 block text-[11px] font-medium">Account Number</span>
              <span className="text-slate-800 print:text-black font-mono mt-0.5 block font-medium">•••• •••• 8492</span>
            </div>
            <div>
              <span className="text-slate-500 print:text-gray-600 block text-[11px] font-medium">Income Tax PAN</span>
              <span className="text-slate-800 print:text-black font-mono mt-0.5 block font-medium">ABCDE1234F</span>
            </div>
          </div>

          {/* Itemized Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Earnings Column */}
            <div className="rounded-xl border border-slate-200 print:border-black overflow-hidden shadow-xs">
              <div className="bg-slate-50 print:bg-gray-100 p-3 px-4 border-b border-slate-200 print:border-black flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 print:text-black">
                  Earnings Breakdown
                </span>
                <span className="text-[11px] text-slate-500 print:text-gray-600 font-mono font-medium">Amount (INR)</span>
              </div>
              <div className="p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 print:text-gray-800 font-medium">
                  <span>Basic Pay (50%)</span>
                  <span className="font-mono text-slate-900 font-semibold">{formatCurrencyINR(basic)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 print:text-gray-800 font-medium">
                  <span>House Rent Allowance / HRA (20%)</span>
                  <span className="font-mono text-slate-900 font-semibold">{formatCurrencyINR(hra)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 print:text-gray-800 font-medium">
                  <span>Special Allowance (30%)</span>
                  <span className="font-mono text-slate-900 font-semibold">{formatCurrencyINR(specialAllowance)}</span>
                </div>
                <div className="pt-2.5 border-t border-slate-100 print:border-black flex items-center justify-between font-bold text-slate-900 print:text-black">
                  <span>Total Gross Earnings</span>
                  <span className="font-mono text-emerald-700 print:text-black text-sm">
                    {formatCurrencyINR(gross)}
                  </span>
                </div>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="rounded-xl border border-slate-200 print:border-black overflow-hidden shadow-xs">
              <div className="bg-slate-50 print:bg-gray-100 p-3 px-4 border-b border-slate-200 print:border-black flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 print:text-black">
                  Deductions Breakdown
                </span>
                <span className="text-[11px] text-slate-500 print:text-gray-600 font-mono font-medium">Amount (INR)</span>
              </div>
              <div className="p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 print:text-gray-800 font-medium">
                  <span>Provident Fund / EPF (12%)</span>
                  <span className="font-mono text-rose-700 font-semibold">-{formatCurrencyINR(pf)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 print:text-gray-800 font-medium">
                  <span>Professional Tax (PT)</span>
                  <span className="font-mono text-rose-700 font-semibold">-{formatCurrencyINR(pt)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 print:text-gray-800 font-medium">
                  <span>Unpaid Leave / LOP</span>
                  <span className="font-mono text-rose-700 font-semibold">-{formatCurrencyINR(leaveDeduction)}</span>
                </div>
                <div className="pt-2.5 border-t border-slate-100 print:border-black flex items-center justify-between font-bold text-slate-900 print:text-black">
                  <span>Total Deductions</span>
                  <span className="font-mono text-rose-700 print:text-black text-sm">
                    -{formatCurrencyINR(totalDeductions)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Highlighted Net Payable Banner */}
          <div className="rounded-2xl border-2 border-emerald-200 print:border-black bg-gradient-to-r from-emerald-50/80 to-teal-50/50 print:bg-gray-100 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-900 print:text-black">
                Net Payable Amount
              </span>
              <p className="text-xs text-emerald-800 print:text-gray-700 mt-1 italic font-medium">
                {numberToWordsINR(netSalary)}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-700 print:text-black">
                {formatCurrencyINR(netSalary)}
              </span>
              <span className="block text-[11px] text-emerald-600 print:text-gray-600 font-medium mt-0.5">
                Credited via RTGS/NEFT
              </span>
            </div>
          </div>

          {/* Statutory Formal Notice */}
          <div className="pt-3 border-t border-slate-200 print:border-black flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 print:text-gray-500 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 print:text-black" />
              <span>Computer-generated official statement; no physical signature required.</span>
            </span>
            <span>Generated on {new Date().toLocaleDateString('en-IN')}</span>
          </div>
        </div>

        {/* Modal Bottom Controls (Hidden in Print) */}
        <div className="no-print p-4 sm:px-6 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Print view automatically formats to formal letterhead layout.
          </span>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-xs"
          >
            Close Payslip
          </button>
        </div>
      </div>
    </div>
  );
}

