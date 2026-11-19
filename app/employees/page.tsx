'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useAuth } from '@/lib/auth-context';
import { DataService } from '@/lib/data-service';
import { Employee, Department, AttendanceRecord, EmployeeStatus } from '@/types';
import { EmployeeProfileDrawer } from '@/components/employees/employee-profile-drawer';
import { EmployeeFormDrawer } from '@/components/employees/employee-form-drawer';
import { DeleteConfirmDialog } from '@/components/employees/delete-confirm-dialog';
import {
  Search,
  Users,
  MapPin,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
  X,
  LayoutGrid,
  List,
} from 'lucide-react';
import { formatCurrencyINR, formatDate, cn } from '@/lib/utils';

type SortField = 'employeeCode' | 'fullName' | 'departmentName' | 'joiningDate' | 'salary';
type SortOrder = 'asc' | 'desc';

const ITEMS_PER_PAGE = 8;

export default function EmployeesPage() {
  const { user, role } = useAuth();

  // Data states
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [attendanceToday, setAttendanceToday] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('employeeCode');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // View mode
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Drawer / Dialog states
  const [profileDrawerEmployee, setProfileDrawerEmployee] = useState<Employee | null>(null);
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteDialogEmployee, setDeleteDialogEmployee] = useState<Employee | null>(null);

  const loadData = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [empList, deptList, attList] = await Promise.all([
        DataService.getEmployees(),
        DataService.getDepartments(),
        DataService.getAttendance(todayStr),
      ]);
      setEmployees(empList);
      setDepartments(deptList);
      setAttendanceToday(attList);
    } catch (err) {
      console.error('Failed to load employee directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDept, selectedStatus, selectedLocation, sortField, sortOrder]);

  const availableLocations = useMemo(() => {
    const locSet = new Set<string>();
    employees.forEach((e) => {
      if (e.location) locSet.add(e.location);
    });
    return Array.from(locSet).sort();
  }, [employees]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedEmployees = useMemo(() => {
    const filtered = employees.filter((emp) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        emp.fullName.toLowerCase().includes(q) ||
        emp.employeeCode.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q);

      const matchesDept = selectedDept === 'all' || emp.departmentId === selectedDept;
      const matchesStatus = selectedStatus === 'all' || emp.status === selectedStatus;
      const matchesLocation = selectedLocation === 'all' || emp.location === selectedLocation;

      return matchesSearch && matchesDept && matchesStatus && matchesLocation;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'employeeCode') {
        comparison = a.employeeCode.localeCompare(b.employeeCode, undefined, { numeric: true });
      } else if (sortField === 'fullName') {
        comparison = a.fullName.localeCompare(b.fullName);
      } else if (sortField === 'departmentName') {
        comparison = a.departmentName.localeCompare(b.departmentName);
      } else if (sortField === 'joiningDate') {
        comparison = new Date(a.joiningDate).getTime() - new Date(b.joiningDate).getTime();
      } else if (sortField === 'salary') {
        comparison = a.salary - b.salary;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [employees, search, selectedDept, selectedStatus, selectedLocation, sortField, sortOrder]);

  const totalItems = filteredAndSortedEmployees.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedEmployees.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedEmployees, currentPage]);

  const hasActiveFilters =
    search !== '' ||
    selectedDept !== 'all' ||
    selectedStatus !== 'all' ||
    selectedLocation !== 'all';

  const clearAllFilters = () => {
    setSearch('');
    setSelectedDept('all');
    setSelectedStatus('all');
    setSelectedLocation('all');
  };

  return (
    <DashboardShell title="Staff Directory & Roster">
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Top Header & Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Staff Directory
              </h2>
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 font-mono">
                {employees.length} Members
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Browse, filter, and manage staff records across all functional divisions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View switcher */}
            <div className="flex items-center rounded-[8px] border border-slate-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  'rounded-[6px] p-1.5 transition-all duration-200 active:scale-95',
                  viewMode === 'table'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                )}
                title="Table List View"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'rounded-[6px] p-1.5 transition-all duration-200 active:scale-95',
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                )}
                title="Card Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>

            {/* Add Employee Button (Admin Only) */}
            {role === 'admin' && (
              <button
                onClick={() => {
                  setEditingEmployee(null);
                  setFormDrawerOpen(true);
                }}
                className="lovable-button-primary text-xs"
              >
                <Plus className="h-4 w-4" />
                <span>+ Add Employee</span>
              </button>
            )}
          </div>
        </div>

        {/* Search, Multi-Filter, and Reset Bar */}
        <div className="rounded-[16px] border border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, EMP-ID, email, designation..."
                className="lovable-input w-full pl-9 pr-8 py-2 text-xs"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="lovable-input w-full px-3 py-2 text-xs font-medium text-slate-700"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="lovable-input w-full px-3 py-2 text-xs capitalize font-medium text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="remote">Remote</option>
                <option value="terminated">Terminated</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="lovable-input w-full px-3 py-2 text-xs font-medium text-slate-700"
              >
                <option value="all">All Locations</option>
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status summary & Clear filters action */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <span>
                Showing <strong className="text-slate-900 font-bold">{filteredAndSortedEmployees.length}</strong> of{' '}
                <strong className="text-slate-900 font-bold">{employees.length}</strong> employees
              </span>
              {hasActiveFilters && (
                <span className="rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 px-2 py-0.5 text-[10px] font-bold">
                  Filtered Results
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
              >
                <X className="h-3 w-3" />
                <span>Clear All Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Directory Content: Table View OR Grid View */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
              <span className="text-xs font-medium text-slate-500">Loading directory...</span>
            </div>
          </div>
        ) : filteredAndSortedEmployees.length === 0 ? (
          <div className="rounded-[16px] border border-slate-200/90 bg-white p-12 text-center shadow-sm">
            <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No employees match your search</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria, clearing selected filters, or onboarding a new employee.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-xs"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="rounded-[14px] border border-slate-200/90 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-700 font-semibold">
                    <th
                      onClick={() => handleSort('employeeCode')}
                      className="py-3.5 pl-4 cursor-pointer hover:text-indigo-600 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>ID</span>
                        {sortField === 'employeeCode' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-indigo-600" /> : <ArrowDown className="h-3 w-3 text-indigo-600" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleSort('fullName')}
                      className="py-3.5 cursor-pointer hover:text-indigo-600 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Employee</span>
                        {sortField === 'fullName' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-indigo-600" /> : <ArrowDown className="h-3 w-3 text-indigo-600" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleSort('departmentName')}
                      className="py-3.5 cursor-pointer hover:text-indigo-600 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Department</span>
                        {sortField === 'departmentName' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-indigo-600" /> : <ArrowDown className="h-3 w-3 text-indigo-600" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </div>
                    </th>

                    <th className="py-3.5">Designation</th>
                    <th className="py-3.5">Location</th>

                    <th
                      onClick={() => handleSort('joiningDate')}
                      className="py-3.5 cursor-pointer hover:text-indigo-600 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Joined</span>
                        {sortField === 'joiningDate' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-indigo-600" /> : <ArrowDown className="h-3 w-3 text-indigo-600" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </div>
                    </th>

                    <th className="py-3.5">Status</th>

                    {role === 'admin' && (
                      <th
                        onClick={() => handleSort('salary')}
                        className="py-3.5 cursor-pointer hover:text-indigo-600 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Annual CTC</span>
                          {sortField === 'salary' ? (
                            sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-indigo-600" /> : <ArrowDown className="h-3 w-3 text-indigo-600" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-40" />
                          )}
                        </div>
                      </th>
                    )}

                    <th className="py-3.5 pr-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {paginatedEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      onClick={() => setProfileDrawerEmployee(emp)}
                      className="group hover:bg-indigo-50/40 cursor-pointer transition-colors duration-150"
                    >
                      <td className="py-3.5 pl-4 font-mono font-semibold text-slate-900">
                        {emp.employeeCode}
                      </td>

                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatarUrl}
                            alt={emp.fullName}
                            className="h-9 w-9 rounded-lg object-cover border border-slate-200/90 shadow-xs shrink-0 transition-transform duration-200 group-hover:scale-105 group-hover:ring-2 group-hover:ring-indigo-500/30"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {emp.fullName}
                            </div>
                            <div className="text-[11px] text-slate-500">{emp.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200/70">
                          {emp.departmentName}
                        </span>
                      </td>

                      <td className="py-3.5 text-slate-600 font-medium max-w-xs truncate">
                        {emp.designation}
                      </td>

                      <td className="py-3.5 text-slate-600 font-medium">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {emp.location}
                        </span>
                      </td>

                      <td className="py-3.5 text-slate-500 font-mono text-[11px]">
                        {formatDate(emp.joiningDate)}
                      </td>

                      <td className="py-3.5">
                        {emp.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border border-emerald-200 bg-emerald-50 text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            ACTIVE
                          </span>
                        ) : emp.status === 'remote' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border border-sky-200 bg-sky-50 text-sky-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                            REMOTE
                          </span>
                        ) : emp.status === 'on_leave' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border border-amber-200 bg-amber-50 text-amber-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            ON LEAVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border border-rose-200 bg-rose-50 text-rose-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            {emp.status.replace('_', ' ').toUpperCase()}
                          </span>
                        )}
                      </td>

                      {role === 'admin' && (
                        <td className="py-3.5 font-mono font-bold text-slate-900">
                          {formatCurrencyINR(emp.salary)}
                        </td>
                      )}

                      <td
                        className="py-3.5 pr-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setProfileDrawerEmployee(emp)}
                            className="rounded-lg p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all"
                            title="View Profile Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {role === 'admin' && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingEmployee(emp);
                                  setFormDrawerOpen(true);
                                }}
                                className="rounded-lg p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all"
                                title="Edit Employee"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>

                              <button
                                onClick={() => setDeleteDialogEmployee(emp)}
                                className="rounded-lg p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                                title="Deactivate or Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid Card View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {paginatedEmployees.map((emp) => (
              <div
                key={emp.id}
                onClick={() => setProfileDrawerEmployee(emp)}
                className="group rounded-[14px] border border-slate-200/90 bg-white p-5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <img
                      src={emp.avatarUrl}
                      alt={emp.fullName}
                      className="h-12 w-12 rounded-xl object-cover border-2 border-slate-100 shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:ring-2 group-hover:ring-indigo-500/30"
                    />
                    {emp.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border border-emerald-200 bg-emerald-50 text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        ACTIVE
                      </span>
                    ) : emp.status === 'remote' ? (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border border-sky-200 bg-sky-50 text-sky-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                        REMOTE
                      </span>
                    ) : emp.status === 'on_leave' ? (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border border-amber-200 bg-amber-50 text-amber-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        ON LEAVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border border-rose-200 bg-rose-50 text-rose-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        {emp.status.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="mt-3">
                    <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                      {emp.fullName}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                      {emp.designation}
                    </p>
                    <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded-md inline-block mt-1.5 border border-indigo-100">
                      {emp.departmentName}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[11px] text-slate-500">
                        <MapPin className="h-3 w-3" /> Location
                      </span>
                      <span className="text-slate-800 font-medium">{emp.location}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Employee ID</span>
                      <span className="font-mono text-slate-900 font-bold">
                        {emp.employeeCode}
                      </span>
                    </div>

                    {role === 'admin' && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-[11px] text-slate-500">Annual CTC</span>
                        <span className="font-mono font-bold text-slate-900">
                          {formatCurrencyINR(emp.salary)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setProfileDrawerEmployee(emp)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold transition-colors active:scale-95"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Profile</span>
                  </button>

                  {role === 'admin' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingEmployee(emp);
                          setFormDrawerOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 active:scale-90 transition-all"
                        title="Edit"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteDialogEmployee(emp)}
                        className="rounded-lg p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-100 active:scale-90 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Client-Side Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-xs text-slate-500 font-medium">
              Showing{' '}
              <strong className="text-slate-900 font-bold">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-900 font-bold">
                {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
              </strong>{' '}
              of <strong className="text-slate-900 font-bold">{totalItems}</strong> entries
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      'h-8 w-8 rounded-lg text-xs font-bold transition-all duration-150 active:scale-95',
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 shadow-xs'
                    )}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-xs"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Profile Drawer */}
      <EmployeeProfileDrawer
        employee={profileDrawerEmployee}
        isOpen={Boolean(profileDrawerEmployee)}
        onClose={() => setProfileDrawerEmployee(null)}
        userRole={role}
        onEdit={(emp) => {
          setEditingEmployee(emp);
          setFormDrawerOpen(true);
        }}
        onDelete={(emp) => {
          setDeleteDialogEmployee(emp);
        }}
        attendanceToday={
          profileDrawerEmployee
            ? attendanceToday.find((a) => a.employeeId === profileDrawerEmployee.id) || null
            : null
        }
      />

      {/* Add / Edit Form Drawer (Admin Only) */}
      <EmployeeFormDrawer
        isOpen={formDrawerOpen}
        onClose={() => {
          setFormDrawerOpen(false);
          setEditingEmployee(null);
        }}
        onSuccess={() => {
          loadData();
        }}
        initialEmployee={editingEmployee}
        departments={departments}
        adminName={user?.name || 'HR Admin'}
      />

      {/* Delete / Terminate Confirm Dialog (Admin Only) */}
      <DeleteConfirmDialog
        isOpen={Boolean(deleteDialogEmployee)}
        employee={deleteDialogEmployee}
        onClose={() => setDeleteDialogEmployee(null)}
        onSuccess={() => {
          loadData();
        }}
        currentUserId={user?.employeeId || user?.id}
        adminName={user?.name || 'HR Admin'}
      />
    </DashboardShell>
  );
}
