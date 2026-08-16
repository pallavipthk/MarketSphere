'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
  avatar?: string;
}

interface CartItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
    category: string;
  };
  quantity: number;
  price: number;
}

interface Cart {
  items: CartItem[];
}

interface Wishlist {
  products: {
    _id: string;
    name: string;
    price: number;
    image: string;
    stock: number;
    rating: number;
  }[];
}

interface SessionContextProps {
  user: UserSession | null;
  cart: Cart | null;
  wishlist: Wishlist | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<boolean>;
  updateCartQty: (productId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<boolean>;
  toggleWishlist: (productId: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const refreshWishlist = useCallback(async () => {
    try {
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const data = await res.json();
        setWishlist(data.wishlist);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const initSession = async () => {
      setLoading(true);
      await refreshUser();
      setLoading(false);
    };
    initSession();
  }, [refreshUser]);

  useEffect(() => {
    if (user && user.role === 'customer') {
      refreshCart();
      refreshWishlist();
    } else {
      setCart(null);
      setWishlist(null);
    }
  }, [user, refreshCart, refreshWishlist]);

  const addToCart = async (productId: string, quantity: number): Promise<boolean> => {
    if (!user) {
      showToast('Please log in to add items to your cart', 'warning');
      return false;
    }
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await res.json();
      if (res.ok) {
        setCart(data.cart);
        showToast('Item added to cart successfully', 'success');
        return true;
      } else {
        showToast(data.error || 'Failed to add item to cart', 'error');
        return false;
      }
    } catch {
      showToast('Network error, please try again', 'error');
      return false;
    }
  };

  const updateCartQty = async (productId: string, quantity: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await res.json();
      if (res.ok) {
        setCart(data.cart);
        showToast('Cart updated', 'success');
        return true;
      } else {
        showToast(data.error || 'Failed to update quantity', 'error');
        return false;
      }
    } catch {
      showToast('Network error', 'error');
      return false;
    }
  };

  const removeFromCart = async (productId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCart(data.cart);
        showToast('Item removed from cart', 'success');
        return true;
      } else {
        showToast(data.error || 'Failed to remove item', 'error');
        return false;
      }
    } catch {
      showToast('Network error', 'error');
      return false;
    }
  };

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    if (!user) {
      showToast('Please log in to manage your wishlist', 'warning');
      return false;
    }
    const isFav = wishlist?.products?.some((p) => p._id === productId);
    try {
      const method = isFav ? 'DELETE' : 'POST';
      const res = await fetch('/api/wishlist', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (res.ok) {
        setWishlist(data.wishlist);
        showToast(isFav ? 'Removed from wishlist' : 'Added to wishlist', 'success');
        return true;
      } else {
        showToast(data.error || 'Wishlist update failed', 'error');
        return false;
      }
    } catch {
      showToast('Network error', 'error');
      return false;
    }
  };

  const logout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setUser(null);
        setCart(null);
        setWishlist(null);
        showToast('Logged out successfully', 'success');
        window.location.href = '/';
      } else {
        showToast('Failed to logout', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  return (
    <SessionContext.Provider
      value={{
        user,
        cart,
        wishlist,
        loading,
        refreshUser,
        refreshCart,
        refreshWishlist,
        addToCart,
        updateCartQty,
        removeFromCart,
        toggleWishlist,
        logout,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
