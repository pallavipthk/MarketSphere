import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="text-xl font-black tracking-tight text-white">
              MarketSphere
            </Link>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              A premium multi-vendor marketplace connecting buyers and sellers for high-quality electronics, fashion, home essentials, books, and more.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Explore</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/products?category=electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link href="/products?category=fashion" className="hover:text-white transition-colors">Fashion</Link></li>
              <li><Link href="/products?category=home" className="hover:text-white transition-colors">Home & Living</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Join Us</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/register?role=seller" className="hover:text-white transition-colors">Sell on MarketSphere</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Create Customer Account</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Contact & Support</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>Email: support@marketsphere.com</li>
              <li>Phone: +1 (555) 019-2834</li>
              <li>Location: San Francisco, CA</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} MarketSphere. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
