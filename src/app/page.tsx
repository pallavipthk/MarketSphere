import React from 'react';
import Link from 'next/link';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import ProductCard from '@/components/ui/ProductCard';
import { ArrowRight, ShieldCheck, Zap, Sparkles, Award } from 'lucide-react';

export const revalidate = 0;

export default async function HomePage() {
  await connectDB();
  const rawCategories = await Category.find({});
  const rawProducts = await Product.find({})
    .populate('storeId')
    .sort({ rating: -1, createdAt: -1 })
    .limit(8);

  const categories = JSON.parse(JSON.stringify(rawCategories));
  const products = JSON.parse(JSON.stringify(rawProducts));

  const heroImage = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200";

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-slate-900 text-white py-20 px-4 md:px-8">
          <div className="absolute inset-0 z-0 opacity-40">
            <img src={heroImage} alt="Hero Banner" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent z-0" />
          
          <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-block">
                Exclusive Summer Deals
              </span>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
                Your Premium <br />
                <span className="gradient-text">Marketplace</span> Hub
              </h1>
              <p className="text-slate-300 text-base sm:text-lg max-w-lg leading-relaxed">
                Connect with verified local merchants, explore high-quality electronics, designer apparel, home essentials, and experience secure checkouts instantly.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/products"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-indigo-900/30 flex items-center gap-2 group transition-all"
                >
                  Shop Catalog
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/register?role=seller"
                  className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold py-3 px-6 rounded-full transition-all"
                >
                  Sell with Us
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 card-shadow flex gap-4 items-start">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Secure Checkout</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Razorpay protected safe card & UPI transfers.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 card-shadow flex gap-4 items-start">
            <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Instant Delivery</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Real-time status updates and order tracking.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 card-shadow flex gap-4 items-start">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Verified Vendors</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">100% genuine local stores and items guaranteed.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 card-shadow flex gap-4 items-start">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Top Coupons</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Unlock huge savings with promo codes at checkout.</p>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Browse Categories</h2>
                <p className="text-xs text-slate-400 font-semibold mt-1">Explore carefully curated collections</p>
              </div>
              <Link href="/products" className="text-xs font-bold text-indigo-600 hover:underline">
                View All Catalog
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat: any) => (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  className="p-6 border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-slate-50/50 text-center card-shadow group transition-all"
                >
                  <div className="font-bold text-slate-800 text-sm capitalize group-hover:text-indigo-600 transition-colors">
                    {cat.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-800">Trending Products</h2>
              <p className="text-xs text-slate-400 font-semibold mt-1">Customer favorites right now</p>
            </div>
            <Link href="/products" className="text-xs font-bold text-indigo-600 hover:underline">
              Browse All
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <span className="text-slate-400 font-bold">No products available. Seed data to get started!</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((prod: any) => (
                <ProductCard key={prod._id.toString()} product={prod as any} />
              ))}
            </div>
          )}
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="gradient-bg rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden shadow-xl shadow-indigo-100">
            <div className="max-w-2xl mx-auto space-y-6 relative z-10">
              <h2 className="text-3xl font-black">Start Selling Today</h2>
              <p className="text-indigo-100 text-sm md:text-base leading-relaxed">
                Reach thousands of buyers globally. List your products, customize your storefront, and grow your retail business seamlessly.
              </p>
              <div className="pt-2">
                <Link
                  href="/register?role=seller"
                  className="bg-white hover:bg-slate-100 text-indigo-600 font-black py-3.5 px-8 rounded-full shadow-md text-sm transition-all"
                >
                  Create Merchant Store
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
