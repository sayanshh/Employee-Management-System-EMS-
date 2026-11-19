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
    <div className="relative min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-12 selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* Soft atmospheric gradient glows behind hero */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-400/15 via-purple-400/15 to-pink-400/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 -right-20 w-[450px] h-[450px] bg-gradient-to-br from-emerald-400/10 to-teal-400/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 mb-4 transition-transform hover:scale-105 duration-200">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            EMS Core
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Enterprise Employee Management & Workspace
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5">
          {/* Quick Demo Login One-Click Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" /> Instant Demo Access
              </span>
              <span className="text-[11px] text-slate-400 font-medium">No password required</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Admin Demo Button (Rich Dark Gradient) */}
              <button
                type="button"
                onClick={() => loginAs('admin')}
                className="group relative flex items-center justify-between rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3.5 text-left transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] border border-indigo-500/30 shadow-md shadow-indigo-950/20 hover:border-indigo-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 transition-transform duration-200 group-hover:scale-110">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        HR Manager / Admin
                      </span>
                      <span className="rounded-full bg-indigo-500/30 border border-indigo-400/40 px-2 py-0.2 text-[10px] font-bold text-indigo-200">
                        Admin
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {DEMO_ADMIN_USER.name} • {DEMO_ADMIN_USER.email}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-indigo-300 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
              </button>

              {/* Employee Demo Button (Vibrant Light Card) */}
              <button
                type="button"
                onClick={() => loginAs('employee')}
                className="group relative flex items-center justify-between rounded-xl border-2 border-indigo-200/90 bg-gradient-to-r from-indigo-50/70 via-white to-violet-50/50 hover:border-indigo-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10 p-3.5 text-left transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-200 bg-white text-indigo-600 shadow-xs transition-transform duration-200 group-hover:scale-110">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        Staff Engineer / Employee
                      </span>
                      <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.2 text-[10px] font-bold text-indigo-700">
                        Employee
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {DEMO_EMPLOYEE_USER.name} • {DEMO_EMPLOYEE_USER.email}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-200" />
              </button>
            </div>
          </div>

          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              or sign in with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 font-semibold shadow-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">Any password in demo mode</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <Database className="h-3.5 w-3.5 text-indigo-600" />
              {isSupabaseConfigured ? 'Supabase Database' : 'Local State Engine'}
            </span>
            <span>14 Seeded Employees</span>
          </div>
        </div>
      </div>
    </div>
  );
}
