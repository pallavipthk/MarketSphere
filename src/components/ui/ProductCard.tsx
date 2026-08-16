'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useSession } from './SessionContext';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    stock: number;
    rating: number;
    reviewsCount: number;
    category: string;
    storeId?: {
      name: string;
    };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, wishlist } = useSession();
  const isFavorite = wishlist?.products?.some((p) => p._id === product._id) || false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product._id, 1);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden card-shadow hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      <button
        onClick={handleWishlist}
        className="absolute top-3 right-3 z-10 p-2 rounded-full glass hover:scale-105 active:scale-95 transition-all text-slate-500 hover:text-rose-600"
      >
        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-600 text-rose-600' : ''}`} />
      </button>

      <Link href={`/products/${product._id}`} className="block relative aspect-square overflow-hidden bg-slate-100 shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
            <span className="text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-rose-600 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          <span>{product.category}</span>
          {product.storeId && (
            <span className="max-w-[120px] truncate text-indigo-500">
              {product.storeId.name}
            </span>
          )}
        </div>

        <Link href={`/products/${product._id}`} className="block">
          <h3 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mt-1 mb-2">
          <div className="flex items-center text-amber-500">
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="text-xs font-bold text-slate-700">{product.rating || 'New'}</span>
          {product.reviewsCount > 0 && (
            <span className="text-[10px] text-slate-400">({product.reviewsCount})</span>
          )}
        </div>

        <div className="mb-3 text-[10px] font-bold">
          {isOutOfStock ? (
            <span className="text-rose-600">No Stock</span>
          ) : isLowStock ? (
            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Only {product.stock} Left</span>
          ) : (
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">In Stock</span>
          )}
        </div>

        <div className="flex justify-between items-center mt-auto pt-2 border-t border-slate-50">
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Price</div>
            <div className="text-base font-black text-slate-900">₹{product.price.toLocaleString()}</div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-xl transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 hover:scale-105 active:scale-95'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
