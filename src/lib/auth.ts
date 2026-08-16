import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-12345';

export interface TokenPayload {
  id: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getAuthUser(req?: NextRequest): Promise<TokenPayload | null> {
  try {
    let token: string | undefined;
    if (req) {
      token = req.cookies.get('token')?.value;
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get('token')?.value;
    }
    if (!token) return null;
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}

export async function setAuthCookie(payload: TokenPayload) {
  const token = generateToken(payload);
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}
