import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  createdAt: Date;
}

export interface AuthUser extends User {
  notesCount?: number;
}

interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * 从请求中获取当前认证用户
 */
export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key'
    ) as JWTPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            notes: true
          }
        }
      }
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      notesCount: user._count.notes
    };

  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * 验证JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key'
    ) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * 生成JWT token
 */
export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
}

/**
 * 生成默认头像URL（使用用户名首字母）
 */
export function generateAvatarUrl(name: string): string {
  const initial = name.charAt(0).toUpperCase();
  return `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=128`;
}
