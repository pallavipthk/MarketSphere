import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { productId, quantity } = await req.json();

    if (!productId || quantity === undefined || quantity < 1) {
      return NextResponse.json({ error: 'Product ID and valid quantity are required' }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: 'Insufficient stock available' }, { status: 400 });
    }

    let cart = await Cart.findOne({ userId: session.id });
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const itemIndex = cart.items.findIndex((item: any) => item.productId.toString() === productId);
    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not in cart' }, { status: 404 });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price;

    await cart.save();
    await cart.populate('items.productId');

    return NextResponse.json({ cart }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
