'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/ToastContext';
import { ShoppingBag, ChevronRight, Calendar, User, Truck, Check } from 'lucide-react';

export default function SellerOrdersPage() {
  const { showToast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        showToast('Failed to load merchant orders', 'error');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
    let nextStatus = '';
    if (currentStatus === 'PLACED') nextStatus = 'CONFIRMED';
    else if (currentStatus === 'CONFIRMED') nextStatus = 'SHIPPED';
    else if (currentStatus === 'SHIPPED') nextStatus = 'DELIVERED';
    else return;

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Order status updated to ${nextStatus}`, 'success');
        fetchOrders();
      } else {
        showToast(data.error || 'Failed to update order status', 'error');
      }
    } catch {
      showToast('Network error, please try again', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
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
        return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const getActionButtonLabel = (status: string) => {
    switch (status) {
      case 'PLACED':
        return 'Confirm Order';
      case 'CONFIRMED':
        return 'Ship Order';
      case 'SHIPPED':
        return 'Mark Delivered';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 card-shadow space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-indigo-600" />
          Incoming Orders
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">Accept and manage delivery statuses of orders</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <span className="text-slate-400 font-bold text-xs">Loading orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border border-slate-100 rounded-2xl">
          <span className="text-slate-400 font-bold block text-sm">No incoming orders found.</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-4">Order Details</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Products Purchased</th>
                <th className="py-3 px-4">Total Earning</th>
                <th className="py-3 px-4">Tracking Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {orders.map((order) => {
                const actionLabel = getActionButtonLabel(order.orderStatus);

                return (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 space-y-1">
                      <div className="font-mono text-slate-800 font-black truncate max-w-[120px] uppercase">
                        ID: {order._id.substring(order._id.length - 8)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4 space-y-1">
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {order.shippingAddress.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold pl-4">
                        {order.shippingAddress.city}, {order.shippingAddress.phone}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="max-w-[200px] space-y-1">
                        {order.items.map((item: any) => (
                          <div key={item.productId} className="truncate text-slate-600 font-medium">
                            {item.name} <span className="font-black text-slate-800">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-black text-slate-800">
                      ₹{order.finalAmount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusBadge(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {actionLabel ? (
                        <button
                          onClick={() => handleUpdateStatus(order._id, order.orderStatus)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3.5 rounded-xl text-[10px] transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          {order.orderStatus === 'PLACED' && <Check className="w-3.5 h-3.5" />}
                          {order.orderStatus === 'CONFIRMED' && <Truck className="w-3.5 h-3.5 animate-bounce" />}
                          {order.orderStatus === 'SHIPPED' && <Check className="w-3.5 h-3.5" />}
                          {actionLabel}
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider flex items-center gap-1 justify-end">
                          <Check className="w-3.5 h-3.5" />
                          Complete
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
