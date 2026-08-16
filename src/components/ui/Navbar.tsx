'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  Search,
  LogOut,
  Store as StoreIcon,
  Sliders,
  Menu,
  X,
  ClipboardList
} from 'lucide-react';
import { useSession } from './SessionContext';

export default function Navbar() {
  const { user, cart, wishlist, logout } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  const totalCartItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const wishlistCount = wishlist?.products?.length || 0;

  return (
    <nav className="sticky top-0 z-40 w-full glass-nav card-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">
          <div className="flex shrink-0">
            <Link href="/" className="text-2xl font-black tracking-tight gradient-text">
              MarketSphere
            </Link>
          </div>

          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-full focus:outline-none focus:border-indigo-500 bg-slate-50/50 text-sm font-medium"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </form>

          <div className="hidden lg:flex items-center gap-5">
            <Link href="/products" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              Browse
            </Link>

            {user?.role === 'customer' && (
              <>
                <Link href="/wishlist" className="relative p-1.5 text-slate-600 hover:text-indigo-600 transition-colors">
                  <Heart className="w-6 h-6" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full text-[10px] font-bold w-4 h-4 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link href="/cart" className="relative p-1.5 text-slate-600 hover:text-indigo-600 transition-colors">
                  <ShoppingBag className="w-6 h-6" />
                  {totalCartItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full text-[10px] font-bold w-4 h-4 flex items-center justify-center">
                      {totalCartItems}
                    </span>
                  )}
                </Link>
                <Link href="/orders" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <ClipboardList className="w-4 h-4" />
                  Orders
                </Link>
              </>
            )}

            {user?.role === 'seller' && (
              <>
                <Link href="/seller" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-full">
                  <StoreIcon className="w-4 h-4" />
                  Seller Dashboard
                </Link>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <Link href="/admin" className="text-sm font-semibold text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-1.5 bg-violet-50 px-3 py-1.5 rounded-full">
                  <Sliders className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              </>
            )}

            {user ? (
              <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                <Link href="/profile" className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase text-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left leading-none">
                    <div className="text-sm font-bold truncate max-w-[100px]">{user.name}</div>
                    <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
                  </div>
                </Link>
                <button onClick={logout} className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors" title="Log Out">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">
                  Log in
                </Link>
                <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm shadow-indigo-100">
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="lg:hidden flex items-center gap-3">
            {user?.role === 'customer' && (
              <Link href="/cart" className="relative p-1.5 text-slate-600">
                <ShoppingBag className="w-6 h-6" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full text-[10px] font-bold w-4 h-4 flex items-center justify-center">
                    {totalCartItems}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-600 hover:text-indigo-600 animate-fade-in"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-4 pt-2 pb-6 space-y-4 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-full focus:outline-none"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-5 h-5" />
            </button>
          </form>

          <div className="flex flex-col gap-3 font-semibold text-slate-700">
            <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600 py-1.5 border-b border-slate-50">
              Browse Products
            </Link>

            {user?.role === 'customer' && (
              <>
                <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600 py-1.5 border-b border-slate-50">
                  Wishlist ({wishlistCount})
                </Link>
                <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600 py-1.5 border-b border-slate-50">
                  Order History
                </Link>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600 py-1.5 border-b border-slate-50">
                  My Profile
                </Link>
              </>
            )}

            {user?.role === 'seller' && (
              <>
                <Link href="/seller" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600 py-1.5 border-b border-slate-50">
                  Seller Dashboard
                </Link>
                <Link href="/seller/store" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600 py-1.5 border-b border-slate-50">
                  Manage Store
                </Link>
                <Link href="/seller/products" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600 py-1.5 border-b border-slate-50">
                  Manage Products
                </Link>
                <Link href="/seller/orders" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600 py-1.5 border-b border-slate-50">
                  Incoming Orders
                </Link>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="hover:text-indigo-600 py-1.5 border-b border-slate-50">
                  Admin Dashboard
                </Link>
              </>
            )}

            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left text-rose-600 py-1.5"
              >
                Log Out
              </button>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center border border-slate-200 py-2 rounded-full text-slate-700">
                  Log In
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center bg-indigo-600 text-white py-2 rounded-full font-bold">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
