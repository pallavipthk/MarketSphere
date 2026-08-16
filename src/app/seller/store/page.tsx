'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/ToastContext';
import { Store, MapPin, Image as ImageIcon, FileText, ArrowRight } from 'lucide-react';

export default function ManageStorePage() {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [location, setLocation] = useState('');

  const [hasStore, setHasStore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/stores/my')
      .then((res) => res.json())
      .then((data) => {
        if (data.store && !data.noStore) {
          setName(data.store.name);
          setDescription(data.store.description);
          setLogo(data.store.logo || '');
          setLocation(data.store.location);
          setHasStore(true);
        } else {
          setHasStore(false);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !location) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const url = hasStore ? '/api/stores/my' : '/api/stores';
      const method = hasStore ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, logo, location }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(hasStore ? 'Store profile updated!' : 'Store registered successfully!', 'success');
        setHasStore(true);
      } else {
        showToast(data.error || 'Failed to update store', 'error');
      }
    } catch {
      showToast('Connection error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="text-slate-400 font-bold">Loading store details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl bg-white border border-slate-100 rounded-3xl p-6 md:p-8 card-shadow space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-800 tracking-tight">
          {hasStore ? 'Edit Store Profile' : 'Register Merchant Store'}
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          {hasStore ? 'Update details of your public marketplace shop' : 'Create your digital shop to start listing products'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Store Name</label>
          <div className="relative">
            <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MarketSphere Tech Store"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Store Location</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Mumbai, Maharashtra"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Store Logo Image URL (Optional)</label>
          <div className="relative">
            <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Store Description</label>
          <div className="relative">
            <FileText className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell customers what your store sells, values, and policies..."
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
          {submitting ? 'Saving Details...' : hasStore ? 'Save Store Changes' : 'Register Store'}
          {!submitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
        </button>
      </form>
    </div>
  );
}
