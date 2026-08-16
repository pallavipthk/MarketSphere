import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session || session.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const productCount = await Product.countDocuments({ sellerId: session.id });
    const lowStockCount = await Product.countDocuments({ sellerId: session.id, stock: { $lte: 5 } });

    const orders = await Order.find({ sellerId: session.id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum: number, order: any) => sum + order.finalAmount, 0);

    // Calculate weekly sales chart data
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return {
        dateStr: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.toDateString(),
        amount: 0,
      };
    }).reverse();

    orders.forEach((order: any) => {
      const orderDate = new Date(order.createdAt).toDateString();
      const match = last7Days.find((day) => day.date === orderDate);
      if (match) {
        match.amount += order.finalAmount;
      }
    });

    return NextResponse.json({
      productCount,
      lowStockCount,
      totalOrders,
      totalSales: parseFloat(totalSales.toFixed(2)),
      recentOrders: orders.slice(0, 5),
      chartData: last7Days,
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
