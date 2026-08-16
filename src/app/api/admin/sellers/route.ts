import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Store from '@/models/Store';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const sellers = await User.find({ role: 'seller' }).select('-password').sort({ createdAt: -1 });

    const enrichedSellers = await Promise.all(
      sellers.map(async (seller: any) => {
        const store = await Store.findOne({ sellerId: seller._id });
        return {
          ...seller.toObject(),
          storeName: store ? store.name : 'No Store Registered',
          storeLocation: store ? store.location : 'N/A',
        };
      })
    );

    return NextResponse.json({ sellers: enrichedSellers }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
