import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Store from '@/models/Store';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const order = await Order.findById(id).populate('userId', 'name email');
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const isCustomer = order.userId._id.toString() === session.id;
    const isSeller = order.sellerId.toString() === session.id;
    const isAdmin = session.role === 'admin';

    if (!isCustomer && !isSeller && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const store = await Store.findOne({ sellerId: order.sellerId });
    const sellerUser = await User.findById(order.sellerId).select('name email');

    return NextResponse.json({
      order,
      store: store || null,
      seller: sellerUser || null,
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
