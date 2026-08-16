'use client';

import React from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { useSession } from '@/components/ui/SessionContext';
import { Mail, Shield, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useSession();

  if (!user) return null;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50/50 pb-16">
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 card-shadow space-y-6">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase text-2xl mx-auto shadow-inner">
                {user.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800">{user.name}</h1>
                <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 font-black uppercase tracking-wider px-3 py-1 rounded-full capitalize">
                  {user.role}
                </span>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-6 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Email Address</div>
                  <span className="text-slate-700">{user.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Account Access</div>
                  <span className="text-slate-700 capitalize">{user.role} Privileges</span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
