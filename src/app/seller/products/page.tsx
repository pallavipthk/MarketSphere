'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastContext';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';

export default function SellerProductsPage() {
  const { showToast } = useToast();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = () => {
    setLoading(true);
    fetch('/api/products/seller')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        showToast('Failed to load products', 'error');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Product deleted successfully', 'success');
        fetchProducts();
      } else {
        showToast(data.error || 'Failed to delete product', 'error');
      }
    } catch {
      showToast('Network error, please try again', 'error');
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 card-shadow space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            My Products
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">Manage stock inventory, pricing, and details</p>
        </div>

        <Link
          href="/seller/products/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-full text-xs shadow-md shadow-indigo-100 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <span className="text-slate-400 font-bold text-xs">Loading products...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
          <span className="text-slate-400 font-bold block text-sm">No products listed yet.</span>
          <Link href="/seller/products/new" className="inline-block bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold py-2 px-4 rounded-full text-xs">
            List Your First Item
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {products.map((prod) => {
                const isOutOfStock = prod.stock <= 0;
                const isLowStock = prod.stock > 0 && prod.stock <= 5;

                return (
                  <tr key={prod._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0" />
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 max-w-[200px] truncate">
                      {prod.name}
                    </td>
                    <td className="py-3 px-4 capitalize">{prod.category}</td>
                    <td className="py-3 px-4 font-bold">₹{prod.price.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      {isOutOfStock ? (
                        <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-[10px] font-bold">No Stock</span>
                      ) : isLowStock ? (
                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-[10px] font-bold">Low ({prod.stock})</span>
                      ) : (
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">In Stock ({prod.stock})</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Link
                          href={`/seller/products/new?edit=${prod._id}`}
                          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors border border-slate-100 rounded-lg hover:bg-white shrink-0"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(prod._id)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors border border-slate-100 rounded-lg hover:bg-white shrink-0"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
