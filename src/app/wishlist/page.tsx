'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import ProductCard from '@/components/ui/ProductCard';
import { useSession } from '@/components/ui/SessionContext';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist } = useSession();
  const products = wishlist?.products || [];

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50/50 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 mb-8">
            <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Wishlist</h1>
          </div>

          {products.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center card-shadow space-y-4">
              <span className="text-slate-400 font-bold block text-sm">Your wishlist is currently empty.</span>
              <Link href="/products" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-full text-xs shadow-sm">
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod._id} product={prod as any} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
