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
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.6px] text-[#1c1c1c]">
                Staff Directory
              </h2>
              <span className="rounded-full border border-[#eceae4] bg-[#eceae4] px-2.5 py-0.5 text-xs text-[#1c1c1c]">
                {employees.length} Members
              </span>
            </div>
            <p className="text-xs text-[#5f5f5d] mt-1 font-normal">
              Browse, filter, and manage staff records across all functional divisions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View switcher */}
            <div className="flex items-center rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] p-1">
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  'rounded-[4px] p-1.5 transition-all duration-200 active:scale-95',
                  viewMode === 'table'
                    ? 'bg-[#eceae4] text-[#1c1c1c] shadow-xs'
                    : 'text-[#5f5f5d] hover:text-[#1c1c1c]'
                )}
                title="Table List View"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'rounded-[4px] p-1.5 transition-all duration-200 active:scale-95',
                  viewMode === 'grid'
                    ? 'bg-[#eceae4] text-[#1c1c1c] shadow-xs'
                    : 'text-[#5f5f5d] hover:text-[#1c1c1c]'
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
        <div className="rounded-[12px] border border-[#eceae4] bg-[#f7f4ed] p-4 sm:p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f5f5d]" />
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5f5f5d] hover:text-[#1c1c1c]"
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
                className="lovable-input w-full px-3 py-2 text-xs"
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
                className="lovable-input w-full px-3 py-2 text-xs capitalize"
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
                className="lovable-input w-full px-3 py-2 text-xs"
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
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#eceae4] text-xs">
            <div className="flex items-center gap-2 text-[#5f5f5d]">
              <span>
                Showing <strong className="text-[#1c1c1c] font-semibold">{filteredAndSortedEmployees.length}</strong> of{' '}
                <strong className="text-[#1c1c1c] font-semibold">{employees.length}</strong> employees
              </span>
              {hasActiveFilters && (
                <span className="rounded-full border border-[#eceae4] bg-[#eceae4] text-[#1c1c1c] px-2 py-0.5 text-[10px]">
                  Filtered Results
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 text-[#1c1c1c] hover:underline font-medium transition-colors"
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
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1c1c1c] border-t-transparent" />
              <span className="text-xs text-[#5f5f5d]">Loading directory...</span>
            </div>
          </div>
        ) : filteredAndSortedEmployees.length === 0 ? (
          <div className="rounded-[12px] border border-[#eceae4] bg-[#f7f4ed] p-12 text-center">
            <Users className="h-8 w-8 text-[#5f5f5d] opacity-50 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-[#1c1c1c]">No employees match your search</h3>
            <p className="text-xs text-[#5f5f5d] mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria, clearing selected filters, or onboarding a new employee.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="lovable-button-ghost text-xs mt-4"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="rounded-[12px] border border-[#eceae4] bg-[#f7f4ed] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#eceae4] bg-[#f7f4ed] text-[#5f5f5d] font-medium">
                    <th
                      onClick={() => handleSort('employeeCode')}
                      className="py-3.5 pl-4 cursor-pointer hover:text-[#1c1c1c] transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>ID</span>
                        {sortField === 'employeeCode' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleSort('fullName')}
                      className="py-3.5 cursor-pointer hover:text-[#1c1c1c] transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Employee</span>
                        {sortField === 'fullName' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </div>
                    </th>

                    <th
                      onClick={() => handleSort('departmentName')}
                      className="py-3.5 cursor-pointer hover:text-[#1c1c1c] transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Department</span>
                        {sortField === 'departmentName' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </div>
                    </th>

                    <th className="py-3.5">Designation</th>
                    <th className="py-3.5">Location</th>

                    <th
                      onClick={() => handleSort('joiningDate')}
                      className="py-3.5 cursor-pointer hover:text-[#1c1c1c] transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Joined</span>
                        {sortField === 'joiningDate' ? (
                          sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </div>
                    </th>

                    <th className="py-3.5">Status</th>

                    {role === 'admin' && (
                      <th
                        onClick={() => handleSort('salary')}
                        className="py-3.5 cursor-pointer hover:text-[#1c1c1c] transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Annual CTC</span>
                          {sortField === 'salary' ? (
                            sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-40" />
                          )}
                        </div>
                      </th>
                    )}

                    <th className="py-3.5 pr-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#eceae4]">
                  {paginatedEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      onClick={() => setProfileDrawerEmployee(emp)}
                      className="group hover:bg-[rgba(236,234,228,0.45)] cursor-pointer transition-colors duration-150"
                    >
                      <td className="py-3.5 pl-4 font-mono font-medium text-[#1c1c1c]">
                        {emp.employeeCode}
                      </td>

                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatarUrl}
                            alt={emp.fullName}
                            className="h-8 w-8 rounded-[6px] object-cover border border-[#eceae4] shrink-0 transition-transform duration-200 group-hover:scale-105"
                          />
                          <div>
                            <div className="font-semibold text-[#1c1c1c]">
                              {emp.fullName}
                            </div>
                            <div className="text-[11px] text-[#5f5f5d]">{emp.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 text-[#1c1c1c] font-medium">
                        {emp.departmentName}
                      </td>

                      <td className="py-3.5 text-[#5f5f5d] max-w-xs truncate">
                        {emp.designation}
                      </td>

                      <td className="py-3.5 text-[#5f5f5d]">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-[#5f5f5d]" />
                          {emp.location}
                        </span>
                      </td>

                      <td className="py-3.5 text-[#5f5f5d] font-mono text-[11px]">
                        {formatDate(emp.joiningDate)}
                      </td>

                      <td className="py-3.5">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border border-[#eceae4] bg-[#eceae4] text-[#1c1c1c] uppercase">
                          {emp.status.replace('_', ' ')}
                        </span>
                      </td>

                      {role === 'admin' && (
                        <td className="py-3.5 font-mono font-semibold text-[#1c1c1c]">
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
                            className="rounded-[4px] p-1.5 text-[#5f5f5d] hover:text-[#1c1c1c] hover:bg-[rgba(28,28,28,0.04)] transition-colors"
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
                                className="rounded-[4px] p-1.5 text-[#1c1c1c] hover:bg-[rgba(28,28,28,0.04)] transition-colors"
                                title="Edit Employee"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>

                              <button
                                onClick={() => setDeleteDialogEmployee(emp)}
                                className="rounded-[4px] p-1.5 text-rose-700 hover:bg-rose-50 transition-colors"
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
                className="group rounded-[12px] border border-[#eceae4] bg-[#f7f4ed] p-5 hover:border-[rgba(28,28,28,0.3)] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_8px_20px_-6px_rgba(28,28,28,0.08)] flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <img
                      src={emp.avatarUrl}
                      alt={emp.fullName}
                      className="h-12 w-12 rounded-[6px] object-cover border border-[#eceae4] transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="rounded-full border border-[#eceae4] bg-[#eceae4] text-[#1c1c1c] px-2 py-0.5 text-[10px] font-medium uppercase">
                      {emp.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h3 className="text-sm font-semibold text-[#1c1c1c] truncate group-hover:text-black transition-colors">
                      {emp.fullName}
                    </h3>
                    <p className="text-xs text-[#5f5f5d] truncate mt-0.5">
                      {emp.designation}
                    </p>
                    <p className="text-[11px] text-[#5f5f5d] truncate mt-0.5">
                      {emp.departmentName} Division
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#eceae4] space-y-1.5 text-xs text-[#5f5f5d]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[11px]">
                        <MapPin className="h-3 w-3" /> Location
                      </span>
                      <span className="text-[#1c1c1c]">{emp.location}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px]">Code</span>
                      <span className="font-mono text-[#1c1c1c] font-medium">
                        {emp.employeeCode}
                      </span>
                    </div>

                    {role === 'admin' && (
                      <div className="flex items-center justify-between pt-1 border-t border-[#eceae4]">
                        <span className="text-[11px]">Annual CTC</span>
                        <span className="font-mono font-semibold text-[#1c1c1c]">
                          {formatCurrencyINR(emp.salary)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="mt-4 pt-3 border-t border-[#eceae4] flex items-center justify-between text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setProfileDrawerEmployee(emp)}
                    className="text-xs text-[#5f5f5d] hover:text-[#1c1c1c] flex items-center gap-1 font-medium transition-colors active:scale-95"
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
                        className="rounded-[4px] p-1 text-[#1c1c1c] hover:bg-[rgba(28,28,28,0.06)] active:scale-90 transition-all"
                        title="Edit"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteDialogEmployee(emp)}
                        className="rounded-[4px] p-1 text-rose-700 hover:bg-rose-50 active:scale-90 transition-all"
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
            <span className="text-xs text-[#5f5f5d]">
              Showing{' '}
              <strong className="text-[#1c1c1c]">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-[#1c1c1c]">
                {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
              </strong>{' '}
              of <strong className="text-[#1c1c1c]">{totalItems}</strong> entries
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-3 py-1.5 text-xs font-medium text-[#1c1c1c] hover:bg-[rgba(28,28,28,0.04)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
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
                      'h-8 w-8 rounded-[6px] text-xs font-medium transition-all duration-150 active:scale-95',
                      currentPage === pageNum
                        ? 'bg-[#1c1c1c] text-[#fcfbf8] shadow-button-inset'
                        : 'border border-[#eceae4] bg-[#f7f4ed] text-[#5f5f5d] hover:text-[#1c1c1c] hover:bg-[rgba(28,28,28,0.04)]'
                    )}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 rounded-[6px] border border-[#eceae4] bg-[#f7f4ed] px-3 py-1.5 text-xs font-medium text-[#1c1c1c] hover:bg-[rgba(28,28,28,0.04)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
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
