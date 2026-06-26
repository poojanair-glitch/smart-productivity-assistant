'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Cpu, Sparkles, AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  useEffect(() => {
    const err = searchParams.get('error');
    const msg = searchParams.get('message');
    if (err) setErrorMessage(err);
    if (msg) setInfoMessage(msg);
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMessage('');
    setInfoMessage('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] dark:bg-[#0B0F19] flex items-center justify-center p-6 bg-grid-pattern relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#6D5DFC]/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#8B5CF6]/5 rounded-full blur-3xl -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-8 rounded-3xl glass-panel shadow-2xl border border-slate-200 dark:border-slate-800/80 space-y-6 bg-white/80 dark:bg-[#131B2E]/70"
      >
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-br from-[#6D5DFC] to-[#8B5CF6] text-white shadow-xl shadow-[#6D5DFC]/20 mb-2">
            <Cpu className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-350 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to access your AI Smart Productivity Assistant
          </p>
        </div>

        {/* Message banners */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}
        {infoMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{infoMessage}</p>
          </div>
        )}

        {/* Form fields */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs font-medium">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-[#6D5DFC] focus:outline-none focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <Link href="/forgot-password" className="text-[10px] text-[#6D5DFC] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-[#6D5DFC] focus:outline-none focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#6D5DFC] to-[#8B5CF6] text-white hover:opacity-95 font-bold transition-all shadow-md shadow-[#6D5DFC]/10 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800/80">
          New to the assistant?{' '}
          <Link href="/signup" className="text-[#6D5DFC] hover:underline font-bold">
            Create an Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-xs text-slate-400">
        Loading Authentication Portal...
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
