import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Store from '@/models/Store';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    const stores = await Store.find({}).populate('sellerId', 'name email');
    return NextResponse.json({ stores }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthUser();
    if (!session || session.role !== 'seller') {
      return NextResponse.json({ error: 'Only sellers can create stores' }, { status: 403 });
    }

    await connectDB();
    const { name, description, logo, location } = await req.json();

    if (!name || !description || !location) {
      return NextResponse.json({ error: 'Name, description, and location are required' }, { status: 400 });
    }

    const existingStore = await Store.findOne({ sellerId: session.id });
    if (existingStore) {
      return NextResponse.json({ error: 'Seller already has a store' }, { status: 400 });
    }

    const store = await Store.create({
      sellerId: session.id,
      name,
      description,
      logo: logo || '',
      location,
    });

    return NextResponse.json({ store }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
