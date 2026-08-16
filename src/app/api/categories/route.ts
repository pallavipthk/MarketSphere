import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({});
    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthUser();
    if (!session || (session.role !== 'admin' && session.role !== 'seller')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const { name, slug } = await req.json();
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const category = await Category.create({ name, slug });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
