'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/components/ui/SessionContext';
import { useToast } from '@/components/ui/ToastContext';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Script from 'next/script';
import { MapPin, Phone, User, Home, Landmark, CreditCard, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CheckoutFormClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, cart, refreshCart } = useSession();
  const { showToast } = useToast();

  const couponCode = searchParams.get('coupon') || '';

  // Form Fields
  const [name, setName] = useState(user?.name || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('India');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [cartDetails, setCartDetails] = useState<any>(null);

  // Mock Payment Simulator Modal
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockPaymentData, setMockPaymentData] = useState<any>(null);

  // Load calculations
  useEffect(() => {
    if (!cart || cart.items.length === 0) return;

    const fetchPricing = async () => {
      try {
        const res = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ couponCode }),
        });
        const data = await res.json();
        if (res.ok) {
          setCartDetails(data);
        } else {
          showToast(data.error || 'Checkout initialization failed', 'error');
          router.push('/cart');
        }
      } catch {
        showToast('Checkout loading failed', 'error');
      }
    };
    fetchPricing();
  }, [cart, couponCode]);

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <span className="text-slate-400 font-bold block text-sm">Your cart is empty. Cannot checkout.</span>
          <button onClick={() => router.push('/products')} className="mt-4 bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-full text-xs">
            Browse Products
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !street || !city || !state || !zipCode || !country || !phone) {
      showToast('Please fill in all shipping details', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Failed to place order', 'error');
        setLoading(false);
        return;
      }

      const shippingAddress = { name, street, city, state, zipCode, country, phone };

      if (data.mock) {
        // Trigger simulated test modal
        setMockPaymentData({ ...data, shippingAddress });
        setShowMockModal(true);
      } else {
        // Real Razorpay integration
        const options = {
          key: data.keyId,
          amount: Math.round(data.finalAmount * 100),
          currency: data.currency,
          name: 'MarketSphere',
          description: 'E-Commerce Purchase',
          order_id: data.orderId,
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  shippingAddress,
                  couponCode,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok) {
                showToast('Order placed successfully!', 'success');
                await refreshCart();
                router.push('/orders');
              } else {
                showToast(verifyData.error || 'Payment verification failed', 'error');
              }
            } catch {
              showToast('Verification server connection error', 'error');
            }
          },
          prefill: {
            name,
            email: user?.email || '',
            contact: phone,
          },
          theme: {
            color: '#4f46e5',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setLoading(false);
      }
    } catch {
      showToast('Network error, please try again', 'error');
      setLoading(false);
    }
  };

  // Simulated sandbox handlers
  const handleConfirmMockPayment = async () => {
    if (!mockPaymentData) return;
    setLoading(true);
    setShowMockModal(false);

    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_payment_id: `mock_pay_id_${Date.now()}`,
          razorpay_order_id: mockPaymentData.orderId,
          razorpay_signature: 'mock_signature_12345',
          shippingAddress: mockPaymentData.shippingAddress,
          couponCode,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Payment successful! Order confirmed.', 'success');
        await refreshCart();
        router.push('/orders');
      } else {
        showToast(data.error || 'Payment failed', 'error');
      }
    } catch {
      showToast('Verification request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineMockPayment = () => {
    setShowMockModal(false);
    showToast('Payment declined. Order canceled.', 'error');
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <main className="flex-1 bg-slate-50/50 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 mb-8">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Shipping Form */}
            <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 card-shadow">
              <h2 className="font-bold text-slate-800 text-sm pb-4 border-b border-slate-100 mb-6">Shipping Address</h2>
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Recipient Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Street Address</label>
                  <div className="relative">
                    <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="123 Main Street, Suite 4B"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Mumbai"
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="MH"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Postal Code</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="400001"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Country</label>
                  <div className="relative">
                    <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="India"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 group cursor-pointer"
                >
                  {loading ? 'Processing Payment...' : 'Proceed to Payment'}
                  {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
                </button>
              </form>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 card-shadow space-y-6">
              <h2 className="font-bold text-slate-800 text-sm pb-3 border-b border-slate-100">Order Summary</h2>
              
              {/* Items List inside Checkout */}
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto space-y-3.5 pr-2">
                {cart.items.map((item) => {
                  const product = item.productId;
                  if (!product) return null;
                  return (
                    <div key={product._id} className="flex gap-3 items-center pt-3.5 first:pt-0">
                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">{product.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-bold">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-xs font-black text-slate-900">₹{(product.price * item.quantity).toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>

              {/* Pricing totals */}
              {cartDetails && (
                <div className="space-y-3 border-t border-slate-100 pt-4 text-xs font-bold text-slate-500">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-slate-800">₹{cartDetails.totalAmount.toLocaleString()}</span>
                  </div>
                  {cartDetails.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount ({couponCode})</span>
                      <span>- ₹{cartDetails.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-100 pt-3.5 text-sm font-black text-slate-800">
                    <span>Grand Total</span>
                    <span className="text-indigo-600">₹{cartDetails.finalAmount.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Simulated Sandbox Dialog */}
      {showMockModal && mockPaymentData && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 md:p-8 card-shadow space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-black text-slate-800">Razorpay Test Sandbox</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Razorpay keys are not configured. We have automatically launched the simulated sandbox checkout. No real funds will be processed.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 space-y-2">
              <div className="flex justify-between">
                <span>Transaction Order ID</span>
                <span className="text-slate-800 font-mono text-[10px]">{mockPaymentData.orderId}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-800 border-t border-slate-200/50 pt-2">
                <span>Total Amount to Pay</span>
                <span className="text-indigo-600">₹{mockPaymentData.finalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleConfirmMockPayment}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Authorize Mock Payment (Success)
              </button>
              <button
                onClick={handleDeclineMockPayment}
                className="w-full bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel / Decline Transaction
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
