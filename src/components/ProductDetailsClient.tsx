'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import ProductCard from '@/components/ui/ProductCard';
import { useSession } from '@/components/ui/SessionContext';
import { useToast } from '@/components/ui/ToastContext';
import { Star, ShoppingCart, Heart, ArrowLeft, Plus, Minus, MessageSquare, AlertCircle } from 'lucide-react';

interface ProductDetailsClientProps {
  productId: string;
}

export default function ProductDetailsClient({ productId }: ProductDetailsClientProps) {
  const router = useRouter();
  const { user, addToCart, toggleWishlist, wishlist } = useSession();
  const { showToast } = useToast();

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cart Qty State
  const [qty, setQty] = useState(1);

  // Review Post State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const isFavorite = wishlist?.products?.some((p) => p._id === productId) || false;

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${productId}`);
      if (!res.ok) {
        showToast('Product not found', 'error');
        router.push('/products');
        return;
      }
      const data = await res.json();
      setProduct(data.product);

      // Fetch reviews
      const revRes = await fetch(`/api/reviews?productId=${productId}`);
      const revData = await revRes.json();
      if (revRes.ok) setReviews(revData.reviews);

      // Fetch related products
      const relRes = await fetch(`/api/products?category=${data.product.category}`);
      const relData = await relRes.json();
      if (relRes.ok && relData.products) {
        // filter out current product
        setRelated(relData.products.filter((p: any) => p._id !== productId).slice(0, 4));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId]);

  const handleIncrement = () => {
    if (qty < product.stock) setQty(qty + 1);
  };

  const handleDecrement = () => {
    if (qty > 1) setQty(qty - 1);
  };

  const handleAddToCart = async () => {
    await addToCart(product._id, qty);
  };

  const handleBuyNow = async () => {
    const success = await addToCart(product._id, qty);
    if (success) {
      router.push('/cart');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Please enter a comment', 'warning');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Review submitted successfully!', 'success');
        setComment('');
        setRating(5);
        // Refresh product details and reviews
        fetchProductData();
      } else {
        showToast(data.error || 'Failed to submit review', 'error');
      }
    } catch {
      showToast('Network error, please try again', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
          <span className="text-slate-400 font-bold">Loading product details...</span>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-slate-50/50 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          {/* Back button */}
          <div>
            <button
              onClick={() => router.push('/products')}
              className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to catalog
            </button>
          </div>

          {/* Product showcase */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 card-shadow grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
            {/* Image viewer */}
            <div className="lg:col-span-6 relative aspect-square overflow-hidden bg-slate-100 rounded-2xl">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              <button
                onClick={() => toggleWishlist(product._id)}
                className="absolute top-4 right-4 p-3 rounded-full glass hover:scale-105 transition-all text-slate-500 hover:text-rose-600"
              >
                <Heart className={`w-6 h-6 ${isFavorite ? 'fill-rose-600 text-rose-600' : ''}`} />
              </button>
            </div>

            {/* Info */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>{product.category}</span>
                  {product.storeId && (
                    <span className="text-indigo-500 bg-indigo-50 px-2.5 py-0.5 rounded-full capitalize">
                      Store: {product.storeId.name}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                  {product.name}
                </h1>

                {/* Rating & Review Counter */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-sm font-black text-slate-700">{product.rating || 'New'}</span>
                  <span className="text-xs text-slate-400">
                    ({product.reviewsCount} {product.reviewsCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>

                {/* Pricing info */}
                <div className="text-3xl font-black text-slate-900">
                  ₹{product.price.toLocaleString()}
                </div>

                <div className="text-sm text-slate-400 leading-relaxed font-semibold">
                  {product.description}
                </div>
              </div>

              {/* Purchase Box */}
              <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-500">Availability</span>
                  <div>
                    {isOutOfStock ? (
                      <span className="text-rose-600">Out of Stock</span>
                    ) : isLowStock ? (
                      <span className="text-amber-600">Only {product.stock} items left in stock</span>
                    ) : (
                      <span className="text-emerald-600">In Stock ({product.stock} available)</span>
                    )}
                  </div>
                </div>

                {/* Quantity select */}
                {!isOutOfStock && (
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-bold text-slate-500">Quantity</span>
                    <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden">
                      <button onClick={handleDecrement} className="p-2 hover:bg-slate-50 text-slate-500">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-bold text-sm text-slate-700">{qty}</span>
                      <button onClick={handleIncrement} className="p-2 hover:bg-slate-50 text-slate-500">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* CTAs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all ${
                      isOutOfStock
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white hover:bg-slate-50 text-indigo-600 border-indigo-200 active:scale-95'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className={`py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                      isOutOfStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 active:scale-95'
                    }`}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-800">Related Products</h2>
                <p className="text-xs text-slate-400 font-semibold mt-1">Customers also viewed these items</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((prod) => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>
            </div>
          )}

          {/* Reviews section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Reviews list */}
            <div className="lg:col-span-8 space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  Customer Reviews
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-1">Read feedback from our buyers</p>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 card-shadow">
                  <span className="text-slate-400 font-bold block text-sm">No reviews yet for this product.</span>
                  <span className="text-[10px] text-slate-400">Be the first to share your experience!</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="bg-white border border-slate-100 rounded-2xl p-5 card-shadow space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs uppercase text-slate-700">
                            {rev.userId?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800">{rev.userId?.name || 'Customer'}</div>
                            <div className="text-[9px] text-slate-400 font-medium">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'fill-current text-amber-500' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed pl-10">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write a review box */}
            <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 card-shadow space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Write a Review</h3>
              {user && user.role === 'customer' ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Rating</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setRating(val)}
                          className="text-amber-500 hover:scale-105 active:scale-95 transition-transform"
                        >
                          <Star className={`w-6 h-6 ${val <= rating ? 'fill-current' : 'text-slate-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Your Feedback</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts on the quality, shipping, store support..."
                      rows={4}
                      className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs font-semibold"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex gap-3 text-xs leading-relaxed text-slate-400 font-semibold">
                  <AlertCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span>Only registered customers can write reviews. Please log in as a customer to post.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
