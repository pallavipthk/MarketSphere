'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { useToast } from '@/components/ui/ToastContext';
import { ClipboardList, Calendar, IndianRupee, ArrowRight } from 'lucide-react';

export default function CustomerOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        showToast('Failed to load orders', 'error');
        setLoading(false);
      });
  }, []);

  const getStatusBadgeClass = (status: string) => {
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
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50/50 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Order History</h1>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 card-shadow space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-100 w-1/4 rounded" />
                  <div className="h-3 bg-slate-100 w-1/3 rounded" />
                  <div className="h-8 bg-slate-100 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center card-shadow space-y-4">
              <span className="text-slate-400 font-bold block text-sm">You haven&apos;t placed any orders yet.</span>
              <Link href="/products" className="inline-block bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-full text-xs transition-colors">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="bg-white border border-slate-100 rounded-2xl p-6 card-shadow space-y-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800 font-mono uppercase truncate max-w-xs">
                        Order ID: {order._id}
                      </span>
                      <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full capitalize ${getStatusBadgeClass(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
                      <div className="flex items-center gap-1 shrink-0">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-700 shrink-0">
                        <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold">₹{order.finalAmount.toLocaleString()}</span>
                      </div>
                      <span className="text-indigo-500 max-w-[150px] truncate">Store: {order.storeName}</span>
                    </div>

                    <div className="text-xs text-slate-500 font-medium line-clamp-1">
                      Items: {order.items.map((it: any) => `${it.name} (${it.quantity})`).join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-end">
                    <Link
                      href={`/orders/${order._id}`}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold py-2.5 px-5 rounded-full text-xs transition-colors flex items-center gap-1.5"
                    >
                      Track & Details
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
