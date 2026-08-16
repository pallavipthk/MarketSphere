import React from 'react';
import ProductDetailsClient from '@/components/ProductDetailsClient';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetailsClient productId={id} />;
}
