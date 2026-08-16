import React, { Suspense } from 'react';
import CheckoutFormClient from '@/components/CheckoutFormClient';

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <span className="text-slate-400 font-bold">Loading Checkout...</span>
      </div>
    }>
      <CheckoutFormClient />
    </Suspense>
  );
}
