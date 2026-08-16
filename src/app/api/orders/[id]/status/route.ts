import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { getAuthUser } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getAuthUser();
    if (!session || session.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { status } = await req.json();

    const validStatuses = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.sellerId.toString() !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    order.orderStatus = status as any;
    await order.save();

    return NextResponse.json({ message: 'Order status updated successfully', order }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
