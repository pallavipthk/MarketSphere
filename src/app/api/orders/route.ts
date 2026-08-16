import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Store from '@/models/Store';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    if (session.role === 'customer') {
      const orders = await Order.find({ userId: session.id }).sort({ createdAt: -1 });

      const enrichedOrders = await Promise.all(
        orders.map(async (order: any) => {
          const store = await Store.findOne({ sellerId: order.sellerId });
          return {
            ...order.toObject(),
            storeName: store ? store.name : 'MarketSphere Partner Store',
          };
        })
      );

      return NextResponse.json({ orders: enrichedOrders }, { status: 200 });
    } else if (session.role === 'seller') {
      const orders = await Order.find({ sellerId: session.id })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });

      return NextResponse.json({ orders }, { status: 200 });
    } else {
      const orders = await Order.find({}).sort({ createdAt: -1 });
      return NextResponse.json({ orders }, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
