import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import { getAuthUser } from '@/lib/auth';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { couponCode } = await req.json();

    const cart = await Cart.findOne({ userId: session.id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 });
    }

    let totalAmount = 0;
    for (const item of cart.items) {
      const product = item.productId as any;
      if (!product) {
        return NextResponse.json({ error: 'Some items in your cart are no longer available' }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for product: ${product.name}` }, { status: 400 });
      }
      totalAmount += product.price * item.quantity;
    }

    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (coupon && new Date(coupon.expiryDate) > new Date()) {
        if (coupon.type === 'percentage') {
          discount = (totalAmount * coupon.value) / 100;
        } else if (coupon.type === 'flat') {
          discount = coupon.value;
        }
        discount = Math.min(discount, totalAmount);
      }
    }

    const finalAmount = totalAmount - discount;
    const isMockMode = !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET;

    if (isMockMode) {
      return NextResponse.json({
        mock: true,
        orderId: `mock_order_${Date.now()}`,
        amount: finalAmount,
        currency: 'INR',
        keyId: 'mock_key_id',
        totalAmount,
        discount,
        finalAmount,
      }, { status: 200 });
    } else {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      });

      const options = {
        amount: Math.round(finalAmount * 100),
        currency: 'INR',
        receipt: `receipt_order_${Date.now()}`,
      };

      const rpOrder = await razorpay.orders.create(options);

      return NextResponse.json({
        mock: false,
        orderId: rpOrder.id,
        amount: finalAmount,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
        totalAmount,
        discount,
        finalAmount,
      }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Create order payment error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
