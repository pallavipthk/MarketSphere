import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Store from '@/models/Store';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const orders = await Order.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const enrichedOrders = await Promise.all(
      orders.map(async (order: any) => {
        const store = await Store.findOne({ sellerId: order.sellerId });
        return {
          ...order.toObject(),
          storeName: store ? store.name : 'MarketSphere Store',
        };
      })
    );

    return NextResponse.json({ orders: enrichedOrders }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
