import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Store from '@/models/Store';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const customerCount = await User.countDocuments({ role: 'customer' });
    const sellerCount = await User.countDocuments({ role: 'seller' });
    const productCount = await Product.countDocuments({});
    const orderCount = await Order.countDocuments({});

    const revenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$finalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Fetch lists
    const users = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
    const sellers = await User.find({ role: 'seller' }).select('-password').sort({ createdAt: -1 });
    
    const enrichedSellers = await Promise.all(
      sellers.map(async (seller: any) => {
        const store = await Store.findOne({ sellerId: seller._id });
        return {
          ...seller.toObject(),
          storeName: store ? store.name : 'No Store Registered',
        };
      })
    );

    const products = await Product.find({})
      .populate('sellerId', 'name email')
      .populate('storeId', 'name')
      .sort({ createdAt: -1 });

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

    return NextResponse.json({
      metrics: {
        customerCount,
        sellerCount,
        productCount,
        orderCount,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      },
      lists: {
        users,
        sellers: enrichedSellers,
        products,
        orders: enrichedOrders,
      },
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
