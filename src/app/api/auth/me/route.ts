import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export async function GET(request: NextRequest) {
  try {
    // 从cookie获取token
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // 验证token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key'
    ) as JWTPayload;

    // 获取用户信息
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
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        notesCount: user._count.notes
      }
    });

  } catch (error) {
    console.error('Auth verification error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
