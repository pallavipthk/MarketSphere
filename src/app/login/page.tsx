'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/components/ui/SessionContext';
import { useToast } from '@/components/ui/ToastContext';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useSession();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get('redirect') || '';

  useEffect(() => {
    if (user) {
      if (redirectTo) {
        router.push(redirectTo);
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'seller') {
        router.push('/seller');
      } else {
        router.push('/');
      }
    }
  }, [user, redirectTo, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Login successful!', 'success');
        await refreshUser();
      } else {
        showToast(data.error || 'Invalid credentials', 'error');
      }
    } catch {
      showToast('Network error, please try again', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 card-shadow">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-slate-800">Welcome Back</h1>
        <p className="text-sm text-slate-400 mt-1 font-medium">Log in to your MarketSphere account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-slate-50/50 text-sm font-medium"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-slate-50/50 text-sm font-medium"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 group cursor-pointer"
        >
          {loading ? 'Logging in...' : 'Log In'}
          {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
        </button>
      </form>

      <div className="text-center mt-6 text-sm text-slate-400 font-semibold">
        Don&apos;t have an account?{' '}
        <Link href={`/register${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="text-indigo-600 hover:underline">
          Register here
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <Suspense fallback={
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 card-shadow flex items-center justify-center">
            <span className="text-slate-400 font-bold">Loading...</span>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
