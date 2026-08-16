import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import Order from '@/models/Order';
import { getAuthUser } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      shippingAddress,
      couponCode,
    } = await req.json();

    if (!shippingAddress) {
      return NextResponse.json({ error: 'Shipping address is required' }, { status: 400 });
    }

    const isMockMode = !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET;

    if (!isMockMode) {
      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return NextResponse.json({ error: 'Payment parameters are missing' }, { status: 400 });
      }

      const text = razorpay_order_id + '|' + razorpay_payment_id;
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(text)
        .digest('hex');

      if (generated_signature !== razorpay_signature) {
        return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 });
      }
    }

    // Retrieve and validate cart
    const cart = await Cart.findOne({ userId: session.id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Verify stock availability
    for (const item of cart.items) {
      const product = item.productId as any;
      if (!product) {
        return NextResponse.json({ error: 'Some products are no longer available' }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for product: ${product.name}` }, { status: 400 });
      }
    }

    // Reduce stock inventory
    for (const item of cart.items) {
      const product = item.productId as any;
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Compute totals and discounts
    let totalSubtotal = 0;
    for (const item of cart.items) {
      const product = item.productId as any;
      totalSubtotal += product.price * item.quantity;
    }

    let totalDiscount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (coupon && new Date(coupon.expiryDate) > new Date()) {
        if (coupon.type === 'percentage') {
          totalDiscount = (totalSubtotal * coupon.value) / 100;
        } else if (coupon.type === 'flat') {
          totalDiscount = coupon.value;
        }
        totalDiscount = Math.min(totalDiscount, totalSubtotal);
      }
    }

    // Group items by sellerId to create vendor-specific orders
    const itemsBySeller: { [sellerId: string]: any[] } = {};
    for (const item of cart.items) {
      const product = item.productId as any;
      const sellerId = product.sellerId.toString();
      if (!itemsBySeller[sellerId]) {
        itemsBySeller[sellerId] = [];
      }
      itemsBySeller[sellerId].push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
        image: product.image,
      });
    }

    const createdOrders = [];
    const paymentId = razorpay_payment_id || `mock_payment_${Date.now()}`;

    for (const sellerId in itemsBySeller) {
      const sellerItems = itemsBySeller[sellerId];
      let sellerSubtotal = 0;
      for (const item of sellerItems) {
        sellerSubtotal += item.price * item.quantity;
      }

      // Apportion discount proportionally
      const sellerDiscount = totalSubtotal > 0 ? (totalDiscount * sellerSubtotal) / totalSubtotal : 0;
      const sellerFinalAmount = sellerSubtotal - sellerDiscount;

      const order = await Order.create({
        userId: session.id,
        sellerId,
        items: sellerItems,
        totalAmount: sellerSubtotal,
        discount: parseFloat(sellerDiscount.toFixed(2)),
        finalAmount: parseFloat(sellerFinalAmount.toFixed(2)),
        shippingAddress,
        paymentStatus: 'PAID',
        paymentId,
        orderStatus: 'PLACED',
      });

      createdOrders.push(order);
    }

    // Clear user cart
    await Cart.findOneAndUpdate({ userId: session.id }, { items: [] });

    return NextResponse.json({
      message: 'Payment verified and orders created successfully',
      orders: createdOrders,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
