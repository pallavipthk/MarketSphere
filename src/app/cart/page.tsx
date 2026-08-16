'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/ui/SessionContext';
import { useToast } from '@/components/ui/ToastContext';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { Trash2, Plus, Minus, ArrowRight, Ticket, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { cart, updateCartQty, removeFromCart } = useSession();
  const { showToast } = useToast();
  const router = useRouter();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const items = cart?.items || [];

  const subtotal = items.reduce((sum, item) => {
    const price = item.productId?.price || item.price;
    return sum + price * item.quantity;
  }, 0);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      showToast('Please enter a coupon code', 'warning');
      return;
    }

    setValidatingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon(data.coupon);
        showToast(`Coupon ${data.coupon.code} applied!`, 'success');
      } else {
        setAppliedCoupon(null);
        showToast(data.error || 'Invalid coupon', 'error');
      }
    } catch {
      showToast('Network error, please try again', 'error');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    showToast('Coupon removed', 'info');
  };

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discount = (subtotal * appliedCoupon.value) / 100;
    } else if (appliedCoupon.type === 'flat') {
      discount = appliedCoupon.value;
    }
    discount = Math.min(discount, subtotal);
  }

  const finalTotal = subtotal - discount;

  const handleQtyChange = (productId: string, currentQty: number, change: number, stock: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    if (newQty > stock) {
      showToast('Cannot add more than available stock', 'warning');
      return;
    }
    updateCartQty(productId, newQty);
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    const url = appliedCoupon ? `/checkout?coupon=${appliedCoupon.code}` : '/checkout';
    router.push(url);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50/50 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 mb-8">
            <ShoppingBag className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Shopping Cart</h1>
          </div>

          {items.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center card-shadow space-y-4">
              <span className="text-slate-400 font-bold block text-sm">Your shopping cart is currently empty.</span>
              <Link href="/products" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-full text-xs transition-all shadow-sm">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-4">
                {items.map((item) => {
                  const product = item.productId;
                  if (!product) return null;

                  return (
                    <div key={product._id} className="bg-white border border-slate-100 rounded-2xl p-4 card-shadow flex gap-4 items-center justify-between">
                      <div className="flex gap-4 items-center flex-1 min-w-0">
                        <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <Link href={`/products/${product._id}`} className="block">
                            <h3 className="text-xs font-bold text-slate-800 truncate hover:text-indigo-600 transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                          <div className="text-xs font-semibold text-slate-400 mt-0.5 capitalize">{product.category}</div>
                          <div className="text-sm font-black text-slate-900 mt-1">₹{product.price.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shrink-0">
                          <button
                            onClick={() => handleQtyChange(product._id, item.quantity, -1, product.stock)}
                            className="p-1.5 hover:bg-slate-50 text-slate-500"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 font-bold text-xs text-slate-700">{item.quantity}</span>
                          <button
                            onClick={() => handleQtyChange(product._id, item.quantity, 1, product.stock)}
                            className="p-1.5 hover:bg-slate-50 text-slate-500"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button onClick={() => removeFromCart(product._id)} className="text-slate-400 hover:text-rose-600 transition-colors shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 card-shadow space-y-6">
                <h2 className="font-bold text-slate-800 text-sm pb-3 border-b border-slate-100">Order Summary</h2>

                <div className="space-y-3.5 text-xs font-bold text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-slate-800">₹{subtotal.toLocaleString()}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>- ₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-emerald-600 uppercase tracking-wider text-[10px]">Free</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-800 border-t border-slate-100 pt-3.5">
                    <span>Final Amount</span>
                    <span className="text-indigo-600">₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-xl p-3 text-xs font-bold">
                      <div className="flex items-center gap-1.5">
                        <Ticket className="w-4 h-4 text-emerald-600" />
                        <span>Code Applied: {appliedCoupon.code}</span>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-slate-400 hover:text-rose-600 text-[10px] font-bold uppercase transition-colors">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Promo Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold uppercase"
                      />
                      <button
                        type="submit"
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs shrink-0 cursor-pointer"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-2xl text-sm shadow-md shadow-indigo-100 flex items-center justify-center gap-2 group transition-all cursor-pointer"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
