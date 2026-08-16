'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/ToastContext';
import { ArrowLeft, Tag, DollarSign, Box, Image as ImageIcon, FileText, ArrowRight } from 'lucide-react';

export default function ProductFormClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const editId = searchParams.get('edit') || '';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch categories
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0 && !editId) {
            setCategory(data.categories[0].slug);
          }
        }
      })
      .catch((e) => console.error(e));

    // Fetch product if editing
    if (editId) {
      fetch(`/api/products/${editId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.product) {
            setName(data.product.name);
            setDescription(data.product.description);
            setPrice(data.product.price.toString());
            setStock(data.product.stock.toString());
            setCategory(data.product.category);
            setImage(data.product.image);
          } else {
            showToast('Failed to load product details', 'error');
            router.push('/seller/products');
          }
          setLoading(false);
        })
        .catch(() => {
          showToast('Product load failed', 'error');
          router.push('/seller/products');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [editId]);

  // Support local image uploads using base64 conversion
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      showToast('Image uploaded successfully (local sandbox mode)', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price || !stock || !category || !image) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const url = editId ? `/api/products/${editId}` : '/api/products';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          stock: parseInt(stock),
          category,
          image,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(editId ? 'Product updated!' : 'Product added successfully!', 'success');
        router.push('/seller/products');
      } else {
        showToast(data.error || 'Failed to save product', 'error');
      }
    } catch {
      showToast('Connection error, please try again', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="text-slate-400 font-bold">Loading product form...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl bg-white border border-slate-100 rounded-3xl p-6 md:p-8 card-shadow space-y-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push('/seller/products')}
          className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">
            {editId ? 'Edit Product Details' : 'Add New Product'}
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            {editId ? 'Modify the product listing properties' : 'Create a new marketplace listing'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. UltraHD LED Smart Projector"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold"
            required
          />
        </div>

        {/* Pricing & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Price (INR)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="4999"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Stock Count</label>
            <div className="relative">
              <Box className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="10"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold"
                required
              />
            </div>
          </div>
        </div>

        {/* Category dropdown */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Product Category</label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold bg-white capitalize"
              required
            >
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Image File upload or text url */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Product Image (File or URL)</label>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
            />
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Or paste an image URL directly"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold"
              />
            </div>
            {image && (
              <div className="mt-2 relative w-32 aspect-square rounded-xl overflow-hidden border border-slate-200">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Product Description</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of the specifications, design features, warranty..."
              rows={4}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 group transition-colors cursor-pointer"
        >
          {submitting ? 'Saving Product...' : editId ? 'Save Product Changes' : 'Create Product Listing'}
          {!submitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
        </button>
      </form>
    </div>
  );
}
