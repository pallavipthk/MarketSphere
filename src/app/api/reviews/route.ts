import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const reviews = await Review.find({ productId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { productId, orderId, rating, comment } = await req.json();

    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: 'Product ID, rating, and comment are required' }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const newReview = await Review.create({
      userId: session.id,
      productId,
      orderId,
      rating: parseInt(rating),
      comment,
    });

    const reviews = await Review.find({ productId });
    const totalRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
    const reviewsCount = reviews.length;
    const avgRating = reviewsCount > 0 ? parseFloat((totalRating / reviewsCount).toFixed(1)) : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      reviewsCount,
    });

    return NextResponse.json({ message: 'Review added successfully', review: newReview }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
