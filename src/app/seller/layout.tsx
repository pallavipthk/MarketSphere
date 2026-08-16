'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/components/ui/SessionContext';
import { LayoutDashboard, Store, Package, ShoppingCart, Loader2 } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'seller') {
    return null;
  }

  const menuItems = [
    { label: 'Overview', path: '/seller', icon: LayoutDashboard },
    { label: 'Store Profile', path: '/seller/store', icon: Store },
    { label: 'My Products', path: '/seller/products', icon: Package },
    { label: 'Incoming Orders', path: '/seller/orders', icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row flex-1 items-start gap-8 px-4 sm:px-6 lg:px-8 py-8">
        <aside className="w-full md:w-64 bg-white border border-slate-100 rounded-3xl p-6 card-shadow shrink-0 space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="font-black text-slate-800 text-sm">Merchant Portal</h2>
            <span className="text-[10px] text-slate-400 font-bold capitalize">Role: {user.role}</span>
          </div>

          <nav className="flex flex-col gap-1 text-xs font-bold text-slate-600">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 w-full overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
