# Enterprise Employee Management System (EMS Core)

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A cloud-native, responsive Employee Management & Payroll System built with **Next.js 15 (App Router)**, **TypeScript**, and **Tailwind CSS**. Featuring an autonomous dual-mode data layer that works seamlessly with **Supabase PostgreSQL** or falls back to **persistent local state** with pre-seeded data for zero-config preview.

---

## 🌟 Key Features

### 1. Dual-Persona Architecture & RBAC
- **Admin (HR Manager):** Full CRUD directory controls, leave approval queue, monthly payroll generator, company KPIs, and audit feed.
- **Employee:** Personal self-service dashboard, live attendance punch timecard, remaining leave balances, and downloadable payslips.
- **One-Click Demo Switcher:** Seamlessly switch between HR Admin and Staff Employee profiles directly from the login page or topbar.

### 2. Employee Directory & Advanced CRUD
- **Real-Time Search & Multi-Filters:** Instant search by name, code (`EMP-XXXX`), email, or role, with filters for Department, Location, and Status.
- **Dual View Modes:** Clean tabular roster view and card grid view.
- **Slide-Over Management Drawers:** Create, view, and edit staff records with validation.
- **Safe Lifecycle Transitions:** Soft-termination and deletion confirmations.

### 3. Attendance Tracking & Leave Workflow
- **Live Clock In/Out:** Digital clock, shift timer, and toggle between Office vs. Remote punch modes.
- **Admin Attendance Roster:** View and filter daily attendance logs across all staff.
- **Leave Requisition & Approval:** Apply for Sick, Casual, or Earned leaves with automatic balance deduction upon administrative approval.

### 4. Statutory Indian Payroll & Printable Payslips
- **Automated Monthly Payroll Engine:** Run payroll cycles with statutory breakdown:
  - Basic Pay (50%)
  - House Rent Allowance / HRA (20%)
  - Special Allowances (30%)
  - Statutory Provident Fund (EPF 12% of basic)
  - Professional Tax (₹200)
- **Official Payslip Modal:** Itemized earnings vs. deductions breakdown, net amount in words, and a print-optimized PDF layout.

### 5. Autonomous Dual Data Engine
- Works immediately out-of-the-box without requiring live database credentials.
- Connects automatically to **Supabase** when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are provided.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server & Client Components)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict mode, full type safety)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Custom typography, fluid animations)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Database / Backend:** [Supabase](https://supabase.com/) (PostgreSQL) + LocalStorage State Engine Fallback

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18.17.0 or later)
- npm or pnpm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sayanshh/Employee-Management-System-EMS-.git
   cd Employee-Management-System-EMS-
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **(Optional) Configure Supabase Environment Variables:**
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
   *Note: If omitted, the application runs seamlessly in local persistent mode with 14 pre-seeded Indian staff profiles.*

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   npm run start
   ```

---

## 👥 Demo Credentials

| Role | Name | Email | Password |
|---|---|---|---|
| **HR Admin** | Priya Sharma | `priya.sharma@company.com` | `admin123` (or 1-click login) |
| **Staff Employee** | Sayansh Kulshreshtha | `sayansh.k@company.com` | `emp123` (or 1-click login) |

---

## 📂 Project Structure

```
├── app/
│   ├── attendance/         # Live attendance tracking & leave management
│   ├── dashboard/          # Dual-persona overview dashboard
│   ├── employees/          # Employee directory & CRUD operations
│   ├── login/              # Authentication & one-click demo access
│   ├── payroll/            # Payroll calculation & payslip generator
│   ├── globals.css         # Tailwind styles & custom animations
│   └── layout.tsx          # Root layout & providers
├── components/
│   ├── attendance/         # Clock banner, leave queue, modals
│   ├── dashboard/          # Admin & Employee overview widgets
│   ├── employees/          # Profile drawers, form drawers, delete dialogs
│   ├── payroll/            # Digital payslip modal & print layout
│   ├── dashboard-shell.tsx # Shell container wrapper
│   ├── sidebar.tsx         # Collapsible responsive navigation
│   └── topbar.tsx          # User profile, role badge & switcher
├── lib/
│   ├── auth-context.tsx    # Role-based auth provider
│   ├── data-service.ts     # Unified Supabase / LocalStorage data layer
│   ├── mock-data.ts        # Seeded employee records & history
│   ├── supabase.ts         # Supabase client configuration
│   └── utils.ts            # Formatting helpers (currency INR, date, etc.)
├── types/
│   └── index.ts            # Core TypeScript data contracts
└── PROJECT_DOCUMENTATION.md # Comprehensive NTCC Academic Report
```

---

## 📄 License
This project is licensed under the MIT License.
