import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Wishlist from '@/models/Wishlist';
import Product from '@/models/Product';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    let wishlist = await Wishlist.findOne({ userId: session.id }).populate('products');
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: session.id, products: [] });
    }

    return NextResponse.json({ wishlist }, { status: 200 });
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
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let wishlist = await Wishlist.findOne({ userId: session.id });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: session.id, products: [] });
    }

    if (!wishlist.products.includes(productId as any)) {
      wishlist.products.push(productId as any);
      await wishlist.save();
    }

    await wishlist.populate('products');

    return NextResponse.json({ wishlist }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    let wishlist = await Wishlist.findOne({ userId: session.id });
    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
    }

    wishlist.products = wishlist.products.filter(
      (pid: any) => pid.toString() !== productId
    ) as any;

    await wishlist.save();
    await wishlist.populate('products');

    return NextResponse.json({ wishlist }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
