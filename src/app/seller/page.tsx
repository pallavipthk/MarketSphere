'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { IndianRupee, ShoppingCart, Package, AlertTriangle, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/ToastContext';

export default function SellerDashboard() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/seller/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          showToast(data.error, 'error');
        } else {
          setStats(data);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        showToast('Failed to load merchant metrics', 'error');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="text-slate-400 font-bold">Loading dashboard data...</span>
      </div>
    );
  }

  if (!stats) return null;

  const cardData = [
    { label: 'Total Sales', value: `₹${stats.totalSales.toLocaleString()}`, icon: IndianRupee, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingCart, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { label: 'Total Products', value: stats.productCount.toString(), icon: Package, color: 'bg-sky-50 text-sky-600 border-sky-100' },
    { label: 'Low Stock Products', value: stats.lowStockCount.toString(), icon: AlertTriangle, color: stats.lowStockCount > 0 ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' : 'bg-slate-50 text-slate-400 border-slate-100' },
  ];

  const maxAmount = Math.max(...stats.chartData.map((d: any) => d.amount), 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-black text-slate-800 tracking-tight">Dashboard Overview</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">Track store metrics and sales trends</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map((card, idx) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 bg-white border border-slate-100 rounded-3xl p-6 card-shadow space-y-6">
          <div>
            <h2 className="font-bold text-slate-800 text-sm">Sales Last 7 Days</h2>
            <p className="text-[10px] text-slate-400 font-semibold">Store revenue patterns by day</p>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 pt-6 border-b border-l border-slate-100 px-4">
            {stats.chartData.map((day: any, idx: number) => {
              const pct = (day.amount / maxAmount) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div className="absolute -top-8 bg-slate-900 text-white text-[9px] font-black py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                    ₹{day.amount.toLocaleString()}
                  </div>

                  <div
                    className="w-full bg-indigo-600 rounded-t-lg transition-all duration-700 min-h-[4px]"
                    style={{ height: `${Math.max(pct, 2)}%` }}
                  />

                  <span className="text-[10px] text-slate-400 font-bold mt-1 uppercase">
                    {day.dateStr}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-6 bg-white border border-slate-100 rounded-3xl p-6 card-shadow space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-bold text-slate-800 text-sm">Recent Incoming Orders</h2>
              <p className="text-[10px] text-slate-400 font-semibold">Latest updates on purchase orders</p>
            </div>
            <Link href="/seller/orders" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-0.5">
              Manage
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 font-bold text-xs">
              No orders found yet
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-2">
              {stats.recentOrders.map((order: any) => (
                <div key={order._id} className="py-3 flex justify-between items-center gap-4 text-xs font-semibold font-medium">
                  <div>
                    <span className="text-slate-800 font-bold truncate max-w-[120px] block">
                      {order.userId?.name || 'Customer'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Order ID: {order._id.substring(order._id.length - 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-black text-slate-900 font-bold">₹{order.finalAmount.toLocaleString()}</div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
