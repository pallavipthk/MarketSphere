import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Store from '@/models/Store';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session || session.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const store = await Store.findOne({ sellerId: session.id });
    if (!store) {
      return NextResponse.json({ error: 'Store not found', noStore: true }, { status: 200 });
    }

    return NextResponse.json({ store }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getAuthUser();
    if (!session || session.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { name, description, logo, location } = await req.json();

    if (!name || !description || !location) {
      return NextResponse.json({ error: 'Name, description, and location are required' }, { status: 400 });
    }

    const store = await Store.findOneAndUpdate(
      { sellerId: session.id },
      { name, description, logo, location },
      { new: true }
    );

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    return NextResponse.json({ store }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
