'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import OrderTimeline from '@/components/ui/OrderTimeline';
import { useToast } from '@/components/ui/ToastContext';
import { ArrowLeft, Download, FileText, MapPin, Phone, User, Calendar, Tag } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface OrderDetailClientProps {
  orderId: string;
}

export default function OrderDetailClient({ orderId }: OrderDetailClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [order, setOrder] = useState<any>(null);
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (res.ok) {
          setOrder(data.order);
          setStore(data.store);
        } else {
          showToast(data.error || 'Failed to load order details', 'error');
          router.push('/orders');
        }
        setLoading(false);
      });
    const res = { ok: true }; // temp validation
  }, [orderId]);

  const handleDownloadInvoice = () => {
    if (!order) return;
    try {
      const doc = new jsPDF();

      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('MARKETSPHERE INVOICE', 20, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 30);
      doc.text(`Order ID: ${order._id}`, 20, 35);
      doc.text(`Payment Status: ${order.paymentStatus}`, 20, 40);
      doc.text(`Payment ID: ${order.paymentId || 'N/A'}`, 20, 45);

      doc.setFont('helvetica', 'bold');
      doc.text('Bill To:', 20, 55);
      doc.setFont('helvetica', 'normal');
      doc.text(order.shippingAddress.name, 20, 60);
      doc.text(order.shippingAddress.street, 20, 65);
      doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`, 20, 70);
      doc.text(order.shippingAddress.country, 20, 75);
      doc.text(`Phone: ${order.shippingAddress.phone}`, 20, 80);

      doc.setFont('helvetica', 'bold');
      doc.text('Merchant:', 120, 55);
      doc.setFont('helvetica', 'normal');
      doc.text(store ? store.name : 'MarketSphere Store', 120, 60);
      doc.text(store ? store.location : 'Online Partner', 120, 65);

      let y = 95;
      doc.setFont('helvetica', 'bold');
      doc.text('Product', 20, y);
      doc.text('Qty', 120, y);
      doc.text('Price (INR)', 140, y);
      doc.text('Total (INR)', 170, y);

      doc.line(20, y + 2, 190, y + 2);
      y += 8;

      doc.setFont('helvetica', 'normal');
      order.items.forEach((item: any) => {
        doc.text(item.name || 'Product Item', 20, y);
        doc.text(item.quantity.toString(), 120, y);
        doc.text(item.price.toLocaleString(), 140, y);
        doc.text((item.price * item.quantity).toLocaleString(), 170, y);
        y += 8;
      });

      doc.line(20, y - 2, 190, y - 2);
      y += 6;

      doc.setFont('helvetica', 'bold');
      doc.text('Subtotal:', 120, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`Rs. ${order.totalAmount.toLocaleString()}`, 170, y);
      y += 8;

      if (order.discount > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('Discount:', 120, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`- Rs. ${order.discount.toLocaleString()}`, 170, y);
        y += 8;
      }

      doc.setFont('helvetica', 'bold');
      doc.text('Final Total:', 120, y);
      doc.text(`Rs. ${order.finalAmount.toLocaleString()}`, 170, y);

      doc.save(`invoice_${order._id}.pdf`);
      showToast('Invoice PDF downloaded', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to generate PDF invoice', 'error');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
          <span className="text-slate-400 font-bold">Loading order details...</span>
        </main>
        <Footer />
      </>
    );
  }

  if (!order) return null;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50/50 pb-16">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div>
            <button
              onClick={() => router.push('/orders')}
              className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to orders
            </button>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 card-shadow space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black tracking-wider uppercase bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
                  Status: {order.orderStatus}
                </span>
                <h1 className="text-lg font-black text-slate-800 font-mono uppercase pt-1">
                  Order ID: {order._id}
                </h1>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                onClick={handleDownloadInvoice}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-full text-xs shadow-md shadow-indigo-100 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download Invoice
              </button>
            </div>

            {/* Tracking Timeline */}
            <div>
              <h2 className="text-sm font-black text-slate-800 tracking-wider uppercase mb-4">Track Shipping Progress</h2>
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 md:p-6">
                <OrderTimeline currentStatus={order.orderStatus} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              {/* Shipping Address */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-50">Delivery Address</h3>
                <div className="text-xs font-semibold text-slate-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-800">{order.shippingAddress.name}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {order.shippingAddress.street}, {order.shippingAddress.city}, <br />
                      {order.shippingAddress.state} {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{order.shippingAddress.phone}</span>
                  </div>
                </div>
              </div>

              {/* Merchant Store info */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-50">Merchant Store</h3>
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 text-sm font-black shrink-0 uppercase">
                    {store ? store.name.charAt(0) : 'MS'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {store ? store.name : 'MarketSphere Store'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">
                      Location: {store ? store.location : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Table Summary */}
            <div className="space-y-3 pt-4">
              <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-50 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-500" />
                Purchased Items
              </h3>
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <div className="divide-y divide-slate-100 bg-white">
                  {order.items.map((item: any) => (
                    <div key={item.productId} className="p-4 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-800">{item.name}</div>
                          <span className="text-[10px] text-slate-400 font-semibold">Price: ₹{item.price.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-semibold text-slate-500">Qty: {item.quantity}</div>
                        <div className="font-black text-slate-900 mt-0.5">₹{(item.price * item.quantity).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotals footer */}
                <div className="bg-slate-50 p-4 border-t border-slate-100 text-xs font-bold text-slate-500 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-slate-800">₹{order.totalAmount.toLocaleString()}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Coupon Discount</span>
                      <span>- ₹{order.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-slate-800 border-t border-slate-200/50 pt-2">
                    <span>Paid Grand Total</span>
                    <span className="text-indigo-600">₹{order.finalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
