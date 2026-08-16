'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { useToast } from '@/components/ui/ToastContext';
import { useSession } from '@/components/ui/SessionContext';
import { Sliders, Users, Store, Package, ShoppingCart, IndianRupee, Loader2, Calendar } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, loading: sessionLoading } = useSession();
  const { showToast } = useToast();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'sellers' | 'products' | 'orders'>('users');

  useEffect(() => {
    if (sessionLoading) return;
    if (!user || user.role !== 'admin') return;

    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.error) {
          showToast(resData.error, 'error');
        } else {
          setData(resData);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        showToast('Failed to load admin stats', 'error');
        setLoading(false);
      });
  }, [sessionLoading, user]);

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const { metrics, lists } = data;

  const cards = [
    { label: 'Total Revenue', value: `₹${metrics.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Customers', value: metrics.customerCount.toString(), icon: Users, color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { label: 'Registered Sellers', value: metrics.sellerCount.toString(), icon: Store, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { label: 'Active Products', value: metrics.productCount.toString(), icon: Package, color: 'bg-sky-50 text-sky-600 border-sky-100' },
    { label: 'Total Orders Placed', value: metrics.orderCount.toString(), icon: ShoppingCart, color: 'bg-violet-50 text-violet-600 border-violet-100' },
  ];

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PLACED':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'CONFIRMED':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'SHIPPED':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-violet-600" />
            Admin Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">Platform management console and listings overview</p>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 card-shadow flex items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{card.label}</span>
                  <h3 className="text-lg font-black text-slate-800 leading-none">{card.value}</h3>
                </div>
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Tab content controller */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 card-shadow space-y-6">
          {/* Tab buttons */}
          <div className="flex border-b border-slate-100 gap-6 text-xs font-bold text-slate-400 pb-3">
            {[
              { id: 'users', label: 'Customers', icon: Users },
              { id: 'sellers', label: 'Sellers', icon: Store },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 pb-3 border-b-2 -mb-3.5 transition-colors cursor-pointer ${
                    isActive ? 'border-violet-600 text-violet-600' : 'border-transparent hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* List display */}
          <div className="overflow-x-auto pt-2">
            {activeTab === 'users' && (
              <table className="w-full text-left border-collapse text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {lists.users.map((c: any) => (
                    <tr key={c._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-800">{c.name}</td>
                      <td className="py-3 px-4">{c.email}</td>
                      <td className="py-3 px-4 font-normal text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'sellers' && (
              <table className="w-full text-left border-collapse text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Registered Shop</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {lists.sellers.map((s: any) => (
                    <tr key={s._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-800">{s.name}</td>
                      <td className="py-3 px-4">{s.email}</td>
                      <td className="py-3 px-4 text-indigo-600 font-bold">{s.storeName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'products' && (
              <table className="w-full text-left border-collapse text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Store / Merchant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {lists.products.map((p: any) => (
                    <tr key={p._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-800 max-w-[200px] truncate">{p.name}</td>
                      <td className="py-3 px-4 capitalize">{p.category}</td>
                      <td className="py-3 px-4 font-bold">₹{p.price.toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold">{p.stock} units</td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-bold">{p.storeId?.name || 'N/A'}</div>
                        <span className="text-[10px] text-slate-400 font-normal">Seller: {p.sellerId?.name || 'N/A'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'orders' && (
              <table className="w-full text-left border-collapse text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-3 px-4">Order Details</th>
                    <th className="py-3 px-4">Buyer Details</th>
                    <th className="py-3 px-4">Merchant Shop</th>
                    <th className="py-3 px-4">Paid Total</th>
                    <th className="py-3 px-4">Shipping Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {lists.orders.map((o: any) => (
                    <tr key={o._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 space-y-1">
                        <div className="font-mono text-slate-800 font-bold uppercase truncate max-w-[120px]">
                          ID: {o._id.substring(o._id.length - 8)}
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(o.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        <div>{o.userId?.name || 'Customer'}</div>
                        <span className="text-[10px] text-slate-400 font-semibold">{o.userId?.email}</span>
                      </td>
                      <td className="py-3 px-4 text-indigo-600 font-bold">{o.storeName}</td>
                      <td className="py-3 px-4 font-black">₹{o.finalAmount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusClass(o.orderStatus)}`}>
                          {o.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
