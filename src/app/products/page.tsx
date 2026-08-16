'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import ProductCard from '@/components/ui/ProductCard';
import { Filter, SlidersHorizontal, Search, RotateCcw, LayoutGrid } from 'lucide-react';

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('');

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || 'all');
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (category && category !== 'all') query.append('category', category);
    if (minPrice) query.append('minPrice', minPrice);
    if (maxPrice) query.append('maxPrice', maxPrice);
    if (sort) query.append('sort', sort);

    fetch(`/api/products?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [search, category, minPrice, maxPrice, sort]);

  const handleReset = () => {
    setSearch('');
    setCategory('all');
    setMinPrice('');
    setPassword('');
    setMaxPrice('');
    setSort('');
    router.push('/products');
  };

  function setPassword(arg0: string) {
    // temporary unused
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
      <aside className="w-full lg:w-64 shrink-0 space-y-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 card-shadow">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
            <h2 className="font-black text-slate-800 flex items-center gap-2 text-sm">
              <Filter className="w-4 h-4 text-indigo-600" />
              Filters
            </h2>
            <button onClick={handleReset} className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Search</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Categories</label>
            <div className="flex flex-wrap lg:flex-col gap-1.5">
              <button
                onClick={() => setCategory('all')}
                className={`text-xs font-bold px-3 py-2 rounded-xl text-left transition-all ${
                  category === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setCategory(cat.slug)}
                  className={`text-xs font-bold px-3 py-2 rounded-xl text-left transition-all capitalize ${
                    category === cat.slug
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Price Range (₹)</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold"
              />
            </div>
          </div>
        </div>
      </aside>

      <section className="flex-1 space-y-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 card-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <LayoutGrid className="w-4 h-4 text-indigo-500" />
            Showing {products.length} {products.length === 1 ? 'product' : 'products'}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs font-bold border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 bg-white"
            >
              <option value="">Sort by: Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 card-shadow space-y-4 animate-pulse">
                <div className="aspect-square bg-slate-100 rounded-xl" />
                <div className="h-4 bg-slate-100 w-2/3 rounded" />
                <div className="h-3 bg-slate-100 w-1/3 rounded" />
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-slate-100 w-1/4 rounded" />
                  <div className="h-8 bg-slate-100 w-8 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 card-shadow space-y-4">
            <span className="text-slate-400 font-bold block text-sm">No products match your criteria.</span>
            <button onClick={handleReset} className="text-xs font-black bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-100 transition-all">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50/50">
        <Suspense fallback={
          <div className="max-w-7xl mx-auto px-4 py-8 flex justify-center">
            <span className="text-slate-400 font-bold">Loading catalog...</span>
          </div>
        }>
          <CatalogContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
