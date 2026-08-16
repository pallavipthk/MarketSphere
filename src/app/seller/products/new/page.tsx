import React, { Suspense } from 'react';
import ProductFormClient from '@/components/ProductFormClient';

export default function NewProductPage() {
  return (
    <Suspense fallback={
      <div className="bg-white border border-slate-100 rounded-3xl p-8 card-shadow flex items-center justify-center">
        <span className="text-slate-400 font-bold">Loading Form...</span>
      </div>
    }>
      <ProductFormClient />
    </Suspense>
  );
}
