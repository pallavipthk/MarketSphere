import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Store from '@/models/Store';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999999');
    const sort = searchParams.get('sort') || '';

    let query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    query.price = { $gte: minPrice, $lte: maxPrice };

    let sortOptions: any = { createdAt: -1 };
    if (sort === 'price-asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'rating') {
      sortOptions = { rating: -1 };
    }

    const products = await Product.find(query)
      .populate('storeId', 'name location logo')
      .sort(sortOptions);

    return NextResponse.json({ products }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthUser();
    if (!session || session.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const store = await Store.findOne({ sellerId: session.id });
    if (!store) {
      return NextResponse.json({ error: 'Please create a store first before adding products' }, { status: 400 });
    }

    const { name, description, price, category, image, stock } = await req.json();

    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const product = await Product.create({
      sellerId: session.id,
      storeId: store._id,
      name,
      description,
      price: parseFloat(price),
      category,
      image,
      stock: parseInt(stock),
      rating: 0,
      reviewsCount: 0,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
