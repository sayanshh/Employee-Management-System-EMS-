'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, DEMO_ADMIN_USER, DEMO_EMPLOYEE_USER } from '@/lib/auth-context';
import {
  Building2,
  Shield,
  User,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  Database,
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAs, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your work email address');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch {
      setError('Authentication failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#f7f4ed] px-4 py-12 selection:bg-[rgba(28,28,28,0.1)] selection:text-[#1c1c1c] overflow-hidden">
      {/* Soft warm atmospheric wash behind hero */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-amber-100/50 via-rose-100/30 to-sky-100/40 blur-[130px] pointer-events-none rounded-full" />

      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-[6px] bg-[#1c1c1c] text-[#fcfbf8] shadow-button-inset mb-4">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-semibold tracking-[-1.2px] text-[#1c1c1c]">
            EMS Core
          </h1>
          <p className="text-sm text-[#5f5f5d] mt-1.5 font-normal">
            Enterprise Employee Management & Workspace
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-[16px] border border-[#eceae4] bg-[#f7f4ed] p-6 sm:p-8 shadow-warm-focus">
          {/* Quick Demo Login One-Click Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1c1c1c] flex items-center gap-1.5">
                Instant Demo Access
              </span>
              <span className="text-[11px] text-[#5f5f5d]">No password required</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Admin Demo Button (Primary Dark) */}
              <button
                type="button"
                onClick={() => loginAs('admin')}
                className="group relative flex items-center justify-between rounded-[8px] bg-[#1c1c1c] text-[#fcfbf8] p-3.5 text-left transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-button-inset hover:bg-[#2b2b2b] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-6px_rgba(28,28,28,0.2)] active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-[rgba(255,255,255,0.1)] text-[#fcfbf8] transition-transform duration-200 group-hover:scale-110">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#fcfbf8]">
                        HR Manager / Admin
                      </span>
                      <span className="rounded-full bg-[rgba(255,255,255,0.15)] px-1.5 py-0.2 text-[10px] text-[#fcfbf8]">
                        Admin
                      </span>
                    </div>
                    <p className="text-[11px] text-[rgba(252,251,248,0.7)]">
                      {DEMO_ADMIN_USER.name} • {DEMO_ADMIN_USER.email}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[rgba(252,251,248,0.7)] group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
              </button>

              {/* Employee Demo Button (Ghost) */}
              <button
                type="button"
                onClick={() => loginAs('employee')}
                className="group relative flex items-center justify-between rounded-[8px] border border-[rgba(28,28,28,0.3)] bg-transparent hover:bg-[rgba(28,28,28,0.04)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-6px_rgba(28,28,28,0.08)] p-3.5 text-left transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] border border-[#eceae4] bg-[#eceae4]/40 text-[#1c1c1c] transition-transform duration-200 group-hover:scale-110">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#1c1c1c]">
                        Staff Engineer / Employee
                      </span>
                      <span className="rounded-full border border-[#eceae4] bg-[#eceae4] px-1.5 py-0.2 text-[10px] text-[#1c1c1c]">
                        Employee
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5f5f5d]">
                      {DEMO_EMPLOYEE_USER.name} • {DEMO_EMPLOYEE_USER.email}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#5f5f5d] group-hover:text-[#1c1c1c] group-hover:translate-x-1 transition-all duration-200" />
              </button>
            </div>
          </div>

          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#eceae4]" />
            </div>
            <span className="relative bg-[#f7f4ed] px-3 text-[11px] uppercase tracking-wider text-[#5f5f5d] font-medium">
              or sign in with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-[6px] border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#1c1c1c] mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f5f5d]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="lovable-input w-full pl-9 pr-3 py-2 text-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#1c1c1c]">
                  Password
                </label>
                <span className="text-[11px] text-[#5f5f5d]">Any password in demo mode</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5f5f5d]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="lovable-input w-full pl-9 pr-3 py-2 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="lovable-button-primary w-full py-2.5 text-xs mt-2"
            >
              {submitting ? 'Authenticating...' : 'Sign In to Workspace'}
            </button>
          </form>

          {/* Engine status footer */}
          <div className="mt-6 pt-5 border-t border-[#eceae4] flex items-center justify-between text-[11px] text-[#5f5f5d]">
            <span className="flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-[#1c1c1c]" />
              {isSupabaseConfigured ? 'Supabase Database' : 'Local State Engine'}
            </span>
            <span>14 Seeded Employees</span>
          </div>
        </div>
      </div>
    </div>
  );
}
