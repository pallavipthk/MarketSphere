import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Store from '@/models/Store';
import Category from '@/models/Category';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import Review from '@/models/Review';
import Order from '@/models/Order';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();

    // Clear all existing data
    await User.deleteMany({});
    await Store.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    await Review.deleteMany({});
    await Order.deleteMany({});

    // Hash passwords
    const adminHash = await hashPassword('admin123');
    const userHash = await hashPassword('password123');

    // Create 1 Admin
    const admin = await User.create({
      name: 'Platform Administrator',
      email: 'admin@marketsphere.com',
      password: adminHash,
      role: 'admin',
      avatar: '',
    });

    // Create 2 Sellers
    const seller1 = await User.create({
      name: 'Alex TechMerchant',
      email: 'seller1@marketsphere.com',
      password: userHash,
      role: 'seller',
    });

    const seller2 = await User.create({
      name: 'Sophia FashionHouse',
      email: 'seller2@marketsphere.com',
      password: userHash,
      role: 'seller',
    });

    // Create 5 Customers
    const customer1 = await User.create({ name: 'Liam Buyer', email: 'customer1@marketsphere.com', password: userHash, role: 'customer' });
    const customer2 = await User.create({ name: 'Emma Shopper', email: 'customer2@marketsphere.com', password: userHash, role: 'customer' });
    const customer3 = await User.create({ name: 'Oliver DealFinder', email: 'customer3@marketsphere.com', password: userHash, role: 'customer' });
    const customer4 = await User.create({ name: 'Ava Premium', email: 'customer4@marketsphere.com', password: userHash, role: 'customer' });
    const customer5 = await User.create({ name: 'Noah Retail', email: 'customer5@marketsphere.com', password: userHash, role: 'customer' });

    // Create 3 Stores
    const store1 = await Store.create({
      sellerId: seller1._id,
      name: 'MarketSphere Tech',
      description: 'Authorized retailer for top tier laptops, soundbars, headphones, and screens.',
      logo: '',
      location: 'Bangalore, KA',
    });

    const store2 = await Store.create({
      sellerId: seller2._id,
      name: 'Fashion Hub',
      description: 'Stunning premium clothing, activewear, jackets, and accessories.',
      logo: '',
      location: 'Mumbai, MH',
    });

    const store3 = await Store.create({
      sellerId: seller2._id, // Sophia runs both Fashion and Home Decor
      name: 'Home & Living',
      description: 'Artisanal cushions, modern table lamps, and luxury espresso brewers.',
      logo: '',
      location: 'Delhi, DL',
    });

    // Create 6 Categories
    const categories = [
      { name: 'Electronics', slug: 'electronics' },
      { name: 'Fashion', slug: 'fashion' },
      { name: 'Home & Living', slug: 'home' },
      { name: 'Books', slug: 'books' },
      { name: 'Sports', slug: 'sports' },
      { name: 'Beauty', slug: 'beauty' },
    ];
    await Category.insertMany(categories);

    // Create 15+ Products with Unsplash links
    const productsData = [
      {
        sellerId: seller1._id,
        storeId: store1._id,
        name: 'Pro Noise-Cancelling Headphones',
        description: 'Experience pure acoustic audio. Features adaptive sound masking, Bluetooth 5.2, and 40 hour battery life.',
        price: 9999,
        category: 'electronics',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
        stock: 12,
        rating: 4.8,
        reviewsCount: 1,
      },
      {
        sellerId: seller1._id,
        storeId: store1._id,
        name: 'UltraLite 14-inch Laptop',
        description: 'Performance meets portability. Intel i7 core CPU, 16GB RAM, 512GB NVMe SSD, and 12-hour high endurance capacity.',
        price: 54999,
        category: 'electronics',
        image: 'https://images.unsplash.com/photo-1496181130204-7552cc145cd1?auto=format&fit=crop&q=80&w=400',
        stock: 3, // Low stock indicator test
        rating: 4.5,
        reviewsCount: 0,
      },
      {
        sellerId: seller1._id,
        storeId: store1._id,
        name: 'Aerofit Smartwatch v2',
        description: 'Your wellness partner. Heart rate monitoring, blood oxygen sensing, sleep analysis, and water resistance.',
        price: 4999,
        category: 'electronics',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400',
        stock: 8,
        rating: 4.2,
        reviewsCount: 0,
      },
      {
        sellerId: seller2._id,
        storeId: store2._id,
        name: 'Unisex Leather Travel Bag',
        description: 'Handcrafted full-grain leather weekender. Features custom compartments, metallic buckles, and vintage patina.',
        price: 3499,
        category: 'fashion',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400',
        stock: 15,
        rating: 4.9,
        reviewsCount: 1,
      },
      {
        sellerId: seller2._id,
        storeId: store2._id,
        name: 'Waterproof Hooded Windbreaker',
        description: 'Breathable ripstop nylon shell. Ideal for trail hiking, cycling, and city commutes during monsoon.',
        price: 1899,
        category: 'fashion',
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=400',
        stock: 0, // Out of stock indicator test
        rating: 3.8,
        reviewsCount: 0,
      },
      {
        sellerId: seller2._id,
        storeId: store2._id,
        name: 'Classic White Athletic Sneakers',
        description: 'Memory foam insoles wrapped in micro-weave knit mesh. Maximum comfort for walking and jogging.',
        price: 2499,
        category: 'fashion',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400',
        stock: 22,
        rating: 4.6,
        reviewsCount: 0,
      },
      {
        sellerId: seller2._id,
        storeId: store3._id,
        name: 'Minimalist Ceramic Table Lamp',
        description: 'Warm ambient glow with structured clay base and natural linen shade. Includes smart energy LED bulb.',
        price: 1299,
        category: 'home',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=400',
        stock: 5,
        rating: 4.4,
        reviewsCount: 0,
      },
      {
        sellerId: seller2._id,
        storeId: store3._id,
        name: 'Woven Cotton Throw Pillow Cushions',
        description: 'Set of two boho-style covers with geometric fringes. Easy zipper release and washable canvas fabric.',
        price: 799,
        category: 'home',
        image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=400',
        stock: 30,
        rating: 4.0,
        reviewsCount: 0,
      },
      {
        sellerId: seller2._id,
        storeId: store3._id,
        name: 'Precision Drip Coffee Brewer',
        description: 'Thermal siphon extraction pot with micro-mesh filter. Brings out rich aroma from fresh beans.',
        price: 1599,
        category: 'home',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400',
        stock: 14,
        rating: 4.7,
        reviewsCount: 0,
      },
      {
        sellerId: seller1._id,
        storeId: store1._id,
        name: 'Mastering TypeScript & Clean Code',
        description: 'Comprehensive software development guide. Covers async code patterns, generic types, and clean OOP designs.',
        price: 699,
        category: 'books',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
        stock: 18,
        rating: 4.3,
        reviewsCount: 0,
      },
      {
        sellerId: seller1._id,
        storeId: store1._id,
        name: 'Interactive Science Encyclopedia',
        description: 'Rich graphical illustrations explaining mechanics, cosmic astrophysics, anatomy, and microbiology.',
        price: 1499,
        category: 'books',
        image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
        stock: 7,
        rating: 4.5,
        reviewsCount: 0,
      },
      {
        sellerId: seller2._id,
        storeId: store2._id,
        name: 'Pro-Grip Dumbbells Pair 10kg',
        description: 'Heavy duty neoprene coating to prevent slips. Perfect for high intensity training at home.',
        price: 1999,
        category: 'sports',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400',
        stock: 10,
        rating: 4.6,
        reviewsCount: 0,
      },
      {
        sellerId: seller2._id,
        storeId: store2._id,
        name: 'Anti-Slip Hybrid Yoga Mat',
        description: 'Extra thick cushioning made of eco-friendly TPE material. Water resistant, easy-carry strap included.',
        price: 899,
        category: 'sports',
        image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&q=80&w=400',
        stock: 15,
        rating: 4.1,
        reviewsCount: 0,
      },
      {
        sellerId: seller2._id,
        storeId: store2._id,
        name: 'Organic Aloe Vera Face Moisturizer',
        description: 'Intense hydration serum made of cold pressed aloe gel and cucumber extract. Free of chemicals.',
        price: 499,
        category: 'beauty',
        image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=400',
        stock: 25,
        rating: 4.4,
        reviewsCount: 0,
      },
      {
        sellerId: seller2._id,
        storeId: store2._id,
        name: 'Luxury Charcoal Bath Soap',
        description: 'Pack of three exfoliating carbon soaps. Extracts deep oils, leaving skin fresh and revitalized.',
        price: 349,
        category: 'beauty',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400',
        stock: 40,
        rating: 4.3,
        reviewsCount: 0,
      },
    ];

    const insertedProducts = await Product.insertMany(productsData);

    // Create 2 Coupons
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    await Coupon.create({
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      expiryDate: expiry,
      active: true,
    });

    await Coupon.create({
      code: 'FLAT50',
      type: 'flat',
      value: 50,
      expiryDate: expiry,
      active: true,
    });

    // Create a couple of reviews
    await Review.create({
      userId: customer1._id,
      productId: insertedProducts[0]._id,
      rating: 5,
      comment: 'Absolutely spectacular sound cancellation quality. Truly value for money.',
    });

    await Review.create({
      userId: customer2._id,
      productId: insertedProducts[3]._id,
      rating: 4,
      comment: 'Superb quality leather. The color is slightly darker than the image, but holds up amazing for weekend trips.',
    });

    // Create a mock order to populate metrics immediately
    await Order.create({
      userId: customer3._id,
      sellerId: seller1._id,
      items: [
        {
          productId: insertedProducts[0]._id,
          quantity: 1,
          price: 9999,
          name: insertedProducts[0].name,
          image: insertedProducts[0].image,
        },
      ],
      totalAmount: 9999,
      discount: 0,
      finalAmount: 9999,
      shippingAddress: {
        name: 'Oliver DealFinder',
        street: '456 Central Avenue',
        city: 'Bangalore',
        state: 'KA',
        zipCode: '560001',
        country: 'India',
        phone: '9876543211',
      },
      paymentStatus: 'PAID',
      paymentId: 'mock_pay_seed_1',
      orderStatus: 'PLACED',
    });

    await Order.create({
      userId: customer4._id,
      sellerId: seller2._id,
      items: [
        {
          productId: insertedProducts[3]._id,
          quantity: 2,
          price: 3499,
          name: insertedProducts[3].name,
          image: insertedProducts[3].image,
        },
      ],
      totalAmount: 6998,
      discount: 50, // Applied FLAT50
      finalAmount: 6948,
      shippingAddress: {
        name: 'Ava Premium',
        street: '789 Marine Drive',
        city: 'Mumbai',
        state: 'MH',
        zipCode: '400002',
        country: 'India',
        phone: '9876543212',
      },
      paymentStatus: 'PAID',
      paymentId: 'mock_pay_seed_2',
      orderStatus: 'DELIVERED',
    });

    return NextResponse.json({
      message: 'Database seeded successfully',
      credentials: {
        admin: 'admin@marketsphere.com / admin123',
        seller1: 'seller1@marketsphere.com / password123 (Tech Store)',
        seller2: 'seller2@marketsphere.com / password123 (Fashion & Home Decor)',
        customers: 'customer1@marketsphere.com to customer5@marketsphere.com / password123',
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
