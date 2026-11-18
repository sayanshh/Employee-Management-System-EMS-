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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-[16px] border border-[#eceae4] bg-[#f7f4ed] shadow-2xl overflow-hidden my-auto animate-scale-in">
        {/* Modal Top Control Bar (Hidden in Print) */}
        <div className="no-print p-4 sm:px-6 border-b border-[#eceae4] flex items-center justify-between bg-[#f7f4ed]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1c1c1c]">
              Official Salary Slip
            </span>
            <span className="text-[#5f5f5d]">•</span>
            <span className="text-xs text-[#5f5f5d]">{record.month}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#1c1c1c] hover:bg-[#2b2b2b] text-[#fcfbf8] shadow-button-inset px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-[0.98]"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-[6px] p-1.5 text-[#5f5f5d] hover:text-[#1c1c1c] hover:bg-[#eceae4]/60 active:scale-90 transition-all duration-150"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Formal Payslip Container */}
        <div id="printable-payslip" className="p-6 sm:p-8 space-y-6 text-[#1c1c1c] print:text-black">
          {/* Company Official Letterhead */}
          <div className="border-b border-[#eceae4] print:border-black pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#eceae4] text-[#1c1c1c] border border-[#eceae4] print:border-black print:text-black">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1c1c1c] -tracking-tight print:text-black">
                    EMS CORE TECHNOLOGIES PVT. LTD.
                  </h1>
                  <p className="text-xs text-[#5f5f5d] print:text-gray-600">
                    Outer Ring Road, Bellandur, Bengaluru, Karnataka - 560103, India
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-[#5f5f5d] print:text-gray-500 mt-2">
                CIN: U72200KA2021PTC145678 • GSTIN: 29AABCE1234F1Z8 • TAN: BLRE12345F
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block rounded-[6px] bg-[#eceae4] text-[#1c1c1c] border border-[#eceae4] px-2.5 py-1 text-xs font-bold font-mono uppercase print:border-black print:text-black">
                {record.month}
              </span>
              <p className="text-xs text-[#5f5f5d] print:text-gray-600 mt-1">
                Disbursement Date: {record.paymentDate || '2026-11-30'}
              </p>
              <div className="mt-1">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border capitalize',
                    record.status === 'paid'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80 print:border-black print:text-black'
                      : 'bg-amber-50 text-amber-800 border-amber-200/80 print:border-black print:text-black'
                  )}
                >
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 print:text-black" />
                  {record.status}
                </span>
              </div>
            </div>
          </div>

          {/* Employee & Bank Particulars Grid */}
          <div className="rounded-[12px] border border-[#eceae4] print:border-black bg-[#eceae4]/30 print:bg-gray-50 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[#5f5f5d] print:text-gray-600 block text-[11px]">Employee Name</span>
              <strong className="text-[#1c1c1c] print:text-black mt-0.5 block">{record.employeeName}</strong>
            </div>
            <div>
              <span className="text-[#5f5f5d] print:text-gray-600 block text-[11px]">Employee ID</span>
              <span className="text-[#1c1c1c] print:text-black font-mono font-semibold mt-0.5 block">
                {record.employeeCode || record.employeeId}
              </span>
            </div>
            <div>
              <span className="text-[#5f5f5d] print:text-gray-600 block text-[11px]">Designation</span>
              <span className="text-[#1c1c1c] print:text-black mt-0.5 block">
                {record.designation || 'Staff Member'}
              </span>
            </div>
            <div>
              <span className="text-[#5f5f5d] print:text-gray-600 block text-[11px]">Department</span>
              <span className="text-[#1c1c1c] print:text-black mt-0.5 block">
                {record.departmentName || 'Engineering'}
              </span>
            </div>

            <div>
              <span className="text-[#5f5f5d] print:text-gray-600 block text-[11px]">Payment Mode</span>
              <span className="text-[#1c1c1c] print:text-black mt-0.5 block">Direct Bank Transfer</span>
            </div>
            <div>
              <span className="text-[#5f5f5d] print:text-gray-600 block text-[11px]">Bank Name</span>
              <span className="text-[#1c1c1c] print:text-black mt-0.5 block">HDFC Bank Ltd</span>
            </div>
            <div>
              <span className="text-[#5f5f5d] print:text-gray-600 block text-[11px]">Account Number</span>
              <span className="text-[#1c1c1c] print:text-black font-mono mt-0.5 block">•••• •••• 8492</span>
            </div>
            <div>
              <span className="text-[#5f5f5d] print:text-gray-600 block text-[11px]">Income Tax PAN</span>
              <span className="text-[#1c1c1c] print:text-black font-mono mt-0.5 block">ABCDE1234F</span>
            </div>
          </div>

          {/* Itemized Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Earnings Column */}
            <div className="rounded-[12px] border border-[#eceae4] print:border-black overflow-hidden">
              <div className="bg-[#eceae4]/50 print:bg-gray-100 p-2.5 px-3.5 border-b border-[#eceae4] print:border-black flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1c1c1c] print:text-black">
                  Earnings Breakdown
                </span>
                <span className="text-[11px] text-[#5f5f5d] print:text-gray-600 font-mono">Amount (INR)</span>
              </div>
              <div className="p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#5f5f5d] print:text-gray-800">
                  <span>Basic Pay (50%)</span>
                  <span className="font-mono text-[#1c1c1c]">{formatCurrencyINR(basic)}</span>
                </div>
                <div className="flex items-center justify-between text-[#5f5f5d] print:text-gray-800">
                  <span>House Rent Allowance / HRA (20%)</span>
                  <span className="font-mono text-[#1c1c1c]">{formatCurrencyINR(hra)}</span>
                </div>
                <div className="flex items-center justify-between text-[#5f5f5d] print:text-gray-800">
                  <span>Special Allowance (30%)</span>
                  <span className="font-mono text-[#1c1c1c]">{formatCurrencyINR(specialAllowance)}</span>
                </div>
                <div className="pt-2 border-t border-[#eceae4] print:border-black flex items-center justify-between font-bold text-[#1c1c1c] print:text-black">
                  <span>Total Gross Earnings</span>
                  <span className="font-mono text-emerald-800 print:text-black">
                    {formatCurrencyINR(gross)}
                  </span>
                </div>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="rounded-[12px] border border-[#eceae4] print:border-black overflow-hidden">
              <div className="bg-[#eceae4]/50 print:bg-gray-100 p-2.5 px-3.5 border-b border-[#eceae4] print:border-black flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1c1c1c] print:text-black">
                  Deductions Breakdown
                </span>
                <span className="text-[11px] text-[#5f5f5d] print:text-gray-600 font-mono">Amount (INR)</span>
              </div>
              <div className="p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#5f5f5d] print:text-gray-800">
                  <span>Provident Fund / EPF (12%)</span>
                  <span className="font-mono text-[#1c1c1c]">{formatCurrencyINR(pf)}</span>
                </div>
                <div className="flex items-center justify-between text-[#5f5f5d] print:text-gray-800">
                  <span>Professional Tax (PT)</span>
                  <span className="font-mono text-[#1c1c1c]">{formatCurrencyINR(pt)}</span>
                </div>
                <div className="flex items-center justify-between text-[#5f5f5d] print:text-gray-800">
                  <span>Unpaid Leave / LOP</span>
                  <span className="font-mono text-[#1c1c1c]">{formatCurrencyINR(leaveDeduction)}</span>
                </div>
                <div className="pt-2 border-t border-[#eceae4] print:border-black flex items-center justify-between font-bold text-[#1c1c1c] print:text-black">
                  <span>Total Deductions</span>
                  <span className="font-mono text-rose-800 print:text-black">
                    {formatCurrencyINR(totalDeductions)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Highlighted Net Payable Banner */}
          <div className="rounded-[12px] border border-[#eceae4] print:border-black bg-[#eceae4]/40 print:bg-gray-100 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#1c1c1c] print:text-black">
                Net Payable Amount
              </span>
              <p className="text-xs text-[#5f5f5d] print:text-gray-700 mt-1 italic">
                {numberToWordsINR(netSalary)}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[#1c1c1c] print:text-black">
                {formatCurrencyINR(netSalary)}
              </span>
              <span className="block text-[11px] text-[#5f5f5d] print:text-gray-600">
                Credited via RTGS/NEFT
              </span>
            </div>
          </div>

          {/* Statutory Formal Notice */}
          <div className="pt-3 border-t border-[#eceae4] print:border-black flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#5f5f5d] print:text-gray-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 print:text-black" />
              <span>Computer-generated official statement; no physical signature required.</span>
            </span>
            <span>Generated on {new Date().toLocaleDateString('en-IN')}</span>
          </div>
        </div>

        {/* Modal Bottom Controls (Hidden in Print) */}
        <div className="no-print p-4 sm:px-6 border-t border-[#eceae4] bg-[#f7f4ed] flex items-center justify-between">
          <span className="text-xs text-[#5f5f5d]">
            Print view automatically formats to formal letterhead layout.
          </span>
          <button
            onClick={onClose}
            className="rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-4 py-2 text-xs font-medium text-[#1c1c1c] hover:bg-[#eceae4]/50 transition-colors"
          >
            Close Payslip
          </button>
        </div>
      </div>
    </div>
  );
}

