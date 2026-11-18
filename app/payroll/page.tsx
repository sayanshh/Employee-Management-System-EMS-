'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useAuth } from '@/lib/auth-context';
import { DataService } from '@/lib/data-service';
import { PayrollRecord, Employee, PayrollStatus } from '@/types';
import { PayslipModal } from '@/components/payroll/payslip-modal';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Play,
  Download,
  Search,
  Filter,
  TrendingUp,
  Building2,
  Sparkles,
  FileText,
  IndianRupee,
  CheckCheck,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { formatCurrencyINR, formatDate, cn } from '@/lib/utils';

const PAYROLL_MONTHS = [
  'November 2026',
  'October 2026',
  'September 2026',
  'August 2026',
];

export default function PayrollPage() {
  const { user, role } = useAuth();

  // Data states
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Cycle states
  const [selectedMonth, setSelectedMonth] = useState<string>('November 2026');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  // Interactive action states
  const [processingRun, setProcessingRun] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);

  const loadData = async () => {
    try {
      const [payList, empList] = await Promise.all([
        DataService.getPayrollRecords(),
        DataService.getEmployees(),
      ]);
      setPayroll(payList);
      setEmployees(empList);
    } catch (err) {
      console.error('Failed to load payroll data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Identify current logged-in employee record
  const currentEmployee = useMemo(() => {
    return (
      employees.find(
        (e) => e.id === user?.employeeId || e.email.toLowerCase() === user?.email?.toLowerCase()
      ) || (employees.length > 0 ? employees[0] : null)
    );
  }, [employees, user]);

  // "Run Monthly Payroll" Generator (Admin Only)
  const handleRunPayroll = async () => {
    setProcessingRun(true);
    setActionSuccessMsg('');
    try {
      await DataService.runMonthlyPayroll(selectedMonth, user?.name || 'HR Admin');
      await loadData();
      setActionSuccessMsg(`Successfully executed and generated payroll records for ${selectedMonth}!`);
      setTimeout(() => setActionSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Payroll generation failed:', err);
    } finally {
      setProcessingRun(false);
    }
  };

  // Single "Mark as Paid"
  const handleMarkAsPaid = async (id: string) => {
    await DataService.updatePayrollStatus(id, 'paid', user?.name || 'HR Admin');
    loadData();
  };

  // Bulk "Mark All Pending as Paid"
  const handleBulkPay = async () => {
    if (confirm(`Disburse and mark all pending payslips for ${selectedMonth} as PAID?`)) {
      const settledCount = await DataService.markBulkPayrollPaid(selectedMonth, user?.name || 'HR Admin');
      await loadData();
      setActionSuccessMsg(`Successfully disbursed ${settledCount} pending payslips for ${selectedMonth}!`);
      setTimeout(() => setActionSuccessMsg(''), 5000);
    }
  };

  // Filtered records for selected month (Admin View)
  const filteredMonthRecords = useMemo(() => {
    return payroll.filter((p) => {
      const matchesMonth = p.month === selectedMonth;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesSearch =
        !search ||
        p.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        (p.employeeCode && p.employeeCode.toLowerCase().includes(search.toLowerCase()));
      return matchesMonth && matchesStatus && matchesSearch;
    });
  }, [payroll, selectedMonth, statusFilter, search]);

  // Admin Payroll Summary KPIs for selected month
  const monthKpis = useMemo(() => {
    const monthRecords = payroll.filter((p) => p.month === selectedMonth);
    const totalGross = monthRecords.reduce((acc, cur) => acc + (cur.grossSalary || cur.basicSalary + cur.allowances), 0);
    const totalDeductions = monthRecords.reduce((acc, cur) => acc + cur.deductions, 0);
    const totalNet = monthRecords.reduce((acc, cur) => acc + cur.netSalary, 0);
    const paidCount = monthRecords.filter((p) => p.status === 'paid').length;
    const pendingCount = monthRecords.filter((p) => p.status === 'pending').length;
    const totalCount = monthRecords.length;

    return { totalGross, totalDeductions, totalNet, paidCount, pendingCount, totalCount };
  }, [payroll, selectedMonth]);

  // Employee View: Personal payslip records
  const personalPayslips = useMemo(() => {
    if (!currentEmployee) return [];
    return payroll
      .filter((p) => p.employeeId === currentEmployee.id || p.employeeName.toLowerCase() === currentEmployee.fullName.toLowerCase())
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [payroll, currentEmployee]);

  // Personal Compensation Overview Card figures
  const personalComp = useMemo(() => {
    if (!currentEmployee) return null;
    const gross = Math.round(currentEmployee.salary / 12);
    const basic = Math.round(gross * 0.5);
    const hra = Math.round(gross * 0.2);
    const special = gross - basic - hra;
    const pf = Math.round(basic * 0.12);
    const pt = 200;
    const deductions = pf + pt;
    const net = gross - deductions;
    return { gross, basic, hra, special, pf, pt, deductions, net };
  }, [currentEmployee]);

  return (
    <DashboardShell title="Payroll & Compensation Management">
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Top Header & Context Description */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1c1c1c] -tracking-tight">
                {role === 'admin' ? 'Payroll Administration' : 'My Compensation & Payslips'}
              </h2>
              <span className="rounded-full bg-[#eceae4] border border-[#eceae4] px-2.5 py-0.5 text-xs font-semibold text-[#1c1c1c]">
                FY 2026-27
              </span>
            </div>
            <p className="text-xs text-[#5f5f5d] mt-1">
              {role === 'admin'
                ? 'Automated monthly disbursement calculations, statutory PF/PT deductions, and payslips.'
                : 'Review your monthly salary statements, itemized allowances, and download official PDF slips.'}
            </p>
          </div>

          {/* Admin "Run Monthly Payroll" Action */}
          {role === 'admin' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunPayroll}
                disabled={processingRun}
                className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#1c1c1c] hover:bg-[#2b2b2b] text-[#fcfbf8] shadow-button-inset px-4 py-2.5 text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Play className={cn('h-3.5 w-3.5 fill-current', processingRun && 'animate-spin')} />
                <span>{processingRun ? 'Running Calculation...' : `Run ${selectedMonth} Payroll`}</span>
              </button>
            </div>
          )}
        </div>

        {/* Action feedback banner */}
        {actionSuccessMsg && (
          <div className="rounded-[8px] border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ADMIN VIEW */}
        {/* ========================================================================= */}
        {role === 'admin' ? (
          <div className="space-y-6">
            {/* 4 Payroll Summary KPI Cards for Selected Month */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Gross Payroll */}
              <div className="rounded-[16px] border border-[#eceae4] bg-[#f7f4ed] p-5 shadow-sm lovable-card-interactive">
                <span className="text-xs font-medium text-[#5f5f5d]">Total Gross Payroll</span>
                <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-[#1c1c1c]">
                  {formatCurrencyINR(monthKpis.totalGross)}
                </div>
                <p className="mt-1 text-xs text-[#5f5f5d]">Active headcount ({monthKpis.totalCount} staff)</p>
              </div>

              {/* Total Deductions */}
              <div className="rounded-[16px] border border-[#eceae4] bg-[#f7f4ed] p-5 shadow-sm lovable-card-interactive">
                <span className="text-xs font-medium text-[#5f5f5d]">Statutory Deductions</span>
                <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-rose-800">
                  -{formatCurrencyINR(monthKpis.totalDeductions)}
                </div>
                <p className="mt-1 text-xs text-[#5f5f5d]">EPF 12% + PT ₹200 standard</p>
              </div>

              {/* Net Disbursement */}
              <div className="rounded-[16px] border border-[#eceae4] bg-[#f7f4ed] p-5 shadow-sm lovable-card-interactive">
                <span className="text-xs font-medium text-[#5f5f5d]">Net Disbursable Amount</span>
                <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-emerald-800">
                  {formatCurrencyINR(monthKpis.totalNet)}
                </div>
                <p className="mt-1 text-xs text-emerald-800 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Direct HDFC NEFT / RTGS</span>
                </p>
              </div>

              {/* Status Settlement */}
              <div className="rounded-[16px] border border-[#eceae4] bg-[#f7f4ed] p-5 shadow-sm lovable-card-interactive">
                <span className="text-xs font-medium text-[#5f5f5d]">Settlement Status</span>
                <div className="mt-2 text-xl font-bold text-[#1c1c1c] flex items-center gap-2">
                  <span className="text-emerald-800 font-mono">{monthKpis.paidCount} Paid</span>
                  <span className="text-[#5f5f5d]">/</span>
                  <span className="text-amber-800 font-mono">{monthKpis.pendingCount} Pending</span>
                </div>
                {monthKpis.pendingCount > 0 && (
                  <button
                    onClick={handleBulkPay}
                    className="mt-2 text-xs font-semibold text-[#1c1c1c] hover:underline flex items-center gap-1 transition-colors active:scale-95"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>Disburse All Pending ({monthKpis.pendingCount})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter and Cycle Control Bar */}
            <div className="rounded-[16px] border border-[#eceae4] bg-[#f7f4ed] p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Month Cycle Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#5f5f5d]">Payroll Cycle:</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-3.5 py-2 text-xs text-[#1c1c1c] focus:border-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c] font-semibold"
                  >
                    {PAYROLL_MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search & Status Filter */}
                <div className="flex items-center gap-2.5">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-3 py-2 text-xs text-[#1c1c1c] focus:border-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c] capitalize"
                  >
                    <option value="all">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#5f5f5d]" />
                    <input
                      type="text"
                      placeholder="Search staff or code..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] pl-8 pr-3 py-2 text-xs text-[#1c1c1c] placeholder:text-[#5f5f5d]/60 focus:border-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c] w-44"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payroll Ledger Table */}
            <div className="rounded-[16px] border border-[#eceae4] bg-[#f7f4ed] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#eceae4] bg-[#eceae4]/40 text-[#5f5f5d] font-medium">
                      <th className="py-3.5 pl-4">Staff Member</th>
                      <th className="py-3.5">Basic (50%)</th>
                      <th className="py-3.5">Allowances (50%)</th>
                      <th className="py-3.5">Gross Pay</th>
                      <th className="py-3.5">Deductions</th>
                      <th className="py-3.5 font-bold text-[#1c1c1c]">Net Payout</th>
                      <th className="py-3.5">Status</th>
                      <th className="py-3.5 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eceae4]">
                    {filteredMonthRecords.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-[#5f5f5d]">
                          No payroll records found for {selectedMonth}. Click &quot;Run {selectedMonth} Payroll&quot; to calculate.
                        </td>
                      </tr>
                    ) : (
                      filteredMonthRecords.map((rec) => (
                        <tr key={rec.id} className="hover:bg-[#eceae4]/30 transition-colors">
                          <td className="py-3.5 pl-4">
                            <div className="font-semibold text-[#1c1c1c]">{rec.employeeName}</div>
                            <div className="text-[11px] text-[#5f5f5d]">
                              {rec.employeeCode || rec.employeeId} • {rec.designation || 'Staff'}
                            </div>
                          </td>
                          <td className="py-3.5 text-[#1c1c1c] font-mono">
                            {formatCurrencyINR(rec.basicSalary)}
                          </td>
                          <td className="py-3.5 text-[#1c1c1c] font-mono">
                            {formatCurrencyINR(rec.allowances)}
                          </td>
                          <td className="py-3.5 text-[#1c1c1c] font-mono font-medium">
                            {formatCurrencyINR(rec.grossSalary || rec.basicSalary + rec.allowances)}
                          </td>
                          <td className="py-3.5 text-rose-800 font-mono">
                            -{formatCurrencyINR(rec.deductions)}
                          </td>
                          <td className="py-3.5 font-bold font-mono text-emerald-800">
                            {formatCurrencyINR(rec.netSalary)}
                          </td>
                          <td className="py-3.5">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border capitalize',
                                rec.status === 'paid'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                                  : 'bg-amber-50 text-amber-800 border-amber-200/80'
                              )}
                            >
                              {rec.status}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {rec.status === 'pending' && (
                                <button
                                  onClick={() => handleMarkAsPaid(rec.id)}
                                  className="rounded-[6px] bg-[#1c1c1c] hover:bg-[#2b2b2b] text-[#fcfbf8] shadow-button-inset px-2.5 py-1 text-[11px] font-medium transition-all active:scale-[0.98]"
                                >
                                  Mark as Paid
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedPayslip(rec)}
                                className="inline-flex items-center gap-1 rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] hover:bg-[#eceae4]/50 text-[#1c1c1c] px-2.5 py-1 text-[11px] font-medium transition-colors"
                              >
                                <Eye className="h-3 w-3" />
                                <span>Payslip</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* EMPLOYEE VIEW: Personal Compensation Breakdown & Payslip Archive */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Compensation Overview Hero Card */}
            {personalComp && (
              <div className="rounded-[16px] border border-[#eceae4] bg-[#f7f4ed] p-6 shadow-sm relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eceae4] border border-[#eceae4] px-2.5 py-0.5 text-[11px] font-semibold text-[#1c1c1c] mb-2">
                      <Sparkles className="h-3 w-3 text-[#5f5f5d]" /> Annual Compensation Structure
                    </span>
                    <h2 className="text-2xl font-bold tracking-tight text-[#1c1c1c] -tracking-tight">
                      {formatCurrencyINR(currentEmployee?.salary || 0)}{' '}
                      <span className="text-xs text-[#5f5f5d] font-normal">Annual CTC</span>
                    </h2>
                    <p className="text-xs text-[#5f5f5d] mt-1">
                      {currentEmployee?.fullName} • {currentEmployee?.designation} ({currentEmployee?.departmentName})
                    </p>
                  </div>

                  <div className="rounded-[12px] border border-[#eceae4] bg-[#eceae4]/40 p-4 text-left sm:text-right min-w-[200px]">
                    <span className="text-xs text-[#5f5f5d] font-medium">Estimated Monthly Take-Home</span>
                    <div className="text-2xl font-bold font-mono text-emerald-800 mt-0.5">
                      {formatCurrencyINR(personalComp.net)}
                    </div>
                    <span className="text-[11px] text-[#5f5f5d]">After statutory EPF & PT deductions</span>
                  </div>
                </div>

                {/* Compensation breakdown pills */}
                <div className="mt-6 pt-5 border-t border-[#eceae4] grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div className="rounded-[8px] border border-[#eceae4] bg-[#f7f4ed] p-3">
                    <span className="text-[#5f5f5d] block text-[11px]">Basic Pay (50%)</span>
                    <strong className="text-[#1c1c1c] font-mono mt-0.5 block">{formatCurrencyINR(personalComp.basic)}</strong>
                  </div>
                  <div className="rounded-[8px] border border-[#eceae4] bg-[#f7f4ed] p-3">
                    <span className="text-[#5f5f5d] block text-[11px]">HRA (20%)</span>
                    <strong className="text-[#1c1c1c] font-mono mt-0.5 block">{formatCurrencyINR(personalComp.hra)}</strong>
                  </div>
                  <div className="rounded-[8px] border border-[#eceae4] bg-[#f7f4ed] p-3">
                    <span className="text-[#5f5f5d] block text-[11px]">Special Allow. (30%)</span>
                    <strong className="text-[#1c1c1c] font-mono mt-0.5 block">{formatCurrencyINR(personalComp.special)}</strong>
                  </div>
                  <div className="rounded-[8px] border border-[#eceae4] bg-[#f7f4ed] p-3">
                    <span className="text-[#5f5f5d] block text-[11px]">EPF Deduction</span>
                    <strong className="text-rose-800 font-mono mt-0.5 block">-{formatCurrencyINR(personalComp.pf)}</strong>
                  </div>
                  <div className="rounded-[8px] border border-[#eceae4] bg-[#f7f4ed] p-3">
                    <span className="text-[#5f5f5d] block text-[11px]">Prof. Tax (PT)</span>
                    <strong className="text-rose-800 font-mono mt-0.5 block">-{formatCurrencyINR(personalComp.pt)}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* My Payslips Archive Table */}
            <div className="rounded-[16px] border border-[#eceae4] bg-[#f7f4ed] overflow-hidden shadow-sm">
              <div className="p-4 sm:p-5 border-b border-[#eceae4] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#1c1c1c] -tracking-tight">Disbursed Salary Slips</h3>
                  <p className="text-xs text-[#5f5f5d] mt-0.5">
                    Download and view itemized monthly payslips
                  </p>
                </div>
                <span className="text-xs text-[#5f5f5d] font-mono">{personalPayslips.length} Statements</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#eceae4] bg-[#eceae4]/40 text-[#5f5f5d] font-medium">
                      <th className="py-3.5 pl-4">Pay Period</th>
                      <th className="py-3.5">Gross Amount</th>
                      <th className="py-3.5">Total Deductions</th>
                      <th className="py-3.5 font-bold text-[#1c1c1c]">Net Credited</th>
                      <th className="py-3.5">Status</th>
                      <th className="py-3.5">Disbursement Date</th>
                      <th className="py-3.5 pr-4 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eceae4]">
                    {personalPayslips.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[#5f5f5d]">
                          No payslips recorded for your profile yet.
                        </td>
                      </tr>
                    ) : (
                      personalPayslips.map((slip) => (
                        <tr key={slip.id} className="hover:bg-[#eceae4]/30 transition-colors">
                          <td className="py-3.5 pl-4 font-semibold text-[#1c1c1c]">{slip.month}</td>
                          <td className="py-3.5 text-[#1c1c1c] font-mono">
                            {formatCurrencyINR(slip.grossSalary || slip.basicSalary + slip.allowances)}
                          </td>
                          <td className="py-3.5 text-rose-800 font-mono">
                            -{formatCurrencyINR(slip.deductions)}
                          </td>
                          <td className="py-3.5 font-bold font-mono text-emerald-800">
                            {formatCurrencyINR(slip.netSalary)}
                          </td>
                          <td className="py-3.5">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border capitalize',
                                slip.status === 'paid'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                                  : 'bg-amber-50 text-amber-800 border-amber-200/80'
                              )}
                            >
                              {slip.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-[#5f5f5d] font-mono">{slip.paymentDate}</td>
                          <td className="py-3.5 pr-4 text-right">
                            <button
                              onClick={() => setSelectedPayslip(slip)}
                              className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] hover:bg-[#eceae4]/50 text-[#1c1c1c] px-3 py-1.5 text-xs font-medium transition-colors"
                            >
                              <FileText className="h-3.5 w-3.5 text-[#5f5f5d]" />
                              <span>View Payslip</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Digital Payslip Modal with Formal Print / PDF View */}
      <PayslipModal
        record={selectedPayslip}
        isOpen={Boolean(selectedPayslip)}
        onClose={() => setSelectedPayslip(null)}
        employeeJoiningDate={currentEmployee?.joiningDate}
      />
    </DashboardShell>
  );
}
