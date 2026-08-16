import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const users = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
    return NextResponse.json({ users }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
