import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coupon from '@/models/Coupon';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon code not found' }, { status: 404 });
    }

    if (!coupon.active) {
      return NextResponse.json({ error: 'Coupon is no longer active' }, { status: 400 });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Coupon is valid',
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
