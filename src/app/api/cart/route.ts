import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Cart from '@/models/Cart';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    let cart = await Cart.findOne({ userId: session.id }).populate('items.productId');

    if (!cart) {
      cart = await Cart.create({ userId: session.id, items: [] });
    }

    return NextResponse.json({ cart }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
