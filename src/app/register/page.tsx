'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/components/ui/SessionContext';
import { useToast } from '@/components/ui/ToastContext';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, ArrowRight, Store as StoreIcon } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useSession();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'seller'>('customer');
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
    if (!name || !email || !password) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Registration successful! Please log in.', 'success');
        router.push(`/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`);
      } else {
        showToast(data.error || 'Registration failed', 'error');
      }
    } catch {
      showToast('Network error, please try again', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 card-shadow">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-black text-slate-800">Create Account</h1>
        <p className="text-sm text-slate-400 mt-1 font-medium">Join the MarketSphere community</p>
      </div>

      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-2xl mb-6">
        <button
          type="button"
          onClick={() => setRole('customer')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            role === 'customer'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          Buyer
        </button>
        <button
          type="button"
          onClick={() => setRole('seller')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            role === 'seller'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <StoreIcon className="w-4 h-4" />
          Merchant
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
          <div className="relative">
            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-slate-50/50 text-sm font-medium"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
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
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Password</label>
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
          {loading ? 'Creating Account...' : 'Register'}
          {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
        </button>
      </form>

      <div className="text-center mt-6 text-sm text-slate-400 font-semibold">
        Already have an account?{' '}
        <Link href={`/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`} className="text-indigo-600 hover:underline">
          Log in here
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <Suspense fallback={
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 card-shadow flex items-center justify-center">
            <span className="text-slate-400 font-bold">Loading...</span>
          </div>
        }>
          <RegisterForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
